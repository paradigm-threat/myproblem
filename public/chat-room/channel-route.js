/**
 * Map active-tab host → IRC channel + attribution context.
 * Product hosts → repo channel; everyone else → #web + [[d:domain]].
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CleverTreeChannelRoute = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var PT_HOSTS = {
    "paradigmthreat.net": 1,
    "www.paradigmthreat.net": 1,
    "old.paradigmthreat.net": 1,
  };
  var MP_HOSTS = {
    "myproblem.app": 1,
    "www.myproblem.app": 1,
  };

  function normalizeHost(host) {
    var h = String(host || "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .split(":")[0];
    if (h.indexOf("www.") === 0) h = h.slice(4);
    return h;
  }

  /**
   * @returns {{ channel: string, title: string, topicId: number|null, domain: string, repo: string }}
   */
  function routeForUrl(href, opts) {
    opts = opts || {};
    var domain = "";
    try {
      var u = new URL(href);
      domain = normalizeHost(u.hostname);
    } catch (e) {
      domain = normalizeHost(href);
    }
    if (opts.topicId !== undefined && opts.topicId !== null && opts.channel) {
      return {
        channel: opts.channel,
        title: opts.title || "Public room",
        topicId: opts.topicId,
        domain: "",
        repo: opts.repo || "product",
      };
    }
    if (PT_HOSTS[domain] || PT_HOSTS["www." + domain]) {
      var tid = opts.topicId !== undefined && opts.topicId !== null ? opts.topicId : 0;
      return {
        channel: "#pt",
        title: "Paradigm Threat",
        topicId: tid,
        domain: "",
        repo: "paradigm-threat",
      };
    }
    if (MP_HOSTS[domain] || MP_HOSTS["www." + domain]) {
      var path = "";
      try {
        path = new URL(href).pathname || "";
      } catch (e2) {}
      if (path.indexOf("ga-savannah") >= 0 || path.indexOf("savannah-cat") >= 0) {
        return {
          channel: "#ga-savannah-cat-rescue",
          title: "Savannah Cat Rescue",
          topicId: null,
          domain: "",
          repo: "myproblem",
        };
      }
      return {
        channel: "#mp-general",
        title: "MyProblem general",
        topicId: null,
        domain: "",
        repo: "myproblem",
      };
    }
    return {
      channel: "#web",
      title: "Public web",
      topicId: null,
      domain: domain || "unknown",
      repo: "public-web",
    };
  }

  return {
    normalizeHost: normalizeHost,
    routeForUrl: routeForUrl,
  };
});
