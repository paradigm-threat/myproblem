import { describe, expect, it } from "vitest";
import {
  flushAll,
  retryFailed,
  syncOneSubmission,
  type FlushStore,
} from "./flush";
import type { OutboxSubmission } from "./types";

function makeSub(overrides: Partial<OutboxSubmission> = {}): OutboxSubmission {
  return {
    clientSubmissionId: "sub-1",
    createdAt: 1,
    status: "queued",
    visitorId: "vis-1",
    region: "georgia",
    title: "Broken pipe",
    description: "Water in basement",
    wantPublic: false,
    publicSlug: "",
    media: [
      {
        localId: "m1",
        kind: "audio",
        filename: "note.webm",
        mime: "audio/webm",
        blob: new Blob(["audio"], { type: "audio/webm" }),
        uploaded: false,
      },
    ],
    ...overrides,
  };
}

function memoryStore(seed: OutboxSubmission[] = []): FlushStore {
  const map = new Map(
    seed.map((s) => [s.clientSubmissionId, structuredClone(s)]),
  );
  return {
    async get(id) {
      const v = map.get(id);
      return v ? structuredClone(v) : undefined;
    },
    async put(sub) {
      map.set(sub.clientSubmissionId, structuredClone(sub));
    },
    async delete(id) {
      map.delete(id);
    },
    async listPending() {
      return [...map.values()]
        .filter((s) => s.status !== "synced")
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((s) => structuredClone(s));
    },
  };
}

