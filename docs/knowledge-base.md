# Shared local knowledge base

MyProblem grows a **region-scoped public knowledge base** from every investigation — not a global chatbot corpus.

Each Project (and resolved ticket) can **mint or update public documents**: common advice, verified local facts, and even rumors **when attributed to reliable / identified sources** — while **private ticket details stay private**.

Related: [`projects.md`](./projects.md) · [`infra-definition.md`](./infra-definition.md) · Relay vision in `clevertree-llc-plan/02-vision-product.md`.

---

## Why this exists

People lean on global AIs (ChatGPT, Grok, …) and national directories (Google, Yelp, …) that are weak on **what is true here, now**. MyProblem starts in **two pilots only — Georgia (USA) and Israel** — and builds knowledge that **must attach to a local geographic point** in those regions.

| Global AI / directory | MyProblem local KB |
|---|---|
| World-scale training cutoffs | Continuously updated from live investigations |
| Generic “near me” scrape | Place-linked docs for GA / Israel only |
| Compete on everywhere | **Outcompete on local, real-time, Relay-connected knowledge** |
| Opaque provenance | Source tiers: identified accounts, merchants, bot synthesis |

**Growth rule:** do not scale by absorbing unrelated world knowledge. Scale by deepening **place-tied** coverage. Anything in the KB must **in some way relate to a local geographic point** in Georgia or Israel (a town, street, venue, Wi-Fi channel, service area, etc.). Broader topics are fine **only** when grounded that way (e.g. “how freeze warnings affect Atlanta plumbing,” not generic global freeze theory with no local hook).

---

## What the AI publishes

After (and during) Projects, the investigation worker may:

1. **Create** a public KB document (how-to, FAQ, local service note, rumor log with attribution).  
2. **Maintain** it — merge new tickets’ *public* lessons; bump confidence; retire stale claims.  
3. **Redact** — never copy private photos, phone numbers, exact personal addresses, account secrets, or identifiable minors into the public KB.  
4. **Cite** — advice and rumors require a **source tier** (see below).

Private ticket timeline remains the source of truth for the person and any merchants on that tip. The KB is the **shared layer**.

### Source tiers (draft)

| Tier | Example | KB use |
|---|---|---|
| `identified_account` | Opt-in named / verified local account | Cite; higher trust weight |
| `merchant` | Business on MyProblem | Cite shop name when they publish |
| `bot_synthesis` | Multi-ticket pattern in-region | Mark as synthesis; lower weight until confirmed |
| `rumor_attributed` | Community claim with named/reliable source | Allowed **only** with attribution + reliability flag |
| `anonymous_local` | Place-channel post without identity | Allowed on channel; weaker trust |

Unattributed gossip from nowhere does **not** enter the public KB.

---

## Privacy default + voluntary projection

**Default:** anonymous and private. Investigations do not dox users into the KB.

**Opt-in projection:** people may **publish non-secret locality signals** so helpers and neighbors can find the right context — **without passwords or sensitive PII**:

| May publish (opt-in) | Must not require for basic help |
|---|---|
| Coarse geo (town, neighborhood, map pin band) | Full street address |
| **Wi-Fi channel / BSSID-style locality tag** (public “I’m on this network place”) | Wi-Fi password |
| House / building **channel** handle (alias for “this place”) | Legal name, phone |
| Public ticket linked to a channel | Private evidence blobs |

**Trust gradient:** the more non-sensitive locality and provenance you share, the more others (and the AI) can trust and help — still without forcing street address or phone number.

---

## Channels — place-linked presence (Relay-aligned)

Channels are **local gathering points** for tickets and knowledge — not global anonymous forums.

| Channel type | Purpose |
|---|---|
| **House / place channel** | People find each other around a home or venue alias |
| **Street / town channel** | Broader local scope inside GA or IL region |
| **Wi-Fi locality channel** | “Same place network” without sharing the password |
| **Public channel feed** | Tickets or KB notes posted **associated with** that place |

Tickets may be:

- Posted **to** an address- or Wi-Fi-linked channel (helpers see house / street / town grain — not “random internet”).  
- Posted **publicly** but **tagged** to those channels so investigators know the general identity of the place.  
- Kept fully private (no channel).

This matches the Relay vision: **local mesh identity and tips**, not a second Twitter.

---

## Relationship to Projects

```
Ticket capture (realtime, private by default)
   → Project investigation (deferred, thorough)
   → Outcomes on ticket timeline
   → Optional extract → region KB doc create/update (redacted)
   → Optional post / link to place or Wi-Fi channel
```

KB writes are **batch-friendly** (same worker pool as Projects). Realtime capture does not publish.

---

## Region lock

| Allowed | Forbidden (for now) |
|---|---|
| GA- and Israel-tied places, services, climate/ops, local rumor with local source | KB articles with no GA/Israel geographic hook |
| Expanding **depth** inside pilots | Pretending to be a global Wikipedia/ChatGPT |

New regions later = **new KB partitions**, not one world graph.

---

## Product copy (canonical)

- Shared knowledge = **local, place-tied, continuously maintained** from investigations.  
- Private by default; public docs are redacted extracts.  
- Rumors OK only with **reliable / identified** attribution.  
- Channels (house, street, town, Wi-Fi locality) let people and tickets meet **locally** without passwords or forced PII.  
- We win on **local realtime knowledge**, not global LLM breadth.

---

## Implementation checklist (docs → code)

1. Schema: `KbDocument`, `KbRevision`, `SourceCitation`, `Channel`, `ChannelMembership` (Neon); Blob for attachments.  
2. Redaction pipeline before any Project → KB publish.  
3. Region partition key: `georgia` | `israel` (+ place geo).  
4. Channel post APIs; ticket `channel_ids` optional.  
5. Trust UI: show source tier + how much locality the author projected.  
6. Never store Wi-Fi passwords; locality tags are public identifiers only.

---

## Open questions

1. Exact Wi-Fi locality identifier (hashed BSSID vs user-named place network)?  
2. Moderation: who can flag bad rumors in-region?  
3. Merchant edits to KB pages about their own shop?  
4. Retention when a user deletes a ticket that already fed a KB doc?
