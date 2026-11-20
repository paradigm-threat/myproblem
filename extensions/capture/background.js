/**
 * MyProblem X — side panel + local batch cache (chrome.storage.local).
 * Schema: myproblem.capture_batch.v1 — one post = one ticket candidate.
 */
importScripts("lib/topics.js", "lib/media-idb.js", "lib/social-hosts.js");

const STORAGE_KEY = "mpx_batch_v0";
const SCHEMA = "myproblem.capture_batch.v1";

async function setTabExtensionVisible(tabId, url) {
  if (tabId == null) return;
  const allowed = self.MyProblemSocialHosts.isAllowed(url);
  try {
    if (allowed) await chrome.action.enable(tabId);
    else await chrome.action.disable(tabId);
  } catch (_) {}
  if (chrome.sidePanel && chrome.sidePanel.setOptions) {
    try {
      await chrome.sidePanel.setOptions({
        tabId,
        enabled: allowed,
        path: "sidepanel.html",
      });
    } catch (_) {}
  }
}

async function refreshAllTabVisibility() {
  let tabs = [];
  try {
    tabs = await chrome.tabs.query({});
  } catch (_) {
    return;
  }
  for (const tab of tabs) {
    if (tab.id != null) await setTabExtensionVisible(tab.id, tab.url || "");
  }
}

function installDeclarativeShowRules() {
  if (!chrome.declarativeContent || !chrome.declarativeContent.onPageChanged) {
    return;
  }
  const suffixes = self.MyProblemSocialHosts.declarativeHostSuffixes();
  const conditions = suffixes.map(
    (hostSuffix) =>
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { hostSuffix },
      })
  );
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    if (!conditions.length) return;
    chrome.declarativeContent.onPageChanged.addRules(
      [
        {
          conditions,
          actions: [new chrome.declarativeContent.ShowAction()],
        },
      ],
      () => {
        /* ignore quota / API errors on older Chromium */
      }
    );
  });
}

chrome.runtime.onInstalled.addListener(() => {
  // Hide toolbar action until a social host is active
  try {
    chrome.action.disable();
  } catch (_) {}
  installDeclarativeShowRules();
  refreshAllTabVisibility();
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch(() => {});
  }
});

chrome.runtime.onStartup.addListener(() => {
  try {
    chrome.action.disable();
  } catch (_) {}
  installDeclarativeShowRules();
  refreshAllTabVisibility();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === "complete" || changeInfo.status === "loading") {
    setTabExtensionVisible(tabId, (tab && tab.url) || changeInfo.url || "");
  }
});

chrome.tabs.onActivated.addListener(async (info) => {
  try {
    const tab = await chrome.tabs.get(info.tabId);
    await setTabExtensionVisible(info.tabId, (tab && tab.url) || "");
  } catch (_) {}
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || tab.id == null) return;
  if (!self.MyProblemSocialHosts.isAllowed(tab.url || "")) {
    try {
      await chrome.action.disable(tab.id);
    } catch (_) {}
    return;
  }
  if (!chrome.sidePanel || tab.windowId == null) return;
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId, tabId: tab.id });
  } catch (_) {
    try {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    } catch (_) {
      /* older Chromium */
    }
  }
});

function emptyBatch() {
  return {
    schema: SCHEMA,
    channel_hint: "savannah-cat-rescue",
    region_hint: "georgia",
    source: null,
    captured_at: null,
    status: "draft",
    ready_at: null,
    validated_at: null,
    validation_pass: 0,
    upload: {
      state: "never",
      last_uploaded_at: null,
      last_content_hash: null,
    },
    stats: { ticket_count: 0, outlier_count: 0, by_reason: {} },
    content_hash: null,
    threads: [],
    debug: [],
    last_dom_probe: null,
    last_capture_summary: null,
  };
}

function normalizeThread(t) {
  const topics = self.MyProblemTopics;
  return topics && topics.normalizeThread
    ? topics.normalizeThread(t)
    : t;
}

