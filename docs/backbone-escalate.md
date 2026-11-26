# Providers, escalate, and cost — cheap first, switch when stuck

**Stance:** MyProblem does **not** need on-demand frontier chat as the product. Smart-enough capture fills the ticket; a **JIRA-style queue** batch-investigates ASAP. All AI (text, ASR, stills, video) uses **metered providers** — Groq, Bedrock, and peers — with **KB + tip context** assembled into each call. **No batch GPU fleet.** See [`providers-ai.md`](./providers-ai.md).

| Capability | Default path | Escalate / switch |
|---|---|---|
| Text / math / language | Cheap Groq / Bedrock Haiku-class + KB context | Stronger Bedrock / peer models |
| Photo / still analysis | Provider VL APIs | Higher-tier VL or multi-frame package |
| Video understanding | Provider video APIs (or frames → VL) | Stronger native video model |
| ASR | Groq Whisper (or peer) from batch only | Re-transcribe with richer hotwords |
| Image generation | Cheap batch image API if needed | Frontier image API only if open path fails |

Escalate paths and preferred **model ids** live in the **public KB** as recipes; batch (Cursor Phase 1 / automated Phase 2) runs them after KB miss ([`batch-phases.md`](./batch-phases.md)).

Related: [`projects.md`](./projects.md) · [`infra-definition.md`](./infra-definition.md) · [`knowledge-base.md`](./knowledge-base.md) · [`providers-ai.md`](./providers-ai.md) · plan [`08`](../../relay/clevertree-llc-plan/08-realtime-vision-infra-cost.md).

---

## What we optimize for

| Do | Don’t |
|---|---|
| Capture questions, requirements, photos → package ticket | Stream every frame to Sonnet |
| Queue by status (`packaged` → `project_queued` → …) | Fake “instant deep answer” spinners |
| **Check region KB git first**; research/escalate only on miss | Treat the server LLM as the knowledge store |
| Call providers with assembled context; **log $/request** | Repeat the same VL call for the same evidence hash |
| Escalate **once**, then **write KB Markdown** + cache | On-demand frontier as the product; escalate with no KB write |
| Switch model when eval shows underperformance | Fine-tune before Phase 2 |
| Browser research only where bots are allowed; honest walls | Pretend we saw gated forms / bypass bans |

**On-demand premium media ≠ product path.** Priority buys a **faster Project queue / SLA**, not live Claude vision for every frame.

The live session’s own brain is the confidence gauge ([`confidence-gauge.md`](./confidence-gauge.md)): gather the problem, ask until it is specific, and stop advising when a next step would be a guess or a hazard. Outside models are a **backup inside the batch pass**. They do not replace the gauge.

---

## Pipeline (canonical)

```
Realtime (thin, smart-enough)
  camera coach + clarifying Qs + SEND frames
  → ticket fields complete
  → status: packaged
        ▼
JIRA-like queue (by status / priority)
  project_queued → project_running
        ▼
Batch investigator (asap + complete, not wasteful)
  1. Region KB git (category + place) + prior ticket / media cache (pHash + Q hash)
  2. Allowed browser / maps / public research → honest limits on ticket
  3. Providers: ASR + VL/video + mid LLM (cheap default)
  4. Commit useful public residue → KB Markdown (PT-style categories)
  5. Only if still stuck → stronger provider / Bedrock escalate
  6. Distill escalate → KB + cache (required when useful)
  7. Write InvestigationUpdate + media artifacts + **cost notice fields**
  8. Close, need_evidence, or recommend merchant
```

**Primary learning = KB + context**, not weight updates ([`knowledge-base.md`](./knowledge-base.md)).

### Capture (realtime)

- Job: **requirements gathering** — what’s broken, what’s tried, missing angles, legal stops.  
- Model class: on-device pack ([`onboard-ai.md`](./onboard-ai.md)) + small/cheap coach.  
- **Not** responsible for advanced math, rare languages, gold-label vision, or image generation.

### Batch investigator — media via providers

| Job | Preferred path | Notes |
|---|---|---|
| Deep re-read of ticket stills | Provider VL | Cache by frame hash |
| Deferred video | Provider video understanding | Or shortlist frames → VL |
| Parts / damage diagrams | Cheap image API if needed | Cache by prompt+refs |
| Still stuck | Stronger Bedrock / peer VL | Unique frame hash only; then KB write |

Flags (draft): `relay.ai.vision`, `relay.ai.asr`, `relay.ai.imggen`, `relay.ai.frontier` (stronger escalate inside Project only).

### Backbone escalate (when cheap path cannot)

Use stronger Bedrock (or equivalent) when:

- Advanced math / formal reasoning  
- Rare language beyond Argos / local pack  
- Low-confidence VL on critical evidence after first provider pass  
- Legal-sensitive “stop and redirect” wording that must be gold-quality  
- Image/video understanding that cheaper models fail and the ticket still needs  

Then: write gold onto the Problem → **cache** normalized Q / media hash → **required** redacted **KB** Markdown → optional distill row for *future* specialist (not a training gate). Next identical ask should hit **git / cache ≈ $0**.

Do **not** escalate again for the same class of miss without a fresh **KB miss** check.

---

## Cost intuition (publicize)

| Kind | Unique-miss ballpark | Notes |
|---|---|---|
| Cheap text (Groq / Haiku-class) | ~$0.0001–0.005 / call | Most gray-zone / summaries |
| Stronger text (Sonnet-class) | ~$0.005–0.02 / call | Thin escalate slice |
| Provider VL / video | cents → $/min depending on API | Prefer short clips / shortlisted frames |
| ASR (Groq Whisper-class) | typically fractions of a cent per short clip | Batch only |

Monthly AI $ ≈ sum of logged `/request` costs. Tips/donations cover **servers + this metered AI**. Surface incurred cost after successful work so users can tip with eyes open.

---

## Product copy

- No batch GPU fleet; no on-demand “live Sonnet for everything.”  
- Smart capture → queue ticket → **KB + context first** → providers investigate thoroughly.  
- Groq / Bedrock / peers for text, ASR, stills, and video; **switch** when underperforming.  
- We **publish what requests cost**.  
- We get smarter by **growing the Markdown KB**, not by training custom weights for MVP.
