# Shared local knowledge base (primary learning)

MyProblem’s **primary means of knowledge and research** is a **region-scoped git repo of Markdown files** — not a bigger server LLM, not a global chatbot corpus, and not Neon tables.

**Purpose of the app:** solve problems. That often means knowing the **best way to solve a problem with local resources** — exactly the layer search ads and ranking wars obscure. The KB holds that layer (and place-independent DIY advice when location does not matter). It does **not** freeze-frame the greater internet.

**Disclaimer (locked):** KB content is **completely speculative** in the product sense — derived from **user contributions** and **AI investigations** only. It is **never** ranked by algorithm for pay, SEO games, or **boosting**. **Boosting is forbidden.** Readers and tickets must see that honesty.

We learn by **writing, re-testing, refining, or ditching** KB advice — and by **not forgetting** what we learned (git history). Bedrock / research tools exist to **mint or update** those files. The server LLM is only adjusted so it can **perform our vision better** — not so it can “know more” by itself.

Related: [`projects.md`](./projects.md) · [`backbone-escalate.md`](./backbone-escalate.md) · [`infra-definition.md`](./infra-definition.md) · Relay vision in `clevertree-llc-plan/02-vision-product.md` · KB [`STORE_POLICY.md`](../../myproblem-kb/docs/STORE_POLICY.md) · Paradigm Threat patterns in `paradigm-threat-files`.

---

## Why this exists

Paid search and directories fight over **advertisement rankings**. MyProblem starts in **Georgia (USA)** and **Israel** and compounds **problem-solving knowledge**: which local path actually helps, what DIY works regardless of town, what we learned on real tickets — not a clone of Yelp/Google fields.

| Global AI / ad directory | MyProblem KB |
|---|---|
| Rankings shaped by competition / ads | **No boosting**; provenance + categories only |
| Cache of the public web | **Cite** live URLs; **do not** store searchable snapshots |
| Weights as “memory” | Continuously **re-tested** git Markdown; retire dead advice |
| Escalate first, forget later | **KB first**; never forget lessons without trail |

**Growth rule:** store only what serves **problem-solving for the app** — local resource wisdom and general repair/DIY guidance when it is useful and grounded. Do not absorb world trivia or fine-tune the server model for facts.

**Searchable ≠ store (locked):** Hours, phone, menus, Wikipedia, directory scrapes stay on the live web — **cite, don’t cache**. Store **ticket-driven assessments**, DIY lessons, automation Limits, and other **useful, provable-enough** advice. Full policy: [`STORE_POLICY.md`](../../myproblem-kb/docs/STORE_POLICY.md).

**Ticket-driven business pages only:** An assessment of a company exists **only** because a Project thoroughly investigated that company **for someone’s ticket** — never a crawl of every shop.

**Learning rule (locked):**

1. **Check the KB** before expensive research or Bedrock escalate.  
2. When research or escalate runs, write **useful non-searchable** residue into the KB (redacted).  
3. **Re-test** advice on later tickets; **refine or ditch** what stops helping; keep history so we **do not forget**.  
4. Next similar ask hits **git**, not another frontier call.  
5. Server LLM tweaks are for **function/vision** only.

---

## SoT: git Markdown (Paradigm Threat patterns)

The KB is a **Relay-backed git repository** (or regional pair) of Markdown — same operational DNA as **paradigm-threat-files**:

| Pattern | How MyProblem uses it |
|---|---|
| **Category folders** | Reasonable topic trees under the region (e.g. `home-repair/plumbing/…`, `places/atlanta/…`, `services/…`). Every new doc lands in a **recognized category**, not a flat dump. |
| **Hub `page.md`** | Category index + short overview; list siblings when the hub hides auto-index (AutoIndex / folder-contents pattern). |
| **Reader articles** | Parent-folder `*.md` — plain chronicle voice for people; main ideas; link out for proof density. |
| **`investigations/` dossiers** | Evidence-heavy companions: tables, source tiers, Limits, TODOs, browser-session notes. |
| **Discovery** | New docs must be **recognized as necessary**: linked from the matching category hub, and (when flagship) from a region root index — same discipline as PT Investigation Categories. |
| **Publish** | Relay mesh / gateway serves the tree; UUID ticket tips stay separate SoT ([`anonymous-tickets.md`](./anonymous-tickets.md)). |

Private ticket timelines remain the source of truth for the person and any merchants on that tip. The KB is the **shared, redacted, category-organized layer**.

