/**
 * IndexedDB store for social-capture media blobs (side panel + SW).
 * Key: `${threadId}::${local_name}`
 */
(function (global) {
  "use strict";

  const DB_NAME = "mpx_media_v1";
  const STORE = "blobs";
  const DB_VERSION = 1;

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "key" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("idb_open_failed"));
    });
  }

  function mediaKey(threadId, localName) {
    return String(threadId) + "::" + String(localName);
  }

  async function putBlob(entry) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(entry);
      tx.oncomplete = () => resolve(entry.key);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getBlob(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function listBlobs() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function clearAll() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function countAll() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
  }

  async function listMeta() {
    const all = await listBlobs();
    return all.map((e) => ({
      key: e.key,
      threadId: e.threadId,
      local_name: e.local_name,
      kind: e.kind,
      bytes: e.bytes,
      sha256: e.sha256,
      scrubbed_locally: false,
    }));
  }

  async function countForThread(threadId) {
    const all = await listMeta();
    const prefix = String(threadId) + "::";
    return all.filter((e) => e.key && e.key.startsWith(prefix)).length;
  }

  global.MyProblemMediaIdb = {
    mediaKey,
    putBlob,
    getBlob,
    listBlobs,
    listMeta,
    countAll,
    clearAll,
    countForThread,
  };
})(typeof globalThis !== "undefined" ? globalThis : self);
