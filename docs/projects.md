# Projects — deferred server investigation (primary path)

**Projects** are MyProblem’s primary heavy investigation mode: **deferred, batched, server-side research** on a ticket after the client has captured enough context—not a real-time “solve it while you wait” LLM session.

**We do not need an on-demand frontier LLM or on-demand premium vision.** We need a **smart-enough** model to capture the question, requirements, and photos; **queue a JIRA-like ticket by status**; then **batch-investigate ASAP and as completely as possible** — including **advanced photo analysis and generation** at minimal cost (Hugging Face / Spot first) — without waste or redundant calls. Bedrock / other frontier APIs are a **rare backbone escalate** inside that batch worker — see [`backbone-escalate.md`](./backbone-escalate.md).

Realtime AI in the app exists only to **build the ticket**. Full investigation quality runs later, when Spot / batch capacity (and optional internet / multi-LLM queries) are cheap and available.

**Product promise:** the AI **does not cut corners** to look instant. It takes the time resources allow to investigate thoroughly. Waiting for capacity is an honest UX; silently downgrading free-tier depth is not.

Related: [`backbone-escalate.md`](./backbone-escalate.md) · [`context-for-server.md`](./context-for-server.md) · [`spot-ai-mvp.md`](./spot-ai-mvp.md) · [`infra-definition.md`](./infra-definition.md) · [`knowledge-base.md`](./knowledge-base.md).

---

## One-sentence rule

> **Capture smart in real time; queue the ticket; batch-investigate thoroughly — escalate to Bedrock only when the cheap path truly cannot.**

Service-provider handoff remains **always available**. Deferred investigation is the default *quality* path when the client and server agree: *we do not have a solution yet, but more AI research could help—and we are not ready (or not required) to submit to a merchant.*

---

## What is a Project?

| Term | Meaning |
|---|---|
| **Problem / ticket** | The durable record (photos, facts, stops, attempts, status). Same as today. |
| **Project** | A deferred investigation job (or job series) attached to that ticket: queue → batch worker → research → status updates → optional close or escalate. |
| **Realtime capture session** | Thin on-device + light server coach: gate frames, ask for missing angles/labels, fill required fields. **Not** deep research. |

A Project looks like a **JIRA-style work item** for investigation: uninvestigated tickets sit in a queue; workers (bots, later humans, later merchants) advance them; the end user gets a **single timeline** of updates.

---

## When a Project starts

Client + capture coach reach a natural fork:

1. **Enough evidence is on the ticket** (stills, OCR snippets, answers, constraints), **and**
2. **No confident self-serve solution yet**, **and**
3. User chooses (or defaults to) **“keep investigating”** rather than immediate merchant submit.

Then the app **packages the ticket** and enqueues a Project instead of burning premium GPU/LLM for an instant deep answer.

User can still:

- Wait for deferred results (default / cheapest quality path).
- Submit to a local service provider anytime (pilot regions).
- Close / abandon the ticket.
- Add more evidence later (re-opens or extends the Project).

---

## Realtime vs deferred — split of AI load

| Layer | Latency expectation | AI job | Cost posture |
|---|---|---|---|
| **On-device gate** | Frame-time | Drop shake/blur/dupe; never upload junk | Free / local |
| **Realtime capture coach** | Seconds | “Turn left,” “read the label,” “what have you tried?” — **ticket intake only** | Cheap / free pool; capped |
| **Project investigation (primary)** | Minutes → hours (honest ETA) | Deep VL (HF/Spot), optional image gen, multi-step LLM, web tools, dossier compile, rare Bedrock escalate | **Batch / Spot / off-peak** — much cheaper than on-demand premium |
| **Merchant / human update** | Async | Accept, decline, ask for more info, schedule | Businesses free; timeline still on ticket |

**Do not** design the product around realtime “frontier investigation while the user stares at a spinner.” That path is optional premium later if ever; it is **not** the default.

### Realtime must stay thin

Allowed in the live session:

- Capture coaching + `capture_request`
- Clarifying questions that fill ticket fields
- Soft local hints (“might be X — we’ll dig deeper offline”)
- Packaging / enqueue confirmation + ETA band (“usually within N hours when capacity frees”)

Not in the live session (default):

- Long multi-hop research across the public web
- Multi-model consensus / expensive frontier calls
- Exhaustive parts lookup, manual-style repair trees, legal/medical rabbit holes
- “Fully solved” dossiers that require batch GPU

Those belong on the **Project worker**.

---

## Server primary path (batch investigator)

