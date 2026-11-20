/**
 * Client-side PII scrub before persist/export.
 * Shared by content script and side panel (no modules — classic scripts).
 */
(function (global) {
  "use strict";

  const PHONE =
    /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;
  const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const PAYMENT =
    /(?:venmo|zelle|cash\s*app|cashapp|paypal)\s*[:@]?\s*[@$]?\S+/gi;
  const HANDLE_PAY = /(?:@|\$)[A-Za-z][A-Za-z0-9._-]{2,}/g;
  const STREETISH =
    /\b\d{1,5}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,4}\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|cir|circle|pl|place|hwy|highway)\b\.?/gi;

  function scrubText(input) {
    if (!input || typeof input !== "string") return "";
    let t = input;
    // Origin ref tags are wire metadata — strip from tip/export bodies
    t = t.replace(/\[\[ndg?:[^\]]+\]\]/g, "");
    t = t.replace(PHONE, "[phone]");
    t = t.replace(EMAIL, "[email]");
    t = t.replace(PAYMENT, "[payment]");
    t = t.replace(HANDLE_PAY, "[handle]");
    t = t.replace(STREETISH, "[street]");
    return t.replace(/\s{2,}/g, " ").trim();
  }

  function scrubThread(thread) {
    const out = { ...thread };
    if (out.body) out.body_redacted = scrubText(out.body);
    else if (out.body_redacted) out.body_redacted = scrubText(out.body_redacted);
    delete out.body;
    if (Array.isArray(out.reply_templates)) {
      out.reply_templates = out.reply_templates.map((r) => ({
        ...r,
        body: scrubText(r.body || ""),
      }));
    }
    if (out.author_name) delete out.author_name;
    return out;
  }

  global.MyProblemScrub = { scrubText, scrubThread };
})(typeof globalThis !== "undefined" ? globalThis : self);
