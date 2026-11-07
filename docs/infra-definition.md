# Infrastructure definition (define only — not provisioned)

Companion to the multi-platform product plan. **No Spot pools or GPUs are stood up by this doc.**

## Free vs premium by workload physics

| Workload | Relative cost | Free path | Premium path |
|---|---|---|---|
| Realtime capture coach (ticket intake) | 1× | Spot CPU / mid API; capped | — |
| **Project batch investigation** (primary) | ~N × still + research | Spot GPU / off-peak batch queue — wait for capacity | Priority queue / faster SLA |
| Still photo VL + OCR (coach) | ~5–20× | Spot GPU burst (e.g. Rackspace A30 SJC ~$0.15/hr) or cheap VL API | Rare frontier **inside Project**, not live |
| Investigative multi-still | ~N × still | Free via **Projects** with caps | — |
| Realtime gated video to server | ~50–500×+ | Only when Spot spare + honest busy UI | Reliable / reserved GPU |

Premium exists because **sustained realtime frame analysis** is expensive — not because investigation should be paywalled. Deep research defaults to **deferred Projects** ([`projects.md`](./projects.md)): batching beats fake realtime at best quality.

## Free AI contract

- Chatable, human, **problem-focused** (investigate, measure, rule out assumptions, accurate stills).
- **Not** a general LLM competitor; slim tools/libs for Spot latency.
- Clear UX + system prompt: MyProblem investigates Problems.
- **Realtime = capture the ticket; Projects = investigate it.** Users get timeline updates (app ± email), not a promise of instant deep answers.

## Client gate (proven offline in Test Mode)

See [`context-for-server.md`](context-for-server.md). Bad frames never leave the phone.

## Next ops (out of band)

1. **MVP standup plan:** [`spot-ai-mvp.md`](./spot-ai-mvp.md) — one SJC A30 Spot + Vercel proxy + Relay `relay.ai.*` flags.
2. **Projects** as primary server investigation: [`projects.md`](./projects.md).
3. Spot Phase 0.5 benches ([`clevertree-llc-plan/09-rackspace-spot-vision-prototype.md`](../../relay/clevertree-llc-plan/09-rackspace-spot-vision-prototype.md)).
4. Cost oracle → transparent priority fees (faster Project SLA, not shop invoices).
5. Wire SEND-frame upload only after gate metrics look good.
