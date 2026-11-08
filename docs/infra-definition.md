# Infrastructure definition (define only — not provisioned)

Companion to the multi-platform product plan. **No Spot pools or GPUs are stood up by this doc.**

## Architecture stance (locked)

1. **No on-demand frontier LLM or premium vision/gen as the product.**
2. **Smart-enough capture** → fill questions / requirements / **stills** (no video files) → **queue JIRA-like ticket by status**.
3. **Batch investigate** ASAP and completely — including **advanced photo analysis + generation** via HF/Spot — **region KB git + cache first**.
4. **Bedrock / frontier** = rare backbone escalate **after KB miss**; useful outputs **must** land in the KB ([`backbone-escalate.md`](./backbone-escalate.md) · [`knowledge-base.md`](./knowledge-base.md)).
5. **Anon tickets** by UUID capability; free recover email/register; **regional Relay git tip** SoT; **Bunny/S3-class** object store for audio+stills ([`anonymous-tickets.md`](./anonymous-tickets.md)).
6. **No Neon** for tips, job queues, or KB SoT — tips/jobs and public knowledge are **git**; waitlist signup may still use Neon.
7. **Vercel** = marketing site + APK download only; ticket HTTP/render on Intake `relay-gateway`.
8. **PII** never on server tips by default ([`pii-and-privacy.md`](./pii-and-privacy.md)).
9. **Browser research** only where bots are allowed; honest ticket feedback when forms/walls block automation.
10. **Server LLM** tweaked for vision/function only — knowledge compounds in Markdown KB, not weights.

## Free vs premium by workload physics

| Workload | Relative cost | Free path | Premium path |
|---|---|---|---|
| Realtime capture coach (ticket intake) | 1× | Spot CPU / mid API; capped | — |
| **Project batch investigation** (primary) | ~N × still + research | Spot GPU / off-peak batch — wait for capacity | **Faster queue / SLA** (not live Sonnet) |
| Still photo VL + OCR (coach) | ~5–20× | Spot GPU burst (e.g. Rackspace A30 SJC ~$0.15/hr) or cheap VL API | — |
| **Advanced photo analysis** (Project) | ~N × still | **HF open VL/OCR on Spot** (batch) | Faster queue |
| **Image / diagram generation** (Project) | per artifact | **HF / open gen on Spot** or cheap batch API; cache | Faster queue |
| Audio object storage | $/GB-mo | **Bunny** (prefer) or S3-compatible — infra budget | — |
| Rare backbone escalate (math / lang / hard VL) | varies | Inside Project; cache hits ≈ $0 | Priority may prefer Sonnet vs Haiku on escalate |
| Server video ingest / analysis | — | **Not offered** — stills only | — |

Premium exists because **sustained realtime frame analysis** and **queue latency** are expensive — not because investigation should be a live frontier chat. Deep research defaults to **deferred Projects** ([`projects.md`](./projects.md)).

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
- **Realtime = capture the ticket; Projects = investigate + cheap advanced photo work; KB = primary memory; Bedrock = rare escalate after KB miss.**
- Anon by default with clear loss warning; free recover email/register for durable access.
- Users get timeline updates (app ± email when identified), not instant deep answers or instant image gen.
- Tips stay PII-safe (city / safe radius — not street address).

## Client gate (proven offline in Test Mode)

See [`context-for-server.md`](context-for-server.md). Bad frames never leave the phone. No video file upload.

## Next ops (out of band)

1. **MVP standup plan:** [`spot-ai-mvp.md`](./spot-ai-mvp.md) — Intake gateway + Batch Spot + Relay flags.
2. **Projects** as primary server investigation: [`projects.md`](./projects.md).
3. **Anonymous tickets + regional git SoT:** [`anonymous-tickets.md`](./anonymous-tickets.md).
4. **PII conversion:** [`pii-and-privacy.md`](./pii-and-privacy.md).
5. **Backbone escalate** (Bedrock rare): [`backbone-escalate.md`](./backbone-escalate.md).
6. **Shared local knowledge base** (GA / Israel git Markdown, KB-first escalate): [`knowledge-base.md`](./knowledge-base.md).