Do **not** invent a parallel Neon/`KbDocument` schema as the SoT. Attachments that are not Markdown (maps screenshots, PDFs) live in object store; the Markdown cites URI + hash.

---

## What gets written (and when)

### After Bedrock / frontier escalate

Any time a Project requires **Bedrock or another external deep service**, the batch worker **must** (when the outcome is useful and shareable):

1. Redact / convert PII ([`pii-and-privacy.md`](./pii-and-privacy.md)).  
2. Place the content in the **right category** (create hub/`page.md` if the category is new and warranted).  
3. Prefer: short **reader article** + optional **`investigations/`** dossier for receipts, tool logs, and Limits.  
4. Cite source tier (below) and link related tickets only by opaque id when needed — never dump private evidence.  
5. Update hub discovery links so the doc is findable next time.

Escalate without a KB write is a **bug** in the learning loop (unless the result was empty, illegal, or purely personal).

### After batch research (web, maps, local queries)

When the batch LLM must **research** — public web, local maps, business hours, product pages, municipal pages, etc.:

1. Prefer **advanced browser automation** (headed/headless tooling in the Batch worker) **where bots are allowed**.  
2. **Do not** plow into sites or flows that ban bots, CAPTCHA walls meant to exclude automation, authenticated/paywalled areas we have no right to, or form submits that impersonate a human user.  
3. Give the **user honest feedback** on the ticket timeline: what we could open, what we could not see (forms, gated PDFs, “verify you are human”), and what that means for confidence.  
4. Persist **reusable non-searchable** findings into the KB (comment assessments, “Site X blocks automation — use phone / merchant path”) — **not** a mirror of the pages you fetched.  
5. Session traces that are ops-only go in dossier **Investigator notes** (or ticket-private notes) — not public article body.

Research that only re-states Google/Yelp fields does not belong in the KB. Research that produces a **ticket-driven assessment** compounds.

**Repo:** [`myproblem-kb`](../../myproblem-kb) (`MYPROBLEM_KB_ROOT`). E2E: `npm run test:kb` in `myproblem-tickets`.

### Before another escalate

```
Project step
  1. Query region KB (category + place + question hash) + media/Q cache
  2. If KB answers with enough confidence → write InvestigationUpdate; stop
  3. Else cheap Spot / HF / mid LLM + allowed browser research
  4. Merge new public lessons → KB (git commit)
  5. Only if still stuck → Bedrock / frontier escalate
  6. Distill escalate output → KB + cache
  7. Never escalate again for the same miss without a KB miss check
```

**Escalation is gated by KB miss**, not by model boredom.

---

## Source tiers (draft)

| Tier | Example | KB use |
|---|---|---|
| `identified_account` | Opt-in named / verified local account | Cite; higher trust weight |
| `merchant` | Business on MyProblem | Cite shop name when they publish |
| `bot_synthesis` | Multi-ticket pattern in-region | Mark as synthesis; lower weight until confirmed |
| `bot_research` | Browser/automation scrape of public pages | Cite URL + retrieval time; note robots/ToS posture |
| `rumor_attributed` | Community claim with named/reliable source | Allowed **only** with attribution + reliability flag |
| `anonymous_local` | Place-channel post without identity | Allowed on channel; weaker trust |
| `frontier_distill` | Redacted Bedrock/escalate residue | Cite as distilled; prefer confirm with cheaper path later |

Unattributed gossip from nowhere does **not** enter the public KB.

---

## Privacy default + voluntary projection

**Default:** anonymous and private. Investigations do not dox users into the KB.

**Opt-in projection:** people may **publish non-secret locality signals** so helpers and neighbors can find the right context — **without passwords or sensitive PII**:

| May publish (opt-in) | Must not require for basic help |
|---|---|
| Coarse geo (town, neighborhood, map pin band) | Full street address |
| **Any channel id** (Wi-Fi locality, Bluetooth dongle, house alias, …) | Passwords, pairing secrets, phone |
| Public ticket linked to one or more `channel_id`s | Private evidence blobs |

**Trust gradient:** the more non-sensitive locality and provenance you share, the more others (and the AI) can trust and help — still without forcing street address or phone number.

---

## Channels — anything with a unique id (Relay-aligned)

A **channel** is defined only by a **unique `channel_id`**. The physical or social thing behind it can be almost anything in-region:

| Example binding | Notes |
|---|---|
| House / venue alias | Human-readable place handle |
| Street / town | Broader local scope inside GA or Israel |
| Wi-Fi locality | Network place tag — **never** the password |
| **Bluetooth dongle / beacon** | Hardware presence; id is public, pairing secrets are not |
| Other beacons / QR / NFC place tags | Same rule: unique id, no secrets required to subscribe |