describe("outbox flush", () => {
  it("creates ticket, patches, uploads evidence, then deletes", async () => {
    const store = memoryStore([makeSub()]);
    const calls: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      calls.push(`${init?.method || "GET"} ${url}`);
      if (url === "/api/tickets" && init?.method === "POST") {
        return new Response(
          JSON.stringify({ ticket_uuid: "ticket-1", claim: "claim-1" }),
          { status: 200 },
        );
      }
      if (url.includes("/api/tickets/ticket-1") && init?.method === "PATCH") {
        return new Response("{}", { status: 200 });
      }
      if (url.includes("/evidence") && init?.method === "POST") {
        return new Response("{}", { status: 200 });
      }
      return new Response("nope", { status: 404 });
    };

    const result = await syncOneSubmission(
      (await store.listPending())[0],
      store,
      fetchImpl,
    );
    expect(result).toBe("synced");
    expect(await store.get("sub-1")).toBeUndefined();
    expect(calls).toEqual([
      "POST /api/tickets",
      "PATCH /api/tickets/ticket-1",
      "POST /api/tickets/ticket-1/evidence",
    ]);
  });

  it("resumes evidence after create already persisted", async () => {
    const store = memoryStore([
      makeSub({
        serverTicketUuid: "ticket-1",
        claim: "claim-1",
      }),
    ]);
    const calls: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      const method = init?.method || "GET";
      calls.push(`${method} ${url}`);
      if (method === "PATCH") return new Response("{}", { status: 200 });
      if (method === "POST" && url.includes("/evidence")) {
        return new Response("{}", { status: 200 });
      }
      throw new Error(`unexpected ${method} ${url}`);
    };

    const result = await syncOneSubmission(
      (await store.listPending())[0],
      store,
      fetchImpl,
    );
    expect(result).toBe("synced");
    expect(calls[0]).toBe("PATCH /api/tickets/ticket-1");
    expect(calls.some((c) => c === "POST /api/tickets")).toBe(false);
  });

  it("defers on network failure and keeps batch queued", async () => {
    const store = memoryStore([makeSub()]);
    const fetchImpl: typeof fetch = async () => {
      throw new TypeError("Failed to fetch");
    };
    const result = await syncOneSubmission(
      (await store.listPending())[0],
      store,
      fetchImpl,
    );
    expect(result).toBe("deferred");
    const left = await store.get("sub-1");
    expect(left?.status).toBe("queued");
    expect(left?.serverTicketUuid).toBeUndefined();
  });

  it("FIFO flush stops when a batch is deferred", async () => {
    const store = memoryStore([
      makeSub({ clientSubmissionId: "a", createdAt: 1 }),
      makeSub({ clientSubmissionId: "b", createdAt: 2, title: "Second" }),
    ]);
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      if (url.includes("manifest.webmanifest")) {
        return new Response("{}", { status: 200 });
      }
      if (url === "/api/tickets" && init?.method === "POST") {
        return new Response(
          JSON.stringify({ ticket_uuid: "t1", claim: "c1" }),
          { status: 200 },
        );
      }
      if (init?.method === "PATCH") return new Response("{}", { status: 200 });
      if (String(input).includes("/evidence")) {
        throw new TypeError("Failed to fetch");
      }
      return new Response("nope", { status: 404 });
    };

    const summary = await flushAll(store, fetchImpl);
    expect(summary.deferred).toBe(true);
    expect(summary.synced).toBe(0);
    const a = await store.get("a");
    expect(a?.serverTicketUuid).toBe("t1");
    expect(a?.status).toBe("queued");
    const b = await store.get("b");
    expect(b?.serverTicketUuid).toBeUndefined();
  });

  it("marks failed on 4xx server quota and continues next batch", async () => {
    const store = memoryStore([
      makeSub({
        clientSubmissionId: "big",
        createdAt: 1,
        serverTicketUuid: "t1",
        claim: "c1",
      }),
      makeSub({
        clientSubmissionId: "ok",
        createdAt: 2,
        title: "Ok",
        media: [],
      }),
    ]);
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      if (url.includes("manifest.webmanifest")) {
        return new Response("{}", { status: 200 });
      }
      if (url.includes("/t1/evidence")) {
        return new Response(JSON.stringify({ error: "video_too_large" }), {
          status: 413,
        });
      }
      if (url.includes("/t1") && init?.method === "PATCH") {
        return new Response("{}", { status: 200 });
      }
      if (url === "/api/tickets" && init?.method === "POST") {
        return new Response(
          JSON.stringify({ ticket_uuid: "t2", claim: "c2" }),
          { status: 200 },
        );
      }
      if (url.includes("/t2") && init?.method === "PATCH") {
        return new Response("{}", { status: 200 });
      }
      return new Response("nope", { status: 404 });
    };

    const summary = await flushAll(store, fetchImpl);
    expect(summary.failed).toBe(1);
    expect(summary.synced).toBe(1);
    expect(await store.get("big")).toMatchObject({
      status: "failed",
      lastError: "video_too_large",
    });
    expect(await store.get("ok")).toBeUndefined();
  });

  it("defers flush when reachability probe fails", async () => {
    const store = memoryStore([makeSub()]);
    const summary = await flushAll(store, async () => {
      throw new TypeError("Failed to fetch");
    });
    expect(summary.deferred).toBe(true);
    expect(await store.get("sub-1")).toBeTruthy();
  });

  it("sends Idempotency-Key on create and skips already-uploaded media", async () => {
    const store = memoryStore([
      makeSub({
        serverTicketUuid: "ticket-1",
        claim: "claim-1",
        media: [
          {
            localId: "done",
            kind: "video",
            filename: "a.webm",
            mime: "video/webm",
            blob: new Blob(["x"], { type: "video/webm" }),
            uploaded: true,
          },
          {
            localId: "pending",
            kind: "video",
            filename: "b.webm",
            mime: "video/webm",
            blob: new Blob(["y"], { type: "video/webm" }),
            uploaded: false,
          },
        ],
      }),
    ]);
    const evidenceIds: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      if (init?.method === "PATCH") return new Response("{}", { status: 200 });
      if (url.includes("/evidence")) {
        evidenceIds.push(
          String((init?.headers as Record<string, string>)?.["Idempotency-Key"] || ""),
        );
        return new Response("{}", { status: 200 });
      }
      throw new Error(`unexpected ${init?.method} ${url}`);
    };
    expect(
      await syncOneSubmission((await store.listPending())[0], store, fetchImpl),
    ).toBe("synced");
    expect(evidenceIds).toEqual(["pending"]);
  });

  it("creates with Idempotency-Key then applies public slug", async () => {
    const store = memoryStore([
      makeSub({
        wantPublic: true,
        publicSlug: "lamp-post",
        media: [],
      }),
    ]);
    let createKey = "";
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      if (url === "/api/tickets" && init?.method === "POST") {
        createKey = String(
          (init.headers as Record<string, string>)?.["Idempotency-Key"] || "",
        );
        return new Response(
          JSON.stringify({ ticket_uuid: "t-slug", claim: "c-slug" }),
          { status: 200 },
        );
      }
      if (init?.method === "PATCH") return new Response("{}", { status: 200 });
      if (url.includes("suggest-slug")) {
        const body = JSON.parse(String(init?.body || "{}")) as { slug?: string };
        expect(body.slug).toBe("lamp-post");
        return new Response(JSON.stringify({ slug: "lamp-post" }), { status: 200 });
      }
      return new Response("nope", { status: 404 });
    };
    const remembered: string[] = [];
    expect(
      await syncOneSubmission((await store.listPending())[0], store, fetchImpl, {
        onRemember: (s) => remembered.push(s.slug || ""),
      }),
    ).toBe("synced");
    expect(createKey).toBe("sub-1");
    expect(remembered).toEqual(["lamp-post"]);
  });

  it("skips failed batches until retryFailed requeues them", async () => {
    const store = memoryStore([
      makeSub({
        clientSubmissionId: "failed",
        createdAt: 1,
        status: "failed",
        lastError: "video_too_large",
        serverTicketUuid: "t1",
        claim: "c1",
        media: [],
      }),
      makeSub({
        clientSubmissionId: "next",
        createdAt: 2,
        title: "Next",
        media: [],
      }),
    ]);
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      if (url.includes("manifest.webmanifest")) {
        return new Response("{}", { status: 200 });
      }
      if (url === "/api/tickets" && init?.method === "POST") {
        return new Response(
          JSON.stringify({ ticket_uuid: "t2", claim: "c2" }),
          { status: 200 },
        );
      }
      if (init?.method === "PATCH") return new Response("{}", { status: 200 });
      return new Response("nope", { status: 404 });
    };
    const summary = await flushAll(store, fetchImpl);
    expect(summary.synced).toBe(1);
    expect(await store.get("failed")).toMatchObject({ status: "failed" });
    expect(await store.get("next")).toBeUndefined();

    expect(await retryFailed("failed", store, fetchImpl)).toBe("synced");
    expect(await store.get("failed")).toBeUndefined();
  });

  it("defers on 503 and keeps create progress", async () => {
    const store = memoryStore([makeSub({ media: [] })]);
    const fetchImpl: typeof fetch = async (input, init) => {
      if (String(input) === "/api/tickets" && init?.method === "POST") {
        return new Response(JSON.stringify({ error: "busy" }), { status: 503 });
      }
      throw new Error("unexpected");
    };
    expect(
      await syncOneSubmission((await store.listPending())[0], store, fetchImpl),
    ).toBe("deferred");
    expect(await store.get("sub-1")).toMatchObject({
      status: "queued",
      lastError: "busy",
    });
  });
});
