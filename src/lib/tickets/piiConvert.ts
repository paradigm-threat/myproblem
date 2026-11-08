/**
 * Automatic PII conversion — see docs/pii-and-privacy.md.
 * Never commit raw street addresses / phones / emails into tip text.
 */

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE =
  /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g;
const STREET_RE =
  /\b\d{1,6}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,4}\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Ln|Lane|Dr|Drive|Ct|Court|Way|Hwy|Highway|Pkwy|Parkway)\b\.?/gi;
const UNIT_RE = /\b(?:Apt|Apartment|Unit|Suite|Ste)\.?\s*[A-Za-z0-9-]+\b/gi;
const MY_NAME_RE =
  /\b(?:my name is|I am|I'm)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g;

export function convertPii(
  text: string,
  opts: { cityHint?: string } = {},
): { text: string; changed: boolean } {
  if (!text) return { text: text || "", changed: false };
  let out = text;
  const before = out;
  const city = opts.cityHint || "the local area";
  out = out.replace(EMAIL_RE, "[email withheld]");
  out = out.replace(PHONE_RE, "[phone withheld]");
  out = out.replace(UNIT_RE, "");
  out = out.replace(STREET_RE, `an address in ${city}`);
  out = out.replace(MY_NAME_RE, "my name is [withheld]");
  out = out.replace(/\s{2,}/g, " ").trim();
  return { text: out, changed: out !== before };
}