function computeStats(threads) {
  const by_reason = {};
  let ticket_count = 0;
  let outlier_count = 0;
  for (const raw of threads || []) {
    const t = normalizeThread(raw);
    if (t.gate === "outlier") {
      outlier_count += 1;
      const reason = t.outlier_reason || "off-topic";
      by_reason[reason] = (by_reason[reason] || 0) + 1;
    } else {
      ticket_count += 1;
    }
  }
  return { ticket_count, outlier_count, by_reason };
}

function contentHash(threads) {
  const parts = (threads || [])
    .map((raw) => {
      const t = normalizeThread(raw);
      if (t.gate === "outlier") {
        return `o:${t.id}:${t.outlier_reason || "off-topic"}`;
      }
      const topics = (t.suggested_topics || []).join(",");
      return `t:${t.id}:${topics}:${Number(t.value_rank || 0).toFixed(2)}:${(t.body_redacted || "").slice(0, 80)}`;
    })
    .sort();
  const s = parts.join("|");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ("00000000" + (h >>> 0).toString(16)).slice(-8) + ":" + parts.length;
}

function refreshDerived(batch) {
  const threads = (batch.threads || []).map(normalizeThread);
  batch.threads = threads;
  batch.schema = SCHEMA;
  batch.stats = computeStats(threads);
  batch.content_hash = contentHash(threads);
  if (!batch.upload) {
    batch.upload = {
      state: "never",
      last_uploaded_at: null,
      last_content_hash: null,
    };
  }
  if (!batch.status) batch.status = "draft";
  if (typeof batch.validation_pass !== "number") batch.validation_pass = 0;

  const up = batch.upload;
  if (up.state === "synced" && up.last_content_hash) {
    if (batch.content_hash !== up.last_content_hash) {
      up.state = "pending_new";
    }
  } else if (up.state !== "synced" && up.state !== "pending_new") {
    up.state = threads.length ? "never" : "never";
  }
  return batch;
}

function uploadEnabled(batch) {
  if (!batch || batch.status !== "ready") return false;
  if (!(batch.threads || []).length) return false;
  const state = (batch.upload && batch.upload.state) || "never";
  return state === "never" || state === "pending_new";
}

async function loadBatch() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const raw = data[STORAGE_KEY];
  if (!raw) return emptyBatch();
  return refreshDerived({ ...emptyBatch(), ...raw });
}

async function saveBatch(batch) {
  const next = refreshDerived({ ...batch });
  next.captured_at = new Date().toISOString();
  await chrome.storage.local.set({ [STORAGE_KEY]: next });
  return next;
}

function mergeThreads(existing, incoming) {
  const byId = new Map();
  for (const t of existing) byId.set(t.id, normalizeThread(t));
  for (const raw of incoming) {
    const t = normalizeThread(raw);
    const prev = byId.get(t.id);
    if (!prev) {
      byId.set(t.id, t);
      continue;
    }
    const merged = {
      ...prev,
      ...t,
      reply_templates:
        t.gate === "outlier"
          ? []
          : (t.reply_templates && t.reply_templates.length
              ? t.reply_templates
              : prev.reply_templates) || [],
      suggested_topics:
        t.gate === "outlier"
          ? []
          : t.suggested_topics || prev.suggested_topics,
      value_rank:
        typeof t.value_rank === "number" ? t.value_rank : prev.value_rank,
      external_ref: t.external_ref || prev.external_ref || null,
      comments_redacted:
        t.comments_redacted && t.comments_redacted.length
          ? t.comments_redacted
          : prev.comments_redacted,
      media:
        t.media && t.media.length
          ? t.media
          : prev.media && prev.media.length
            ? prev.media
            : [],
    };
    byId.set(t.id, normalizeThread(merged));
  }
  return [...byId.values()];
}

