# Clevertree Chat — main communication on tickets

**Plan (locked direction):** [Clevertree Chat](https://clevertree.chat) is MyProblem’s **main mode of communication and collaborative problem-solving** around a ticket. It is not a side widget for marketing only, and it is not a realtime frontier chatbot that replaces Projects.

People (and later merchants / helpers) **comment on the problem**. Those threads are organized by the **same AI batch system** that already runs ASR, vision, and Project investigation. Reusable lessons flow into the **knowledge base** automatically. Product site: [clevertree.chat](https://clevertree.chat). Add-on source: sibling repo `clevertree-chat` (`/home/ari/dev/clevertree-chat`).

Related: [`projects.md`](./projects.md) · [`knowledge-base.md`](./knowledge-base.md) · [`batched-agent-work.md`](./batched-agent-work.md) · [`intake-batch-infra.md`](./intake-batch-infra.md) · [`anonymous-tickets.md`](./anonymous-tickets.md) · [`pii-and-privacy.md`](./pii-and-privacy.md) · [`topical-repos.md`](./topical-repos.md) · clevertree-chat [`url-pages-and-associations.md`](../../clevertree-chat/docs/url-pages-and-associations.md) · [`person-space.md`](../../clevertree-chat/docs/person-space.md).

---

## One-sentence rule

> **Every ticket is wired to Clevertree Chat. Comments live on the home topical ticket repo’s `comments` branch. The Batch worker drains comment jobs with the same AI batch posture as Projects, then organizes reusable knowledge into associated KBs.**

---

## What this is (and is not)

| Is | Is not |
|---|---|
| Standing debate / comment system on a ticket (and on public pages) | A ChatGPT-style live “solve everything now” product |
| Human posts + AI organization of arguments and positions | A second comment implementation inside myproblem.app |
| Same Intake + Batch infra family as tickets | A separate GPU fleet or Neon chat SoT |
| Feed for KB learning after redaction | Unfiltered dump of private tip evidence into public articles |

**“Problems, not chatbots”** still holds for investigation economics: capture builds the ticket; **Projects** investigate thoroughly in batch. Clevertree Chat is how people **talk about** the problem and build a reusable argument/knowledge trail — the deep pass still waits for Batch.

---

## Where it mounts

| Surface | Role |
|---|---|
| **Every ticket** | Primary communication: people add posts; AI batch organizes positions; progress stays one place with the dossier |
| Knowledge-base reader articles | Article stays the KB page; debate hangs off it |
| Marketing / public myproblem.app pages that make a claim | Optional standing debate |
| Published handoff posts | Redacted public file; debate allowed on that public object |

Loading a page or tip does **not** invent a topic. A topic exists when a person submits the **first words** (Clevertree Chat rule).

---

## Home repo, `comments` branch

Ticket dossiers and comment threads share the **home topical ticket git app** — they do **not** fork into a second product SoT. Home is AI-routed among progressive topical remotes ([`topical-repos.md`](./topical-repos.md)).

| Branch | Holds |
|---|---|
| **Default tip branch** (dossier SoT) | `tickets/<uuid>/tip.json`, `index.md`, Evidence links, `associations[]`, Project/ASR/vision **job files** ([`anonymous-tickets.md`](./anonymous-tickets.md)) |
| **`comments` branch** | Clevertree Chat topic trees for those tickets (and other mounted pages): posts, category keys, curator rewrites, **comment job files** |

Rules:

1. **Home repo only** for the tip + comment drain (georgia/israel today; craft topics + `unorganized` when minted). Associated topics get thin tip pointers, not a second debate tree.  
2. **Do not** merge comment bodies into `tip.json` as the debate SoT. Tip = dossier; `comments` = debate.  
3. Workers that curate chat **check out home `comments` only** for that drain (same discipline as clevertree-chat infra).  
4. Wire key: ticket mount uses a stable topic key derived from the ticket (opaque id / path). Public pages keep their own topic keys.  
5. KB article debates may use that KB remote’s `comments` branch the same way.

The clevertree-chat **product** hosts guided demos on **Intake** (`https://intake.myproblem.app/chat/…`): containable UI + `/api/chat` + WebSocket fan-out (`clevertree-chat` → `scripts/chat_host.py`). Peer speakers are server-injected; Vercel (`clevertree.chat`) is marketing links only. MyProblem production threads for tickets live on the **home ticket repo’s `comments` branch**.

**Any public URL** can mount the same debate (browser extension planned next). Batch associates mirrors and related pages under a canonical page id, and may classify a home as **topic** or **person** ([`url-pages-and-associations.md`](../../clevertree-chat/docs/url-pages-and-associations.md)). A **person** home is that person’s house for `rules.md` / `policy.md` once claim exists; claim is deferred ([`person-space.md`](../../clevertree-chat/docs/person-space.md)). Ticket homes on topical remotes are unchanged.

---

## Same AI batch

```
Person posts on ticket (live path — thin)
   │  file post + optional starting category suggestion
   │  enqueue comment job on `comments` branch
   ▼
Batch (same Spot / drain family as ASR · vision · Project)
   · Organize arguments / positions (Clevertree Chat curator rules)
   · Spill new keys only when posts do not fit existing ones
   · Rewrite / summarize sections without erasing distinct positions
   · When shareable: redact → commit reusable lessons into **associated** KB remotes
   · Optional: InvestigationUpdate on the tip timeline (“debate advanced”)
   ▼
Hardware tear-down when comment + ticket GPU bins are empty
```

| Job family | Branch | Who |
|---|---|---|
| `asr` / `vision` / `project` / `intake` | Home tip / default | Intake + Batch ([`intake-batch-infra.md`](./intake-batch-infra.md)) |
| Comment / debate curator jobs | Home **`comments`** | **Same Batch** workers (shared AI batch system) |

No separate “chat AI product.” Comment threads are another bin the batch already knows how to wake, drain, and shut down.

---

## Knowledge base loop

Comments are a **first-class learning input**, not throwaway chat:

1. People write original posts on the ticket debate (Clevertree Chat: posts are arguments, not nested reply trees).  
2. Batch organizes them into addressable positions.  
3. When a position is **useful and shareable**, the same learning rules as Projects apply ([`knowledge-base.md`](./knowledge-base.md)): redact PII, place in category hubs on **matching associated KBs**, cite source tier (`anonymous_local` / `bot_synthesis` / etc.), **no boosting**.  
4. Later tickets hit those KBs **before** expensive research — including lessons that started as ticket comments.

Private tip evidence and raw comment PII never jump straight into public KB articles.

---

## Privacy

- Tip SoT PII rules still apply ([`pii-and-privacy.md`](./pii-and-privacy.md)).  
- Comment posts on `comments` are treated as **user-authored text**: convert/redact before any KB publish; do not put street addresses, phones, or emails into curated public summaries.  
- Capability access: knowing the ticket UUID still gates the private ticket mount; public page debates stay public.

---

## Product copy (canonical)

- Clevertree Chat is how we **communicate on Problems** — wired to every ticket.  
- Comments build a **knowledge trail**; Batch **organizes** it and feeds **associated KBs**.  
- **Home** topical ticket repo, separate **`comments` branch**; same **AI batch** as Projects ([`topical-repos.md`](./topical-repos.md)).  
- Still **not** a realtime frontier chatbot: live = post; deep = batch.

---

## Implementation checklist (docs → code)

1. Mount Clevertree Chat on ticket UI (Intake/APK/web tip view) with topic key ↔ `ticket_uuid`.  
2. Ensure **home** topical ticket repos have a published **`comments` branch** layout compatible with clevertree-chat.  
3. Enqueue comment jobs on submit; Batch drains home `comments` with existing wake/decommission scripts (or shared wake that covers both tip + comments bins).  
4. After useful curation: redacted writes to **associated** KBs ([`knowledge-base.md`](./knowledge-base.md)).  
5. Keep tip dossier and debate storage separate (branch split).  
6. Align marketing: communication = Clevertree Chat; investigation = Project batch.  
7. Update embed/snippet from `clevertree-chat` rather than inventing a second comment stack.  
8. Follow progressive topical home routing ([`topical-repos.md`](./topical-repos.md)).
