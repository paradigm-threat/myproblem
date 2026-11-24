import type { OutboxSubmission } from "./types";

export type FlushFetch = typeof fetch;

export type FlushStore = {
  get: (id: string) => Promise<OutboxSubmission | undefined>;
  put: (sub: OutboxSubmission) => Promise<void>;
  delete: (id: string) => Promise<void>;
  listPending: () => Promise<OutboxSubmission[]>;
};

export type FlushHooks = {
  onRemember?: (sub: OutboxSubmission) => void;
  onChange?: (sub: OutboxSubmission) => void;
};

export class NetworkUnavailableError extends Error {
  constructor(message = "Network unavailable") {
    super(message);
    this.name = "NetworkUnavailableError";
  }
}

function isNetworkFailure(err: unknown): boolean {
  if (err instanceof NetworkUnavailableError) return true;
  if (err instanceof TypeError) return true;
  if (!err || typeof err !== "object") return false;
  const msg = String((err as Error).message || "").toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("offline") ||
    msg.includes("load failed")
  );
}

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.message || data.error || `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

/** True for offline / 5xx / 408 / 429 — leave queued and stop drain. */
function isRetriableHttp(status: number): boolean {
  return status === 0 || status === 408 || status === 429 || status >= 500;
}

export async function syncOneSubmission(
  initial: OutboxSubmission,
  store: FlushStore,
  fetchImpl: FlushFetch,
  hooks: FlushHooks = {},
): Promise<"synced" | "failed" | "deferred"> {
  let sub: OutboxSubmission = {
    ...initial,
    media: initial.media.map((m) => ({ ...m })),
    status: "syncing",
    lastError: undefined,
  };
  await store.put(sub);
  hooks.onChange?.(sub);

  const persist = async () => {
    await store.put(sub);
    hooks.onChange?.(sub);
  };

  try {
    if (!sub.serverTicketUuid || !sub.claim) {
      const createRes = await fetchImpl("/api/tickets", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-visitor-id": sub.visitorId,
          "Idempotency-Key": sub.clientSubmissionId,
        },
        body: JSON.stringify({
          region: sub.region,
          raiser_visitor_id: sub.visitorId,
          mint_slug: false,
          client_submission_id: sub.clientSubmissionId,
        }),
      });
      if (!createRes.ok) {
        if (isRetriableHttp(createRes.status)) {
          sub.status = "queued";
          sub.lastError = await readError(createRes);
          await persist();
          return "deferred";
        }
        sub.status = "failed";
        sub.lastError = await readError(createRes);
        await persist();
        return "failed";
      }
      const createData = (await createRes.json()) as {
        ticket_uuid?: string;
        claim?: string;
        slug?: string | null;
      };
      if (!createData.ticket_uuid || !createData.claim) {
        sub.status = "failed";
        sub.lastError = "Could not create ticket";
        await persist();
        return "failed";
      }
      sub.serverTicketUuid = createData.ticket_uuid;
      sub.claim = createData.claim;
      if (createData.slug) sub.slug = createData.slug;
      await persist();
    }

    const headers: HeadersInit = {
      "content-type": "application/json",
      "x-ticket-claim": sub.claim!,
      "x-visitor-id": sub.visitorId,
    };

    const patchRes = await fetchImpl(
      `/api/tickets/${encodeURIComponent(sub.serverTicketUuid!)}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          title: sub.title,
          description: sub.description,
        }),
      },
    );
    if (!patchRes.ok) {
      if (isRetriableHttp(patchRes.status)) {
        sub.status = "queued";
        sub.lastError = await readError(patchRes);
        await persist();
        return "deferred";
      }
      sub.status = "failed";
      sub.lastError = await readError(patchRes);
      await persist();
      return "failed";
    }

    for (let i = 0; i < sub.media.length; i++) {
      const item = sub.media[i];
      if (item.uploaded) continue;
      const form = new FormData();
      if (item.kind === "video") {
        form.set("kind", "video");
        form.set("lane", "batch");
        form.set("scrubbed_locally", "false");
      } else if (item.kind === "audio") {
        form.set("kind", "audio");
        form.set("isFinal", "true");
      } else {
        form.set("kind", "still");
      }
      form.set(
        "file",
        new File([item.blob], item.filename, { type: item.mime || item.blob.type }),
      );
      const evRes = await fetchImpl(
        `/api/tickets/${encodeURIComponent(sub.serverTicketUuid!)}/evidence`,
        {
          method: "POST",
          headers: {
            "x-ticket-claim": sub.claim!,
            "x-visitor-id": sub.visitorId,
            "Idempotency-Key": item.localId,
          },
          body: form,
        },
      );
      if (!evRes.ok) {
        if (isRetriableHttp(evRes.status)) {
          sub.status = "queued";
          sub.lastError = await readError(evRes);
          await persist();
          return "deferred";
        }
        sub.status = "failed";
        sub.lastError = await readError(evRes);
        await persist();
        return "failed";
      }
      sub.media[i] = { ...item, uploaded: true, blob: new Blob() };
      await persist();
    }

    if (sub.wantPublic && !sub.slug) {
      const slugRes = await fetchImpl(
        `/api/tickets/${encodeURIComponent(sub.serverTicketUuid!)}/suggest-slug`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            apply: true,
            title: sub.title,
            description: sub.description,
            slug: sub.publicSlug.trim() || undefined,
          }),
        },
      );
      if (!slugRes.ok) {
        if (isRetriableHttp(slugRes.status)) {
          sub.status = "queued";
          sub.lastError = await readError(slugRes);
          await persist();
          return "deferred";
        }
        sub.status = "failed";
        sub.lastError = await readError(slugRes);
        await persist();
        return "failed";
      }
      const slugData = (await slugRes.json()) as { slug?: string };
      sub.slug = slugData.slug || null;
      await persist();
    }

    hooks.onRemember?.(sub);
    sub.status = "synced";
    sub.lastError = undefined;
    // Drop media blobs; keep a slim synced tombstone briefly then delete.
    sub.media = sub.media.map((m) => ({
      ...m,
      blob: new Blob(),
      uploaded: true,
    }));
    await store.delete(sub.clientSubmissionId);
    hooks.onChange?.({ ...sub, status: "synced" });
    return "synced";
  } catch (err) {
    if (isNetworkFailure(err)) {
      sub.status = "queued";
      sub.lastError = "Waiting for network";
      await persist();
      return "deferred";
    }
    sub.status = "failed";
    sub.lastError = err instanceof Error ? err.message : "Sync failed";
    await persist();
    return "failed";
  }
}

