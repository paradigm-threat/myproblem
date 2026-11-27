/**
 * Context tags for IRC-centric rooms.
 * Wire tags stay in PRIVMSG; UI renders chips and hides raw markup.
 * See docs/context-tags.md.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CleverTreeContextTags = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // [[t:N]] [[d:host]] [[c:…]] [[nd:…]] [[ndg:…]] etc.
  var TAG_RE =
    /\[\[(t|d|c|ndg?|fb|x|ig|reddit):([^\]]+)\]\]/gi;

  function normalizeKind(k) {
    k = String(k || "").toLowerCase();
    if (k === "nd") return "nd";
    if (k === "ndg") return "ndg";
    return k;
  }

  function parseTags(text) {
    var out = [];
    String(text || "").replace(TAG_RE, function (full, kind, body) {
      kind = normalizeKind(kind);
      var chip = { raw: full, kind: kind, body: body };
      if (kind === "nd") {
        var slash = body.indexOf("/");
        if (slash > 0) {
          chip.group = body.slice(0, slash);
          chip.post = body.slice(slash + 1);
        }
      } else if (kind === "ndg") {
        chip.group = body;
      } else if (kind === "t") {
        chip.topic = body;
        var n = parseInt(body, 10);
        if (!isNaN(n) && String(n) === String(body).trim()) chip.topicId = n;
      } else if (kind === "c") {
        chip.collection = body;
      } else if (kind === "d") {
        chip.domain = normalizeDomain(body);
      }
      out.push(chip);
      return full;
    });
    return out;
  }

  function stripTags(text) {
    return String(text || "")
      .replace(TAG_RE, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function normalizeDomain(host) {
    var h = String(host || "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .split(":")[0];
    if (h.indexOf("www.") === 0) h = h.slice(4);
    return h.replace(/[^a-z0-9.-]/g, "").slice(0, 253);
  }

  function tagTopic(id) {
    if (id === 0 || id === "0") return "[[t:0]]";
    if (id === undefined || id === null || id === "") return "";
    return "[[t:" + String(id).trim() + "]]";
  }

  function tagDomain(host) {
    var d = normalizeDomain(host);
    if (!d) return "";
    return "[[d:" + d + "]]";
  }

  function tagCollection(id) {
    if (!id) return "";
    return "[[c:" + String(id).trim() + "]]";
  }

  function tagNdPost(group, post) {
    if (!group || !post) return "";
    return "[[nd:" + group + "/" + post + "]]";
  }

  function tagNdGroup(group) {
    if (!group) return "";
    return "[[ndg:" + group + "]]";
  }

  /** Append unique tags at end of message (never page-path tags). */
  function autoTag(body, ctx) {
    ctx = ctx || {};
    var parts = [];
    if (ctx.topicId !== undefined && ctx.topicId !== null && ctx.topicId !== "") {
      parts.push(tagTopic(ctx.topicId));
    } else if (ctx.topic !== undefined && ctx.topic !== null && ctx.topic !== "") {
      parts.push(tagTopic(ctx.topic));
    }
    if (ctx.domain) parts.push(tagDomain(ctx.domain));
    if (ctx.collection) parts.push(tagCollection(ctx.collection));
    if (ctx.ndGroup && ctx.ndPost) parts.push(tagNdPost(ctx.ndGroup, ctx.ndPost));
    else if (ctx.ndGroup) parts.push(tagNdGroup(ctx.ndGroup));
    var text = String(body || "").trim();
    parts.forEach(function (t) {
      if (t && text.indexOf(t) < 0) text = (text ? text + " " : "") + t;
    });
    return text;
  }

  function topicHref(chip, cfg) {
    cfg = cfg || {};
    var topics = cfg.topics || [];
    var id = chip.topicId;
    if (id === undefined) {
      var n = parseInt(chip.topic, 10);
      if (!isNaN(n)) id = n;
    }
    if (id !== undefined && topics.length) {
      for (var i = 0; i < topics.length; i++) {
        if (topics[i].id === id) {
          var href = topics[i].href || "";
          if (!href) return null;
          if (href.indexOf("http") === 0) return href;
          var origin = cfg.siteOrigin || "";
          return origin.replace(/\/$/, "") + (href.charAt(0) === "/" ? href : "/" + href);
        }
      }
      return null;
    }
    if (chip.kind === "t" && cfg.topicBase) {
      return cfg.topicBase.replace("{topic}", encodeURIComponent(chip.topic));
    }
    return null;
  }

  function hrefFor(chip, cfg) {
    cfg = cfg || {};
    if (chip.kind === "d" && chip.domain) {
      return "https://" + chip.domain + "/";
    }
    if (chip.kind === "nd" && chip.group && chip.post) {
      return (cfg.ndPostUrl || "https://nextdoor.com/p/{post}").replace(
        "{post}",
        encodeURIComponent(chip.post)
      );
    }
    if ((chip.kind === "nd" || chip.kind === "ndg") && chip.group) {
      return (cfg.ndGroupUrl || "https://nextdoor.com/g/{group}/").replace(
        "{group}",
        encodeURIComponent(chip.group)
      );
    }
    if (chip.kind === "t") return topicHref(chip, cfg);
    return null;
  }

  function labelFor(chip, cfg) {
    cfg = cfg || {};
    if (chip.kind === "d") return chip.domain || chip.body;
    if (chip.kind === "t") {
      var topics = cfg.topics || [];
      var id = chip.topicId;
      if (id === undefined) {
        var n = parseInt(chip.topic, 10);
        if (!isNaN(n)) id = n;
      }
      if (id !== undefined && topics.length) {
        for (var i = 0; i < topics.length; i++) {
          if (topics[i].id === id) return topics[i].title || topics[i].slug || "topic " + id;
        }
        return "topic " + id;
      }
      return "topic:" + chip.topic;
    }
    if (chip.kind === "c") return "collection:" + chip.collection;
    if (chip.kind === "ndg") return "group:" + chip.group;
    if (chip.kind === "nd") return "post:" + (chip.post || chip.body);
    return chip.kind + ":" + chip.body;
  }

  function renderHtml(text, cfg) {
    var esc = String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return esc.replace(TAG_RE, function (full) {
      var chip = parseTags(full)[0];
      if (!chip) return "";
      var href = hrefFor(chip, cfg);
      var label = labelFor(chip, cfg);
      if (href) {
        return (
          '<a class="ct-tag" data-kind="' +
          chip.kind +
          '" href="' +
          href.replace(/"/g, "") +
          '" target="_blank" rel="noopener noreferrer">' +
          label.replace(/</g, "") +
          "</a>"
        );
      }
      return (
        '<span class="ct-tag" data-kind="' +
        chip.kind +
        '">' +
        label.replace(/</g, "") +
        "</span>"
      );
    });
  }

  return {
    TAG_RE: TAG_RE,
    parseTags: parseTags,
    stripTags: stripTags,
    normalizeDomain: normalizeDomain,
    tagTopic: tagTopic,
    tagDomain: tagDomain,
    tagCollection: tagCollection,
    tagNdPost: tagNdPost,
    tagNdGroup: tagNdGroup,
    autoTag: autoTag,
    hrefFor: hrefFor,
    labelFor: labelFor,
    renderHtml: renderHtml,
  };
});
