# Infrastructure definition (define only — not provisioned)

Companion to the multi-platform product plan. **No Spot pools or GPUs are stood up by this doc.**

## Free vs premium by workload physics

| Workload | Relative cost | Free path | Premium path |
|---|---|---|---|
| Problem chat (compiled brief) | 1× | Spot CPU / mid API | — |
| Still photo VL + OCR | ~5–20× | Spot GPU burst (e.g. Rackspace A30 SJC ~$0.15/hr) or cheap VL API | Rare frontier escalate |
| Investigative multi-still | ~N × still | Free with caps | — |
| Realtime gated video to server | ~50–500×+ | Only when Spot spare + honest busy UI | Reliable / reserved GPU |

Premium exists because **sustained frame analysis** is expensive — not because chat should be paywalled.

## Free AI contract

- Chatable, human, **problem-focused** (investigate, measure, rule out assumptions, accurate stills).
- **Not** a general LLM competitor; slim tools/libs for Spot latency.
- Clear UX + system prompt: MyProblem investigates Problems.

## Client gate (proven offline in Test Mode)

See [`context-for-server.md`](context-for-server.md). Bad frames never leave the phone.

## Next ops (out of band)

1. **MVP standup plan:** [`spot-ai-mvp.md`](./spot-ai-mvp.md) — one SJC A30 Spot + Vercel proxy + Relay `relay.ai.*` flags.
2. Spot Phase 0.5 benches ([`clevertree-llc-plan/09-rackspace-spot-vision-prototype.md`](../../relay/clevertree-llc-plan/09-rackspace-spot-vision-prototype.md)).
3. Cost oracle → transparent priority fees.
4. Wire SEND-frame upload only after gate metrics look good.
