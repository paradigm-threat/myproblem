# Infrastructure definition (define only — not provisioned)

Companion to the multi-platform product plan. **No batch GPU fleet is stood up by this doc.**

## Architecture stance (locked)

1. **No on-demand frontier LLM as the product.**
2. **Smart-enough capture** → fill questions / requirements / **stills** (no **realtime** video upload) → **queue JIRA-like ticket by status**. Deferred video is batch-only ([`ephemeral-media.md`](./ephemeral-media.md)).
3. **Batch investigate** ASAP via **API providers** (Groq / Bedrock / peers) for ASR, VL, video, and think — **region KB git + tip context first** ([`providers-ai.md`](./providers-ai.md)).
4. **Stronger models** = escalate **after KB miss**; useful outputs **must** land in the KB ([`backbone-escalate.md`](./backbone-escalate.md) · [`knowledge-base.md`](./knowledge-base.md)).
5. **Anon tickets** by UUID capability; free recover email/register; **regional Relay git tip** SoT; **Bunny/S3-class** object store for audio+stills ([`anonymous-tickets.md`](./anonymous-tickets.md)).
6. **No Neon** for tips, job queues, or KB SoT — tips/jobs and public knowledge are **git**; waitlist signup may still use Neon.
7. **Vercel** = marketing site + APK download only; ticket HTTP/render on Intake `relay-gateway`.
8. **PII** never on server tips by default ([`pii-and-privacy.md`](./pii-and-privacy.md)).
9. **Browser research** only where bots are allowed; honest ticket feedback when forms/walls block automation.
10. **Context + KB**, not custom training for MVP; switch models when underperforming; **publicize $/request**.
11. **No Spot A30 / HF-on-GPU product path** — abandoned ([`abandoned/spot-ai-mvp.md`](./abandoned/spot-ai-mvp.md)).

## Free vs premium by workload physics

| Workload | Relative cost | Free path | Premium path |
|---|---|---|---|
| Realtime capture coach (ticket intake) | 1× | Spot **CPU** / mid API; capped | — |
| **Project batch investigation** (primary) | ~N × still + research | Metered providers — wait for budget/capacity | **Faster queue / SLA** (not live Sonnet for everything) |
| Still photo VL + OCR | ~5–20× | Cheap provider VL | Stronger VL |
| **Advanced photo / video** (Project) | ~N × media | Provider VL / video APIs; cache | Faster queue / stronger model |
| **Image / diagram generation** (Project) | per artifact | Cheap batch image API; cache | Faster queue |
| Audio object storage | $/GB-mo | **Bunny** (prefer) or S3-compatible — infra budget | — |
| ASR | per clip | Groq Whisper-class from batch | — |
| Stronger escalate (math / lang / hard VL) | varies | Inside Project; cache hits ≈ $0 | Priority may prefer Sonnet vs Haiku |
| Server video ingest / analysis | — | **Not on realtime API**; deferred inbox → provider | — |

Premium exists because **queue latency** and **provider spend** are real — not because investigation should be a live frontier chat. Deep research defaults to **deferred Projects** ([`projects.md`](./projects.md)). Tips/donations cover **servers + metered AI**.

## Storage split

| Store | Role |
|---|---|
| Regional Relay git tip (`myproblem-tickets-georgia` / `-israel`) | Problem dossier SoT (`ticket_uuid`); job lease files |
| Region KB git (Markdown categories) | Primary shared knowledge / research memory ([`knowledge-base.md`](./knowledge-base.md)) |
| Object store (Bunny prefer) | Audio + still blobs; tip holds URI + hash |
| Client PII vault | Names/addresses/phones — on-device; share on request |
| Master integrity backup | Offline longer git history — anti-fraud only |

## Free AI contract

- Chatable, human, **problem-focused** (investigate, measure, rule out assumptions, accurate stills).
- **Not** a general on-demand LLM competitor.
- **Realtime = capture the ticket; Projects = investigate via providers; KB = primary memory; stronger API = escalate after KB miss.**
- Anon by default with clear loss warning; free recover email/register for durable access.
- Users get timeline updates (app ± email when identified), not instant deep answers — and may see **what the request cost**.
- Tips stay PII-safe (city / safe radius — not street address).

## Client gate (proven offline in Test Mode)

See [`context-for-server.md`](context-for-server.md). Bad frames never leave the phone on the realtime path. No **realtime** video file upload; deferred video → Batch + providers ([`ephemeral-media.md`](./ephemeral-media.md)).

## Next ops (out of band)

1. **Providers AI plan:** [`providers-ai.md`](./providers-ai.md) — Intake + batch SI + Groq/Bedrock/peers + cost logs.
2. **Projects** as primary server investigation: [`projects.md`](./projects.md).
3. **Anonymous tickets + regional git SoT:** [`anonymous-tickets.md`](./anonymous-tickets.md).
4. **PII conversion:** [`pii-and-privacy.md`](./pii-and-privacy.md).
5. **Escalate + cost:** [`backbone-escalate.md`](./backbone-escalate.md).
6. **Shared local knowledge base** (GA / Israel git Markdown, KB-first escalate): [`knowledge-base.md`](./knowledge-base.md).
