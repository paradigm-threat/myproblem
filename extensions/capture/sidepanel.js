(function () {
  "use strict";

  let batch = null;
  let uploadEnabled = false;
  let mediaFileCount = 0;
  let pageCtx = null;
  let groupEntry = null;
  let collectionMeta = null;
  let topicFilter = null;
  let selectedThreadId = null;
  let visitorId = null;
  /** @type {"idle"|"needs"|"gathering"|"success"|"failed"|"lookback"} */
  let gatherState = "needs";
  let lookbackDays = null; // null = since last refresh
  let lastGatherAt = null;
  let lastGatherStats = { posts: 0, topics: 0 };

  const $ = (id) => document.getElementById(id);
  const EXT_VERSION = chrome.runtime.getManifest().version;
  const ExtId = () => globalThis.MyProblemExternalId;
  const LOOKBACK_KEY = "mpx_lookback_days";
  const LAST_GATHER_KEY = "mpx_last_gather_at";

  function setStatus(msg) {
    const el = $("status-line");
    if (el) {
      el.hidden = false;
      el.textContent = msg;
    }
  }

  function daysSince(ms) {
    if (!ms) return null;
    return Math.max(1, Math.round((Date.now() - ms) / 86400000));
  }

  function plainLookback() {
    if (lookbackDays != null) return "Last " + lookbackDays + " days";
    const d = daysSince(lastGatherAt);
    if (d == null) return "About a few days to catch up";
    return "About " + d + " day" + (d === 1 ? "" : "s") + " to catch up";
  }

  function setGatherState(next) {
    gatherState = next;
    const ids = [
      "gather-idle",
      "gather-needs",
      "gather-gathering",
      "gather-success",
      "gather-failed",
      "gather-lookback",
    ];
    ids.forEach((id) => {
      const el = $(id);
      if (!el) return;
      const key = id.replace("gather-", "");
      el.hidden = key !== next;
    });
    const lb = $("lookback-plain");
    if (lb) lb.textContent = plainLookback();
    const needsLast = $("last-refresh-needs");
    const idleLast = $("last-refresh-idle");
    const lastTxt = lastGatherAt
      ? "Last refreshed " +
        (daysSince(lastGatherAt) === 1
          ? "yesterday"
          : daysSince(lastGatherAt) + " days ago")
      : "Not refreshed yet on this device";
    if (needsLast) needsLast.textContent = lastTxt;
    if (idleLast) {
      idleLast.textContent = lastGatherAt
        ? daysSince(lastGatherAt) <= 1
          ? "Last refreshed today"
          : lastTxt
        : "No gather yet";
    }
    const sp = $("stat-posts");
    const st = $("stat-topics");
    if (sp) sp.textContent = String(lastGatherStats.posts || 0);
    if (st) st.textContent = String(lastGatherStats.topics || 0);
  }

  async function loadGatherPrefs() {
    const data = await chrome.storage.local.get([LOOKBACK_KEY, LAST_GATHER_KEY]);
    if (data[LOOKBACK_KEY] != null) lookbackDays = Number(data[LOOKBACK_KEY]) || null;
    if (data[LAST_GATHER_KEY]) lastGatherAt = Number(data[LAST_GATHER_KEY]) || null;
    const stale =
      !lastGatherAt || (daysSince(lastGatherAt) != null && daysSince(lastGatherAt) >= 1);
    setGatherState(stale ? "needs" : "idle");
  }

  function maxPostsForLookback() {
    const d = lookbackDays != null ? lookbackDays : daysSince(lastGatherAt) || 5;
    return Math.min(40, Math.max(8, Math.round(d * 3)));
  }

  async function showHostOverlay(show) {
    try {
      const tab = await findNextdoorTab();
      if (!tab || !tab.id) return;
      await chrome.tabs.sendMessage(tab.id, {
        type: show ? "MPX_GATHER_OVERLAY_SHOW" : "MPX_GATHER_OVERLAY_HIDE",
      });
    } catch (_) {
      /* content may be missing */
    }
  }

  function setConn(state, msg) {
    const el = $("conn-line");
    if (!el) return;
    el.className = "mpx-conn" + (state ? " " + state : "");
    el.textContent = msg;
  }

  function paintVersion() {
    // Version lives in the Chrome side-panel title (manifest name). Footer is backup only.
    const foot = $("ext-version-foot");
    if (foot) foot.textContent = "v" + EXT_VERSION;
  }

  async function findNextdoorTab() {
    const active = await activeTab();
    if (active && active.id && active.url && /nextdoor\.com/i.test(active.url)) {
      return active;
    }
    const inWindow = await chrome.tabs.query({
      currentWindow: true,
      url: ["*://nextdoor.com/*", "*://*.nextdoor.com/*"],
    });
    if (inWindow && inWindow.length) {
      const focused = inWindow.find((t) => t.active) || inWindow[0];
      return focused;
    }
    const any = await chrome.tabs.query({
      url: ["*://nextdoor.com/*", "*://*.nextdoor.com/*"],
    });
    return any && any[0] ? any[0] : active || null;
  }

  async function pingTab(tab) {
    if (!tab || !tab.id) return null;
    try {
      return await chrome.tabs.sendMessage(tab.id, { type: "MPX_PING" });
    } catch (_) {
      return null;
    }
  }

  async function injectContent(tab) {
    if (!tab || !tab.id) throw new Error("no_tab");
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [
        "lib/scrub.js",
        "lib/topics.js",
        "lib/external-id.js",
        "content.js",
      ],
    });
  }

  async function ensureVisitor() {
    if (visitorId) return visitorId;
    const data = await chrome.storage.local.get(["mpx_visitor"]);
    if (data.mpx_visitor) {
      visitorId = data.mpx_visitor;
      return visitorId;
    }
    visitorId =
      "mpx-" +
      (crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8)
        : String(Date.now()));
    await chrome.storage.local.set({ mpx_visitor: visitorId });
    return visitorId;
  }

  function matchCollectionGroup(collection, groupId) {
    if (!collection || !groupId) return null;
    const groups = collection.groups || [];
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (
        g.group_secure_id === groupId ||
        g.id === "ndg-" + groupId ||
        g.id === groupId
      ) {
        return {
          id: g.id || "ndg-" + groupId,
          kind: "forum_group",
          site: g.site || "nextdoor",
          group_secure_id: g.group_secure_id || groupId,
          group_name: g.group_name || collection.name,
          url: g.url,
          irc_channel: collection.irc_channel,
          ws_topic: collection.ws_topic,
          topics: collection.topics || [],
          collection_id: collection.id,
          collection_name: collection.name,
        };
      }
    }
    return null;
  }

  async function loadCollection() {
    const urls = [
      chrome.runtime.getURL("data/savannah-cat-rescue.json"),
      "https://myproblem.app/collections/savannah-cat-rescue.json",
    ];
    for (let i = 0; i < urls.length; i++) {
      try {
        const res = await fetch(
          urls[i],
          urls[i].indexOf("http") === 0 ? { cache: "no-store" } : undefined
        );
        if (!res.ok) continue;
        const j = await res.json();
        if (j && j.kind === "forum_collection") {
          collectionMeta = j;
          return j;
        }
      } catch (_) {}
    }
    return collectionMeta;
  }

  async function loadGroupEntry(groupId) {
    groupEntry = null;
    const coll = collectionMeta || (await loadCollection());
    if (!coll) return null;
    if (!groupId) return null;
    const matched = matchCollectionGroup(coll, groupId);
    if (matched) {
      groupEntry = matched;
      return groupEntry;
    }
    return null;
  }

  async function refreshPageContext() {
    await loadCollection();
    const tab = await findNextdoorTab();
    const eid = ExtId();
    pageCtx = tab && tab.url && eid ? eid.parseNextdoorUrl(tab.url) : null;
    // Prefer group from batch source when on a post without group in URL
    if (pageCtx && pageCtx.kind === "post" && !pageCtx.groupId && batch && batch.source) {
      pageCtx.groupId = batch.source.group_secure_id || null;
    }
    if (pageCtx && pageCtx.groupId) {
      await loadGroupEntry(pageCtx.groupId);
    } else if (batch && batch.source && batch.source.group_secure_id) {
      pageCtx = pageCtx || { kind: "group", groupId: null, postId: null };
      if (!pageCtx.groupId) pageCtx.groupId = batch.source.group_secure_id;
      await loadGroupEntry(pageCtx.groupId);
    } else {
      groupEntry = null;
    }
    paintCollectionHeader();
    paintRoster();
    paintPageContext();
    paintTopicChips();
    paintRefPreview();
  }

  function paintCollectionHeader() {
    const title = $("collection-title");
    const tag = $("collection-tag");
    const mission = $("collection-mission");
    const c = collectionMeta;
    if (title) {
      title.textContent = (c && c.name) || "Savannah Cat Rescue";
    }
    if (mission) {
      mission.textContent =
        (c && c.primary_job) ||
        "First job: connect litters / unfixed moms to the TNR trap network.";
    }
    if (tag) {
      const place = (c && c.place) || "Savannah, GA";
      const ch =
        (c && c.irc_channel) ||
        (ExtId() && ExtId().DEFAULTS.irc_channel) ||
        "#ga-savannah-cat-rescue";
      const n = (c && c.groups && c.groups.length) || 0;
      tag.textContent =
        place +
        " · " +
        n +
        " group" +
        (n === 1 ? "" : "s") +
        " to sync · " +
        ch;
    }
  }

  const TNR_TOPIC_KEYS = {
    tnr: true,
    relocate: true,
    "colony-care": true,
    foster: true,
  };

  function isTnrMatch(thread) {
    if (!thread || thread.gate === "outlier" || thread.skip) return false;
    const topics = thread.suggested_topics || [];
    for (let i = 0; i < topics.length; i++) {
      if (TNR_TOPIC_KEYS[topics[i]]) return true;
    }
    const body = String(thread.body_redacted || thread.body || "");
    return /\b(kitten|kittens|litter|pregnant|unfixed|not fixed|trap|tnr|trap[\s/-]?neuter|need(s)? (a )?trapper|mama cat|mother cat)\b/i.test(
      body
    );
  }

  function tnrThreads() {
    return ticketThreads().filter(isTnrMatch);
  }

  function paintTnrQueue() {
    const list = $("tnr-list");
    const empty = $("tnr-empty");
    if (!list || !empty) return;
    const rows = batch ? tnrThreads() : [];
    if (!rows.length) {
      empty.hidden = false;
      list.hidden = true;
      empty.textContent = batch
        ? "No litter / unfixed / trap-needed posts in this session yet. Deep capture a member group."
        : "Capture a member group feed. Posts about kittens, pregnant/unfixed strays, or trap help surface here first.";
      list.innerHTML = "";
      return;
    }
    empty.hidden = true;
    list.hidden = false;
    renderThreadList(list, rows, { outlier: false });
  }

  function paintRoster() {
    const list = $("roster-list");
    const empty = $("roster-empty");
    if (!list || !empty) return;
    const groups = (collectionMeta && collectionMeta.groups) || [];
    list.innerHTML = "";
    if (!groups.length) {
      empty.hidden = false;
      list.hidden = true;
      empty.textContent = "No member groups in collection yet.";
      return;
    }
    empty.hidden = true;
    list.hidden = false;
    const activeId = (pageCtx && pageCtx.groupId) || (groupEntry && groupEntry.group_secure_id) || "";
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      const li = document.createElement("li");
      const isActive = g.group_secure_id === activeId;
      li.className = "mpx-roster-item" + (isActive ? " is-active" : "");
      const name = document.createElement(g.url ? "a" : "span");
      name.textContent = g.group_name || g.group_secure_id || "Group";
      if (g.url) {
        name.href = g.url;
        name.target = "_blank";
        name.rel = "noopener";
      }
      const meta = document.createElement("span");
      meta.className = "mpx-roster-meta";
      meta.textContent =
        (g.site || "nextdoor") +
        " · " +
        (g.group_secure_id || "") +
        (isActive ? " · this tab" : "");
      li.appendChild(name);
      li.appendChild(meta);
      list.appendChild(li);
    }
  }

  function paintPageContext() {
    const pageLine = $("page-line");
    const entryLine = $("entry-line");
    const ircLine = $("irc-line");
    if (!pageLine) return;
    if (!pageCtx || pageCtx.kind === "other") {
      pageLine.textContent = "Not on a Nextdoor group/post URL";
    } else if (pageCtx.kind === "post") {
      pageLine.textContent =
        "Post " +
        pageCtx.postId +
        (pageCtx.groupId ? " · group " + pageCtx.groupId : " · group unknown");
    } else {
      pageLine.textContent = "Group " + (pageCtx.groupId || "?");
    }
    if (entryLine) {
      if (groupEntry) {
        entryLine.textContent =
          "Collection: " +
          (groupEntry.collection_name || groupEntry.collection_id || "Savannah Cat Rescue") +
          " · " +
          (groupEntry.group_name || groupEntry.id) +
          " · " +
          (groupEntry.topics || []).length +
          " topics";
      } else if (pageCtx && pageCtx.groupId) {
        entryLine.textContent =
          "No collection entry yet — deep capture + upload; batch AI may add " +
          pageCtx.groupId +
          " to savannah-cat-rescue";
      } else {
        entryLine.textContent = "No entry";
      }
    }
    if (ircLine) {
      const ch =
        (groupEntry && groupEntry.irc_channel) ||
        (ExtId() && ExtId().DEFAULTS.irc_channel) ||
        "#ga-savannah-cat-rescue";
      const topic =
        (groupEntry && groupEntry.ws_topic) ||
        (ExtId() && ExtId().DEFAULTS.ws_topic) ||
        "ga-savannah-cat-rescue";
      ircLine.textContent = "Craft IRC: " + ch + " · WS topic=" + topic;
    }
  }

  function paintTopicChips() {
    const wrap = $("topic-chips");
    const empty = $("topics-empty");
    if (!wrap) return;
    const topics =
      (groupEntry && groupEntry.topics) ||
      (collectionMeta && collectionMeta.topics) ||
      [...new Set(ticketThreads().flatMap((t) => t.suggested_topics || []))];
    wrap.innerHTML = "";
    if (!topics.length) {
      wrap.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    wrap.hidden = false;
    const all = document.createElement("button");
    all.type = "button";
    all.className = "mpx-chip" + (topicFilter == null ? " is-active" : "");
    all.textContent = "All";
    all.addEventListener("click", () => {
      topicFilter = null;
      paintTopicChips();
      render();
    });
    wrap.appendChild(all);
    for (const t of topics) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mpx-chip" + (topicFilter === t ? " is-active" : "");
      btn.textContent = t;
      btn.addEventListener("click", () => {
        topicFilter = t;
        paintTopicChips();
        render();
      });
      wrap.appendChild(btn);
    }
  }

  function currentRefTag() {
    const eid = ExtId();
    if (!eid) return "";
    let ctx = pageCtx ? { ...pageCtx } : null;
    if (selectedThreadId && batch) {
      const th = (batch.threads || []).find((t) => t.id === selectedThreadId);
      let postId = th && th.external_ref && th.external_ref.post_id;
      if (!postId && th && th.external_ref && th.external_ref.url) {
        const m = String(th.external_ref.url).match(/\/p\/([A-Za-z0-9_-]+)/);
        postId = m ? m[1] : null;
      }
      const groupId =
        (batch.source && batch.source.group_secure_id) ||
        (pageCtx && pageCtx.groupId);
      if (postId && groupId) ctx = { kind: "post", groupId, postId };
    }
    return eid.contextTag(ctx);
  }

  function selectedTopicHint() {
    if (topicFilter) return topicFilter;
    if (!selectedThreadId || !batch) return "";
    const th = (batch.threads || []).find((t) => t.id === selectedThreadId);
    const topics = (th && th.suggested_topics) || [];
    return topics[0] || "";
  }

  function paintRefPreview() {
    const el = $("ref-preview");
    if (!el) return;
    const tag = currentRefTag();
    const topicHint = selectedTopicHint();
    if (!tag) {
      el.textContent = "No origin ref (open a tracked group/post)";
      return;
    }
    el.innerHTML = "";
    const icon = document.createElement("a");
    icon.className = "mpx-ref-icon";
    icon.href = "#";
    icon.title = tag;
    icon.textContent = "↗";
    icon.setAttribute("aria-label", "Origin ref " + tag);
    const parsed = ExtId().parseTag(tag);
    const urls = ExtId().urlsFor(parsed);
    if (urls && (urls.post_url || urls.group_url)) {
      icon.href = urls.post_url || urls.group_url;
      icon.target = "_blank";
      icon.rel = "noopener";
    }
    el.appendChild(icon);
    const meta = document.createElement("span");
    meta.textContent =
      "  will prepend tag" + (topicHint ? " · topic [" + topicHint + "]" : "");
    el.appendChild(meta);
  }

  async function sendCraftMessage() {
    const eid = ExtId();
    const draft = $("irc-draft");
    const body = (draft && draft.value) || "";
    const tag = currentRefTag();
    const topicHint = selectedTopicHint();
    let text = eid ? eid.prependTag(body, tag) : body;
    if (topicHint && text.indexOf("[" + topicHint + "]") < 0) {
      text = text.replace(tag, tag + " [" + topicHint + "]");
      if (text === body) text = (tag ? tag + " " : "") + "[" + topicHint + "] " + body;
    }
    text = text.trim();
    if (!text) {
      setStatus("Craft message empty");
      return;
    }
    const topic =
      (groupEntry && groupEntry.ws_topic) ||
      eid.DEFAULTS.ws_topic ||
      "ga-savannah-cat-rescue";
    const visitor = await ensureVisitor();
    const host = eid.DEFAULTS.chat_host;
    try {
      const view = await fetch(
        host + "/api/chat?action=view&topic=" + encodeURIComponent(topic),
        { credentials: "omit" }
      );
      // Prefer submit enqueue
      const res = await fetch(host + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          topic,
          visitor,
          body: text,
        }),
      });
      if (!res.ok) {
        setStatus("Craft send failed HTTP " + res.status);
        return;
      }
      appendIrcLog(text);
      if (draft) draft.value = "";
      setStatus("Sent to craft room " + topic + " (WS/IRC bridge)");
      void view;
    } catch (e) {
      setStatus("Craft send error: " + (e && e.message ? e.message : e));
    }
  }

  function appendIrcLog(text) {
    const log = $("irc-log");
    if (!log) return;
    const li = document.createElement("li");
    const eid = ExtId();
    const stripped = eid ? eid.stripTags(text) : text;
    const m = text.match(eid && eid.TAG_RE);
    li.innerHTML = "";
    if (m) {
      const icon = document.createElement("span");
      icon.className = "mpx-ref-icon";
      icon.textContent = "↗";
      icon.title = m[0];
      li.appendChild(icon);
      li.appendChild(document.createTextNode(" " + stripped));
    } else {
      li.textContent = stripped;
    }
    log.insertBefore(li, log.firstChild);
    while (log.children.length > 20) log.removeChild(log.lastChild);
  }

  function switchTab(which) {
    const main = $("panel-main");
    const lab = $("panel-lab");
    const tm = $("tab-main");
    const tl = $("tab-lab");
    const isMain = which === "main";
    if (main) main.hidden = !isMain;
    if (lab) lab.hidden = isMain;
    if (tm) {
      tm.classList.toggle("is-active", isMain);
      tm.setAttribute("aria-selected", isMain ? "true" : "false");
    }
    if (tl) {
      tl.classList.toggle("is-active", !isMain);
      tl.setAttribute("aria-selected", !isMain ? "true" : "false");
    }
  }

  function paintPingOk(ping) {
    const bits = [];
    if (ping.cards != null) bits.push(ping.cards + " feed cards visible");
    if (ping.detail) bits.push("post detail open");
    setConn(
      "ok",
      "Connected to Nextdoor · " +
        (bits.join(" · ") || "content script live") +
        " — Capture / Deep capture will work"
    );
  }

  async function checkConnection(opts) {
    const tryAttach = !!(opts && opts.tryAttach);
    setConn("", "Checking Nextdoor connection…");
    const tab = await findNextdoorTab();
    if (!tab || !tab.id) {
      setConn("bad", "No tab found — open nextdoor.com/g/… in this window");
      return false;
    }
    if (!tab.url || !/nextdoor\.com/i.test(tab.url)) {
      setConn(
        "warn",
        "No Nextdoor tab in this window (active: " +
          (tab.url ? tab.url.slice(0, 40) : "empty") +
          ") — open the group first"
      );
      return false;
    }

    let ping = await pingTab(tab);
    if (ping && ping.ok) {
      paintPingOk(ping);
      return true;
    }

    if (tryAttach) {
      setConn("warn", "Attaching content script to Nextdoor tab…");
      try {
        await injectContent(tab);
        await new Promise((r) => setTimeout(r, 150));
        ping = await pingTab(tab);
        if (ping && ping.ok) {
          paintPingOk(ping);
          setStatus("Attached — try Capture or Deep capture now");
          return true;
        }
      } catch (e) {
        setConn(
          "bad",
          "Attach failed (" +
            (e && e.message ? e.message : e) +
            ") — click Fix connection (reloads tab + extension if needed)"
        );
        return false;
      }
    }

    setConn(
      "bad",
      "Content script missing — click Fix connection (reloads Nextdoor and re-attaches)"
    );
    return false;
  }

  function waitTabComplete(tabId, timeoutMs) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      const onUpdated = (id, info) => {
        if (id !== tabId) return;
        if (info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(onUpdated);
          resolve(true);
        }
      };
      chrome.tabs.onUpdated.addListener(onUpdated);
      const tick = () => {
        if (Date.now() - t0 > (timeoutMs || 20000)) {
          chrome.tabs.onUpdated.removeListener(onUpdated);
          resolve(false);
          return;
        }
        chrome.tabs.get(tabId, (t) => {
          if (chrome.runtime.lastError) {
            chrome.tabs.onUpdated.removeListener(onUpdated);
            resolve(false);
            return;
          }
          if (t && t.status === "complete") {
            chrome.tabs.onUpdated.removeListener(onUpdated);
            resolve(true);
            return;
          }
          setTimeout(tick, 200);
        });
      };
      setTimeout(tick, 300);
    });
  }

  async function reloadNextdoorTab(tab) {
    await chrome.tabs.reload(tab.id, { bypassCache: true });
    await waitTabComplete(tab.id, 25000);
    // Let Nextdoor hydrate a bit
    await new Promise((r) => setTimeout(r, 600));
  }

  async function finishFixOnTab(tab) {
    setConn("warn", "Re-attaching content script…");
    await injectContent(tab);
    await new Promise((r) => setTimeout(r, 200));
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "MPX_CLEAR_SEEN" });
    } catch (_) {}
    const ping = await pingTab(tab);
    if (ping && ping.ok) {
      paintPingOk(ping);
      setStatus("Connection fixed — Capture / Deep capture should work now");
      return true;
    }
    return false;
  }

  async function fixConnection() {
    const btn = $("btn-fix");
    if (btn) btn.disabled = true;
    setConn("warn", "Fixing connection…");
    setStatus("Fix connection running…");

    let tab = await findNextdoorTab();
    if (!tab || !tab.id || !tab.url || !/nextdoor\.com/i.test(tab.url)) {
      setConn("bad", "Open a nextdoor.com group tab in this window, then Fix connection again");
      setStatus("No Nextdoor tab to fix");
      if (btn) btn.disabled = false;
      return;
    }

    // Fast path: inject into current page
    try {
      if (await finishFixOnTab(tab)) {
        if (btn) btn.disabled = false;
        return;
      }
    } catch (_) {}

    // Reload Nextdoor (bypass cache), then inject
    try {
      setConn("warn", "Reloading Nextdoor tab (bypass cache)…");
      setStatus("Reloading Nextdoor…");
      await reloadNextdoorTab(tab);
      tab = (await chrome.tabs.get(tab.id)) || tab;
      if (await finishFixOnTab(tab)) {
        if (btn) btn.disabled = false;
        return;
      }
    } catch (e) {
      setStatus("Tab reload/attach failed: " + (e && e.message ? e.message : e));
    }

    // Last resort: reload this extension from disk, then finish on startup
    setConn("warn", "Reloading extension code… panel will reopen — hang on");
    setStatus("Reloading extension…");
    await chrome.storage.local.set({
      mpx_fix_pending: Date.now(),
      mpx_fix_tab: tab.id,
    });
    chrome.runtime.reload();
  }

  async function resumeFixIfPending() {
    const data = await chrome.storage.local.get([
      "mpx_fix_pending",
      "mpx_fix_tab",
    ]);
    const pending = data.mpx_fix_pending;
    if (!pending || Date.now() - pending > 90000) return;
    await chrome.storage.local.remove(["mpx_fix_pending", "mpx_fix_tab"]);
    setConn("warn", "Extension reloaded — finishing Fix connection…");
    let tab = null;
    if (data.mpx_fix_tab) {
      try {
        tab = await chrome.tabs.get(data.mpx_fix_tab);
      } catch (_) {}
    }
    if (!tab || !tab.url || !/nextdoor\.com/i.test(tab.url)) {
      tab = await findNextdoorTab();
    }
    if (!tab || !tab.id) {
      setConn("bad", "Extension reloaded but no Nextdoor tab — open the group, then Fix connection");
      return;
    }
    try {
      setConn("warn", "Reloading Nextdoor tab after extension reload…");
      await reloadNextdoorTab(tab);
      tab = (await chrome.tabs.get(tab.id)) || tab;
      if (!(await finishFixOnTab(tab))) {
        setConn(
          "bad",
          "Still not connected after Fix — leave Nextdoor focused and click Fix connection once more"
        );
      }
    } catch (e) {
      setConn(
        "bad",
        "Post-reload fix failed: " + (e && e.message ? e.message : e)
      );
    }
  }

  async function listLocalMediaMeta() {
    try {
      if (globalThis.MyProblemMediaIdb && globalThis.MyProblemMediaIdb.listMeta) {
        const items = await globalThis.MyProblemMediaIdb.listMeta();
        return { ok: true, items: items || [] };
      }
    } catch (_) {}
    try {
      return await chrome.runtime.sendMessage({ type: "MPX_LIST_MEDIA" });
    } catch (_) {
      return { ok: false, items: [] };
    }
  }

  async function refresh() {
    const res = await chrome.runtime.sendMessage({ type: "MPX_GET_BATCH" });
    batch = res.batch;
    uploadEnabled = !!res.upload_enabled;
    try {
      if (globalThis.MyProblemMediaIdb && globalThis.MyProblemMediaIdb.countAll) {
        mediaFileCount = await globalThis.MyProblemMediaIdb.countAll();
      } else {
        const media = await listLocalMediaMeta();
        mediaFileCount = media && media.ok ? (media.items || []).length : 0;
      }
    } catch (_) {
      mediaFileCount = 0;
    }
    render();
  }

  function repliesReady() {
    if (!batch) return [];
    return (batch.threads || []).filter(
      (t) =>
        t.gate !== "outlier" &&
        Array.isArray(t.reply_templates) &&
        t.reply_templates.length > 0
    );
  }

  function ticketThreads() {
    let list = (batch.threads || []).filter((t) => t.gate !== "outlier" && !t.skip);
    if (topicFilter) {
      list = list.filter((t) => (t.suggested_topics || []).includes(topicFilter));
    }
    return list;
  }

  function outlierThreads() {
    return (batch.threads || []).filter((t) => t.gate === "outlier" || t.skip);
  }

  function probeLooksStale(probe) {
    if (!probe || !probe.candidate_by_selector) return !!probe;
    const by = probe.candidate_by_selector;
    const cardHits =
      (by['[data-testid="feed-item-card"]'] || 0) +
      (by['[data-testid="feed-item-card"](exact)'] || 0);
    if (cardHits > 0) return false;
    return (probe.candidate_card_count || 0) >= 100;
  }

  function paintStats() {
    const line = $("stats-line");
    if (!batch || !line) return;
    const s = batch.stats || {};
    const tickets = s.ticket_count != null ? s.ticket_count : ticketThreads().length;
    const outliers =
      s.outlier_count != null ? s.outlier_count : outlierThreads().length;
    const reasons = s.by_reason || {};
    const reasonBits = Object.keys(reasons)
      .sort()
      .map((k) => `${k}:${reasons[k]}`)
      .join(", ");
    const status = batch.status || "draft";
    const up = (batch.upload && batch.upload.state) || "never";
    const pass = batch.validation_pass || 0;
    line.hidden = false;
    line.textContent =
      `${tickets} ticket${tickets === 1 ? "" : "s"} · ${outliers} outlier${
        outliers === 1 ? "" : "s"
      }` +
      (reasonBits ? ` (${reasonBits})` : "") +
      ` · ${mediaFileCount} media file${mediaFileCount === 1 ? "" : "s"}` +
      ` · status=${status} · upload=${up}` +
      (pass ? ` · pass ${pass}` : "");
  }

  function renderThreadList(el, threads, { outlier }) {
    el.innerHTML = "";
    const sorted = [...threads].sort(
      (a, b) => (b.value_rank || 0) - (a.value_rank || 0)
    );
    for (const t of sorted) {
      const li = document.createElement("li");
      if (outlier) {
        const url = t.external_ref && t.external_ref.url;
        li.innerHTML = `
          <div class="rank">${escapeHtml(t.outlier_reason || "outlier")} · ${escapeHtml(t.id)}</div>
          <div class="body-preview">${escapeHtml(t.body_redacted || "")}</div>
          <div class="row-actions">
            ${
              url
                ? `<a class="link-btn" href="${escapeAttr(url)}" target="_blank" rel="noopener">Open post</a>`
                : ""
            }
            <button type="button" class="secondary" data-copy-id="${escapeAttr(t.id)}">Copy body</button>
          </div>`;
      } else {
        const topics = (t.suggested_topics || [])
          .map((k) => `<span class="chip">${escapeHtml(k)}</span>`)
          .join("");
        const url = t.external_ref && t.external_ref.url;
        const mediaBits = (t.media || [])
          .map((m) => m.kind + (m.downloaded ? "" : "?"))
          .join(",");
        const mediaLabel =
          t.media && t.media.length
            ? `${t.media.length} media${mediaBits ? ` (${mediaBits})` : ""}`
            : "no media";
        li.innerHTML = `
          <div class="rank">value ${Number(t.value_rank || 0).toFixed(2)} · ${escapeHtml(t.id)} · ${escapeHtml(mediaLabel)}</div>
          <div class="topics">${topics}</div>
          <div class="body-preview">${escapeHtml(t.body_redacted || "")}</div>
          <div class="row-actions">
            ${
              url
                ? `<a class="link-btn" href="${escapeAttr(url)}" target="_blank" rel="noopener">Open post</a>`
                : ""
            }
            <button type="button" class="secondary" data-select-id="${escapeAttr(t.id)}">Use for IRC</button>
            <button type="button" class="secondary" data-copy-id="${escapeAttr(t.id)}">Copy body</button>
          </div>`;
        if (selectedThreadId === t.id) li.classList.add("is-selected");
      }
      el.appendChild(li);
    }
    el.querySelectorAll("[data-copy-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const th = batch.threads.find(
          (x) => x.id === btn.getAttribute("data-copy-id")
        );
        if (th) copyText(th.body_redacted || "");
      });
    });
    el.querySelectorAll("[data-select-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedThreadId = btn.getAttribute("data-select-id");
        paintRefPreview();
        render();
      });
    });
  }

  function render() {
    if (!batch) {
      paintCollectionHeader();
      paintRoster();
      paintPageContext();
      paintTopicChips();
      paintRefPreview();
      paintTnrQueue();
      return;
    }
    const tickets = ticketThreads();
    const outliers = outlierThreads();
    const ready = repliesReady();
    const src = batch.source
      ? `${batch.source.group_name || "group"} (${batch.source.group_secure_id || "?"})`
      : "no source yet";
    const summary = batch.last_capture_summary;
    const stale = probeLooksStale(batch.last_dom_probe);
    const summaryBit = summary
      ? ` · last: ${summary.threads || 0} threads / ${summary.cards || 0} cards${
          summary.logged_out_guess ? " · LOGGED OUT?" : ""
        }`
      : "";
    const staleBit = stale
      ? ` · STALE probe (v${EXT_VERSION}) — F5 Nextdoor tab then Probe`
      : "";
    setStatus(
      `${tickets.length} tickets · ${outliers.length} outliers · ${ready.length} with replies · ${src}${summaryBit}${staleBit}`
    );
    paintStats();
    void refreshPageContext();

    if ($("ticket-count")) $("ticket-count").textContent = `(${tickets.length})`;
    if ($("outlier-count")) $("outlier-count").textContent = `(${outliers.length})`;
    paintTnrQueue();
    if ($("ticket-list")) renderThreadList($("ticket-list"), tickets, { outlier: false });
    if ($("outlier-list")) renderThreadList($("outlier-list"), outliers, { outlier: true });

    const uploadBtn = $("btn-upload");
    if (uploadBtn) {
      uploadBtn.disabled = !uploadEnabled;
      uploadBtn.title = uploadEnabled
        ? "New outbound work ready for Intake (stub until configured)"
        : batch.status !== "ready"
          ? "Mark ready first"
          : "Nothing new to upload";
    }

    const rl = $("replies-list");
    if (!rl) return;
    rl.innerHTML = "";
    if ($("replies-empty")) $("replies-empty").hidden = ready.length > 0;
    for (const t of ready) {
      for (const r of t.reply_templates) {
        const li = document.createElement("li");
        const tone = document.createElement("div");
        tone.className = "rank";
        tone.textContent = `${r.tone || "helpful"} · thread ${t.id}`;
        const preview = document.createElement("div");
        preview.className = "body-preview";
        preview.textContent = r.body || "";
        const actions = document.createElement("div");
        actions.className = "row-actions";
        const pasteBtn = document.createElement("button");
        pasteBtn.type = "button";
        pasteBtn.textContent = "Paste into page";
        pasteBtn.addEventListener("click", () => pasteToActiveTab(r.body || ""));
        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "secondary";
        copyBtn.textContent = "Copy";
        copyBtn.addEventListener("click", () => copyText(r.body || ""));
        actions.appendChild(pasteBtn);
        actions.appendChild(copyBtn);
        li.appendChild(tone);
        li.appendChild(preview);
        li.appendChild(actions);
        rl.appendChild(li);
      }
    }

    const debugView = {
      status: batch.status,
      upload: batch.upload,
      stats: batch.stats,
      content_hash: batch.content_hash,
      validation_pass: batch.validation_pass,
      last_capture_summary: batch.last_capture_summary,
      last_dom_probe: batch.last_dom_probe,
      recent_debug: (batch.debug || []).slice(-15),
    };
    $("debug-pre").textContent = JSON.stringify(debugView, null, 2);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied to clipboard");
    } catch (_) {
      setStatus("Clipboard blocked — select text manually");
    }
  }

  async function activeTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  async function runOnNextdoor(messageType, busyLabel, extra) {
    let tab = await findNextdoorTab();
    if (!tab || !tab.id) {
      setStatus("No Nextdoor tab — open the group in this window");
      await checkConnection();
      return null;
    }
    if (!tab.url || !/nextdoor\.com/i.test(tab.url)) {
      setStatus("Open a nextdoor.com group/feed tab first");
      await checkConnection();
      return null;
    }
    setStatus(busyLabel);
    let res;
    try {
      res = await chrome.tabs.sendMessage(tab.id, {
        type: messageType,
        ...(extra || {}),
      });
    } catch (e) {
      // After extension reload, auto-inject once then retry
      try {
        await injectContent(tab);
        await new Promise((r) => setTimeout(r, 150));
        res = await chrome.tabs.sendMessage(tab.id, {
          type: messageType,
          ...(extra || {}),
        });
      } catch (e2) {
        setStatus("Content script missing — click Fix connection, then try again");
        await checkConnection({ tryAttach: true });
        const debug = [
          {
            reason: "content_script_unreachable",
            url: tab.url,
            notes: String(e2 && e2.message ? e2.message : e2),
            hint: "Click Fix connection, or Reload extension then F5 Nextdoor.",
          },
        ];
        await chrome.runtime.sendMessage({
          type: "MPX_MERGE_HARVEST",
          source: null,
          threads: [],
          debug,
          dom_probe: debug[0],
          capture_summary: {
            threads: 0,
            cards: 0,
            error: "content_script_unreachable",
          },
        });
        await refresh();
        return null;
      }
    }
    await chrome.runtime.sendMessage({
      type: "MPX_MERGE_HARVEST",
      source: res.source,
      threads: res.threads || [],
      debug: res.debug || [],
      dom_probe: res.dom_probe,
      capture_summary: res.capture_summary,
    });
    await refresh();
    return res;
  }

  async function capturePage() {
    const res = await runOnNextdoor("MPX_CAPTURE_PAGE", "Capturing…");
    if (!res) return;
    const s = res.capture_summary || {};
    setStatus(
      `Capture done · ${s.threads || 0} threads · ${s.cards || 0} cards · debug ${(res.debug || []).length}${
        s.logged_out_guess ? " · looks logged out" : ""
      } — Mark ready when the session looks complete`
    );
  }

  async function probeDom() {
    const res = await runOnNextdoor("MPX_DOM_PROBE", "Probing DOM…");
    if (!res) return;
    const s = res.capture_summary || {};
    setStatus(
      `Probe done · ${s.threads || 0} threads · ${s.cards || 0} cards — use Copy debug for Cursor`
    );
  }

  let deepHasRun = false;

  function setDeepRunning(running) {
    const stop = $("btn-deep-stop");
    const deep = $("btn-deep");
    const primary = $("btn-gather-primary");
    const capture = $("btn-capture");
    if (stop) stop.hidden = !running;
    if (deep) {
      deep.disabled = !!running;
      const label = deep.querySelector(".mpx-btn-label") || deep;
      if (running) label.textContent = "Gathering…";
      else label.textContent = deepHasRun ? "Refresh" : "Refresh";
    }
    if (primary) primary.disabled = !!running;
    if (capture) capture.disabled = !!running;
    if (running) {
      setGatherState("gathering");
      void showHostOverlay(true);
    }
  }

  /** Clear stacked Nextdoor modals by leaving /p/ overlays — go to group feed or hard reload. */
  async function cleanupNextdoorAfterDeep(tab, source) {
    if (!tab || !tab.id) return;
    const groupId =
      (source && source.group_secure_id) ||
      (batch && batch.source && batch.source.group_secure_id) ||
      null;
    setStatus("Cleaning up stacked post windows — refreshing Nextdoor…");
    try {
      if (groupId) {
        await chrome.tabs.update(tab.id, {
          url: "https://nextdoor.com/g/" + groupId + "/",
        });
      } else {
        await chrome.tabs.reload(tab.id, { bypassCache: true });
      }
      await waitTabComplete(tab.id, 25000);
    } catch (e) {
      try {
        await chrome.tabs.reload(tab.id, { bypassCache: true });
      } catch (_) {}
    }
  }

  async function deepCapture() {
    let tab = await findNextdoorTab();
    if (!tab || !tab.id || !tab.url || !/nextdoor\.com/i.test(tab.url)) {
      setStatus("Open a nextdoor.com group or post tab first");
      setGatherState("failed");
      await checkConnection();
      return;
    }
    setDeepRunning(true);
    setStatus("Gathering… leave this group page open");
    const maxPosts = maxPostsForLookback();
    let res;
    try {
      res = await chrome.tabs.sendMessage(tab.id, {
        type: "MPX_DEEP_CAPTURE",
        maxPosts,
        delayMs: 1000,
      });
    } catch (e) {
      try {
        await injectContent(tab);
        await new Promise((r) => setTimeout(r, 150));
        res = await chrome.tabs.sendMessage(tab.id, {
          type: "MPX_DEEP_CAPTURE",
          maxPosts,
          delayMs: 1000,
        });
      } catch (e2) {
        setDeepRunning(false);
        await showHostOverlay(false);
        setGatherState("failed");
        setStatus("Content script missing — Fix connection, then try again");
        await checkConnection({ tryAttach: true });
        return;
      }
    }
    if (!res || !res.ok) {
      setDeepRunning(false);
      await showHostOverlay(false);
      setGatherState("failed");
      setStatus("Gather failed — Report problem or try again");
      if (res && res.debug) {
        await chrome.runtime.sendMessage({
          type: "MPX_MERGE_HARVEST",
          threads: [],
          debug: res.debug,
        });
        await refresh();
      }
      return;
    }
    await chrome.runtime.sendMessage({
      type: "MPX_MERGE_HARVEST",
      source: res.source,
      threads: res.threads || [],
      debug: res.debug || [],
      dom_probe: res.dom_probe,
      capture_summary: res.capture_summary,
    });
    await refresh();
    const s = res.capture_summary || {};
    lastGatherStats = {
      posts: s.threads || (res.threads && res.threads.length) || 0,
      topics: (batch && batch.threads
        ? batch.threads.filter((t) => t.gate === "ticket").length
        : 0) || 0,
    };
    lastGatherAt = Date.now();
    await chrome.storage.local.set({ [LAST_GATHER_KEY]: lastGatherAt });
    // one-shot lookback override consumed
    lookbackDays = null;
    await chrome.storage.local.remove(LOOKBACK_KEY);
    await cleanupNextdoorAfterDeep(tab, res.source || (batch && batch.source));
    deepHasRun = true;
    setDeepRunning(false);
    await showHostOverlay(false);
    setGatherState("success");
    setStatus(
      "Gathering complete · " +
        lastGatherStats.posts +
        " posts · leave Lab for packaging when ready"
    );
    await checkConnection({ tryAttach: true });
  }

  async function stopDeep() {
    const tab = await activeTab();
    if (tab && tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, { type: "MPX_DEEP_STOP" });
      } catch (_) {}
    }
    setStatus("Stop requested — finishing current post…");
  }

  async function markReady() {
    const res = await chrome.runtime.sendMessage({ type: "MPX_MARK_READY" });
    if (!res || !res.ok) {
      setStatus(
        res && res.error === "empty_batch"
          ? "Nothing to package — Capture or Deep capture first"
          : "Mark ready failed"
      );
      return;
    }
    batch = res.batch;
    uploadEnabled = !!res.upload_enabled;
    render();
    const s = batch.stats || {};
    setStatus(
      `Ready · ${s.ticket_count || 0} tickets · ${s.outlier_count || 0} outliers · hash ${batch.content_hash || "?"} — Export or Upload when enabled`
    );
  }

  async function validateResubmit() {
    setStatus("Validating… re-walking posts when possible");
    const tab = await findNextdoorTab();
    let didDeep = false;
    let deepRes = null;
    if (tab && tab.id && tab.url && /nextdoor\.com/i.test(tab.url)) {
      setDeepRunning(true);
      try {
        deepRes = await chrome.tabs.sendMessage(tab.id, {
          type: "MPX_DEEP_CAPTURE",
          maxPosts: 12,
          delayMs: 800,
        });
        didDeep = !!(deepRes && deepRes.ok);
      } catch (_) {
        didDeep = false;
      }
      if (didDeep && deepRes) {
        await chrome.runtime.sendMessage({
          type: "MPX_MERGE_HARVEST",
          source: deepRes.source,
          threads: deepRes.threads || [],
          debug: deepRes.debug || [],
          dom_probe: deepRes.dom_probe,
          capture_summary: deepRes.capture_summary,
        });
        await cleanupNextdoorAfterDeep(tab, deepRes.source);
        deepHasRun = true;
      } else {
        await chrome.runtime.sendMessage({ type: "MPX_RECLASSIFY_LOCAL" });
      }
      setDeepRunning(false);
    } else {
      await chrome.runtime.sendMessage({ type: "MPX_RECLASSIFY_LOCAL" });
    }

    const done = await chrome.runtime.sendMessage({ type: "MPX_VALIDATE_DONE" });
    batch = done.batch;
    uploadEnabled = !!done.upload_enabled;
    render();
    const s = (batch && batch.stats) || {};
    setStatus(
      `Validated · pass ${batch.validation_pass || "?"} · ${s.ticket_count || 0} tickets · ${s.outlier_count || 0} outliers` +
        (uploadEnabled ? " · Upload enabled (new outbound)" : " · no new outbound") +
        (didDeep ? " · page cleaned" : " · local reclassify only")
    );
  }

  async function uploadStub() {
    const res = await chrome.runtime.sendMessage({ type: "MPX_UPLOAD_STUB" });
    await refresh();
    if (res && res.message) {
      setStatus(res.message);
      return;
    }
    setStatus("Upload unavailable");
  }

  async function pasteToActiveTab(body) {
    const tab = await activeTab();
    if (!tab || !tab.id) {
      await copyText(body);
      setStatus("No tab — reply copied to clipboard (edit before send)");
      return;
    }
    try {
      const r = await chrome.tabs.sendMessage(tab.id, {
        type: "MPX_PASTE_REPLY",
        body,
      });
      if (r && r.ok) {
        setStatus("Pasted into composer — edit, then you send");
      } else {
        await copyText(body);
        setStatus("Composer not found — copied to clipboard. Paste yourself.");
        if (r && r.debug) {
          await chrome.runtime.sendMessage({
            type: "MPX_MERGE_HARVEST",
            threads: [],
            debug: [r.debug],
          });
          await refresh();
        }
      }
    } catch (_) {
      await copyText(body);
      setStatus("Paste failed — copied to clipboard");
    }
  }

  function scrubbedBatchJson() {
    const scrub = globalThis.MyProblemScrub;
    return {
      ...batch,
      schema: "myproblem.capture_batch.v1",
      threads: (batch.threads || []).map((t) =>
        scrub ? scrub.scrubThread(t) : t
      ),
    };
  }

  function exportBatch() {
    if (!batch) return;
    const cleaned = scrubbedBatchJson();
    const blob = new Blob([JSON.stringify(cleaned, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myproblem-capture-batch-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Exported scrubbed v1 batch JSON (no media)");
  }

  function base64ToUint8(b64) {
    const bin = atob(b64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  /** Ask Nextdoor tab to (re)download media for ticket threads into IndexedDB. */
  async function fetchMediaNow() {
    if (!batch || !(batch.threads || []).length) {
      setStatus("No threads — Capture / Recapture first");
      return;
    }
    const tab = await findNextdoorTab();
    if (!tab || !tab.id) {
      setStatus("Open a Nextdoor tab first");
      return;
    }
    setStatus("Fetching media into local store…");
    let res;
    try {
      res = await chrome.tabs.sendMessage(tab.id, {
        type: "MPX_DOWNLOAD_MEDIA",
        threads: batch.threads,
      });
    } catch (e) {
      try {
        await injectContent(tab);
        await new Promise((r) => setTimeout(r, 150));
        res = await chrome.tabs.sendMessage(tab.id, {
          type: "MPX_DOWNLOAD_MEDIA",
          threads: batch.threads,
        });
      } catch (e2) {
        setStatus("Content script missing — Fix connection, then Fetch media now");
        await checkConnection({ tryAttach: true });
        return;
      }
    }
    if (!res || !res.ok) {
      setStatus("Media fetch failed — Recapture on the feed, then try again");
      return;
    }
    if (res.threads && res.threads.length) {
      await chrome.runtime.sendMessage({
        type: "MPX_MERGE_HARVEST",
        source: batch.source,
        threads: res.threads,
        debug: [
          {
            reason: "media_fetch_now",
            notes: `stored=${res.stored || 0}`,
          },
        ],
        capture_summary: {
          threads: res.threads.length,
          media_stored: res.stored || 0,
          mode: "media_fetch",
        },
      });
    }
    await refresh();
    setStatus(
      `Media fetch done · stored ${res.stored || 0} file(s) · ${mediaFileCount} in local store — Export ZIP when ready`
    );
  }

  async function exportBatchWithMedia() {
    if (!batch) return;
    const zipApi = globalThis.MyProblemZip;
    if (!zipApi || !zipApi.packStore) {
      setStatus("ZIP packer missing — reload extension");
      return;
    }
    setStatus("Building ZIP (JSON + media, store/no recompress)…");
    let list = await listLocalMediaMeta();
    if (!list || !list.ok || !(list.items || []).length) {
      setStatus("No media in store yet — running Fetch media now…");
      await fetchMediaNow();
      list = await listLocalMediaMeta();
    }
    const files = {};
    const cleaned = scrubbedBatchJson();
    const jsonText = JSON.stringify(cleaned, null, 2);
    files["batch.json"] = new TextEncoder().encode(jsonText);
    files["README.txt"] = new TextEncoder().encode(
      "MyProblem X capture export\n" +
        "batch.json = scrubbed capture batch v1\n" +
        "media/<threadId>/ = original social media files (not locally scrubbed)\n" +
        "ZIP uses STORE (no recompress) — JPEG/MP4 are already compressed.\n"
    );

    let n = 0;
    let bytes = 0;
    const idb = globalThis.MyProblemMediaIdb;
    for (const item of (list && list.items) || []) {
      let u8 = null;
      let threadId = item.threadId;
      let localName = item.local_name;
      // Prefer direct IndexedDB read (same extension origin) — avoids huge
      // base64 chrome.runtime messages for multi‑MB media.
      if (idb && idb.getBlob) {
        try {
          const entry = item.buffer
            ? item
            : await idb.getBlob(item.key);
          if (entry && entry.buffer) {
            u8 = new Uint8Array(entry.buffer);
            threadId = entry.threadId || threadId;
            localName = entry.local_name || localName;
          }
        } catch (_) {}
      }
      if (!u8) {
        const got = await chrome.runtime.sendMessage({
          type: "MPX_GET_MEDIA_BLOB",
          key: item.key,
        });
        if (!got || !got.ok) continue;
        u8 = base64ToUint8(got.base64);
        threadId = got.threadId || threadId;
        localName = got.local_name || localName;
      }
      const path =
        "media/" +
        (threadId || "thread") +
        "/" +
        (localName || "file.bin");
      files[path] = u8;
      n += 1;
      bytes += u8.length;
    }

    const packed = zipApi.packStore(files);
    const blob = new Blob([packed], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myproblem-capture-${Date.now()}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    setStatus(
      n
        ? `Exported ZIP · batch.json + ${n} media file(s) (~${Math.round(bytes / 1024)} KB media) — local only`
        : "Exported ZIP with batch.json only · 0 media files (Recapture / Fetch media on feed first)"
    );
  }

  async function copyDebug() {
    await runOnNextdoor("MPX_DOM_PROBE", "Refreshing probe before copy…");
    if (!batch) {
      setStatus("No batch after probe — open Nextdoor, F5, try Copy again");
      return;
    }
    const probe = batch.last_dom_probe || null;
    const stale = probeLooksStale(probe);
    const payload = {
      schema: "myproblem.capture_debug.v0",
      purpose:
        "Paste into Cursor so MyProblem X selectors can be fixed. Includes DOM probe, errors, and capture gaps.",
      exported_at: new Date().toISOString(),
      extension_version: EXT_VERSION,
      content_script_ok: !!(probe && probe.reason === "dom_probe"),
      stale_probe_warning: stale
        ? "Probe still looks like pre-0.1.2 selectors (hundreds of post-* fragments, no feed-item-card). Reload the Nextdoor tab (F5) after Reload on chrome://extensions, then Copy debug again."
        : null,
      source: batch.source,
      status: batch.status,
      stats: batch.stats,
      last_capture_summary: batch.last_capture_summary,
      last_dom_probe: probe,
      debug: (batch.debug || []).slice(-80),
      thread_count: (batch.threads || []).length,
      sample_threads: (batch.threads || []).slice(0, 8).map((t) => ({
        id: t.id,
        gate: t.gate,
        outlier_reason: t.outlier_reason || null,
        topics: t.suggested_topics,
        value_rank: t.value_rank,
        skip: t.skip,
        external_ref: t.external_ref || null,
        path: t._debug_path || null,
        preview: (t.body_redacted || "").slice(0, 220),
      })),
    };
    await copyText(JSON.stringify(payload, null, 2));
    if (stale) {
      setStatus(
        `Copied v${EXT_VERSION} but probe looks STALE (cards=${probe?.candidate_card_count || "?"}). F5 Nextdoor, then Copy again.`
      );
    } else {
      setStatus(
        `Debug JSON copied · v${EXT_VERSION} · cards=${probe?.candidate_card_count ?? "?"} — paste into Cursor`
      );
    }
  }

  function on(id, ev, fn) {
    const el = $(id);
    if (el) el.addEventListener(ev, fn);
  }

  on("tab-main", "click", () => switchTab("main"));
  on("tab-lab", "click", () => switchTab("lab"));
  on("btn-irc-send", "click", sendCraftMessage);
  on("btn-capture", "click", capturePage);
  on("btn-deep", "click", deepCapture);
  on("btn-gather-primary", "click", deepCapture);
  on("btn-try-again", "click", deepCapture);
  on("btn-lookback-open", "click", () => setGatherState("lookback"));
  on("btn-lookback-apply", "click", async () => {
    const picked = document.querySelector('input[name="lookback"]:checked');
    const v = picked && picked.value;
    if (!v || v === "since") {
      lookbackDays = null;
      await chrome.storage.local.remove(LOOKBACK_KEY);
    } else {
      lookbackDays = Number(v);
      await chrome.storage.local.set({ [LOOKBACK_KEY]: lookbackDays });
    }
    setGatherState("needs");
  });
  on("btn-report", "click", async () => {
    await copyDebug();
    setStatus("Diagnostics copied — paste into an email or Cursor report");
  });
  on("btn-deep-stop", "click", stopDeep);
  on("btn-ready", "click", markReady);
  on("btn-validate", "click", validateResubmit);
  on("btn-upload", "click", uploadStub);
  on("btn-fix", "click", fixConnection);
  on("btn-probe", "click", probeDom);
  on("btn-export", "click", exportBatch);
  on("btn-fetch-media", "click", fetchMediaNow);
  on("btn-export-media", "click", exportBatchWithMedia);
  on("btn-copy-debug", "click", copyDebug);

  on("btn-clear", "click", async () => {
    await chrome.runtime.sendMessage({ type: "MPX_CLEAR_BATCH" });
    try {
      const tab = await activeTab();
      if (tab && tab.id && tab.url && /nextdoor\.com/i.test(tab.url)) {
        await chrome.tabs.sendMessage(tab.id, { type: "MPX_CLEAR_SEEN" });
      }
    } catch (_) {
      /* content script may be missing until F5 */
    }
    await refresh();
    setStatus("Cache cleared (batch + page SEEN)");
  });

  on("import-file", "change", async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await chrome.runtime.sendMessage({
        type: "MPX_IMPORT_BATCH",
        batch: parsed,
      });
      if (!res.ok) {
        setStatus("Import failed");
        return;
      }
      await refresh();
      setStatus("Imported batch (merged by thread id · v0→v1 normalized)");
    } catch (e) {
      setStatus("Invalid JSON: " + (e.message || e));
    }
    ev.target.value = "";
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || !msg.type) return;
    if (msg.type === "MPX_DEEP_PROGRESS") {
      const cur = msg.current || 0;
      const total = msg.total || 0;
      const label = $("gather-progress-label");
      const line =
        `Reading posts ${cur}/${total}` +
        (msg.notes ? ` · ${msg.notes}` : "");
      if (label) label.textContent = line;
      setStatus(line + " — leave the page open");
      return;
    }
    if (msg.type === "MPX_AUTO_HARVEST_HINT") {
      setStatus("Feed changed — click Capture this page when ready");
    }
  });

  paintVersion();
  switchTab("main");
  loadGatherPrefs()
    .then(() => refresh())
    .then(() => refreshPageContext())
    .then(() => resumeFixIfPending())
    .then(() => checkConnection({ tryAttach: true }));

  chrome.tabs.onActivated.addListener(() => {
    void refreshPageContext();
  });
  chrome.tabs.onUpdated.addListener((_id, info, tab) => {
    if (info.url || info.status === "complete") {
      if (tab && tab.url && /nextdoor\.com/i.test(tab.url)) void refreshPageContext();
    }
  });
})();
