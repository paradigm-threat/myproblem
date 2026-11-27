/**
 * CleverTree public IRC room component (shared by web, embed, Relay extension).
 *
 * Modes: "page" | "embed" | "sidepanel"
 * Gather/Refresh is NEVER part of this component — Relay wraps it.
 *
 * Mount:
 *   CleverTreeRoom.mount(el, {
 *     mode: "embed",
 *     channel: "#ga-savannah-cat-rescue",
 *     title: "Savannah Cat Rescue",
 *     collectionId: "savannah-cat-rescue",
 *     apiBase: "https://api.clevertree.chat",
 *     mirrors: ["wss://pub1.relaygateway.net/chat/ws", ...],
 *     context: { topic, collection, ndGroup, ndPost },
 *     showGather: false, // ignored / forced false
 *   });
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(
      typeof require !== "undefined" ? require("./context-tags.js") : null
    );
  } else {
    root.CleverTreeRoom = factory(root.CleverTreeContextTags || null);
  }
})(typeof self !== "undefined" ? self : this, function (Tags) {
  "use strict";

  Tags = Tags || {
    autoTag: function (b) {
      return b;
    },
    renderHtml: function (t) {
      return String(t || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    },
    stripTags: function (t) {
      return t;
    },
  };

  var BOT_NICKS = ["clevertree", "clevertree-si", "clevertree-ai", "relay-bot"];
  /** Separate from MyProblem site theme (`myproblem.theme`). */
  var THEME_KEY = "clevertree.room.theme";
  var VISITOR_KEY = "clevertree.visitor";

  function mintVisitorId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch (e) {}
    }
    // RFC4122-ish fallback for older WebViews without randomUUID.
    var bytes = new Array(16);
    for (var i = 0; i < 16; i++) bytes[i] = (Math.random() * 256) | 0;
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    var hex = bytes
      .map(function (b) {
        return (b + 0x100).toString(16).slice(1);
      })
      .join("");
    return (
      hex.slice(0, 8) +
      "-" +
      hex.slice(8, 12) +
      "-" +
      hex.slice(12, 16) +
      "-" +
      hex.slice(16, 20) +
      "-" +
      hex.slice(20)
    );
  }

  function ensureVisitor(opts) {
    if (opts && opts.visitor) return String(opts.visitor);
    try {
      var id = localStorage.getItem(VISITOR_KEY);
      if (!id) {
        id = mintVisitorId();
        localStorage.setItem(VISITOR_KEY, id);
      }
      return id || mintVisitorId();
    } catch (e) {
      return mintVisitorId();
    }
  }

  function withVisitorParam(url, visitor) {
    if (!url || !visitor) return url;
    try {
      var base =
        typeof location !== "undefined" && location.href
          ? location.href
          : "https://api.clevertree.chat/";
      var u = new URL(url, base);
      if (!u.searchParams.get("visitor")) {
        u.searchParams.set("visitor", visitor);
      }
      return u.toString();
    } catch (e) {
      return (
        url +
        (url.indexOf("?") >= 0 ? "&" : "?") +
        "visitor=" +
        encodeURIComponent(visitor)
      );
    }
  }
  var THEME_SUN =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75"/><path d="M12 2v2.2M12 19.8V22M4.2 12H2M22 12h-2.2M5.05 5.05l1.56 1.56M17.39 17.39l1.56 1.56M5.05 18.95l1.56-1.56M17.39 6.61l1.56-1.56" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';
  var THEME_MOON =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.5 14.2A8.2 8.2 0 0 1 9.8 3.5 7.4 7.4 0 1 0 20.5 14.2Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/></svg>';
  /* Kit icons (design/clevertree-chat-kit/icons/ui) — attach/send from kit; mic/video match stroke. */
  var ICON_ATTACH =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 13 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l9-9a3.5 3.5 0 0 1 5 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_MIC =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M9 22h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_VIDEO =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="6" width="13" height="12" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="m15 10 6-3v10l-6-3V10Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
  var ICON_STOP =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" stroke="currentColor" stroke-width="1.7"/></svg>';
  var ICON_SEND =
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20V4M5 11l7-7 7 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function $(root, sel) {
    return root.querySelector(sel);
  }

  function readThemePref() {
    try {
      var raw = localStorage.getItem(THEME_KEY);
      if (raw === "light" || raw === "dark" || raw === "system") return raw;
    } catch (e) {}
    return "system";
  }

  function systemTheme() {
    try {
      return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  }

  function resolveRoomTheme(pref) {
    pref = pref || readThemePref();
    return pref === "light" || pref === "dark" ? pref : systemTheme();
  }

  function applyRoomTheme(el, resolved, pref) {
    if (!el) return;
    pref = pref || readThemePref();
    resolved = resolved === "dark" ? "dark" : "light";
    el.setAttribute("data-theme-pref", pref);
    el.setAttribute("data-theme", resolved);
    el.style.colorScheme = resolved;
    var btns = el.querySelectorAll('[data-role="theme-toggle"]');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var next = resolved === "dark" ? "light" : "dark";
      btn.setAttribute(
        "aria-label",
        next === "light" ? "Switch room to light theme" : "Switch room to dark theme"
      );
      btn.title = btn.getAttribute("aria-label");
      btn.innerHTML = resolved === "dark" ? THEME_SUN : THEME_MOON;
    }
  }

  function persistRoomTheme(pref) {
    try {
      if (pref === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, pref);
    } catch (e) {}
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function nickInitials(nick) {
    var p = String(nick || "?").replace(/[^a-zA-Z0-9]/g, " ").trim().split(/\s+/);
    if (!p[0]) return "?";
    if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
    return (p[0][0] + p[1][0]).toUpperCase();
  }

  function isBot(nick) {
    var n = String(nick || "").toLowerCase();
    return BOT_NICKS.indexOf(n) >= 0 || n.indexOf("clevertree") === 0;
  }

  var MEDIA_RE =
    /\[\[mp:media\s+([^\]]*)\]\]/gi;

  function parseMediaMarkers(text) {
    var out = [];
    var m;
    var re = new RegExp(MEDIA_RE.source, "gi");
    while ((m = re.exec(String(text || ""))) !== null) {
      var attrs = m[1] || "";
      var kind = (attrs.match(/\bkind=(\S+)/i) || [])[1] || "file";
      var url = (attrs.match(/\burl=(\S+)/i) || [])[1] || "";
      var review = (attrs.match(/\breview=(\S+)/i) || [])[1] || "pending";
      var sha = (attrs.match(/\bsha=(\S+)/i) || [])[1] || "";
      if (url) {
        out.push({
          kind: kind.toLowerCase(),
          url: url,
          review: String(review).toLowerCase(),
          sha: sha,
        });
      }
    }
    return out;
  }

  function stripMediaMarkers(text) {
    return String(text || "")
      .replace(MEDIA_RE, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function mediaKey(it) {
    return (it && (it.sha || it.url)) || "";
  }

  function effectiveReview(it, reviewMap) {
    var key = mediaKey(it);
    if (reviewMap && key && reviewMap[key]) return reviewMap[key];
    if (reviewMap && it && it.url && reviewMap[it.url]) return reviewMap[it.url];
    var r = (it && it.review) || "pending";
    return r === "clear" || r === "reject" ? r : "pending";
  }

  function mediaHtml(items, reviewMap) {
    if (!items || !items.length) return "";
    var html = "";
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var status = effectiveReview(it, reviewMap);
      var key = esc(mediaKey(it));
      var url = esc(it.url);
      if (it.kind === "image") {
        if (status === "clear") {
          html +=
            '<figure class="media media-image" data-media-key="' +
            key +
            '" data-review="clear"><img src="' +
            url +
            '" alt="Shared image" loading="lazy" decoding="async" /></figure>';
        } else {
          html +=
            '<figure class="media media-image media-covered" data-media-key="' +
            key +
            '" data-review="' +
            esc(status) +
            '">' +
            '<button type="button" class="shield" data-role="reveal-media" aria-label="Show image after AI review">' +
            (status === "reject"
              ? "Hidden — not cleared for this channel"
              : "Covered until AI review — click to peek") +
            "</button>" +
            '<img class="media-hidden" hidden src="' +
            url +
            '" alt="Shared image" loading="lazy" decoding="async" />' +
            "</figure>";
        }
      } else if (it.kind === "audio") {
        html +=
          '<div class="media media-audio" data-media-key="' +
          key +
          '" data-review="clear"><audio controls preload="none" src="' +
          url +
          '"></audio></div>';
      } else if (it.kind === "video") {
        if (status === "clear") {
          html +=
            '<div class="media media-video media-video-clear" data-media-key="' +
            key +
            '" data-review="clear">' +
            '<video controls muted autoplay playsinline loop preload="metadata" data-role="room-video" src="' +
            url +
            '"></video>' +
            '<button type="button" class="video-unmute" data-role="unmute-video">Click for sound</button>' +
            "</div>";
        } else {
          html +=
            '<div class="media media-video media-covered" data-media-key="' +
            key +
            '" data-review="' +
            esc(status) +
            '">' +
            '<button type="button" class="shield" data-role="reveal-media" aria-label="Show video after AI review">' +
            (status === "reject"
              ? "Hidden — not cleared for this channel"
              : "Covered until AI review — click to peek (muted)") +
            "</button>" +
            '<video class="media-hidden" hidden muted playsinline preload="metadata" data-role="room-video" src="' +
            url +
            '"></video>' +
            "</div>";
        }
      } else if (it.kind === "pdf" || it.kind === "text" || it.kind === "file") {
        var label =
          it.kind === "pdf" ? "PDF" : it.kind === "text" ? "Text file" : "File";
        html +=
          '<div class="media media-file" data-media-key="' +
          key +
          '"><a class="media-file-link" href="' +
          url +
          '" target="_blank" rel="noopener noreferrer">' +
          label +
          " — open / download</a></div>";
      }
    }
    return html;
  }

  function shouldClamp(text, bot) {
    var t = String(text || "");
    if (bot && t.length > 220) return true;
    if (t.length > 360) return true;
    if ((t.match(/\n/g) || []).length >= 3) return true;
    return false;
  }

  function formatCopyHtml(text, cfg, reviewMap) {
    var plain = stripMediaMarkers(text);
    var media = mediaHtml(parseMediaMarkers(text), reviewMap);
    var bodyHtml = Tags.renderHtml(plain, cfg);
    var display = Tags.stripTags
      ? Tags.stripTags(plain)
      : plain;
    return (bodyHtml || esc(display)) + media;
  }

  function pickMirror(list, i) {
    if (!list || !list.length) return null;
    return list[Math.max(0, i || 0) % list.length];
  }

  /** Build WS mirrors from apiBase + channel when callers pass none (live.html / Android). */
  function defaultMirrors(apiBase, channel) {
    var topic = String(channel || "#web")
      .replace(/^#/, "")
      .trim() || "web";
    var base = String(apiBase || "https://api.clevertree.chat").replace(/\/$/, "");
    var wsHost = base.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
    var path = "/api/chat/ws?topic=" + encodeURIComponent(topic);
    var list = [wsHost + path];
    if (wsHost.indexOf("api.clevertree.chat") < 0) {
      list.push("wss://api.clevertree.chat" + path);
    }
    list.push("wss://pub1.relaygateway.net/chat/ws?topic=" + encodeURIComponent(topic));
    return list;
  }

  function shellHtml(opts) {
    var ch = esc(opts.channel || "#web");
    var title = esc(opts.title || "Public room");
    var mode = opts.mode || "page";
    var nw = !!opts.showNetworker;
    var sideLabel =
      mode === "sidepanel"
        ? '<div class="surface-label"><span>Chrome side panel · Clevertree</span><span>ROOM</span></div>'
        : "";
    var nwBar = nw
      ? '<div class="networker-bar" data-role="networker-bar" aria-label="Networker">' +
        '<button type="button" class="track" data-role="track" aria-pressed="false">Track</button>' +
        '<button type="button" data-role="gather">Gather</button>' +
        '<button type="button" data-role="refresh">Refresh</button>' +
        "</div>"
      : "";
    return (
      sideLabel +
      nwBar +
      '<header class="top">' +
      '<div class="brand"><span>Clevertree <small>Chat</small></span></div>' +
      '<div class="sep"></div><div class="crumb">Debate board · IRC + SI</div>' +
      '<div class="status" data-role="status">' +
      '<button type="button" class="theme-toggle" data-role="theme-toggle" aria-label="Toggle room theme"></button>' +
      '<span class="dot"></span><strong data-role="conn">Connecting…</strong>' +
      '<span class="mirror" data-role="mirror"></span></div></header>' +
      '<section class="head" aria-label="' +
      title +
      '">' +
      '<div class="roomname">' +
      '<div class="eyebrow">' +
      "<span>Public IRC room</span>" +
      '<code class="channel-tag" data-role="channel-tag">' +
      ch +
      "</code>" +
      "</div></div></section>" +
      '<div class="body"><main class="chat">' +
      '<div class="history" data-role="history" role="log" aria-label="Public IRC channel messages">' +
      '<div class="stream" data-role="stream"></div></div>' +
      '<footer class="composer" data-role="composer">' +
      '<div class="compose-inner">' +
      '<p class="public" role="note">Public · visible in this room</p>' +
      '<div class="composebox" data-role="composebox">' +
      '<textarea data-role="draft" aria-label="Message to public room" placeholder="Help me with a problem… · Help me find something… · What\'s the latest news on something… · What\'s going on in town…"></textarea>' +
      '<div class="pending-media" data-role="pending-media" hidden></div>' +
      '<div class="tools">' +
      '<input type="file" data-role="file-input" hidden accept="image/*,video/*,audio/*,.pdf,text/*,.txt,.md,.json,.csv,.xml,.yaml,.yml" />' +
      '<button type="button" class="tool" data-role="attach" title="Attach file" aria-label="Attach file">' +
      ICON_ATTACH +
      "</button>" +
      '<button type="button" class="tool" data-role="record-audio" title="Record audio" aria-label="Record audio">' +
      ICON_MIC +
      "</button>" +
      '<button type="button" class="tool" data-role="record-video" title="Record video" aria-label="Record video">' +
      ICON_VIDEO +
      "</button>" +
      '<button type="button" class="tool recording-stop" data-role="stop-record" hidden title="Stop recording" aria-label="Stop recording">' +
      ICON_STOP +
      "</button>" +
      '<span class="upload-status" data-role="upload-status" hidden></span>' +
      '<button type="button" class="send" data-role="send" title="Send">' +
      ICON_SEND +
      "<span>Send</span></button>" +
      "</div></div>" +
      '<div class="footnote"><span>Drop audio · video · files · Tags</span><span>Max 50 MiB</span></div>' +
      "</div></footer></main></div>" +
      '<div class="overlay" data-role="overlay" hidden><div class="modal" data-role="modal"></div></div>'
    );
  }

  function wireMediaControls(root) {
    if (!root) return;
    var shields = root.querySelectorAll('[data-role="reveal-media"]');
    for (var i = 0; i < shields.length; i++) {
      (function (btn) {
        if (btn._ctWired) return;
        btn._ctWired = true;
        btn.onclick = function () {
          var wrap = btn.closest(".media");
          if (!wrap) return;
          if (wrap.getAttribute("data-review") === "reject") return;
          var hidden = wrap.querySelector(".media-hidden");
          if (hidden) {
            hidden.hidden = false;
            hidden.classList.remove("media-hidden");
          }
          btn.hidden = true;
          var vid = wrap.querySelector("video");
          if (vid) {
            try {
              vid.muted = true;
              vid.play();
            } catch (e) {}
          }
        };
      })(shields[i]);
    }
    var unmutes = root.querySelectorAll('[data-role="unmute-video"]');
    for (var j = 0; j < unmutes.length; j++) {
      (function (btn) {
        if (btn._ctWired) return;
        btn._ctWired = true;
        btn.onclick = function () {
          var wrap = btn.closest(".media");
          var vid = wrap && wrap.querySelector("video");
          if (!vid) return;
          vid.muted = false;
          try {
            vid.play();
          } catch (e2) {}
          btn.textContent = "Sound on";
          btn.disabled = true;
        };
      })(unmutes[j]);
    }
  }

  function appendMessage(stream, msg, cfg, roomRoot, reviewMap) {
    var bot = isBot(msg.nick);
    var art = document.createElement("article");
    art.className = "msg" + (bot ? " botmsg" : "");
    art.dataset.nick = msg.nick || "";
    var raw = msg.text || "";
    var copyInner = formatCopyHtml(raw, cfg, reviewMap);
    var clamp = shouldClamp(stripMediaMarkers(raw), bot);
    var copyClass = "copy" + (clamp ? " copy-clamp" : "");
    art.innerHTML =
      '<div class="av' +
      (bot ? " bot" : "") +
      '">' +
      esc(nickInitials(msg.nick)) +
      "</div><div" +
      (bot ? ' class="content"' : "") +
      ">" +
      '<div class="meta"><span class="nick">' +
      esc(msg.nick || "anon") +
      "</span>" +
      (bot ? '<span class="tag">ROOM AI</span>' : "") +
      '<time class="time">' +
      esc(msg.time || "") +
      "</time></div>" +
      '<div class="' +
      copyClass +
      '" data-role="copy">' +
      copyInner +
      "</div>" +
      (clamp
        ? '<button type="button" class="expand-msg" data-role="expand-msg">Expand full reply</button>'
        : "") +
      "</div>";
    stream.appendChild(art);
    wireMediaControls(art);
    if (clamp && roomRoot) {
      var btn = art.querySelector('[data-role="expand-msg"]');
      if (btn) {
        btn.onclick = function () {
          openMessageFullscreen(roomRoot, msg.nick || "SI", stripMediaMarkers(raw));
        };
      }
    }
  }

  function openMessageFullscreen(roomRoot, nick, text) {
    var overlay = $(roomRoot, '[data-role="overlay"]');
    var modal = $(roomRoot, '[data-role="modal"]');
    if (!overlay || !modal) return;
    var safe = esc(text).replace(/\n/g, "<br>");
    modal.innerHTML =
      '<div class="modal-full-si">' +
      '<div class="aicap">Full reply</div>' +
      '<div class="aititle"><h2>' +
      esc(nick) +
      '</h2><button type="button" class="close" data-role="full-close" aria-label="Close">×</button></div>' +
      '<div class="full-si-body">' +
      safe +
      "</div></div>";
    overlay.hidden = false;
    overlay.classList.add("open");
    var closer = modal.querySelector('[data-role="full-close"]');
    function close() {
      overlay.classList.remove("open");
      overlay.hidden = true;
      modal.innerHTML = "";
    }
    if (closer) closer.onclick = close;
    overlay.onclick = function (ev) {
      if (ev.target === overlay) close();
    };
  }

  function mount(el, opts) {
    opts = opts || {};
    var visitor = ensureVisitor(opts);
    opts.visitor = visitor;
    if (!el) throw new Error("CleverTreeRoom.mount: element required");

    var mode = opts.mode || "page";
    if (opts.showGather) {
      // Explicitly ignored — gather belongs only on Relay chrome.
      opts.showGather = false;
    }

    el.classList.add("room", "ct-room");
    if (mode === "sidepanel") el.classList.add("sidepanel");
    // Scope embed/sidepanel on the host only — never decorate document.body
    // (host pages like myproblem.app own body tokens/layout).
    if (mode === "page") document.body.classList.add("ct-room-page");
    else el.classList.add("ct-room-host", "embedded");

    if (!opts.apiBase) opts.apiBase = "https://api.clevertree.chat";
    if (!opts.channel) opts.channel = "#web";
    if (!opts.mirrors || !opts.mirrors.length) {
      opts.mirrors = defaultMirrors(opts.apiBase, opts.channel);
    }
    if (!opts.wsUrl) opts.wsUrl = opts.mirrors[0];

    el.innerHTML = shellHtml(opts);

    var state = {
      tracked: !!opts.tracked,
      aiOpen: !!opts.aiOpen,
      connected: false,
      mirrorIndex: 0,
      mirrors: opts.mirrors || [],
      ws: null,
      messages: opts.seedMessages || [],
      historyHydrated: false,
      view: null,
      opts: opts,
      destroyed: false,
      themePref: readThemePref(),
      theme: resolveRoomTheme(),
      mediaReviews: {},
      recording: false,
      mediaRecorder: null,
      mediaStream: null,
      recordChunks: [],
      recordKind: "",
      pendingMedia: [],
    };
    applyRoomTheme(el, state.theme, state.themePref);

    var trackBtn = $(el, '[data-role="track"]');
    var aiBtn = $(el, '[data-role="ai-toggle"]');
    var aiPanel = $(el, '[data-role="ai"]');
    var aiBody = $(el, '[data-role="ai-body"]');
    var stream = $(el, '[data-role="stream"]');
    var history = $(el, '[data-role="history"]');
    var draft = $(el, '[data-role="draft"]');
    var sendBtn = $(el, '[data-role="send"]');
    var composerEl = $(el, '[data-role="composer"]');
    var composeBox = $(el, '[data-role="composebox"]');
    var investigateBtn = $(el, '[data-role="investigate"]');
    /* AI findings panel + Investigate chrome removed from shell (keep refs null-safe). */
    var COMPOSER_EXPANDED_KEY = "clevertree.room.composerExpanded";
    var PLACEHOLDER_EXPANDED =
      "Help me with a problem… · Help me find something… · What's the latest news on something… · What's going on in town…";
    var PLACEHOLDER_COLLAPSED = "Ask something…";

    function readComposerExpanded() {
      try {
        var raw = localStorage.getItem(COMPOSER_EXPANDED_KEY);
        if (raw === null || raw === undefined || raw === "") return true;
        return raw === "1" || raw === "true";
      } catch (e) {
        return true;
      }
    }

    function writeComposerExpanded(on) {
      try {
        localStorage.setItem(COMPOSER_EXPANDED_KEY, on ? "1" : "0");
      } catch (e) {}
    }

    function setComposerExpanded(on) {
      if (!composerEl) return;
      composerEl.classList.toggle("composer-expanded", !!on);
      composerEl.classList.toggle("composer-collapsed", !on);
      composerEl.setAttribute("data-expanded", on ? "true" : "false");
      if (draft) {
        draft.placeholder = on ? PLACEHOLDER_EXPANDED : PLACEHOLDER_COLLAPSED;
        if (on) {
          try {
            draft.focus();
          } catch (e) {}
        }
      }
      writeComposerExpanded(!!on);
    }

    setComposerExpanded(readComposerExpanded());

    if (composeBox) {
      composeBox.addEventListener("click", function () {
        if (composerEl && composerEl.classList.contains("composer-collapsed")) {
          setComposerExpanded(true);
        }
      });
    }
    if (draft) {
      draft.addEventListener("focus", function () {
        if (composerEl && composerEl.classList.contains("composer-collapsed")) {
          setComposerExpanded(true);
        }
      });
    }
    var connEl = $(el, '[data-role="conn"]');
    var mirrorEl = $(el, '[data-role="mirror"]');
    var overlay = $(el, '[data-role="overlay"]');
    var modal = $(el, '[data-role="modal"]');
    var fileInput = $(el, '[data-role="file-input"]');
    var attachBtn = $(el, '[data-role="attach"]');
    var recordAudioBtn = $(el, '[data-role="record-audio"]');
    var recordVideoBtn = $(el, '[data-role="record-video"]');
    var stopRecordBtn = $(el, '[data-role="stop-record"]');
    var uploadStatus = $(el, '[data-role="upload-status"]');
    var pendingMediaEl = $(el, '[data-role="pending-media"]');

    function apiBase() {
      var base =
        opts.apiBase ||
        "https://api.clevertree.chat";
      return String(base).replace(/\/$/, "");
    }

    function channelSlug() {
      return String(opts.channel || "#web")
        .replace(/^#/, "")
        .trim() || "web";
    }

    function renderPendingMedia() {
      if (!pendingMediaEl) return;
      var items = state.pendingMedia || [];
      if (!items.length) {
        pendingMediaEl.hidden = true;
        pendingMediaEl.innerHTML = "";
        return;
      }
      pendingMediaEl.hidden = false;
      pendingMediaEl.innerHTML = items
        .map(function (it, idx) {
          var kind = esc(it.kind || "file");
          var name = esc(it.name || it.kind || "attachment");
          var preview = "";
          if (it.kind === "image" && it.url) {
            preview =
              '<img class="pending-thumb" src="' +
              esc(it.url) +
              '" alt="" />';
          } else if (it.kind === "audio" && it.url) {
            preview =
              '<audio class="pending-player" controls preload="metadata" src="' +
              esc(it.url) +
              '"></audio>';
          } else if (it.kind === "video" && it.url) {
            preview =
              '<video class="pending-player" controls muted playsinline preload="metadata" src="' +
              esc(it.url) +
              '"></video>';
          }
          return (
            '<div class="pending-item" data-pending-idx="' +
            idx +
            '">' +
            preview +
            '<div class="pending-meta"><strong>' +
            kind +
            "</strong><span>" +
            name +
            '</span></div><button type="button" class="pending-clear" data-role="clear-pending" data-pending-idx="' +
            idx +
            '" aria-label="Remove ' +
            kind +
            ' attachment">Remove</button></div>'
          );
        })
        .join("");
      var clears = pendingMediaEl.querySelectorAll('[data-role="clear-pending"]');
      for (var ci = 0; ci < clears.length; ci++) {
        clears[ci].onclick = function (ev) {
          var btn = ev.currentTarget;
          var i = parseInt(btn.getAttribute("data-pending-idx") || "-1", 10);
          if (i < 0) return;
          state.pendingMedia.splice(i, 1);
          renderPendingMedia();
        };
      }
    }

    function setUploadStatus(text) {
      if (!uploadStatus) return;
      if (!text) {
        uploadStatus.hidden = true;
        uploadStatus.textContent = "";
        return;
      }
      uploadStatus.hidden = false;
      uploadStatus.textContent = text;
    }

    function setReview(sha, url, status) {
      if (sha) state.mediaReviews[sha] = status;
      if (url) state.mediaReviews[url] = status;
    }

    function applyMediaReviewEvent(data) {
      var status = String((data && data.status) || "").toLowerCase();
      if (status !== "clear" && status !== "reject" && status !== "pending") return;
      setReview(data.sha, data.url, status);
      // Re-render stream so covers / muted autoplay update
      renderSeed();
    }

    function setTrackUi() {
      if (!trackBtn) return;
      trackBtn.textContent = state.tracked ? "Tracked" : "Track";
      trackBtn.classList.toggle("tracked", state.tracked);
      trackBtn.setAttribute("aria-pressed", state.tracked ? "true" : "false");
    }

    var tagCfg = Object.assign(
      {},
      opts.tagConfig || {},
      {
        topics: opts.topics || (opts.tagConfig && opts.tagConfig.topics) || [],
        siteOrigin: opts.siteOrigin || "",
      }
    );

    function renderAiFindings(view) {
      if (!aiBody) return;
      state.view = view || state.view;
      var v = state.view;
      if (!v || (!v.sections && !v.pairs && !v.exists)) {
        aiBody.innerHTML =
          '<p class="si-stub">SI panel stub — batch curation (topics, findings, CleverScript) will appear here.</p>';
        return;
      }
      var sections = v.sections || {};
      var keys = Object.keys(sections).filter(function (k) {
        return k !== "uncategorized";
      });
      var html = "";
      if (v.pairs && v.pairs.length) {
        html += '<div class="ai-pairs"><h3>Paired perspectives</h3><ul>';
        v.pairs.forEach(function (pair) {
          var a = (pair && (pair[0] || pair.a || pair.left)) || "";
          var b = (pair && (pair[1] || pair.b || pair.right)) || "";
          html +=
            "<li><code>" +
            esc(String(a)) +
            "</code> ↔ <code>" +
            esc(String(b)) +
            "</code></li>";
        });
        html += "</ul></div>";
      }
      keys.forEach(function (key) {
        var section = sections[key] || {};
        var title = section.title || key;
        var pos = section.position_html
          ? String(section.position_html)
          : section.position
            ? esc(String(section.position))
            : "";
        html +=
          '<article class="ai-section"><h3>' +
          esc(String(title)) +
          "</h3>" +
          (pos ? '<div class="ai-position">' + pos + "</div>" : "") +
          "</article>";
      });
      var uncat = sections.uncategorized;
      if (uncat && uncat.comments && uncat.comments.length) {
        html +=
          '<article class="ai-section"><h3>Unfiled</h3><p>' +
          uncat.comments.length +
          " comment(s) waiting for batch filing.</p></article>";
      }
      if (!html) {
        html =
          "<p>Channel is live. No standing perspectives filed yet — keep talking in the room.</p>";
      }
      aiBody.innerHTML = html;
    }

    function setAiUi() {
      if (!aiPanel || !aiBtn) {
        state.aiOpen = false;
        return;
      }
      aiPanel.hidden = !state.aiOpen;
      aiPanel.classList.toggle("open", state.aiOpen);
      aiBtn.classList.toggle("active", state.aiOpen);
      aiBtn.textContent = state.aiOpen ? "Hide AI" : "AI findings";
      aiBtn.setAttribute("aria-expanded", state.aiOpen ? "true" : "false");
      if (state.aiOpen) renderAiFindings(state.view);
    }

    function normalizeHistoryLines(raw) {
      var lines = raw;
      if (!lines) return [];
      if (!Array.isArray(lines) && Array.isArray(lines.lines)) lines = lines.lines;
      if (!Array.isArray(lines)) return [];
      return lines
        .map(function (row) {
          if (typeof row === "string") {
            return { nick: "anon", text: row, time: "" };
          }
          return {
            nick: row.nick || row.from || row.author || "anon",
            text: row.text || row.body || row.message || "",
            time: row.time || row.ts || "",
          };
        })
        .filter(function (m) {
          return m.text;
        });
    }

    function hydrateHistory(raw, replace) {
      var incoming = normalizeHistoryLines(raw);
      if (!incoming.length) return;
      if (replace || !state.historyHydrated) {
        // Keep welcome seed only if history empty after filter
        state.messages = incoming;
        state.historyHydrated = true;
        renderSeed();
      } else {
        incoming.forEach(function (m) {
          state.messages.push(m);
          appendMessage(stream, m, tagCfg, el, state.mediaReviews);
        });
        history.scrollTop = history.scrollHeight;
      }
    }

    function setConnUi(label, mirrorNote) {
      connEl.textContent = label;
      mirrorEl.textContent = mirrorNote ? " · " + mirrorNote : "";
    }

    function renderSeed() {
      stream.innerHTML = "";
      if (!state.messages.length) {
        stream.innerHTML =
          '<div class="empty"><h2>Start the conversation.</h2><p>Ask a question or share what you know. Posts are public.</p></div>';
        return;
      }
      state.messages.forEach(function (m) {
        appendMessage(stream, m, tagCfg, el, state.mediaReviews);
      });
      history.scrollTop = history.scrollHeight;
    }

    async function uploadBlob(file, kindHint) {
      setUploadStatus("Uploading…");
      var fd = new FormData();
      fd.append("file", file, file.name || "upload.bin");
      fd.append("channel", channelSlug());
      if (kindHint) fd.append("kind", kindHint);
      var res = await fetch(apiBase() + "/api/chat/media/upload", {
        method: "POST",
        body: fd,
      });
      var data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }
      if (!res.ok || !data.url) {
        throw new Error(data.error || "upload_" + res.status);
      }
      setReview(data.sha256, data.url, data.review || "pending");
      var kind = data.kind || kindHint || "file";
      var marker =
        data.marker ||
        "[[mp:media kind=" +
          kind +
          " url=" +
          data.url +
          " channel=#" +
          channelSlug() +
          " review=" +
          (data.review || "pending") +
          " sha=" +
          (data.sha256 || "") +
          "]]";
      state.pendingMedia.push({
        kind: kind,
        url: data.url,
        sha256: data.sha256 || "",
        name: file.name || kind,
        marker: marker,
      });
      renderPendingMedia();
      setUploadStatus("");
      setComposerExpanded(true);
    }

    function takePendingMarkers() {
      var markers = (state.pendingMedia || [])
        .map(function (it) {
          return it.marker;
        })
        .filter(Boolean);
      state.pendingMedia = [];
      renderPendingMedia();
      return markers;
    }

    function ingestDroppedFiles(fileList) {
      var files = [];
      if (!fileList || !fileList.length) return;
      for (var i = 0; i < fileList.length; i++) files.push(fileList[i]);
      files.forEach(function (f) {
        var hint = "";
        if (/^audio\//i.test(f.type || "")) hint = "audio";
        else if (/^video\//i.test(f.type || "")) hint = "video";
        else if (/^image\//i.test(f.type || "")) hint = "image";
        uploadBlob(f, hint).catch(function (err) {
          setUploadStatus(err && err.message ? err.message : "Upload failed");
        });
      });
    }

    function stopMediaTracks() {
      if (state.mediaStream) {
        try {
          state.mediaStream.getTracks().forEach(function (t) {
            t.stop();
          });
        } catch (e) {}
      }
      state.mediaStream = null;
    }

    function setRecordingUi(on) {
      state.recording = !!on;
      if (stopRecordBtn) stopRecordBtn.hidden = !on;
      if (recordAudioBtn) recordAudioBtn.disabled = !!on;
      if (recordVideoBtn) recordVideoBtn.disabled = !!on;
      if (attachBtn) attachBtn.disabled = !!on;
    }

    function startCapture(video) {
      if (
        !navigator.mediaDevices ||
        typeof MediaRecorder === "undefined"
      ) {
        setUploadStatus("Recording not supported in this browser");
        return;
      }
      setUploadStatus(video ? "Starting camera…" : "Starting mic…");
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: video ? { facingMode: "user" } : false,
        })
        .then(function (mediaStream) {
          state.mediaStream = mediaStream;
          state.recordChunks = [];
          state.recordKind = video ? "video" : "audio";
          var mime = video
            ? MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
              ? "video/webm;codecs=vp8,opus"
              : "video/webm"
            : MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
              ? "audio/webm;codecs=opus"
              : "audio/webm";
          var rec = new MediaRecorder(mediaStream, { mimeType: mime });
          state.mediaRecorder = rec;
          rec.ondataavailable = function (ev) {
            if (ev.data && ev.data.size) state.recordChunks.push(ev.data);
          };
          rec.onstop = function () {
            var blob = new Blob(state.recordChunks, { type: mime });
            var name = video
              ? "clip-" + Date.now() + ".webm"
              : "voice-" + Date.now() + ".webm";
            var file = new File([blob], name, { type: mime });
            setRecordingUi(false);
            stopMediaTracks();
            uploadBlob(file, video ? "video" : "audio").catch(function (err) {
              setUploadStatus(err && err.message ? err.message : "Upload failed");
            });
          };
          rec.start();
          setRecordingUi(true);
          setUploadStatus(
            video
              ? "Recording video… tap Stop when done"
              : "Recording audio… tap Stop when done"
          );
        })
        .catch(function () {
          setUploadStatus("Mic/camera permission needed");
          setRecordingUi(false);
          stopMediaTracks();
        });
    }

    function stopCapture() {
      if (state.mediaRecorder && state.mediaRecorder.state !== "inactive") {
        try {
          state.mediaRecorder.stop();
        } catch (e) {}
      } else {
        setRecordingUi(false);
        stopMediaTracks();
        setUploadStatus("");
      }
    }

    if (attachBtn && fileInput) {
      attachBtn.onclick = function () {
        fileInput.click();
      };
      fileInput.onchange = function () {
        var f = fileInput.files && fileInput.files[0];
        fileInput.value = "";
        if (!f) return;
        uploadBlob(f, "").catch(function (err) {
          setUploadStatus(err && err.message ? err.message : "Upload failed");
        });
      };
    }
    if (composerEl) {
      ;["dragenter", "dragover"].forEach(function (evName) {
        composerEl.addEventListener(evName, function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          composerEl.classList.add("drop-hover");
        });
      });
      ;["dragleave", "dragend"].forEach(function (evName) {
        composerEl.addEventListener(evName, function (ev) {
          ev.preventDefault();
          composerEl.classList.remove("drop-hover");
        });
      });
      composerEl.addEventListener("drop", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        composerEl.classList.remove("drop-hover");
        var dt = ev.dataTransfer;
        if (!dt || !dt.files || !dt.files.length) return;
        ingestDroppedFiles(dt.files);
      });
    }
    if (draft) {
      draft.addEventListener("paste", function (ev) {
        var items = ev.clipboardData && ev.clipboardData.items;
        if (!items || !items.length) return;
        var files = [];
        for (var pi = 0; pi < items.length; pi++) {
          var item = items[pi];
          if (item.kind === "file") {
            var pf = item.getAsFile();
            if (pf) files.push(pf);
          }
        }
        if (!files.length) return;
        ev.preventDefault();
        ingestDroppedFiles(files);
      });
    }
    if (recordAudioBtn) {
      recordAudioBtn.onclick = function () {
        startCapture(false);
      };
    }
    if (recordVideoBtn) {
      recordVideoBtn.onclick = function () {
        startCapture(true);
      };
    }
    if (stopRecordBtn) {
      stopRecordBtn.onclick = function () {
        stopCapture();
      };
    }

    function confirmPublic(onOk) {
      modal.innerHTML =
        '<div class="eyebrow">PUBLIC IRC ROOM</div>' +
        "<h2>Send to the public room?</h2>" +
        "<p>Your message will appear in " +
        esc(opts.channel || "this channel") +
        ". Anyone may see or save it. There is no private mode.</p>" +
        '<div class="notice"><strong>Public, not private.</strong> AI may preserve useful findings in the collection repository.</div>' +
        '<div class="modal-actions">' +
        '<button type="button" class="cancel" data-role="cancel">Cancel</button>' +
        '<button type="button" class="send" data-role="confirm">Post publicly</button></div>';
      overlay.hidden = false;
      overlay.classList.add("open");
      $(modal, '[data-role="cancel"]').onclick = function () {
        overlay.hidden = true;
        overlay.classList.remove("open");
      };
      $(modal, '[data-role="confirm"]').onclick = function () {
        overlay.hidden = true;
        overlay.classList.remove("open");
        onOk();
      };
    }

    function postLocal(text) {
      var tagged = Tags.autoTag(text, opts.context || {});
      var msg = {
        nick: opts.nick || "you",
        text: tagged,
        time: "now",
      };
      if (typeof opts.onSend === "function") {
        opts.onSend(tagged, msg);
      }
      // Optimistic local append when offline / mock
      if (!state.ws || state.ws.readyState !== 1) {
        state.messages.push(msg);
        appendMessage(stream, msg, tagCfg, el);
        history.scrollTop = history.scrollHeight;
      } else {
        try {
          state.ws.send(
            JSON.stringify({
              type: "privmsg",
              channel: opts.channel,
              text: tagged,
              visitor: visitor,
              nick: opts.nick || "you",
            })
          );
        } catch (e) {
          state.messages.push(msg);
          appendMessage(stream, msg, tagCfg, el);
        }
      }
    }

    function onThemeClick() {
      /* Explicit light/dark override; Options can restore system. */
      state.themePref = state.theme === "dark" ? "light" : "dark";
      state.theme = state.themePref;
      persistRoomTheme(state.themePref);
      applyRoomTheme(el, state.theme, state.themePref);
    }
    var themeBtns = el.querySelectorAll('[data-role="theme-toggle"]');
    for (var ti = 0; ti < themeBtns.length; ti++) {
      themeBtns[ti].onclick = onThemeClick;
    }
    var mq =
      typeof matchMedia === "function"
        ? matchMedia("(prefers-color-scheme: dark)")
        : null;
    function onSchemeChange() {
      if (state.destroyed) return;
      state.themePref = readThemePref();
      if (state.themePref !== "system") return;
      state.theme = resolveRoomTheme("system");
      applyRoomTheme(el, state.theme, state.themePref);
    }
    if (mq && mq.addEventListener) mq.addEventListener("change", onSchemeChange);

    if (trackBtn) {
      trackBtn.onclick = function () {
        state.tracked = !state.tracked;
        setTrackUi();
        if (typeof opts.onTrack === "function") opts.onTrack(state.tracked);
      };
    }
    if (aiBtn) {
      aiBtn.onclick = function () {
        state.aiOpen = !state.aiOpen;
        setAiUi();
        if (state.aiOpen && !state.view && typeof opts.onNeedView === "function") {
          opts.onNeedView();
        }
      };
    }
    var aiHide = $(el, '[data-role="ai-hide"]');
    if (aiHide) {
      aiHide.onclick = function () {
        state.aiOpen = false;
        setAiUi();
        if (aiBtn) aiBtn.focus();
      };
    }

    sendBtn.onclick = function () {
      var text = draft.value.trim();
      var markers = (state.pendingMedia || [])
        .map(function (it) {
          return it.marker;
        })
        .filter(Boolean);
      if (!text && !markers.length) {
        setComposerExpanded(true);
        draft.focus();
        return;
      }
      confirmPublic(function () {
        var attached = takePendingMarkers();
        var body = text;
        if (attached.length) {
          body = body ? body + "\n" + attached.join("\n") : attached.join("\n");
        }
        postLocal(body);
        draft.value = "";
        setComposerExpanded(false);
      });
    };

    if (investigateBtn) {
      investigateBtn.onclick = function () {
        var focus = draft.value.trim();
        var cmd = focus ? "!investigate " + focus : "!investigate";
        confirmPublic(function () {
          postLocal(cmd);
          draft.value = "";
          setComposerExpanded(false);
        });
      };
    }

    function connect() {
      var url = pickMirror(state.mirrors, state.mirrorIndex);
      if (!url && opts.wsUrl) url = opts.wsUrl;
      url = withVisitorParam(url, visitor);
      if (!url) {
        setConnUi("Offline (demo)", "no mirror");
        return;
      }
      setConnUi("Connecting…", "mirror " + (state.mirrorIndex + 1));
      try {
        var ws = new WebSocket(url);
        state.ws = ws;
        ws.onopen = function () {
          state.connected = true;
          setConnUi("IRC connected", "Mirror current");
          if (typeof opts.onOpen === "function") opts.onOpen(ws);
        };
        ws.onclose = function () {
          state.connected = false;
          setConnUi("Reconnecting…", "");
          state.mirrorIndex += 1;
          if (
            !state.destroyed &&
            (state.mirrors.length || opts.wsUrl)
          ) {
            setTimeout(connect, 800);
          } else if (!state.destroyed) {
            setConnUi("Offline", "no mirror");
          }
        };
        ws.onmessage = function (ev) {
          var data;
          try {
            data = JSON.parse(ev.data);
          } catch (e) {
            return;
          }
          var typ = data.type || "";
          if (typ === "hello") {
            if (data.view) renderAiFindings(data.view);
            if (data.media_reviews && typeof data.media_reviews === "object") {
              Object.keys(data.media_reviews).forEach(function (k) {
                state.mediaReviews[k] = data.media_reviews[k];
              });
            }
            hydrateHistory(
              data.chat_history || data.history || data.lines || [],
              true
            );
            if (typeof opts.onHello === "function") opts.onHello(data);
            return;
          }
          if (typ === "chat.history" || typ === "chat_history") {
            hydrateHistory(data.lines || data.chat_history || data, true);
            return;
          }
          if (typ === "media.review") {
            applyMediaReviewEvent(data);
            return;
          }
          if (
            typ === "privmsg" ||
            typ === "message" ||
            typ === "post.live" ||
            data.text ||
            data.body ||
            (data.comment && data.comment.body)
          ) {
            var comment = data.comment || {};
            var line = data.chat_line || {};
            var nick =
              data.nick ||
              line.nick ||
              comment.author ||
              data.from ||
              data.author ||
              "anon";
            var msg = {
              nick: nick,
              text:
                data.text ||
                data.body ||
                line.body ||
                comment.body ||
                "",
              time: data.time || line.ts || "",
            };
            if (!msg.text) return;
            state.messages.push(msg);
            // Drop empty-state placeholder on first live message
            if (stream.querySelector(".empty")) stream.innerHTML = "";
            appendMessage(stream, msg, tagCfg, el, state.mediaReviews);
            history.scrollTop = history.scrollHeight;
          }
        };
      } catch (e) {
        setConnUi("Offline", "ws error");
      }
    }

    setTrackUi();
    setAiUi();
    renderSeed();
    connect();

    return {
      el: el,
      mode: mode,
      /** Gather must never appear on room component */
      hasGather: false,
      getState: function () {
        return {
          tracked: state.tracked,
          aiOpen: state.aiOpen,
          connected: state.connected,
          mode: mode,
          channel: opts.channel,
          theme: state.theme,
          themePref: state.themePref,
        };
      },
      setTheme: function (mode) {
        if (mode !== "light" && mode !== "dark" && mode !== "system") return;
        state.themePref = mode;
        persistRoomTheme(mode);
        state.theme = resolveRoomTheme(mode);
        applyRoomTheme(el, state.theme, state.themePref);
      },
      setTracked: function (v) {
        state.tracked = !!v;
        setTrackUi();
      },
      setAiOpen: function (v) {
        /* Panel chrome removed; API kept as no-op for hosts. */
        state.aiOpen = false;
        setAiUi();
      },
      setView: function (view) {
        if (aiBody) renderAiFindings(view);
      },
      appendMessage: function (msg) {
        state.messages.push(msg);
        appendMessage(stream, msg, tagCfg, el, state.mediaReviews);
      },
      destroy: function () {
        state.destroyed = true;
        stopCapture();
        if (mq && mq.removeEventListener) {
          mq.removeEventListener("change", onSchemeChange);
        }
        if (state.ws) {
          try {
            state.ws.close();
          } catch (e) {}
        }
        if (mode === "page") {
          document.body.classList.remove("ct-room-page");
        }
        el.classList.remove(
          "room",
          "ct-room",
          "ct-room-host",
          "embedded",
          "sidepanel",
        );
        el.removeAttribute("data-theme");
        el.style.colorScheme = "";
        el.innerHTML = "";
      },
      BOT_NICKS: BOT_NICKS,
    };
  }

  return {
    mount: mount,
    isBotNick: isBot,
    BOT_NICKS: BOT_NICKS,
    pickMirror: pickMirror,
    defaultMirrors: defaultMirrors,
    THEME_KEY: THEME_KEY,
    resolveTheme: resolveRoomTheme,
  };
});
