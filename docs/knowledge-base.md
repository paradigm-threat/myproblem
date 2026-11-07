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

Tickets may be:

- **Posted to** one or more channels → every subscriber of those ids sees them.  
- **Tagged** publicly to channels so helpers know the general identity (house / street / town / “that Bluetooth place”) — not anonymous internet.  
- **Kept fully private** (no `channel_id`).

Helpers do not need passwords or pairing codes to follow a channel — only the public id + subscribe. This matches the Relay vision: **local mesh identity and tips**, not a second Twitter.

---

## Relationship to Projects

```
Ticket capture (realtime, private by default)
   → Project investigation (deferred, thorough)
   → Outcomes on ticket timeline
   → Optional extract → region KB doc create/update (redacted)
   → Optional post / link to channel_id(s) (place, Wi-Fi, Bluetooth, …)
```

KB writes are **batch-friendly** (same worker pool as Projects). Realtime capture does not publish. Subscribers of those channels see associated tickets.

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
- Channels = **unique ids** (house, street, town, Wi-Fi, Bluetooth dongle, …); subscribers see associated tickets.  
- No passwords/pairing secrets required to subscribe — only the public id.  
- We win on **local realtime knowledge**, not global LLM breadth.

---

## Implementation checklist (docs → code)

1. Schema: `KbDocument`, `KbRevision`, `SourceCitation`, `Channel` (`channel_id` PK + optional binding type/metadata), `ChannelSubscription` (Neon); Blob for attachments.  
2. Redaction pipeline before any Project → KB publish.  
3. Region partition key: `georgia` | `israel` (+ place geo).  
4. APIs: create/resolve channel by id; subscribe/unsubscribe; list tickets for subscribed channels; ticket `channel_ids[]` optional.  
5. Trust UI: show source tier + how much locality the author projected.  
6. Never store Wi-Fi passwords, Bluetooth pairing secrets, or similar — channel ids are public identifiers only.

---

## Open questions

1. Id formats per binding (hashed BSSID, BLE UUID, user alias) and collision policy?  
2. Moderation: who can flag bad rumors in-region?  
3. Merchant edits to KB pages about their own shop?  
4. Retention when a user deletes a ticket that already fed a KB doc?  
5. Discovery: how do nearby devices propose a `channel_id` without leaking secrets?
