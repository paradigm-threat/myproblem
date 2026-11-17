# Fixit / repair — KB scope, public tickets, pilot

**Terminology:** **SI** = Super Intelligence (i.e. AI) — preferred name for the investigating software.

For **physical repair**, MyProblem collects enough requirements that a **trimmed, accurate ticket** exists for **humans** to review and help. That ticket (plus organized advice) is the real knowledge base. Generic SI advice may appear; deep splice steps stay out of scope until roadmap capabilities (e.g. basic electrical mapping) ship.

Related: [`topical-repos.md`](./topical-repos.md) · [`clevertree-chat.md`](./clevertree-chat.md) · [`ephemeral-media.md`](./ephemeral-media.md) · [`knowledge-base.md`](./knowledge-base.md) · [`confidence-gauge.md`](./confidence-gauge.md) · [`fixit/solution-route-rules.md`](./fixit/solution-route-rules.md) · [`fixit/batch-prompt-pack.md`](./fixit/batch-prompt-pack.md).

---

## Public ticket URL

- Canonical: `https://myproblem.app/t/[slug-or-uuid]`
- SI **suggests** a short kebab slug from **topic + originality** once context is clear; human may edit; uuid stays durable.
- Page mounts Clevertree Chat; **one key per solution route** (e.g. `hire-electrician`, `diy-with-caution`).
- Training notice: all tickets are anonymized but will be used to train the SI.
- UI theme: [`fixit-theme.md`](./fixit-theme.md) + `src/styles/fixit-theme.css` + `public/fixit-theme/` (sticky chip nav; Overview → Photos → Routes → Advice → Approaches → Safety).

### Pilot: garage Ring / always-on outdoor power

- Seed: [`content/public-tickets/garage-ring-power.json`](../content/public-tickets/garage-ring-power.json)
- URL: https://myproblem.app/t/garage-ring-power
- Scrubbed stills: `public/pilot/garage-ring-power/`
- Nextdoor draft: [`content/public-tickets/nextdoor-draft.md`](../content/public-tickets/nextdoor-draft.md)
- Clevertree topic: `garage-ring-power`
- Rules template: [`fixit/solution-route-rules.md`](./fixit/solution-route-rules.md)

---

## In scope vs out of scope

| In scope | Out of scope |
|---|---|
| Requirements + labeled stills for humans | SI-as-electrician / live panel how-to |
| Solution-route organization | Frozen NEC manuals in KB |
| Capture checklists; soft caution | Boosting contractors |
| Place KB for who-to-call / AHJ cites | Homing craft DIY into georgia to avoid mint wait |
| Scrubbed Bunny stills while live | Raw identity-bearing photos on the public page |

---

## Bunny + scrub

While live: scrubbed stills may use Bunny CDN URLs on the tip / public post. **Expire** on solve, unpublish, or media remove. Batch scrub instructions: `stillScrub.mjs` + [`fixit/batch-prompt-pack.md`](./fixit/batch-prompt-pack.md).

---

## Local search → KB

Batch may look up local resources and forums (allowed browser); write **cite-only** briefs into georgia/fixit KB. Honest Limits when blocked. No boosting.

---

## Roadmap (later)

Basic electrical **system mapping** as ticket Evidence for humans — not a permit drawing.