/** Cheap same-origin probe — do not trust navigator.onLine alone. */
export async function probeReachable(
  fetchImpl: FlushFetch = fetch,
): Promise<boolean> {
  try {
    const res = await fetchImpl("/manifest.webmanifest", {
      method: "GET",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function flushAll(
  store: FlushStore,
  fetchImpl: FlushFetch = fetch,
  hooks: FlushHooks = {},
): Promise<{ synced: number; failed: number; deferred: boolean }> {
  const pending = await store.listPending();
  const work = pending.filter((s) => s.status !== "failed");
  if (work.length === 0) return { synced: 0, failed: 0, deferred: false };

  if (!(await probeReachable(fetchImpl))) {
    return { synced: 0, failed: 0, deferred: true };
  }

  let synced = 0;
  let failed = 0;
  for (const sub of work) {
    const result = await syncOneSubmission(sub, store, fetchImpl, hooks);
    if (result === "synced") synced += 1;
    else if (result === "failed") failed += 1;
    else {
      return { synced, failed, deferred: true };
    }
  }
  return { synced, failed, deferred: false };
}

export async function retryFailed(
  id: string,
  store: FlushStore,
  fetchImpl: FlushFetch = fetch,
  hooks: FlushHooks = {},
): Promise<"synced" | "failed" | "deferred"> {
  const sub = await store.get(id);
  if (!sub) return "failed";
  sub.status = "queued";
  sub.lastError = undefined;
  await store.put(sub);
  return syncOneSubmission(sub, store, fetchImpl, hooks);
}
