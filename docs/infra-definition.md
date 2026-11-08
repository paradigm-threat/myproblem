# Infrastructure definition (define only — not provisioned)

Companion to the multi-platform product plan. **No Spot pools or GPUs are stood up by this doc.**

## Architecture stance (locked)

1. **No on-demand frontier LLM or premium vision/gen as the product.**  
2. **Smart-enough capture** → fill questions / requirements / **stills** (no video files) → **queue JIRA-like ticket by status**.  
3. **Batch investigate** ASAP and completely — including **advanced photo analysis + generation** via HF/Spot — cache/KB first.  
4. **Bedrock / frontier** = rare backbone escalate inside the batch worker ([`backbone-escalate.md`](./backbone-escalate.md)).  
5. **Anon tickets** by server UUID; free recover email/register; **Relay tip** dossier SoT; **Bunny/S3-class** object store for audio+stills ([`anonymous-tickets.md`](./anonymous-tickets.md)).

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
| Relay tip | Problem dossier SoT (`ticket_uuid`) |
| Thin queue index (Neon/Redis) | Job leases only |
| Object store (Bunny prefer) | Audio + still blobs; tip holds URI + hash |

## Free AI contract

- Chatable, human, **problem-focused** (investigate, measure, rule out assumptions, accurate stills).
- **Not** a general on-demand LLM competitor.
- **Realtime = capture the ticket; Projects = investigate + cheap advanced photo work; Bedrock = rare escalate.**
- Anon by default with clear loss warning; free recover email/register for durable access.
- Users get timeline updates (app ± email when identified), not instant deep answers or instant image gen.

## Client gate (proven offline in Test Mode)

See [`context-for-server.md`](context-for-server.md). Bad frames never leave the phone. No video file upload.

## Next ops (out of band)

1. **MVP standup plan:** [`spot-ai-mvp.md`](./spot-ai-mvp.md) — one SJC A30 Spot + Vercel proxy + Relay `relay.ai.*` flags.
2. **Projects** as primary server investigation: [`projects.md`](./projects.md).
3. **Anonymous tickets + Relay tip SoT:** [`anonymous-tickets.md`](./anonymous-tickets.md).
4. **Backbone escalate** (Bedrock rare): [`backbone-escalate.md`](./backbone-escalate.md).
5. **Shared local knowledge base** (GA / Israel place-tied): [`knowledge-base.md`](./knowledge-base.md).
6. Spot Phase 0.5 benches ([`clevertree-llc-plan/09-rackspace-spot-vision-prototype.md`](../../relay/clevertree-llc-plan/09-rackspace-spot-vision-prototype.md)).
7. Cost oracle → transparent priority fees (faster Project SLA, not shop invoices); track object-storage $/GB.
8. Wire SEND-frame upload only after gate metrics look good.
