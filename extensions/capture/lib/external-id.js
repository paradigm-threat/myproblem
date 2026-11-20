/**
 * Per-repo forum external ids: [[nd:group/post]] / [[ndg:group]]
 * See content/channels/EXTERNAL_ID.md and myproblem-tickets forum-platforms.json
 */
(function (global) {
  "use strict";

  const TAG_RE = /\[\[(ndg?):([^\]]+)\]\]/g;

  const DEFAULTS = {
    site: "nextdoor",
    group_url: "https://nextdoor.com/g/{group}/",
    post_url: "https://nextdoor.com/p/{post}",
    irc_channel: "#ga-savannah-cat-rescue",
    ws_topic: "ga-savannah-cat-rescue",
    collection_id: "savannah-cat-rescue",
    chat_host: "https://api.clevertree.chat",
  };

  function tagPost(groupId, postId) {
    if (!groupId || !postId) return "";
    return "[[nd:" + groupId + "/" + postId + "]]";
  }

  function tagGroup(groupId) {
    if (!groupId) return "";
    return "[[ndg:" + groupId + "]]";
  }

  function parseTag(raw) {
    const m = String(raw || "").match(/^\[\[(ndg?):([^\]]+)\]\]$/);
    if (!m) return null;
    const kind = m[1];
    const body = m[2];
    if (kind === "ndg") {
      return { kind: "group", site: "nextdoor", group: body, post: null };
    }
    const slash = body.indexOf("/");
    if (slash < 0) return null;
    return {
      kind: "post",
      site: "nextdoor",
      group: body.slice(0, slash),
      post: body.slice(slash + 1),
    };
  }

  function urlsFor(parsed, cfg) {
    const c = cfg || DEFAULTS;
    if (!parsed) return null;
    const out = {};
    if (parsed.group) {
      out.group_url = c.group_url.replace("{group}", encodeURIComponent(parsed.group));
      // Nextdoor group ids are path-safe alnum; avoid over-encoding
      out.group_url = "https://nextdoor.com/g/" + parsed.group + "/";
    }
    if (parsed.post) {
      out.post_url = "https://nextdoor.com/p/" + parsed.post;
    }
    return out;
  }

  function stripTags(text) {
    return String(text || "").replace(TAG_RE, "").replace(/\s{2,}/g, " ").trim();
  }

  function prependTag(text, tag) {
    const body = String(text || "").trim();
    if (!tag) return body;
    if (body.indexOf(tag) === 0) return body;
    return tag + (body ? " " + body : "");
  }

  /** Parse Nextdoor tab URL → { groupId, postId, kind } */
  function parseNextdoorUrl(url) {
    try {
      const raw = String(url || "");
      if (!/nextdoor\.com/i.test(raw)) return null;
      const g = raw.match(/\/g\/([A-Za-z0-9]+)/);
      const p = raw.match(/\/p\/([A-Za-z0-9_-]+)/);
      if (p) {
        return {
          kind: "post",
          postId: p[1],
          groupId: g ? g[1] : null,
        };
      }
      if (g) {
        return { kind: "group", groupId: g[1], postId: null };
      }
      return { kind: "other", groupId: null, postId: null };
    } catch (_) {
      return null;
    }
  }

  function contextTag(ctx) {
    if (!ctx) return "";
    if (ctx.postId && ctx.groupId) return tagPost(ctx.groupId, ctx.postId);
    if (ctx.groupId) return tagGroup(ctx.groupId);
    return "";
  }

  function wsUrl(topic, visitor, host) {
    const base = (host || DEFAULTS.chat_host).replace(/^http/, "ws");
    const u = new URL(base + "/api/chat/ws");
    u.searchParams.set("topic", topic || DEFAULTS.ws_topic);
    u.searchParams.set("visitor", visitor || "mpx-anon");
    return u.toString();
  }

  global.MyProblemExternalId = {
    TAG_RE,
    DEFAULTS,
    tagPost,
    tagGroup,
    parseTag,
    urlsFor,
    stripTags,
    prependTag,
    parseNextdoorUrl,
    contextTag,
    wsUrl,
  };
})(typeof globalThis !== "undefined" ? globalThis : self);
