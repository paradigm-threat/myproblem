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
  var THEME_SUN =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75"/><path d="M12 2v2.2M12 19.8V22M4.2 12H2M22 12h-2.2M5.05 5.05l1.56 1.56M17.39 17.39l1.56 1.56M5.05 18.95l1.56-1.56M17.39 6.61l1.56-1.56" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';
  var THEME_MOON =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.5 14.2A8.2 8.2 0 0 1 9.8 3.5 7.4 7.4 0 1 0 20.5 14.2Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/></svg>';

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

  function applyRoomTheme(el, mode) {
    if (!el) return;
    el.setAttribute("data-theme", mode);
    el.style.colorScheme = mode;
    var btns = el.querySelectorAll('[data-role="theme-toggle"]');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var next = mode === "dark" ? "light" : "dark";
      btn.setAttribute(
        "aria-label",
        next === "light" ? "Switch room to light theme" : "Switch room to dark theme"
      );
      btn.title = btn.getAttribute("aria-label");
      btn.innerHTML = mode === "dark" ? THEME_SUN : THEME_MOON;
    }
  }

  function persistRoomTheme(mode) {
    try {
      localStorage.setItem(THEME_KEY, mode);
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

  function pickMirror(list, i) {
    if (!list || !list.length) return null;
    return list[Math.max(0, i || 0) % list.length];
  }

  function shellHtml(opts) {
    var ch = esc(opts.channel || "#general");
    var title = esc(opts.title || "Public room");
    var mode = opts.mode || "page";
    var sideLabel =
      mode === "sidepanel"
        ? '<div class="surface-label"><span>Chrome side panel · CleverTree</span><span>ROOM</span></div>'
        : "";
    return (
      sideLabel +
      '<header class="top">' +
      '<div class="brand"><span>CleverTree <small>Chat</small></span></div>' +
      '<div class="sep"></div><div class="crumb">Public help network</div>' +
      '<div class="status" data-role="status">' +
      '<button type="button" class="theme-toggle" data-role="theme-toggle" aria-label="Toggle room theme"></button>' +
      '<span class="dot"></span><strong data-role="conn">Connecting…</strong>' +
      '<span class="mirror" data-role="mirror"></span></div></header>' +
      '<section class="head"><div class="roomname">' +
      '<div class="eyebrow">Public room</div>' +
      "<h1>" +
      title +
      "</h1>" +
      '<div class="sub">' +
      ch +
      "</div></div>" +
      '<div class="actions">' +
      '<button type="button" class="theme-toggle" data-role="theme-toggle" aria-label="Toggle room theme"></button>' +
      '<button type="button" class="track" data-role="track" aria-pressed="false">Track this group</button>' +
      '<button type="button" class="investigate" data-role="investigate" title="Ask SI to investigate this channel (!investigate)">Investigate</button>' +
      '<button type="button" class="ai-toggle" data-role="ai-toggle" aria-expanded="false">AI findings</button>' +
      "</div></section>" +
      '<div class="body"><main class="chat">' +
      '<div class="history" data-role="history" role="log" aria-label="Public IRC channel messages">' +
      '<div class="stream" data-role="stream"></div></div>' +
      '<footer class="composer"><div class="compose-inner">' +
      '<div class="public"><strong>You\'re posting publicly.</strong> Text, photos, voice and video go to this IRC room. Anyone may see or save them. There is no private mode.</div>' +
      '<div class="composebox"><textarea data-role="draft" aria-label="Message to public room" placeholder="Message this public room…"></textarea>' +
      '<div class="tools">' +
      '<button type="button" class="send" data-role="send">Send publicly</button>' +
      "</div></div>" +
      '<div class="footnote"><span>Markdown · context tags auto-applied</span><span>Private Relay AI · coming later</span></div>' +
      "</div></footer></main>" +
      '<aside class="ai" data-role="ai" aria-label="AI curation panel" hidden>' +
      '<div class="aicap">Room intelligence</div>' +
      '<div class="aititle"><h2>Shared findings</h2>' +
      '<button type="button" class="close" data-role="ai-hide" aria-label="Hide AI panel">×</button></div>' +
      '<p class="aidesc">AI organizes the public conversation. All replies happen in the room. Hide this panel anytime.</p>' +
      '<div data-role="ai-body"></div></aside></div>' +
      '<div class="overlay" data-role="overlay" hidden><div class="modal" data-role="modal"></div></div>'
    );
  }

  function appendMessage(stream, msg, cfg) {
    var bot = isBot(msg.nick);
    var art = document.createElement("article");
    art.className = "msg" + (bot ? " botmsg" : "");
    art.dataset.nick = msg.nick || "";
    var bodyHtml = Tags.renderHtml(msg.text || "", cfg);
    var display = Tags.stripTags(msg.text || "");
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
      '<div class="copy">' +
      (bodyHtml || esc(display)) +
      "</div></div>";
    stream.appendChild(art);
  }

  function mount(el, opts) {
    opts = opts || {};
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
      theme: resolveRoomTheme(),
    };
    applyRoomTheme(el, state.theme);

    var trackBtn = $(el, '[data-role="track"]');
    var aiBtn = $(el, '[data-role="ai-toggle"]');
    var aiPanel = $(el, '[data-role="ai"]');
    var aiBody = $(el, '[data-role="ai-body"]');
    var stream = $(el, '[data-role="stream"]');
    var history = $(el, '[data-role="history"]');
    var draft = $(el, '[data-role="draft"]');
    var sendBtn = $(el, '[data-role="send"]');
    var investigateBtn = $(el, '[data-role="investigate"]');
    var connEl = $(el, '[data-role="conn"]');
    var mirrorEl = $(el, '[data-role="mirror"]');
    var overlay = $(el, '[data-role="overlay"]');
    var modal = $(el, '[data-role="modal"]');

    function setTrackUi() {
      trackBtn.textContent = state.tracked ? "Tracked" : "Track this group";
      trackBtn.classList.toggle("tracked", state.tracked);
      trackBtn.setAttribute("aria-pressed", state.tracked ? "true" : "false");
    }

    function renderAiFindings(view) {
      if (!aiBody) return;
      state.view = view || state.view;
      var v = state.view;
      if (!v || (!v.sections && !v.pairs && !v.exists)) {
        aiBody.innerHTML =
          "<p>No filed topics yet for this channel. AI will organize perspectives here when batch accepts them.</p>";
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
          appendMessage(stream, m, opts.tagConfig || {});
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
        appendMessage(stream, m, opts.tagConfig || {});
      });
      history.scrollTop = history.scrollHeight;
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
        appendMessage(stream, msg, opts.tagConfig || {});
        history.scrollTop = history.scrollHeight;
      } else {
        try {
          state.ws.send(
            JSON.stringify({
              type: "privmsg",
              channel: opts.channel,
              text: tagged,
            })
          );
        } catch (e) {
          state.messages.push(msg);
          appendMessage(stream, msg, opts.tagConfig || {});
        }
      }
    }

    function onThemeClick() {
      state.theme = state.theme === "dark" ? "light" : "dark";
      persistRoomTheme(state.theme);
      applyRoomTheme(el, state.theme);
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
      if (readThemePref() !== "system") return;
      state.theme = resolveRoomTheme("system");
      applyRoomTheme(el, state.theme);
    }
    if (mq && mq.addEventListener) mq.addEventListener("change", onSchemeChange);

    trackBtn.onclick = function () {
      state.tracked = !state.tracked;
      setTrackUi();
      if (typeof opts.onTrack === "function") opts.onTrack(state.tracked);
    };
    aiBtn.onclick = function () {
      state.aiOpen = !state.aiOpen;
      setAiUi();
      if (state.aiOpen && !state.view && typeof opts.onNeedView === "function") {
        opts.onNeedView();
      }
    };
    $(el, '[data-role="ai-hide"]').onclick = function () {
      state.aiOpen = false;
      setAiUi();
      aiBtn.focus();
    };

    sendBtn.onclick = function () {
      var text = draft.value.trim();
      if (!text) {
        draft.focus();
        return;
      }
      confirmPublic(function () {
        postLocal(text);
        draft.value = "";
      });
    };

    if (investigateBtn) {
      investigateBtn.onclick = function () {
        var focus = draft.value.trim();
        var cmd = focus ? "!investigate " + focus : "!investigate";
        confirmPublic(function () {
          postLocal(cmd);
          draft.value = "";
        });
      };
    }

    function connect() {
      var url = pickMirror(state.mirrors, state.mirrorIndex);
      if (!url && opts.wsUrl) url = opts.wsUrl;
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
          if (!state.destroyed && state.mirrors.length) {
            setTimeout(connect, 800);
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
          if (
            typ === "privmsg" ||
            typ === "message" ||
            typ === "post.live" ||
            data.text ||
            data.body
          ) {
            var nick = data.nick || data.from || data.author || "anon";
            var msg = {
              nick: nick,
              text: data.text || data.body || "",
              time: data.time || "",
            };
            if (!msg.text) return;
            state.messages.push(msg);
            // Drop empty-state placeholder on first live message
            if (stream.querySelector(".empty")) stream.innerHTML = "";
            appendMessage(stream, msg, opts.tagConfig || {});
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
        };
      },
      setTheme: function (mode) {
        if (mode !== "light" && mode !== "dark") return;
        state.theme = mode;
        persistRoomTheme(mode);
        applyRoomTheme(el, mode);
      },
      setTracked: function (v) {
        state.tracked = !!v;
        setTrackUi();
      },
      setAiOpen: function (v) {
        state.aiOpen = !!v;
        setAiUi();
      },
      setView: function (view) {
        renderAiFindings(view);
      },
      appendMessage: function (msg) {
        state.messages.push(msg);
        appendMessage(stream, msg, opts.tagConfig || {});
      },
      destroy: function () {
        state.destroyed = true;
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
    THEME_KEY: THEME_KEY,
    resolveTheme: resolveRoomTheme,
  };
});