function base64ToArrayBuffer(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function sha256HexBuf(buf) {
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const MEDIA_MAX_BYTES = 40 * 1024 * 1024;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg.type === "MPX_GET_BATCH") {
      const batch = await loadBatch();
      sendResponse({
        ok: true,
        batch,
        upload_enabled: uploadEnabled(batch),
      });
      return;
    }

    if (msg.type === "MPX_CLEAR_BATCH") {
      await chrome.storage.local.remove(STORAGE_KEY);
      try {
        if (self.MyProblemMediaIdb) await self.MyProblemMediaIdb.clearAll();
      } catch (_) {}
      sendResponse({ ok: true, batch: await loadBatch(), upload_enabled: false });
      return;
    }

    if (msg.type === "MPX_FETCH_STORE_MEDIA") {
      try {
        const media = msg.media || {};
        const url = media.source_url;
        if (!url) {
          sendResponse({ ok: false, error: "no_url" });
          return;
        }
        const res = await fetch(url, { credentials: "omit", cache: "no-cache" });
        if (!res.ok) {
          sendResponse({ ok: false, error: "http_" + res.status });
          return;
        }
        const buf = await res.arrayBuffer();
        if (buf.byteLength > MEDIA_MAX_BYTES) {
          sendResponse({
            ok: false,
            error: "oversize",
            bytes: buf.byteLength,
          });
          return;
        }
        const contentType =
          res.headers.get("content-type") || "application/octet-stream";
        const head = new Uint8Array(buf.slice(0, 64));
        const headStr = String.fromCharCode.apply(null, head);
        // Nextdoor often serves SVG placeholders (~480B) for icons — drop them
        if (
          /svg/i.test(contentType) ||
          /^\s*<svg[\s>]/i.test(headStr) ||
          (buf.byteLength < 800 && !/^(image\/(jpeg|png|webp|gif)|video\/|audio\/)/i.test(contentType) && head[0] !== 0xff && head[0] !== 0x89)
        ) {
          sendResponse({
            ok: false,
            error: "placeholder_or_svg",
            bytes: buf.byteLength,
            contentType,
          });
          return;
        }
        if (buf.byteLength < 1200 && /image\/(jpeg|jpg)/i.test(contentType) && head[0] !== 0xff) {
          sendResponse({
            ok: false,
            error: "not_jpeg",
            bytes: buf.byteLength,
          });
          return;
        }
        const local_name =
          media.local_name ||
          String(msg.threadId || "t") + "_0.bin";
        const sha256 = await sha256HexBuf(buf);
        const key = self.MyProblemMediaIdb.mediaKey(msg.threadId, local_name);
        await self.MyProblemMediaIdb.putBlob({
          key,
          threadId: msg.threadId,
          local_name,
          kind: media.kind || "other",
          source_url: url,
          sha256,
          bytes: buf.byteLength,
          contentType,
          scrubbed_locally: false,
          buffer: buf,
          stored_at: new Date().toISOString(),
        });
        sendResponse({
          ok: true,
          key,
          bytes: buf.byteLength,
          sha256,
          contentType,
          local_name,
        });
      } catch (e) {
        sendResponse({
          ok: false,
          error: String(e && e.message ? e.message : e),
        });
      }
      return;
    }

    if (msg.type === "MPX_STORE_MEDIA") {
      try {
        const media = msg.media || {};
        const key = self.MyProblemMediaIdb.mediaKey(
          msg.threadId,
          media.local_name
        );
        const buf = base64ToArrayBuffer(msg.base64 || "");
        await self.MyProblemMediaIdb.putBlob({
          key,
          threadId: msg.threadId,
          local_name: media.local_name,
          kind: media.kind,
          source_url: media.source_url,
          sha256: media.sha256,
          bytes: media.bytes || buf.byteLength,
          contentType: msg.contentType || "application/octet-stream",
          scrubbed_locally: false,
          buffer: buf,
          stored_at: new Date().toISOString(),
        });
        sendResponse({ ok: true, key, bytes: buf.byteLength });
      } catch (e) {
        sendResponse({
          ok: false,
          error: String(e && e.message ? e.message : e),
        });
      }
      return;
    }

    if (msg.type === "MPX_LIST_MEDIA") {
      try {
        const items = await self.MyProblemMediaIdb.listMeta();
        sendResponse({ ok: true, items });
      } catch (e) {
        sendResponse({
          ok: false,
          error: String(e && e.message ? e.message : e),
          items: [],
        });
      }
      return;
    }

    if (msg.type === "MPX_GET_MEDIA_BLOB") {
      try {
        const entry = await self.MyProblemMediaIdb.getBlob(msg.key);
        if (!entry || !entry.buffer) {
          sendResponse({ ok: false, error: "not_found" });
          return;
        }
        const bytes = new Uint8Array(entry.buffer);
        let bin = "";
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        sendResponse({
          ok: true,
          base64: btoa(bin),
          contentType: entry.contentType,
          local_name: entry.local_name,
          threadId: entry.threadId,
        });
      } catch (e) {
        sendResponse({
          ok: false,
          error: String(e && e.message ? e.message : e),
        });
      }
      return;
    }

    if (msg.type === "MPX_IMPORT_BATCH") {
      const incoming = msg.batch;
      if (!incoming || !Array.isArray(incoming.threads)) {
        sendResponse({ ok: false, error: "invalid_batch" });
        return;
      }
      const cur = await loadBatch();
      const next = {
        ...cur,
        ...incoming,
        schema: SCHEMA,
        threads: mergeThreads(cur.threads, incoming.threads),
        debug: [...(cur.debug || []), ...(incoming.debug || [])].slice(-200),
      };
      // Importing Cursor output should not auto-mark ready unless file says so
      if (!incoming.status) next.status = cur.status || "draft";
      const saved = await saveBatch(next);
      sendResponse({
        ok: true,
        batch: saved,
        upload_enabled: uploadEnabled(saved),
      });
      return;
    }

    if (msg.type === "MPX_MERGE_HARVEST") {
      const cur = await loadBatch();
      const incomingDebug = msg.debug || [];
      const probe =
        msg.dom_probe ||
        incomingDebug.find((d) => d && d.reason === "dom_probe") ||
        cur.last_dom_probe;
      const next = {
        ...cur,
        channel_hint: cur.channel_hint || "savannah-cat-rescue",
        region_hint: cur.region_hint || "georgia",
        source: msg.source || cur.source,
        threads: mergeThreads(cur.threads, msg.threads || []),
        debug: [...(cur.debug || []), ...incomingDebug].slice(-300),
        last_dom_probe: probe || null,
        last_capture_summary: msg.capture_summary || cur.last_capture_summary,
        // New harvest returns session to draft until Mark ready
        status: "draft",
      };
      const saved = await saveBatch(next);
      sendResponse({
        ok: true,
        batch: saved,
        upload_enabled: uploadEnabled(saved),
      });
      return;
    }

    if (msg.type === "MPX_SET_REPLY_TEMPLATES") {
      const cur = await loadBatch();
      const threads = cur.threads.map((t) => {
        if (t.id !== msg.threadId) return t;
        if (t.gate === "outlier") return { ...t, reply_templates: [] };
        return {
          ...t,
          reply_templates: msg.templates || [],
        };
      });
      const saved = await saveBatch({ ...cur, threads });
      sendResponse({
        ok: true,
        batch: saved,
        upload_enabled: uploadEnabled(saved),
      });
      return;
    }

    if (msg.type === "MPX_MARK_READY") {
      const cur = await loadBatch();
      if (!(cur.threads || []).length) {
        sendResponse({ ok: false, error: "empty_batch" });
        return;
      }
      const now = new Date().toISOString();
      const next = {
        ...cur,
        status: "ready",
        ready_at: now,
        validated_at: now,
        validation_pass: Math.max(1, cur.validation_pass || 0),
      };
      const saved = await saveBatch(next);
      // After ready: if never uploaded, stay never (upload enabled); if was synced and hash same, stay synced
      const up = saved.upload;
      if (up.state === "synced" && up.last_content_hash === saved.content_hash) {
        /* still synced */
      } else if (up.state === "synced") {
        up.state = "pending_new";
        await saveBatch(saved);
      }
      const final = await loadBatch();
      sendResponse({
        ok: true,
        batch: final,
        upload_enabled: uploadEnabled(final),
      });
      return;
    }

    if (msg.type === "MPX_VALIDATE_DONE") {
      // Side panel finished re-harvest/reclassify; stamp validation + ready
      const cur = await loadBatch();
      const now = new Date().toISOString();
      const next = {
        ...cur,
        status: "ready",
        ready_at: cur.ready_at || now,
        validated_at: now,
        validation_pass: (cur.validation_pass || 0) + 1,
      };
      const saved = await saveBatch(next);
      const up = saved.upload;
      if (up.last_content_hash && up.last_content_hash !== saved.content_hash) {
        up.state = "pending_new";
      } else if (!up.last_content_hash) {
        up.state = "never";
      }
      const final = await saveBatch(saved);
      sendResponse({
        ok: true,
        batch: final,
        upload_enabled: uploadEnabled(final),
      });
      return;
    }

    if (msg.type === "MPX_RECLASSIFY_LOCAL") {
      // No tab: re-run classify heuristics on stored bodies
      const cur = await loadBatch();
      const topics = self.MyProblemTopics;
      const threads = (cur.threads || []).map((t) => {
        if (!topics || !topics.classify) return normalizeThread(t);
        const c = topics.classify(t.body_redacted || "");
        const next = {
          ...t,
          gate: c.gate,
          skip: c.skip,
          outlier_reason: c.outlier_reason,
          suggested_topics: c.gate === "outlier" ? [] : c.suggested_topics,
          value_rank: c.value_rank,
          reply_templates: c.gate === "outlier" ? [] : t.reply_templates || [],
        };
        return normalizeThread(next);
      });
      const saved = await saveBatch({ ...cur, threads });
      sendResponse({
        ok: true,
        batch: saved,
        upload_enabled: uploadEnabled(saved),
      });
      return;
    }

    if (msg.type === "MPX_UPLOAD_STUB") {
      const cur = await loadBatch();
      if (!uploadEnabled(cur)) {
        sendResponse({
          ok: false,
          error: "upload_not_enabled",
          batch: cur,
          upload_enabled: false,
          message:
            cur.status !== "ready"
              ? "Mark ready first"
              : "Nothing new to upload",
        });
        return;
      }
      let mediaCount = 0;
      try {
        const all = await self.MyProblemMediaIdb.listBlobs();
        mediaCount = all.length;
      } catch (_) {}
      // Intake not configured — honest stub + contract for later wiring
      sendResponse({
        ok: false,
        error: "intake_not_configured",
        batch: cur,
        upload_enabled: true,
        media_files: mediaCount,
        contract: {
          method: "POST",
          path: "/api/social-capture/upload",
          content_type: "multipart/form-data",
          fields: {
            batch: "myproblem.capture_batch.v1 JSON",
            file: "repeated parts named by media local_name",
          },
          notes:
            "Server stores Intake cache / private Bunny inbox; Batch media_frame_select → choice stills; unused video purged. Extension never holds BUNNY_STORAGE_API_KEY.",
        },
        message:
          `Intake upload not configured yet (${mediaCount} local media file(s) ready). Use Export batch + media, or wait for server upload.`,
      });
      return;
    }

    if (msg.type === "MPX_AUTO_HARVEST_HINT" || msg.type === "MPX_DEEP_PROGRESS") {
      sendResponse({ ok: true });
      return;
    }

    sendResponse({ ok: false, error: "unknown" });
  })();
  return true;
});
