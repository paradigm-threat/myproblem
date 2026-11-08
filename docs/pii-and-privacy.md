# PII and privacy (tickets)

**Document now; implement over time.** Server tips are safe problem dossiers — not identity files.

Related: [`anonymous-tickets.md`](./anonymous-tickets.md) · [`apk-ticket-ux.md`](./apk-ticket-ux.md) · [`intake-batch-infra.md`](./intake-batch-infra.md) · [`progressive-transcription.md`](./progressive-transcription.md).

---

## One-sentence rule

> **No names, street addresses, phones, or emails on the server tip.** Coarse location (city / safe radius) only. Full PII stays on the creator’s device and is shared only on request.

---

## Why

Providers and helpers who are ready to meet exchange contact details privately. Putting addresses and names in the shared tip creates avoidable risk (logs, mesh clones, screenshots, KB extracts). Automatic conversion protects creators even when they speak PII into the mic.

---

## Automatic PII conversion (intake / LLM / ASR)

Before any commit to `tip.json` / `index.md`:

| Detect | Convert to |
|--------|------------|
| Street address, unit, ZIP+house | City / neighborhood / “within ~N km of …” |
| Full legal name | Withheld or first-name-only if product needs a handle |
| Phone, email | Withheld |
| Precise GPS | Coarse geohash / city |
| OCR of mail / ID / faces in stills | Drop or coarsen — never dump raw into tip text |

- Prefer **client-side** redaction before upload when possible.
- **Server-side conversion is mandatory** so accidental uploads still become safe before git commit.
- Intake light LLM and Batch ASR post-process must never “helpfully” restore full PII onto the tip.

---

## Where real PII lives

| Place | Allowed? |
|-------|----------|
| APK / browser **client vault** (keyed by `ticket_uuid`) | Yes — encrypted at rest when feasible |
| Regional git tip / jobs / index.md | **No** (surrogates only) |
| Ephemeral media cache | Bytes may briefly exist; purge after process; do not promote PII into tip text |
| Vercel / gateway access logs | Avoid logging bodies that contain PII |
| Master integrity backup | Treat as sensitive; never re-serve into product tips |

---

## Sharing on request

| Mode | Behavior |
|------|----------|
| **Private to provider** | Provider asks for address/name/phone. Creator approves → client sends PII on a **direct secure channel** to that provider only — **not** written into the public tip. |
| **Explicit public post** | Rare (e.g. community gathering). Creator **opts in** per field. Prefer coarsened location unless they insist. Default **off**. |
| **No silent publish** | No worker or LLM may publish full PII without that opt-in. |

---

## Retention interaction

- Close without `preserve` deletes the tip tree (and linked media) — see [`intake-batch-infra.md`](./intake-batch-infra.md).
- Client vault PII for a purged tip should be wiped on the device when the ticket is gone locally.
- Mesh git history trim (~48h) reduces recovery of past tip text from Relay nodes.

---

## Implementation phases

1. **Docs** (this file + cross-links) — done in plan rollout.
2. **Conversion pipeline** — regex/LLM redaction before tip commit; fixture tests with address utterances.
3. **Client vault + request UX** — provider ask / approve / optional public post.

---

## Product copy (canonical)

- We don’t put your home address or full name on the shared ticket.
- The ticket keeps a safe description (city-level when location matters).
- Providers can **request** contact details; you choose whether to send them privately.
