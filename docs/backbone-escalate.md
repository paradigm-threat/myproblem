# Backbone escalate + batched vision media — rare, cheap, cached

**Stance:** MyProblem does **not** need on-demand frontier LLM **or** on-demand premium vision. We need a **smart-enough capture model** to fill the ticket, then a **JIRA-style queue** that batch-investigates ASAP and as completely as possible — without waste or redundant calls.

| Capability | Default path | Rare escalate |
|---|---|---|
| Text / math / language | Cheap mid LLM + local KB | **Bedrock** (or Anthropic/OpenAI) |
| **Advanced photo analysis** | Spot GPU + **Hugging Face** / open VL (Florence-class, OCR, detectors) | Bedrock VL / GPT-4o-class only on unique hard frames |
| **Photo / diagram generation** | HF / open image models on Spot or a cheap batch API | Frontier image APIs only if open path fails |

Related: [`projects.md`](./projects.md) · [`infra-definition.md`](./infra-definition.md) · [`onboard-ai.md`](./onboard-ai.md) (HF pins for on-device) · [`knowledge-base.md`](./knowledge-base.md) · plan [`08`](../../relay/clevertree-llc-plan/08-realtime-vision-infra-cost.md).

---

## What we optimize for

| Do | Don’t |
|---|---|
| Capture questions, requirements, photos → package ticket | Stream every frame to Sonnet / Midjourney |
| Queue by status (`packaged` → `project_queued` → …) | Fake “instant deep answer” or instant gen spinners |
| Batch investigate + analyze/generate media when capacity frees | Repeat the same VL/gen call for the same evidence hash |
| Escalate **once**, cache + KB, distill | On-demand frontier as the product |

**On-demand premium media ≠ product path.** Priority buys a **faster Project queue / SLA**, not live SDXL or live Claude vision.

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
  1. Local KB + prior ticket / media cache (dedupe by pHash + Q hash)
  2. Cheap Spot: OCR + open VL (HF) + mid LLM + optional image gen
  3. Only if still stuck → backbone escalate (Bedrock text/VL …)
  4. Write InvestigationUpdate + media artifacts; optional KB extract
  5. Close, need_evidence, or recommend merchant
```

### Capture (realtime)

- Job: **requirements gathering** — what’s broken, what’s tried, missing angles, legal stops.  
- Model class: on-device pack ([`onboard-ai.md`](./onboard-ai.md)) + small/cheap coach.  
- **Not** responsible for advanced math, rare languages, gold-label vision, or image generation.

### Batch investigator — vision media (minimal cost)

Advanced **photo analysis** and **generation** run on the **same Project queue**, not live:

| Job | Preferred cheap path | Notes |
|---|---|---|
| Deep re-read of ticket stills | Spot A30 + **HF** VL/OCR (Florence / Paddle / detectors) | Batch when GPU free; reuse crops |
| Parts / damage diagrams for DIY | HF / open **image gen** or edit on Spot (or cheap batch API) | Cache by prompt+refs; never live Midjourney UX |
| “What should this look like?” overlays | Same | Attach as Evidence on ticket; redact before KB |
| Still stuck after open VL | Bedrock / GPT-4o-class **VL escalate** | Unique frame hash only |

Prefer **self-host HF weights on Spot** (or HF Inference / together-style batch) over always-on SaaS. Same rule as text: **no on-demand premium** — queue it, finish it, cache it.

Flags (draft): `relay.ai.vision` (coach vs batch depth), `relay.ai.imggen` (batch generation), `relay.ai.frontier` (rare escalate).

### Backbone escalate (rare)

Use Bedrock (or equivalent) when the cheap path cannot:

- Advanced math / formal reasoning  
- Rare language beyond Argos / local pack  
- Low-confidence VL on critical evidence after HF/Spot pass  
- Legal-sensitive “stop and redirect” wording that must be gold-quality  
- Image understanding/gen that open models fail and the ticket still needs  

Then: write gold onto the Problem → **cache** normalized Q / media hash → optional redacted **KB** doc → training row for distill. Next identical ask should be **$≈0**.

Flag: `relay.ai.frontier` — **Project job only**, never live capture session.

---

## Cost intuition

| Kind | Unique-miss ballpark | Notes |
|---|---|---|
| Text Bedrock | ~$0.005–0.02 / call | Cache/KB dominate savings |
| Open VL on Spot | ~Spot $/hr ÷ batched jobs | Prefer always over frontier VL |
| Frontier VL | ~$0.002–0.005 / hard image | Small % of Projects |
| Open image gen on Spot/HF | Spot or ~pennies / image batch | Cache generations |

Monthly frontier $ ≈ \(X \times (1-h) \times c\). Keep advanced photo work on **HF + Spot batch**; frontier only for unique misses. Discipline → **tens to low hundreds $/mo** at pilot/early scale, not a second SaaS bill.

---

## Product copy

- No on-demand deep LLM or premium vision/gen.  
- Smart capture → queue ticket → batch investigate + analyze/generate media thoroughly.  
- Prefer **Hugging Face / Spot** for advanced photos; Bedrock = rare backbone escalate.  
- Priority = faster queue, not live Sonnet or live image APIs.
