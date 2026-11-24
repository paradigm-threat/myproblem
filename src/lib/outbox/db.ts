import type { OutboxSubmission } from "./types";

const DB_NAME = "myproblem-outbox";
const DB_VERSION = 1;
const STORE = "submissions";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () =>
      reject(req.error || new Error("Could not open outbox database"));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, {
          keyPath: "clientSubmissionId",
        });
        store.createIndex("createdAt", "createdAt", { unique: false });
        store.createIndex("status", "status", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("IndexedDB request failed"));
  });
}

export function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { name?: string; message?: string };
  if (e.name === "QuotaExceededError") return true;
  const msg = (e.message || "").toLowerCase();
  return msg.includes("quota") || msg.includes("storage");
}

export async function putSubmission(sub: OutboxSubmission): Promise<void> {
  try {
    const db = await openDb();
    try {
      const tx = db.transaction(STORE, "readwrite");
      await reqToPromise(tx.objectStore(STORE).put(sub));
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("outbox put failed"));
        tx.onabort = () => reject(tx.error || new Error("outbox put aborted"));
      });
    } finally {
      db.close();
    }
  } catch (err) {
    if (isQuotaError(err)) {
      throw new Error(
        "Device storage full — free space or sync existing batches, then try again.",
      );
    }
    throw err;
  }
}

export async function getSubmission(
  id: string,
): Promise<OutboxSubmission | undefined> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readonly");
    return await reqToPromise(tx.objectStore(STORE).get(id));
  } finally {
    db.close();
  }
}

export async function deleteSubmission(id: string): Promise<void> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readwrite");
    await reqToPromise(tx.objectStore(STORE).delete(id));
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error("outbox delete failed"));
    });
  } finally {
    db.close();
  }
}

/** Oldest first. */
export async function listSubmissions(): Promise<OutboxSubmission[]> {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE, "readonly");
    const all = await reqToPromise(tx.objectStore(STORE).getAll());
    return (all || []).sort((a, b) => a.createdAt - b.createdAt);
  } finally {
    db.close();
  }
}

export async function listPending(): Promise<OutboxSubmission[]> {
  const all = await listSubmissions();
  return all.filter((s) => s.status !== "synced");
}