**Subscription rule:** tickets (and optional KB notes) **associated with a `channel_id` appear to anyone subscribed to that channel**. Unsubscribe → they leave that feed. Private tickets with no channel stay invisible to channel subscribers.

Helpers do not need passwords or pairing codes to follow a channel — only the public id + subscribe.

---

## Relationship to Projects and models

```
Ticket capture (realtime, private by default)
   → Project investigation (deferred, thorough)
   → Always: KB + cache lookup first
   → Research / VL / tools as needed (honest limits)
   → Outcomes on ticket timeline
   → Required when useful: region KB git create/update (redacted, categorized)
   → Rare: Bedrock escalate → then KB write
   → Optional post / link to channel_id(s)
```

| Layer | Role |
|---|---|
| **KB git Markdown** | Primary knowledge + research memory |
| **Ticket tip git** | Private dossier for one problem |
| **Batch / mid LLM** | Orchestrate tools, summarize, decide escalate vs stop |
| **Browser automation** | Fetch public facts where bots are allowed |
| **Bedrock / frontier** | Rare unique miss → distill into KB |
| **Server LLM weights** | Tweaked only for **vision/function** (capture quality, tool honesty, routing) — not for stuffing facts |

Realtime capture does not publish to the KB.

---

## Browser automation — honesty contract

| Do | Don’t |
|---|---|
| Automate public pages that allow bots / fair use research | Bypass CAPTCHAs, logins, or explicit bot bans |
| Prefer official municipal / merchant public info | Submit forms as if we were the user |
| Tell the user what the bot **could not see** | Pretend we filled a contact form or saw gated content |
| Store reusable “blocked here — human path” notes in KB | Retry forever against a wall |

User-facing copy should sound like: *“We checked public pages; the quote form requires a human; here’s what we found and what we couldn’t.”*

---

## Region lock

| Allowed | Forbidden (for now) |
|---|---|
| GA- and Israel-tied places, services, climate/ops, local rumor with local source | KB articles with no GA/Israel geographic hook |
| Expanding **depth** inside pilots | Pretending to be a global Wikipedia/ChatGPT |
| New **categories** when investigations need them | Orphan files with no hub / discovery link |

New regions later = **new KB partitions** (or repos), not one world graph.

---

## Product copy (canonical)

- We solve problems — especially with **local resources** search ads won’t fairly show you.  
- Shared knowledge = **git Markdown** for that purpose (+ DIY when place doesn’t matter).  
- **Disclaimer:** speculative; **user + AI investigations only**; **no boosting / paid ranking**.  
- **Do not cache the internet** — cite live pages; store useful, re-tested advice only.  
- **KB is how we learn** — check before escalate; write after research/Bedrock; refine or ditch; **don’t forget**.  
- Browser research only where bots are allowed; **honest** about forms and walls.  
- Private by default; redacted extracts in **reasonable categories**.  
- Channels = **unique ids**; subscribers see associated tickets.

---

## Implementation checklist (docs → code)

1. Stand up region KB git repo(s) with category tree + root `page.md` discovery (PT-style).  
2. Project worker: **KB search before** tools / Bedrock; **KB commit after** useful research or escalate.  
3. Browser tool: allowlist posture, robots/ToS awareness, honest `InvestigationUpdate` on blocks.  
4. Redaction pipeline before any Project → KB publish ([`pii-and-privacy.md`](./pii-and-privacy.md)).  
5. Region partition: `georgia` | `israel` (+ place geo in path or front matter in body).  
6. Channel ids as Markdown/metadata links — not a separate Neon graph as SoT.  
7. Trust UI: show source tier + automation limits the user.  
8. Never store Wi-Fi passwords, Bluetooth pairing secrets, or similar.  
9. Server LLM change policy: PRs must justify **function/vision** — knowledge belongs in KB PRs.

---

## Open questions

1. ~~One KB repo vs regional pair?~~ → **one repo** `myproblem-kb` with `georgia/` + `israel/` partitions (for now).  
2. Id formats per channel binding (hashed BSSID, BLE UUID, user alias) and collision policy?  
3. Moderation: who can flag bad rumors in-region?  
4. Merchant edits to KB pages about their own shop?  
5. Retention when a user deletes a ticket that already fed a KB doc?  
6. Discovery: how do nearby devices propose a `channel_id` without leaking secrets?  
7. Exact browser stack on Batch (Playwright class) and allowlist maintenance?
