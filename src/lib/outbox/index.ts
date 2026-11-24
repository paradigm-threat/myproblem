import {
  deleteSubmission,
  getSubmission,
  listPending,
  listSubmissions,
  putSubmission,
} from "./db";
import {
  flushAll,
  retryFailed,
  type FlushHooks,
  type FlushStore,
} from "./flush";
import {
  mediaKindForFile,
  toSummary,
  type OutboxSubmission,
  type OutboxSummary,
} from "./types";
import { rememberTicket } from "@/lib/tickets/vault";

export type {
  OutboxSubmission,
  OutboxSummary,
  OutboxStatus,
  OutboxMedia,
} from "./types";
export { toSummary, mediaKindForFile } from "./types";
export { isQuotaError } from "./db";

const store: FlushStore = {
  get: getSubmission,
  put: putSubmission,
  delete: deleteSubmission,
  listPending,
};

let flushInFlight: Promise<{
  synced: number;
  failed: number;
  deferred: boolean;
}> | null = null;

const listeners = new Set<() => void>();

export function subscribeOutbox(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => {
    try {
      l();
    } catch {
      /* ignore */
    }
  });
}

const defaultHooks: FlushHooks = {
  onRemember: (sub) => {
    if (!sub.serverTicketUuid || !sub.claim) return;
    rememberTicket({
      ticket_uuid: sub.serverTicketUuid,
      claim: sub.claim,
      slug: sub.slug ?? null,
      title: sub.title,
      resolution: "unsolved",
    });
  },
  onChange: () => notify(),
};

export async function enqueueSubmission(input: {
  visitorId: string;
  region: "georgia" | "israel";
  description: string;
  files: File[];
  wantPublic?: boolean;
  publicSlug?: string;
}): Promise<OutboxSubmission> {
  const text = input.description.trim();
  const title =
    text
      .split(/\n/)
      .map((l) => l.trim())
      .find(Boolean)
      ?.slice(0, 160) ||
    (input.files[0]?.name ? `Recording · ${input.files[0].name}` : "Untitled problem");

  const sub: OutboxSubmission = {
    clientSubmissionId: crypto.randomUUID(),
    createdAt: Date.now(),
    status: "queued",
    visitorId: input.visitorId,
    region: input.region,
    title,
    description: text,
    wantPublic: !!input.wantPublic,
    publicSlug: (input.publicSlug || "").trim(),
    media: input.files.map((file) => ({
      localId: crypto.randomUUID(),
      kind: mediaKindForFile(file),
      filename: file.name || `media-${Date.now()}`,
      mime: file.type || "application/octet-stream",
      blob: file,
      uploaded: false,
    })),
  };

  await putSubmission(sub);
  notify();
  void requestPersistentStorage();
  void requestBackgroundSync();
  void flushOutbox();
  return sub;
}

async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch {
    /* best-effort */
  }
}

export async function discardOutboxSubmission(id: string): Promise<void> {
  await deleteSubmission(id);
  notify();
}

export async function listOutboxSummaries(): Promise<OutboxSummary[]> {
  const all = await listSubmissions();
  return all
    .filter((s) => s.status !== "synced")
    .map(toSummary)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function pendingOutboxCount(): Promise<number> {
  const pending = await listPending();
  return pending.filter((s) => s.status !== "synced").length;
}

export async function flushOutbox() {
  if (flushInFlight) return flushInFlight;
  flushInFlight = flushAll(store, fetch, defaultHooks).finally(() => {
    flushInFlight = null;
    notify();
  });
  return flushInFlight;
}

export async function retryOutboxSubmission(id: string) {
  const result = await retryFailed(id, store, fetch, defaultHooks);
  notify();
  if (result === "deferred" || result === "synced") {
    void flushOutbox();
  }
  return result;
}

async function requestBackgroundSync() {
  try {
    const reg = await navigator.serviceWorker?.ready;
    // Background Sync is Chromium-only
    const syncManager = (
      reg as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> };
      }
    )?.sync;
    await syncManager?.register("outbox-flush");
  } catch {
    /* unsupported */
  }
}

let wakeArmed = false;

/** Call once from the client (submit page / layout). */
export function armOutboxWake(): void {
  if (typeof window === "undefined" || wakeArmed) return;
  wakeArmed = true;
  window.addEventListener("online", () => {
    void flushOutbox();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void flushOutbox();
  });
  window.setInterval(() => {
    void flushOutbox();
  }, 30_000);
  navigator.serviceWorker?.addEventListener("message", (event) => {
    if (event.data?.type === "outbox-flush") void flushOutbox();
  });
  void flushOutbox();
}