```
Realtime capture (smart-enough, thin)
   │  questions + requirements + photos + ContextPacket
   ▼
Ticket packaged  →  status queued like JIRA
   │
   ▼
Project queue  (by status / priority — drain ASAP)
   │
   ▼
Batch workers (complete + non-redundant)
   · Cache / local KB first (skip duplicate work)
   · Spot + HF: OCR, advanced photo analysis, optional diagram/gen
   · Mid LLM + tools / web as needed
   · Rare: Bedrock / frontier backbone escalate → cache gold
   · Write InvestigationUpdate + media Evidence on the ticket
   ▼
Outcomes
   · Solved / DIY steps → user notified
   · Need more evidence → capture_request push back to app
   · Ready for merchant → optional submit CTA
   · Closed / redirected (emergency, licensed care, out of scope)
```

**Primary means of investigation on the server = this queue + batch path**, not on-demand chat completion for every ticket.

Spot / Relay flags ([`spot-ai-mvp.md`](./spot-ai-mvp.md)):

- `relay.ai.vision` light → **realtime capture** only; deep VL → **Project batch**  
- `relay.ai.imggen` → **batch** photo/diagram generation (HF/Spot)  
- ASR archive, multi-step research → **Project batch** (`free_pool`; busy → wait)  
- `relay.ai.frontier` → **rare escalate inside Project** ([`backbone-escalate.md`](./backbone-escalate.md)) — never live session

---

## Updates: one-stop shop

Every Project (and later merchant/human) action appends to the **same ticket timeline**. Channels:

| Channel | Use |
|---|---|
| **In-app timeline** | Source of truth — bot notes, human notes, merchant replies, evidence requests |
| **Email (optional)** | Digests / milestones when user opted in |
| **Push (later)** | “Investigation advanced,” “needs another photo,” “merchant responded” |

Actors that may write updates:

- Investigation bot (batch worker)
- Assigned humans (ops / specialists — future)
- Service providers (after submit)
- The end user (more photos, answers)

UX promise: **one place** for investigative progress and handoff status—not a separate “chat app” plus a separate “job board.”

---

## Economics (why defer)

| Approach | Quality | Cost |
|---|---|---|
| On-demand frontier for every hard Q | Looks “smart” | Wasteful; redundant; fights free forever |
| **Deferred batch Project + rare Bedrock** | Thorough ASAP; cache/KB dedupe | Spot + pennies per unique escalate |
| Immediate merchant submit | No AI depth | Always allowed; businesses still $0 |

Free-tier honesty: “We’re researching this; you’ll get updates when capacity runs” beats silent downgrade or surprise bills. Priority shortens the **queue**, it does not buy live Sonnet.

---

## Status sketch (ticket + Project)

Draft enums (to freeze in OpenAPI later):

**Ticket**

- `draft` — capture in progress  
- `packaged` — enough to investigate or submit  
- `project_queued` / `project_running` / `project_waiting_user`  
- `recommended_diy` / `recommended_merchant` / `submitted` / `closed`  

**Project job**

- `queued` → `running` → `waiting_evidence` | `waiting_capacity` → `completed` | `cancelled`

Each job run emits `InvestigationUpdate { at, actor, kind, summary, evidence_refs? }`.

---

## Product copy (canonical)

- Real-time = **intake** (camera + questions).  
- Investigation = **Project** (deferred server research).  
- Merchants = optional anytime; Project can recommend submit when ready.  
- Updates = app timeline (+ email if enabled).  
- Public lessons → **region knowledge base** (redacted); optional place / Wi-Fi **channels** ([`knowledge-base.md`](./knowledge-base.md)).

Landing / PDF should not promise “instant deep AI answers.” Prefer: *capture now, investigate when capacity allows, get notified.* Local KB: *we know Georgia and Israel places — not the whole internet.*

---

## Implementation checklist (docs → code)

1. Schema: Problem ticket + Project job + InvestigationUpdate (Neon).  
2. Queue: batch worker hook (Spot / cron on Vercel → worker).  
3. Realtime API stays coach-only; enqueue endpoint `POST /api/projects` (or Problem `start_project`).  
4. Notify: app poll/SSE first; email later.  
5. Always expose **Submit to provider** beside **Start Project**.  
6. After Project: optional redacted publish to region KB + channel tags ([`knowledge-base.md`](./knowledge-base.md)).  
7. Backbone escalate path + answer cache ([`backbone-escalate.md`](./backbone-escalate.md)).  
8. Bench: $/ticket deferred vs fake-realtime; escalate rate + cache hit rate in `clevertree-llc-plan/bench/`.

---

## Open questions

1. Default after packaging: auto-start Project vs explicit user tap?  
2. Max deferred SLA for free vs priority (hours vs same-day)?  
3. How many re-open cycles when bot asks for more photos?  
4. Anonymous tickets: Project updates only in-app session vs require email/account for async notify?
