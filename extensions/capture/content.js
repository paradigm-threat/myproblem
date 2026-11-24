/**
 * Nextdoor feed harvest + reply paste assist.
 * Fail open: every capture emits a rich DOM debug session for Cursor iteration.
 */
(function () {
  "use strict";

  // Idempotent when re-injected via chrome.scripting after extension reload
  if (globalThis.__MPX_CONTENT_LOADED__) return;
  globalThis.__MPX_CONTENT_LOADED__ = true;

  const SOURCE_SITE = "nextdoor";
  const SEEN = new Set();
  const MEDIA_MAX_BYTES = 40 * 1024 * 1024;
  const MEDIA_MAX_PER_THREAD = 6;

  /**
   * Nextdoor group feed (2026): real card root is feed-item-card.
   * Broad *[data-testid*="post"] matches buttons/timestamps — do NOT use as card root.
   */
  const CARD_SELECTORS = [
    '[data-testid="feed-item-card"]',
    '[data-testid="feed-item-visibility-tracker"]',
  ];

  const PROBE_SELECTORS = [
    '[data-testid="feed-item-card"]',
    '[data-testid="feed-item-visibility-tracker"]',
    '[data-testid="post-body"]',
    '[data-testid="post-timestamp"]',
    '[data-testid="author-test"]',
    '[data-testid="feed-container"]',
    '[data-testid*="post"]',
    '[data-testid*="feed-item"]',
  ];

  function scrubMaybe(s) {
    if (globalThis.MyProblemScrub && globalThis.MyProblemScrub.scrubText) {
      return globalThis.MyProblemScrub.scrubText(String(s || ""));
    }
    return String(s || "");
  }

  function groupMeta() {
    const m = location.pathname.match(/\/g\/([^/?#]+)/);
    const secureId = m ? m[1] : null;
    const h = document.querySelector("h1, h2");
    const name =
      (h && h.textContent && h.textContent.trim()) ||
      document.title.replace(/\s*[|·].*$/, "").trim() ||
      null;
    return {
      site: SOURCE_SITE,
      group_secure_id: secureId,
      group_name: name,
      url: location.href.split("#")[0],
      path: location.pathname,
    };
  }

  function hashId(parts) {
    const s = parts.filter(Boolean).join("|");
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return "nd_" + (h >>> 0).toString(16);
  }

  function textOf(el) {
    if (!el) return "";
    return (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function cssPath(el) {
    try {
      const parts = [];
      let n = el;
      for (let i = 0; n && n.nodeType === 1 && i < 6; i++) {
        let part = n.tagName.toLowerCase();
        if (n.id) {
          part += "#" + n.id.slice(0, 40);
          parts.unshift(part);
          break;
        }
        const testid = n.getAttribute("data-testid");
        if (testid) part += `[data-testid="${testid.slice(0, 60)}"]`;
        const parent = n.parentElement;
        if (parent) {
          const sibs = [...parent.children].filter((c) => c.tagName === n.tagName);
          if (sibs.length > 1) part += `:nth-of-type(${sibs.indexOf(n) + 1})`;
        }
        parts.unshift(part);
        n = parent;
      }
      return parts.join(" > ");
    } catch (e) {
      return String(e && e.message ? e.message : e);
    }
  }

  function elFingerprint(el) {
    if (!el) return null;
    const attrs = {};
    try {
      for (const a of el.attributes || []) {
        if (/^(class|id|data-|role|aria-)/.test(a.name)) {
          attrs[a.name] = String(a.value || "").slice(0, 120);
        }
      }
    } catch (_) {
      /* ignore */
    }
    let html = "";
    try {
      html = (el.outerHTML || "").slice(0, 1200);
    } catch (_) {
      html = "";
    }
    return {
      tag: el.tagName,
      path: cssPath(el),
      attrs,
      text_len: textOf(el).length,
      text_sample: scrubMaybe(textOf(el)).slice(0, 240),
      outer_html_trunc: scrubMaybe(html).slice(0, 1200),
      child_count: el.children ? el.children.length : 0,
      child_tags: el.children
        ? [...el.children].slice(0, 12).map((c) => c.tagName)
        : [],
    };
  }

  function selectorHits() {
    return PROBE_SELECTORS.map((sel) => {
      let count = 0;
      try {
        count = document.querySelectorAll(sel).length;
      } catch (_) {
        count = -1;
      }
      return { sel, count };
    });
  }

  function inventoryTestIds(limit) {
    const map = new Map();
    document.querySelectorAll("[data-testid]").forEach((el) => {
      const id = el.getAttribute("data-testid") || "";
      if (!id) return;
      map.set(id, (map.get(id) || 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit || 40)
      .map(([id, count]) => ({ id, count }));
  }

  function inventoryRoles(limit) {
    const map = new Map();
    document.querySelectorAll("[role]").forEach((el) => {
      const id = el.getAttribute("role") || "";
      map.set(id, (map.get(id) || 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit || 20)
      .map(([role, count]) => ({ role, count }));
  }

  function loginGateHints() {
    const body = (document.body && document.body.innerText) || "";
    return {
      has_log_in: /log in/i.test(body),
      has_join: /\bjoin\b/i.test(body),
      has_share_composer: /share something with the group/i.test(body),
      has_add_comment: /add a comment/i.test(body),
      likely_logged_out: /log in/i.test(body) && !/share something with the group/i.test(body),
    };
  }

  function gqlOpsSeen() {
    const ops = [];
    try {
      const entries =
        performance.getEntriesByType && performance.getEntriesByType("resource");
      if (!entries) return ops;
      for (const e of entries) {
        const m = String(e.name).match(/\/api\/gql\/([^/?]+)/);
        if (m) ops.push(m[1]);
        if (/\/api\/groups/.test(e.name)) ops.push("REST:" + e.name.split("nextdoor.com")[1]);
      }
    } catch (_) {
      /* ignore */
    }
    return [...new Set(ops)].slice(0, 40);
  }

  function resolveCardRoot(el) {
    if (!el) return null;
    const card = el.closest('[data-testid="feed-item-card"]');
    if (card) return card;
    // Visibility tracker often wraps / sits on the card shell with id s_<numeric>
    let n = el;
    for (let i = 0; n && i < 8; i++) {
      if (n.id && /^s_\d+$/.test(n.id) && n.querySelector('[data-testid="post-body"]')) {
        return n;
      }
      n = n.parentElement;
    }
    if (el.querySelector && el.querySelector('[data-testid="post-body"]')) return el;
    return null;
  }

  function candidateCards() {
    const found = new Set();
    const bySelector = {};
    for (const sel of CARD_SELECTORS) {
      let nodes = [];
      try {
        nodes = [...document.querySelectorAll(sel)];
      } catch (_) {
        nodes = [];
      }
      bySelector[sel] = nodes.length;
      nodes.forEach((el) => {
        const root = resolveCardRoot(el) || el;
        found.add(root);
      });
    }

    // Prefer exact feed-item-card when present
    const exact = [...document.querySelectorAll('[data-testid="feed-item-card"]')];
    bySelector['[data-testid="feed-item-card"](exact)'] = exact.length;
    if (exact.length) {
      found.clear();
      exact.forEach((el) => found.add(el));
    }

    let usedFallback = false;
    if (found.size === 0) {
      usedFallback = true;
      // Shell divs: id s_<postNumericId> containing a post-body
      document.querySelectorAll("div[id^='s_']").forEach((el) => {
        if (!/^s_\d+$/.test(el.id)) return;
        if (!el.querySelector('[data-testid="post-body"]')) return;
        found.add(el);
      });
      bySelector["div#s_<id>"] = found.size;
    }
    if (found.size === 0) {
      usedFallback = true;
      document.querySelectorAll('[data-testid="post-body"]').forEach((body) => {
        const root = resolveCardRoot(body);
        if (root) found.add(root);
      });
      bySelector["post-body→root"] = found.size;
    }

    // Extra probe counts for Cursor debug (not used as roots)
    for (const sel of PROBE_SELECTORS) {
      if (bySelector[sel] != null) continue;
      try {
        bySelector[sel] = document.querySelectorAll(sel).length;
      } catch (_) {
        bySelector[sel] = -1;
      }
    }

    // Dedupe nested (keep outermost)
    const list = [...found];
    const filtered = list.filter((el) => {
      return !list.some((other) => other !== el && other.contains(el));
    });

    return { cards: filtered, bySelector, usedFallback };
  }

  function buildDomProbe(extra) {
    const main =
      document.querySelector("main") ||
      document.querySelector('[role="main"]') ||
      document.body;
    const articles = document.querySelectorAll("article");
    return {
      reason: "dom_probe",
      at: new Date().toISOString(),
      url: location.href,
      title: document.title,
      readyState: document.readyState,
      viewport: {
        w: window.innerWidth,
        h: window.innerHeight,
        scrollY: window.scrollY,
      },
      login_gate: loginGateHints(),
      selector_hits: selectorHits(),
      testids_top: inventoryTestIds(50),
      roles_top: inventoryRoles(25),
      article_count: articles.length,
      main_fingerprint: elFingerprint(main),
      first_articles: [...articles].slice(0, 3).map(elFingerprint),
      gql_or_api_ops: gqlOpsSeen(),
      body_text_sample: scrubMaybe(
        (document.body && document.body.innerText) || ""
      ).slice(0, 800),
      errors: [],
      ...(extra || {}),
    };
  }

  function extractCard(el) {
    const debug = [];
    const root = resolveCardRoot(el) || el;
    const fp = elFingerprint(root);

    const bodyEl = root.querySelector('[data-testid="post-body"]');
    if (!bodyEl) {
      return {
        ok: false,
        debug: {
          reason: "no_post_body",
          url: location.href,
          notes: "Card root missing data-testid=post-body",
          fingerprint: fp,
        },
      };
    }

    // Expand truncated posts when only "... see more" is visible
    const seeMore = bodyEl.querySelector(
      '[data-post-see-more="true"], [data-testid="post-preview-button"]'
    );
    if (seeMore) {
      try {
        seeMore.click();
      } catch (_) {
        /* ignore */
      }
    }

    // Prefer expanded styled text; avoid "... see more" only
    let body = "";
    const styled = [
      ...bodyEl.querySelectorAll('[data-testid="styled-text"]'),
    ]
      .map(textOf)
      .filter((t) => t && !/^\.\.\.\s*see more$/i.test(t));
    if (styled.length) {
      body = styled.sort((a, b) => b.length - a.length)[0];
    } else {
      const span = bodyEl.querySelector(".postTextBodySpan");
      body = textOf(span || bodyEl);
    }
    body = body.replace(/\s*\.\.\.\s*see more\s*$/i, "").trim();

    // Media-only / still-collapsed: fall back to card text minus chrome
    if (!body || body.length < 8) {
      const chrome = [
        textOf(root.querySelector('[data-testid="author-test"]')),
        textOf(root.querySelector('[data-testid="author-children-test"]')),
        textOf(root.querySelector('[data-testid="post-timestamp"]')),
        "Add a comment...",
        "... see more",
      ].filter(Boolean);
      let fallback = textOf(root);
      for (const c of chrome) {
        fallback = fallback.split(c).join(" ");
      }
      fallback = fallback
        .replace(/\b\d+\s*$/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (fallback.length >= 8) body = fallback;
    }

    if (!body || body.length < 8) {
      const hasMedia = !!root.querySelector(
        '[data-testid="resized-image"], [data-testid="image-attachment-container"], [data-testid="media-wrapper"]'
      );
      if (hasMedia) {
        body = "[media post — text collapsed or empty]";
      } else {
        return {
          ok: false,
          debug: {
            reason: "body_unclear",
            url: location.href,
            notes: "post-body present but text empty/too short",
            fingerprint: fp,
          },
        };
      }
    }

    const timeEl = root.querySelector('[data-testid="post-timestamp"]');
    const relative_time = timeEl ? textOf(timeEl) : null;

    let author_name = null;
    let author_neighborhood = null;
    const authorEl = root.querySelector('[data-testid="author-test"]');
    const authorChildren = root.querySelector(
      '[data-testid="author-children-test"]'
    );
    if (authorEl) author_name = textOf(authorEl);
    if (authorChildren) {
      const bits = textOf(authorChildren)
        .split("·")
        .map((s) => s.trim())
        .filter(Boolean);
      // Often: Neighborhood · time · Edited — time also in post-timestamp
      if (bits.length) {
        const maybeHood = bits.find(
          (b) =>
            b &&
            !/^(Edited|Just now|\d+\s*(hr|min|hour|hours|day|days|ago)|[0-9]{1,2}\s+[A-Za-z]{3}(\s+\d{2})?)$/i.test(
              b
            )
        );
        if (maybeHood) author_neighborhood = maybeHood;
      }
    }

    const link =
      (timeEl && timeEl.querySelector('a[href*="/p/"]')) ||
      root.querySelector('a[href*="/p/"]');
    const postHref = link ? link.href : null;

    let numericId = null;
    if (root.id && /^s_(\d+)$/.test(root.id)) numericId = RegExp.$1;
    if (!numericId) {
      let n = root;
      for (let i = 0; n && i < 6; i++) {
        if (n.id && /^s_(\d+)$/.test(n.id)) {
          numericId = RegExp.$1;
          break;
        }
        n = n.parentElement;
      }
    }
    const dwell =
      root.querySelector('[data-testid^="dwell-tracker-feedItem"]') ||
      (root.parentElement &&
        root.parentElement.querySelector(
          '[data-testid^="dwell-tracker-feedItem"]'
        ));
    if (!numericId && dwell) {
      const m = (dwell.getAttribute("data-testid") || "").match(
        /feedItem:(\d+)/
      );
      if (m) numericId = m[1];
    }
    const hrefId = postHref && postHref.match(/\/p\/([^/?#]+)/);
    const id = numericId
      ? "nd_" + numericId
      : hrefId
        ? "nd_" + hrefId[1]
        : hashId([postHref, body.slice(0, 120), relative_time]);

    const replyBtn = root.querySelector('[data-testid="post-reply-button"]');
    let comment_count = null;
    if (replyBtn) {
      const n = textOf(replyBtn).replace(/[^\d]/g, "");
      if (n) comment_count = Number(n);
    }

    const imgCount = root.querySelectorAll(
      '[data-testid="resized-image"], [data-testid="image-attachment-container"] img, img'
    ).length;

    const mediaMeta = collectMediaMeta(root);

    if (!relative_time) {
      debug.push({
        reason: "time_unclear",
        url: location.href,
        notes: "No post-timestamp inside card",
        id,
      });
    }

    const topics = globalThis.MyProblemTopics;
    const body_redacted = scrubMaybe(body);
    const classified = topics
      ? topics.classify(body_redacted)
      : {
          gate: "ticket",
          skip: false,
          outlier_reason: null,
          suggested_topics: ["useful-info"],
          value_rank: 0.4,
        };

    const postId =
      numericId ||
      (hrefId && hrefId[1]) ||
      (id.startsWith("nd_") ? id.slice(3) : id);
    const externalUrl = postHref
      ? postHref.startsWith("http")
        ? postHref.split("#")[0]
        : "https://nextdoor.com" + (postHref.startsWith("/") ? postHref : "/" + postHref)
      : null;

    const isOutlier = classified.gate === "outlier" || classified.skip;
    return {
      ok: true,
      thread: {
        id,
        source_href: postHref,
        nextdoor_numeric_id: numericId,
        author_name: author_name ? scrubMaybe(author_name) : null,
        author_neighborhood: author_neighborhood
          ? scrubMaybe(author_neighborhood)
          : null,
        relative_time,
        body_redacted,
        comment_count,
        image_count: imgCount,
        gate: isOutlier ? "outlier" : "ticket",
        skip: !!isOutlier,
        outlier_reason: isOutlier
          ? classified.outlier_reason || "off-topic"
          : null,
        suggested_topics: isOutlier ? [] : classified.suggested_topics || [],
        value_rank: classified.value_rank,
        reply_templates: [],
        media: isOutlier ? [] : mediaMeta,
        external_ref: {
          site: "nextdoor",
          post_id: String(postId),
          url: externalUrl,
        },
        captured_url: location.href.split("#")[0],
        _debug_path: fp.path,
        _debug_testid: root.getAttribute("data-testid"),
      },
      debug: debug.length ? debug : null,
    };
  }

  function absUrl(href) {
    if (!href) return null;
    try {
      return new URL(href, location.href).href.split("#")[0];
    } catch (_) {
      return null;
    }
  }

  function guessKind(url, el) {
    const u = (url || "").toLowerCase();
    const tag = (el && el.tagName) || "";
    if (tag === "VIDEO" || /\.(mp4|webm|mov)(\?|$)/i.test(u) || u.includes("/video"))
      return "video";
    if (tag === "AUDIO" || /\.(mp3|m4a|wav|aac)(\?|$)/i.test(u)) return "audio";
    if (/\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(u) || tag === "IMG")
      return "image";
    if (tag === "SOURCE") {
      const t = (el.getAttribute("type") || "").toLowerCase();
      if (t.startsWith("video/")) return "video";
      if (t.startsWith("audio/")) return "audio";
      if (t.startsWith("image/")) return "image";
    }
    return "other";
  }

  function extForKind(kind, url) {
    const u = (url || "").toLowerCase();
    const m = u.match(/\.(jpe?g|png|gif|webp|avif|mp4|webm|mov|mp3|m4a|wav)(\?|$)/i);
    if (m) return m[1].toLowerCase().replace("jpeg", "jpg");
    if (kind === "video") return "mp4";
    if (kind === "audio") return "m4a";
    if (kind === "image") return "jpg";
    return "bin";
  }

  /** Prefer largest candidate from an HTML srcset string. */
  function bestFromSrcset(srcset) {
    if (!srcset || typeof srcset !== "string") return null;
    let best = null;
    let bestW = -1;
    for (const part of srcset.split(",")) {
      const bits = part.trim().split(/\s+/);
      if (!bits[0]) continue;
      let w = 0;
      if (bits[1] && /w$/i.test(bits[1])) w = parseInt(bits[1], 10) || 0;
      else if (bits[1] && /x$/i.test(bits[1]))
        w = (parseFloat(bits[1]) || 1) * 1000;
      if (!best || w >= bestW) {
        best = bits[0];
        bestW = w;
      }
    }
    return best;
  }

  function collectMediaMeta(root) {
    if (!root) return [];
    const seen = new Set();
    const out = [];
    const push = (url, el) => {
      const abs = absUrl(url);
      if (!abs || !/^https?:\/\//i.test(abs)) return;
      if (seen.has(abs)) return;
      // Skip UI chrome / tracking / avatars / group badges (not post attachments)
      if (
        /sprite|icon|emoji|pixel|1x1|profile.?photo|avatar|user_photos|groups_photos|\.svg(\?|$)/i.test(
          abs
        )
      ) {
        return;
      }
      if (
        el &&
        el.closest &&
        el.closest(
          '[data-testid*="avatar"], [data-testid*="Avatar"], [data-testid*="author"]'
        )
      ) {
        return;
      }
      seen.add(abs);
      const kind = guessKind(abs, el);
      const idx = out.length;
      out.push({
        id: "m" + (idx + 1),
        kind,
        source_url: abs,
        local_name: null,
        sha256: null,
        bytes: null,
        scrubbed_locally: false,
        downloaded: false,
      });
    };

    root
      .querySelectorAll(
        '[data-testid="resized-image"] img, [data-testid="image-attachment-container"] img, [data-testid="media-wrapper"] img, img'
      )
      .forEach((img) => {
        const fromSet =
          bestFromSrcset(img.getAttribute("srcset")) ||
          bestFromSrcset(img.getAttribute("data-srcset"));
        push(
          fromSet ||
            img.currentSrc ||
            img.src ||
            img.getAttribute("data-src") ||
            img.getAttribute("src"),
          img
        );
      });
    root.querySelectorAll("video").forEach((v) => {
      push(v.currentSrc || v.src || v.getAttribute("data-src"), v);
      const poster = v.getAttribute("poster");
      if (poster) push(poster, v);
      v.querySelectorAll("source").forEach((s) =>
        push(s.src || s.getAttribute("data-src"), s)
      );
    });
    root.querySelectorAll("audio").forEach((a) => {
      push(a.currentSrc || a.src, a);
      a.querySelectorAll("source").forEach((s) => push(s.src, s));
    });
    root
      .querySelectorAll('a[href*=".mp4"], a[href*=".mov"], a[href*=".webm"]')
      .forEach((a) => {
        push(a.href, a);
      });
    root
      .querySelectorAll(
        '[data-testid="resized-image"], [data-testid="image-attachment-container"], [data-testid="media-wrapper"]'
      )
      .forEach((el) => {
        try {
          const bg = getComputedStyle(el).backgroundImage || "";
          const m = bg.match(/url\(["']?(https?:[^"')]+)["']?\)/i);
          if (m) push(m[1], el);
        } catch (_) {}
      });

    return out.slice(0, MEDIA_MAX_PER_THREAD);
  }

  async function sha256Hex(buf) {
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return [...new Uint8Array(hash)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function bufToBase64(buf) {
    const bytes = new Uint8Array(buf);
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(bin);
  }

  /**
   * Download media for ticket-gate threads into background IndexedDB.
   * Always uses the service worker (host_permissions) — avoids page CORS and
   * huge base64 messages from the content script.
   * No local scrub — internet-sourced bytes as-is.
   */
  async function downloadThreadMedia(thread) {
    if (!thread || thread.gate === "outlier" || thread.skip) {
      return { thread, stored: 0, skipped: "outlier" };
    }
    const list = Array.isArray(thread.media) ? thread.media : [];
    if (!list.length) return { thread, stored: 0, skipped: "none" };

    const nextMedia = [];
    let stored = 0;
    for (let i = 0; i < list.length; i++) {
      const m = { ...list[i] };
      const ext = extForKind(m.kind, m.source_url);
      m.local_name = m.local_name || `${thread.id}_${i}.${ext}`;
      m.scrubbed_locally = false;
      if (m.downloaded && m.sha256 && !m.error) {
        nextMedia.push(m);
        continue;
      }
      try {
        const bg = await chrome.runtime.sendMessage({
          type: "MPX_FETCH_STORE_MEDIA",
          threadId: thread.id,
          media: m,
        });
        if (!bg || !bg.ok) {
          throw new Error((bg && bg.error) || "fetch_store_failed");
        }
        m.bytes = bg.bytes;
        m.sha256 = bg.sha256;
        m.local_name = bg.local_name || m.local_name;
        m.downloaded = true;
        delete m.error;
        stored += 1;
      } catch (e) {
        m.downloaded = false;
        m.error = String(e && e.message ? e.message : e).slice(0, 160);
      }
      nextMedia.push(m);
    }
    thread.media = nextMedia;
    return { thread, stored };
  }

  /** Fill missing media[] from currently visible cards (match by thread id). */
  function enrichMediaFromDom(threads) {
    let byId = new Map();
    try {
      for (const card of candidateCards().cards) {
        const r = extractCard(card);
        if (r.ok && r.thread && r.thread.id) byId.set(r.thread.id, r.thread);
      }
    } catch (_) {}
    return (threads || []).map((t) => {
      if (t.media && t.media.length) return t;
      if (t.gate === "outlier" || t.skip) return t;
      const fresh = byId.get(t.id);
      if (fresh && fresh.media && fresh.media.length) {
        return { ...t, media: fresh.media, image_count: fresh.image_count };
      }
      return t;
    });
  }

  async function downloadMediaForThreads(threads) {
    const enriched = enrichMediaFromDom(threads);
    const out = [];
    let stored = 0;
    for (const t of enriched) {
      const r = await downloadThreadMedia(t);
      out.push(r.thread);
      stored += r.stored || 0;
    }
    return { threads: out, stored };
  }

  async function harvest(opts) {
    const resetSeen = !opts || opts.resetSeen !== false;
    const fetchMedia = !opts || opts.fetchMedia !== false;
    // Page-session SEEN blocked re-Capture (0 threads while cards=43).
    // Background merge already dedupes by thread id — clear each harvest.
    if (resetSeen) SEEN.clear();

    const source = groupMeta();
    const debug = [];
    const errors = [];
    let cards = [];
    let bySelector = {};
    let usedFallback = false;

    try {
      const c = candidateCards();
      cards = c.cards;
      bySelector = c.bySelector;
      usedFallback = c.usedFallback;
    } catch (e) {
      errors.push({
        where: "candidateCards",
        message: String(e && e.message ? e.message : e),
        stack: e && e.stack ? String(e.stack).slice(0, 500) : null,
      });
    }

    const probe = buildDomProbe({
      candidate_card_count: cards.length,
      candidate_by_selector: bySelector,
      used_text_fallback: usedFallback,
      candidate_samples: cards.slice(0, 5).map(elFingerprint),
      errors,
    });
    debug.push(probe);

    if (cards.length === 0) {
      debug.push({
        reason: "no_cards_found",
        url: location.href,
        notes:
          "No post-card selectors matched. Paste Copy debug into Cursor. If login_gate.likely_logged_out, log in first.",
      });
    }

    const threads = [];
    let dupCount = 0;
    let failCount = 0;
    const harvestSeen = new Set();
    for (const el of cards) {
      try {
        const result = extractCard(el);
        if (!result.ok) {
          failCount += 1;
          if (result.debug) debug.push(result.debug);
          continue;
        }
        // Dedupe within this harvest only (nested roots)
        if (harvestSeen.has(result.thread.id) || SEEN.has(result.thread.id)) {
          dupCount += 1;
          continue;
        }
        harvestSeen.add(result.thread.id);
        SEEN.add(result.thread.id);
        threads.push(result.thread);
        if (result.debug) debug.push(...result.debug);
      } catch (e) {
        failCount += 1;
        debug.push({
          reason: "extract_threw",
          url: location.href,
          notes: String(e && e.message ? e.message : e),
          stack: e && e.stack ? String(e.stack).slice(0, 400) : null,
          fingerprint: elFingerprint(el),
        });
      }
    }

    if (dupCount) {
      debug.push({
        reason: "duplicates_summarized",
        notes: `${dupCount} cards skipped as duplicate ids within this harvest`,
      });
    }

    if (threads.length === 0 && cards.length > 0) {
      debug.push({
        reason: "cards_found_but_zero_threads",
        url: location.href,
        notes: `Selectors found ${cards.length} cards but extract produced 0 threads (fails=${failCount}, dups=${dupCount}).`,
        card_count: cards.length,
        fail_count: failCount,
        dup_count: dupCount,
      });
    }

    const gql = gqlOpsSeen();
    if (gql.length) {
      debug.push({
        reason: "gql_ops_seen",
        url: location.href,
        notes: gql.join(", "),
      });
    }

    let mediaStored = 0;
    let finalThreads = threads;
    if (fetchMedia && threads.length) {
      try {
        const dl = await downloadMediaForThreads(threads);
        finalThreads = dl.threads;
        mediaStored = dl.stored || 0;
        debug.push({
          reason: "media_download",
          notes: `Stored ${mediaStored} media file(s) for ticket-gate posts (no local scrub)`,
        });
      } catch (e) {
        debug.push({
          reason: "media_download_failed",
          notes: String(e && e.message ? e.message : e),
        });
      }
    }

    return {
      source,
      threads: finalThreads,
      debug,
      dom_probe: probe,
      capture_summary: {
        threads: finalThreads.length,
        cards: cards.length,
        media_stored: mediaStored,
        debug_entries: debug.length,
        logged_out_guess: !!(probe.login_gate && probe.login_gate.likely_logged_out),
      },
    };
  }

  function findComposer() {
    const sels = [
      'textarea[placeholder*="comment" i]',
      'textarea[placeholder*="Add a comment" i]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      "textarea",
    ];
    const tried = [];
    for (const sel of sels) {
      const el = document.querySelector(sel);
      tried.push({ sel, found: !!el });
      if (el) return { el, tried };
    }
    return { el: null, tried };
  }

  function pasteReply(text) {
    const { el, tried } = findComposer();
    if (!el) {
      return {
        ok: false,
        debug: {
          reason: "composer_not_found",
          url: location.href,
          notes: "No comment textarea/contenteditable. Use clipboard paste manually.",
          composer_selector_tries: tried,
          dom_probe: buildDomProbe(),
        },
      };
    }
    el.focus();
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      el.value = text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      el.textContent = text;
      el.dispatchEvent(new InputEvent("input", { bubbles: true, data: text }));
    }
    return { ok: true };
  }


  /* ── Deep capture: expand see-more, open each post detail, harvest comments ── */

  let deepAbort = false;

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function detailRoot() {
    if (/\/p\//i.test(location.pathname)) {
      return (
        document.querySelector('[data-testid="feed-item-card"]') ||
        document.querySelector('[data-testid="post-body"]')?.closest("div") ||
        document.querySelector("main") ||
        document.body
      );
    }
    const dialogs = [...document.querySelectorAll('[role="dialog"], [aria-modal="true"]')];
    for (const d of dialogs) {
      if (d.querySelector('[data-testid="post-body"]')) return d;
    }
    // Nextdoor sometimes uses a full-bleed overlay without role=dialog
    const overlays = [...document.querySelectorAll("div")].filter((el) => {
      if (!el.querySelector('[data-testid="post-body"]')) return false;
      if (!el.querySelector('[data-testid="comment-reply-prompt"], textarea, [placeholder*="comment" i]'))
        return false;
      const r = el.getBoundingClientRect();
      return r.width > 320 && r.height > 280;
    });
    if (overlays.length) {
      overlays.sort(
        (a, b) =>
          b.getBoundingClientRect().width * b.getBoundingClientRect().height -
          a.getBoundingClientRect().width * a.getBoundingClientRect().height
      );
      return overlays[0];
    }
    return null;
  }

  function isDetailView() {
    return !!detailRoot() && (/\/p\//i.test(location.pathname) || !!document.querySelector('[role="dialog"] [data-testid="post-body"]') || !!document.querySelector('[data-testid="comment-reply-prompt"]'));
  }

  function expandSeeMore(root) {
    if (!root) return 0;
    let n = 0;
    const buttons = root.querySelectorAll(
      '[data-post-see-more="true"], [data-testid="post-preview-button"], span[data-post-see-more]'
    );
    buttons.forEach((btn) => {
      try {
        btn.click();
        n += 1;
      } catch (_) {}
    });
    // Textual "... see more" controls
    root.querySelectorAll("span, button, div[role='button']").forEach((el) => {
      const t = textOf(el);
      if (/^\.\.\.\s*see more$/i.test(t) || /^see more$/i.test(t)) {
        try {
          el.click();
          n += 1;
        } catch (_) {}
      }
    });
    return n;
  }

  function extractComments(root) {
    const out = [];
    if (!root) return out;
    const seen = new Set();

    const candidates = [
      ...root.querySelectorAll(
        '[data-testid*="comment-item"], [data-testid*="CommentItem"], [data-testid*="comment_body"], [data-testid="styled-text"]'
      ),
    ];

    // Prefer structured comment rows: author + body near reply prompt
    const rows = root.querySelectorAll(
      '[data-testid*="comment"]:not([data-testid="comment-reply-prompt"]):not([data-testid="comment-avatar-container"])'
    );
    rows.forEach((row) => {
      const t = textOf(row);
      if (!t || t.length < 2 || t.length > 2000) return;
      if (/^add a comment/i.test(t)) return;
      const key = t.slice(0, 160);
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ body_redacted: scrubMaybe(t), raw_len: t.length });
    });

    if (out.length) return out.slice(0, 40);

    // Fallback: styled-text nodes that are not the main post body
    const postBody = root.querySelector('[data-testid="post-body"]');
    candidates.forEach((el) => {
      if (postBody && postBody.contains(el)) return;
      const t = textOf(el);
      if (!t || t.length < 3 || t.length > 1500) return;
      if (/^\.\.\.\s*see more$/i.test(t)) return;
      const key = t.slice(0, 160);
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ body_redacted: scrubMaybe(t), raw_len: t.length });
    });
    return out.slice(0, 40);
  }

  async function captureOpenDetail() {
    const root = detailRoot();
    if (!root) {
      return {
        ok: false,
        debug: {
          reason: "detail_not_found",
          url: location.href,
          notes: "No post detail root (dialog or /p/ page)",
        },
      };
    }
    expandSeeMore(root);
    await sleep(250);
    expandSeeMore(root);
    // Give lazy images a moment to resolve src/srcset
    await sleep(350);

    const card =
      root.matches?.('[data-testid="feed-item-card"]')
        ? root
        : root.querySelector('[data-testid="feed-item-card"]') || root;
    const result = extractCard(card);
    if (!result.ok) return result;

    if (!(result.thread.media && result.thread.media.length)) {
      result.thread.media = collectMediaMeta(root);
      result.thread.image_count = result.thread.media.length;
    }

    const comments = extractComments(root);
    result.thread.comments_redacted = comments.map((c) => c.body_redacted);
    result.thread.comment_count =
      result.thread.comment_count != null
        ? result.thread.comment_count
        : comments.length || null;
    result.thread.capture_mode = "detail";
    result.thread.deep_captured = true;
    result.thread.captured_url = location.href.split("#")[0];
    // Prefer live /p/ URL when the detail modal is open
    const pathMatch = location.pathname.match(/\/p\/([^/?#]+)/);
    if (pathMatch) {
      const url = location.origin + "/p/" + pathMatch[1] + "/";
      result.thread.external_ref = {
        site: "nextdoor",
        post_id:
          (result.thread.external_ref && result.thread.external_ref.post_id) ||
          pathMatch[1],
        url,
      };
      if (!result.thread.source_href) result.thread.source_href = url;
    }
    return result;
  }

  function openCardDetail(card) {
    const a = card.querySelector('a[href*="/p/"]');
    if (a) {
      a.click();
      return { ok: true, via: "permalink" };
    }
    const ts = card.querySelector('[data-testid="post-timestamp"]');
    if (ts) {
      const clickable =
        ts.querySelector('[role="button"], a, [data-touchable]') || ts;
      clickable.click();
      return { ok: true, via: "timestamp" };
    }
    const bodyLink = card.querySelector(
      '[data-testid="linktouchable"], .postTextBodySpan'
    );
    if (bodyLink) {
      bodyLink.click();
      return { ok: true, via: "body" };
    }
    return { ok: false, via: null };
  }

  function closeDetail() {
    const esc = () =>
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          code: "Escape",
          keyCode: 27,
          which: 27,
          bubbles: true,
          cancelable: true,
        })
      );
    esc();
    // Click every visible close control — stacked modals need more than one
    document
      .querySelectorAll(
        '[aria-label="Close"], [aria-label="close"], [aria-label="Close dialog"], [data-testid*="close-button"], [data-testid*="Close"], button[aria-label*="Close" i]'
      )
      .forEach((btn) => {
        try {
          btn.click();
        } catch (_) {}
      });
    esc();
  }

  async function ensureDetailClosed() {
    for (let i = 0; i < 6; i++) {
      const open =
        !!detailRoot() ||
        !!document.querySelector('[role="dialog"]') ||
        /\/p\//i.test(location.pathname);
      if (!open) return true;
      closeDetail();
      await sleep(180);
    }
    return !(
      detailRoot() ||
      document.querySelector('[role="dialog"]') ||
      /\/p\//i.test(location.pathname)
    );
  }

  /** Backup refresh — side panel also navigates to the group feed after deep walk. */
  function schedulePageRefresh(reason) {
    setTimeout(() => {
      try {
        // Prefer leaving /p/ stacked overlays by going to the group if we can
        const g = location.pathname.match(/\/g\/([^/?#]+)/);
        const fromPost = /\/p\//i.test(location.pathname);
        if (fromPost && !g) {
          // Last-resort: hard reload current URL (side panel should replace with /g/)
          location.reload();
          return;
        }
        if (g) {
          location.assign(location.origin + "/g/" + g[1] + "/");
          return;
        }
        location.reload();
      } catch (_) {
        try {
          location.reload();
        } catch (_) {}
      }
    }, 300);
  }

  async function waitForDetail(ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (detailRoot()) return true;
      await sleep(120);
    }
    return !!detailRoot();
  }

  async function waitForFeed(ms) {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      if (
        !detailRoot() &&
        !document.querySelector('[role="dialog"]') &&
        !/\/p\//i.test(location.pathname)
      ) {
        return true;
      }
      if (
        document.querySelectorAll('[data-testid="feed-item-card"]').length > 2 &&
        !/\/p\//i.test(location.pathname)
      ) {
        return true;
      }
      await sleep(120);
    }
    return !/\/p\//i.test(location.pathname);
  }

  function emitDeepProgress(payload) {
    chrome.runtime
      .sendMessage({ type: "MPX_DEEP_PROGRESS", ...payload })
      .catch(() => {});
  }

  async function deepCapture(opts) {
    deepAbort = false;
    const maxPosts = Math.min(Math.max(Number(opts && opts.maxPosts) || 12, 1), 40);
    const delayMs = Math.min(Math.max(Number(opts && opts.delayMs) || 1000, 400), 5000);
    const source = groupMeta();
    const debug = [];
    const threads = [];

    // Prefer current detail UI when already open (screenshot case)
    if (isDetailView() && detailRoot()) {
      emitDeepProgress({
        phase: "detail_only",
        current: 1,
        total: 1,
        notes: "Capturing open post detail",
      });
      expandSeeMore(detailRoot());
      await sleep(200);
      const one = await captureOpenDetail();
      if (one.ok) threads.push(one.thread);
      else if (one.debug) debug.push(one.debug);
      debug.push({
        reason: "deep_detail_only",
        notes: "Already on post detail — captured this page only (no feed walk)",
        url: location.href,
      });
      let finalThreads = threads;
      let mediaStored = 0;
      try {
        const dl = await downloadMediaForThreads(threads);
        finalThreads = dl.threads;
        mediaStored = dl.stored || 0;
      } catch (e) {
        debug.push({
          reason: "media_download_failed",
          notes: String(e && e.message ? e.message : e),
        });
      }
      return {
        source,
        threads: finalThreads,
        debug,
        dom_probe: buildDomProbe({ mode: "deep_detail" }),
        capture_summary: {
          threads: finalThreads.length,
          cards: 1,
          mode: "detail",
          deep: true,
          media_stored: mediaStored,
          debug_entries: debug.length,
          logged_out_guess: false,
        },
      };
    }

    // Feed walk: expand + open each card's detail modal
    SEEN.clear();
    let cards = [];
    try {
      cards = candidateCards().cards;
    } catch (e) {
      debug.push({
        reason: "deep_cards_failed",
        notes: String(e && e.message ? e.message : e),
      });
    }

    const targets = cards.slice(0, maxPosts);
    let mediaStoredWalk = 0;
    emitDeepProgress({
      phase: "feed_walk",
      current: 0,
      total: targets.length,
      notes: `Walking ${targets.length} feed cards`,
    });

    for (let i = 0; i < targets.length; i++) {
      if (deepAbort) {
        debug.push({ reason: "deep_aborted", at: i, total: targets.length });
        break;
      }
      const card = targets[i];
      emitDeepProgress({
        phase: "feed_walk",
        current: i + 1,
        total: targets.length,
        notes: `Card ${i + 1}/${targets.length}`,
      });

      await ensureDetailClosed();
      expandSeeMore(card);
      await sleep(150);

      const opened = openCardDetail(card);
      if (!opened.ok) {
        // Fall back to feed-card extract only
        const fb = extractCard(card);
        if (fb.ok) {
          fb.thread.capture_mode = "feed_card";
          fb.thread.deep_captured = false;
          threads.push(fb.thread);
          SEEN.add(fb.thread.id);
        } else if (fb.debug) debug.push(fb.debug);
        debug.push({
          reason: "deep_open_failed",
          notes: "Could not open detail — used feed card text",
          fingerprint: elFingerprint(card),
        });
        continue;
      }

      const ready = await waitForDetail(4500);
      if (!ready) {
        debug.push({
          reason: "deep_detail_timeout",
          notes: `Open via ${opened.via} but detail root never appeared`,
          fingerprint: elFingerprint(card),
        });
        await ensureDetailClosed();
        await sleep(delayMs);
        continue;
      }

      await sleep(350);
      const one = await captureOpenDetail();
      if (one.ok) {
        // Download while detail is open (URLs already on thread; SW fetch)
        try {
          const dl = await downloadThreadMedia(one.thread);
          one.thread = dl.thread;
          mediaStoredWalk += dl.stored || 0;
        } catch (_) {}
        if (!SEEN.has(one.thread.id)) {
          SEEN.add(one.thread.id);
          threads.push(one.thread);
        }
      } else if (one.debug) {
        debug.push(one.debug);
      }

      await ensureDetailClosed();
      await waitForFeed(3500);
      await sleep(delayMs);
    }

    debug.push({
      reason: "deep_walk_done",
      notes: `Deep capture finished · threads=${threads.length}/${targets.length} · aborted=${deepAbort}`,
      url: location.href,
    });

    let finalThreads = threads;
    let mediaStored = mediaStoredWalk;
    try {
      const dl = await downloadMediaForThreads(threads);
      finalThreads = dl.threads;
      mediaStored = mediaStoredWalk + (dl.stored || 0);
      debug.push({
        reason: "media_download",
        notes: `Stored ${mediaStored} media file(s) (no local scrub)`,
      });
    } catch (e) {
      debug.push({
        reason: "media_download_failed",
        notes: String(e && e.message ? e.message : e),
      });
    }

    debug.push({
      reason: "page_refresh_scheduled",
      notes: "Reloading Nextdoor after deep walk to clear stacked modals",
    });
    schedulePageRefresh(
      deepAbort ? "deep_aborted" : "deep_walk_done"
    );

    return {
      source,
      threads: finalThreads,
      debug,
      dom_probe: buildDomProbe({ mode: "deep_walk", walked: targets.length }),
      capture_summary: {
        threads: finalThreads.length,
        cards: targets.length,
        mode: "deep_walk",
        deep: true,
        aborted: deepAbort,
        media_stored: mediaStored,
        page_refresh: true,
        debug_entries: debug.length,
        logged_out_guess: false,
      },
    };
  }


  const OVERLAY_ID = "__mpx_gather_overlay__";

  function showGatherOverlay() {
    if (document.getElementById(OVERLAY_ID)) return;
    const el = document.createElement("div");
    el.id = OVERLAY_ID;
    el.setAttribute("role", "alertdialog");
    el.setAttribute("aria-live", "assertive");
    el.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;background:#070d18ed;" +
      "display:grid;place-items:center;padding:24px;font-family:system-ui,sans-serif;";
    el.innerHTML =
      '<div style="max-width:460px;text-align:center;background:#0f1a2c;border:1px solid #72859d;' +
      'padding:28px;border-radius:16px;color:#f3f7fc;">' +
      "<h1 style=\"margin:0 0 12px;font-size:1.75rem;\">Please wait</h1>" +
      "<p style=\"margin:8px 0;line-height:1.5;\">Relay is gathering posts from this group.</p>" +
      "<p style=\"margin:8px 0;line-height:1.5;\">Leave this page open. You can use it again when gathering finishes.</p>" +
      '<small style="color:#b6c5d7;">Progress is shown in the Relay side panel.</small></div>';
    document.documentElement.appendChild(el);
  }

  function hideGatherOverlay() {
    const el = document.getElementById(OVERLAY_ID);
    if (el) el.remove();
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || !msg.type) return;

    if (msg.type === "MPX_CLEAR_SEEN") {
      SEEN.clear();
      sendResponse({ ok: true, cleared: true });
      return true;
    }

    if (msg.type === "MPX_GATHER_OVERLAY_SHOW") {
      showGatherOverlay();
      sendResponse({ ok: true });
      return true;
    }

    if (msg.type === "MPX_GATHER_OVERLAY_HIDE") {
      hideGatherOverlay();
      sendResponse({ ok: true });
      return true;
    }

    if (msg.type === "MPX_DEEP_STOP") {
      deepAbort = true;
      hideGatherOverlay();
      sendResponse({ ok: true, stopping: true });
      return true;
    }

    if (msg.type === "MPX_DEEP_CAPTURE") {
      showGatherOverlay();
      deepCapture(msg)
        .then((res) => {
          hideGatherOverlay();
          sendResponse({ ok: true, ...res });
        })
        .catch((e) => {
          hideGatherOverlay();
          sendResponse({
            ok: false,
            debug: [
              {
                reason: "deep_threw",
                notes: String(e && e.message ? e.message : e),
                url: location.href,
              },
            ],
          });
        });
      return true;
    }

    if (
      msg.type === "MPX_HARVEST" ||
      msg.type === "MPX_CAPTURE_PAGE" ||
      msg.type === "MPX_DOM_PROBE"
    ) {
      try {
        if (msg.type === "MPX_DOM_PROBE") {
          const probe = buildDomProbe({ mode: "probe_only" });
          sendResponse({
            ok: true,
            source: groupMeta(),
            threads: [],
            debug: [probe],
            dom_probe: probe,
            capture_summary: { threads: 0, cards: 0, debug_only: true },
          });
        } else {
          harvest({ resetSeen: true, fetchMedia: true })
            .then((res) => sendResponse({ ok: true, ...res }))
            .catch((e) => {
              const failProbe = {
                reason: "harvest_threw",
                url: location.href,
                notes: String(e && e.message ? e.message : e),
                stack: e && e.stack ? String(e.stack).slice(0, 800) : null,
                title: document.title,
                body_text_sample: scrubMaybe(
                  (document.body && document.body.innerText) || ""
                ).slice(0, 500),
              };
              sendResponse({
                ok: false,
                debug: [failProbe],
                dom_probe: failProbe,
              });
            });
          return true;
        }
      } catch (e) {
        const failProbe = {
          reason: "harvest_threw",
          url: location.href,
          notes: String(e && e.message ? e.message : e),
          stack: e && e.stack ? String(e.stack).slice(0, 800) : null,
          title: document.title,
          body_text_sample: scrubMaybe(
            (document.body && document.body.innerText) || ""
          ).slice(0, 500),
        };
        sendResponse({
          ok: false,
          debug: [failProbe],
          dom_probe: failProbe,
        });
      }
      return true;
    }

    if (msg.type === "MPX_DOWNLOAD_MEDIA") {
      downloadMediaForThreads(msg.threads || [])
        .then((r) => sendResponse({ ok: true, ...r }))
        .catch((e) =>
          sendResponse({
            ok: false,
            error: String(e && e.message ? e.message : e),
          })
        );
      return true;
    }

    if (msg.type === "MPX_PASTE_REPLY") {
      const r = pasteReply(msg.body || "");
      sendResponse(r);
      return true;
    }

    if (msg.type === "MPX_PAGE_INFO") {
      sendResponse({ ok: true, source: groupMeta(), href: location.href });
      return true;
    }

    if (msg.type === "MPX_PING") {
      let cards = 0;
      try {
        cards = document.querySelectorAll(
          '[data-testid="feed-item-card"]'
        ).length;
      } catch (_) {}
      sendResponse({
        ok: true,
        pong: true,
        href: location.href,
        cards,
        detail: !!detailRoot(),
        source: groupMeta(),
      });
      return true;
    }
  });

  let debounce = null;
  const mo = new MutationObserver(() => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      chrome.runtime
        .sendMessage({ type: "MPX_AUTO_HARVEST_HINT" })
        .catch(() => {});
    }, 800);
  });
  if (document.body) {
    mo.observe(document.body, { childList: true, subtree: true });
  }
})();
