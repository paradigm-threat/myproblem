/**
 * Thin Custom Element wrappers over fronts/room mount APIs.
 * One implementation underneath — CleverScript / hosts can use tags.
 *
 *   <clevertree-room channel="#pt" topic-id="0"></clevertree-room>
 *   <clevertree-chat-dock channel="#pt" api-base="https://api.clevertree.chat"></clevertree-chat-dock>
 *
 * SI rail title/subtitle come from IRC TOPIC + pin METADATA via the shared
 * CleverTreeRoom mount (hello / topic.update / pin.update). The optional
 * `title` attribute is only a pre-hello seed until TOPIC arrives — do not
 * treat it as a parallel live SoT.
 */
(function (global) {
  "use strict";

  function attr(el, name, fallback) {
    var v = el.getAttribute(name);
    return v == null || v === "" ? fallback : v;
  }

  function numAttr(el, name, fallback) {
    var v = el.getAttribute(name);
    if (v == null || v === "") return fallback;
    var n = parseInt(v, 10);
    return isNaN(n) ? fallback : n;
  }

  /* ---------- <clevertree-room> ---------- */
  function ClevertreeRoomEl() {
    return Reflect.construct(HTMLElement, [], ClevertreeRoomEl);
  }
  ClevertreeRoomEl.prototype = Object.create(HTMLElement.prototype);
  ClevertreeRoomEl.prototype.constructor = ClevertreeRoomEl;
  Object.setPrototypeOf(ClevertreeRoomEl, HTMLElement);

  ClevertreeRoomEl.observedAttributes = [
    "channel",
    "title",
    "topic-id",
    "api-base",
    "ws-url",
    "mode",
  ];

  ClevertreeRoomEl.prototype.connectedCallback = function () {
    this.style.display = this.style.display || "block";
    this.style.height = this.style.height || "100%";
    this._remount();
  };

  ClevertreeRoomEl.prototype.disconnectedCallback = function () {
    if (this._api && this._api.destroy) {
      try {
        this._api.destroy();
      } catch (e) {}
    }
    this._api = null;
  };

  ClevertreeRoomEl.prototype.attributeChangedCallback = function () {
    if (this.isConnected) this._remount();
  };

  ClevertreeRoomEl.prototype._remount = function () {
    var Room = global.CleverTreeRoom;
    if (!Room || !Room.mount) return;
    if (this._api && this._api.destroy) {
      try {
        this._api.destroy();
      } catch (e) {}
    }
    var channel = attr(this, "channel", "#web");
    var topicId = numAttr(this, "topic-id", 0);
    var apiBase = attr(this, "api-base", "https://api.clevertree.chat");
    var topic = String(channel).replace(/^#/, "");
    var wsHost = apiBase.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
    this._api = Room.mount(this, {
      mode: attr(this, "mode", "page"),
      channel: channel,
      /* Seed only until IRC TOPIC arrives on hello / topic.update. */
      title: attr(this, "title", "Clevertree Chat"),
      context: { topicId: topicId },
      apiBase: apiBase,
      wsUrl: attr(this, "ws-url", wsHost + "/api/chat/ws?topic=" + encodeURIComponent(topic)),
      mirrors: [
        wsHost + "/api/chat/ws?topic=" + encodeURIComponent(topic),
        "wss://api.clevertree.chat/api/chat/ws?topic=" + encodeURIComponent(topic),
      ],
      showNetworker: false,
      showGather: false,
    });
  };

  ClevertreeRoomEl.prototype.getApi = function () {
    return this._api || null;
  };

  /* ---------- <clevertree-chat-dock> ---------- */
  function ClevertreeChatDockEl() {
    return Reflect.construct(HTMLElement, [], ClevertreeChatDockEl);
  }
  ClevertreeChatDockEl.prototype = Object.create(HTMLElement.prototype);
  ClevertreeChatDockEl.prototype.constructor = ClevertreeChatDockEl;
  Object.setPrototypeOf(ClevertreeChatDockEl, HTMLElement);

  ClevertreeChatDockEl.observedAttributes = [
    "channel",
    "title",
    "topic-id",
    "api-base",
    "open",
  ];

  ClevertreeChatDockEl.prototype.connectedCallback = function () {
    var Launcher = global.ClevertreeChatLauncher;
    if (!Launcher) return;
    var self = this;
    this._opts = this._buildOpts();
    this._ctl = Launcher.mountButton(null, Object.assign({}, this._opts, { noFab: true }));
    // Re-bind without injecting FAB: use launcher APIs directly
    if (Launcher.open && !this._ctl) {
      this._ctl = {
        open: function (o) {
          Launcher.open(Object.assign({}, self._opts, o || {}));
        },
        close: function () {
          Launcher.close();
        },
        toggle: function (o) {
          Launcher.toggle(Object.assign({}, self._opts, o || {}));
        },
        setOptions: function (o) {
          self._opts = Object.assign({}, self._opts, o || {});
        },
      };
    }
    if (this.hasAttribute("open")) this.open();
    this._onChange = function (ev) {
      var open = !!(ev && ev.detail && ev.detail.open);
      if (open) self.setAttribute("open", "");
      else self.removeAttribute("open");
      self.dispatchEvent(
        new CustomEvent("clevertree-chat:change", {
          bubbles: true,
          composed: true,
          detail: { open: open },
        })
      );
    };
    document.addEventListener("clevertree-chat:openchange", this._onChange);
  };

  ClevertreeChatDockEl.prototype.disconnectedCallback = function () {
    if (this._onChange) {
      document.removeEventListener("clevertree-chat:openchange", this._onChange);
    }
    if (this._ctl && this._ctl.close) this._ctl.close();
  };

  ClevertreeChatDockEl.prototype.attributeChangedCallback = function (name) {
    if (!this.isConnected) return;
    this._opts = this._buildOpts();
    if (this._ctl && this._ctl.setOptions) this._ctl.setOptions(this._opts);
    if (name === "open") {
      if (this.hasAttribute("open")) this.open();
      else this.close();
    }
  };

  ClevertreeChatDockEl.prototype._buildOpts = function () {
    return {
      channel: attr(this, "channel", "#pt"),
      /* Seed only; live SI title comes from IRC TOPIC after mount. */
      title: attr(this, "title", "Paradigm Threat"),
      topicId: numAttr(this, "topic-id", 0),
      apiBase: attr(this, "api-base", "https://api.clevertree.chat"),
      siteOrigin: attr(this, "site-origin", location.origin),
      dock: "fullscreen",
      noFab: true,
    };
  };

  ClevertreeChatDockEl.prototype.getApi = function () {
    return this._ctl || null;
  };

  ClevertreeChatDockEl.prototype.open = function (extra) {
    var Launcher = global.ClevertreeChatLauncher;
    var opts = Object.assign({}, this._opts || this._buildOpts(), extra || {});
    if (this._ctl && this._ctl.open) this._ctl.open(opts);
    else if (Launcher) Launcher.open(opts);
  };

  ClevertreeChatDockEl.prototype.close = function () {
    var Launcher = global.ClevertreeChatLauncher;
    if (this._ctl && this._ctl.close) this._ctl.close();
    else if (Launcher) Launcher.close();
  };

  ClevertreeChatDockEl.prototype.toggle = function (extra) {
    var Launcher = global.ClevertreeChatLauncher;
    if (Launcher && typeof Launcher.isOpen === "function" && Launcher.isOpen()) {
      this.close();
    } else {
      this.open(extra);
    }
  };

  if (!global.customElements.get("clevertree-room")) {
    global.customElements.define("clevertree-room", ClevertreeRoomEl);
  }
  if (!global.customElements.get("clevertree-chat-dock")) {
    global.customElements.define("clevertree-chat-dock", ClevertreeChatDockEl);
  }
})(typeof window !== "undefined" ? window : globalThis);
