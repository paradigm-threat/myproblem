/**
 * Context tags for IRC-centric rooms.
 * Wire tags stay in PRIVMSG; UI renders chips and hides raw markup.
 * See docs/context-tags.md and EXTERNAL_ID (MyProblem).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CleverTreeContextTags = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // [[t:topic]] [[c:collection]] [[nd:group/post]] [[ndg:group]] [[fb:…]] etc.
  var TAG_RE =
    /\[\[(t|c|ndg?|fb|x|ig|reddit):([^\]]+)\]\]/gi;

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
      } else if (kind === "c") {
        chip.collection = body;
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

  function tagTopic(id) {
    if (!id) return "";
    return "[[t:" + String(id).trim() + "]]";
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

  /** Prepend unique tags for compose context. */
  function autoTag(body, ctx) {
    ctx = ctx || {};
    var parts = [];
    if (ctx.topic) parts.push(tagTopic(ctx.topic));
    if (ctx.collection) parts.push(tagCollection(ctx.collection));
    if (ctx.ndGroup && ctx.ndPost) parts.push(tagNdPost(ctx.ndGroup, ctx.ndPost));
    else if (ctx.ndGroup) parts.push(tagNdGroup(ctx.ndGroup));
    var text = String(body || "").trim();
    parts.forEach(function (t) {
      if (t && text.indexOf(t) < 0) text = t + (text ? " " + text : "");
    });
    return text;
  }

  function hrefFor(chip, cfg) {
    cfg = cfg || {};
    if (chip.kind === "nd" && chip.group && chip.post) {
      return (cfg.ndPostUrl || "https://nextdoor.com/p/{post}").replace(
        "{post}",
        encodeURIComponent(chip.post)
      );
    }
    if ((chip.kind === "nd" || chip.kind === "ndg") && chip.group) {
      return (
        cfg.ndGroupUrl || "https://nextdoor.com/g/{group}/"
      ).replace("{group}", encodeURIComponent(chip.group));
    }
    if (chip.kind === "t" && cfg.topicBase) {
      return cfg.topicBase.replace("{topic}", encodeURIComponent(chip.topic));
    }
    return null;
  }

  function labelFor(chip) {
    if (chip.kind === "t") return "topic:" + chip.topic;
    if (chip.kind === "c") return "collection:" + chip.collection;
    if (chip.kind === "ndg") return "group:" + chip.group;
    if (chip.kind === "nd") return "post:" + (chip.post || chip.body);
    return chip.kind + ":" + chip.body;
  }

  /** Escape HTML then inject chip markup for known tags. */
  function renderHtml(text, cfg) {
    var esc = String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return esc.replace(TAG_RE, function (full, kind, body) {
      var chip = parseTags(full)[0];
      if (!chip) return "";
      var href = hrefFor(chip, cfg);
      var label = labelFor(chip);
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
    tagTopic: tagTopic,
    tagCollection: tagCollection,
    tagNdPost: tagNdPost,
    tagNdGroup: tagNdGroup,
    autoTag: autoTag,
    hrefFor: hrefFor,
    labelFor: labelFor,
    renderHtml: renderHtml,
  };
});
