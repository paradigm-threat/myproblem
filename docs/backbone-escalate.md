# Backbone escalate (Bedrock / frontier) — rare, batched, cached

**Stance:** MyProblem does **not** need an on-demand frontier LLM for normal use. We need a **smart-enough capture model** to fill the ticket, then a **JIRA-style queue** that batch-investigates ASAP and as completely as possible — without waste or redundant calls. Bedrock (or OpenAI / Anthropic direct) is the **backbone for rare escalation** inside that batch path.

Related: [`projects.md`](./projects.md) · [`infra-definition.md`](./infra-definition.md) · [`knowledge-base.md`](./knowledge-base.md) · plan [`08-realtime-vision-infra-cost.md`](../../relay/clevertree-llc-plan/08-realtime-vision-infra-cost.md).

---

## What we optimize for

| Do | Don’t |
|---|---|
| Capture questions, requirements, photos → package ticket | Stream every frame to Sonnet |
| Queue by status (`packaged` → `project_queued` → …) | Fake “instant deep answer” spinners |
| Batch investigate thoroughly when capacity frees | Repeat the same frontier call for the same normalized Q |
| Escalate **once**, cache + KB, distill | On-demand frontier as the product |

**On-demand LLM ≠ product path.** Priority consumers buy a **faster Project queue / SLA**, not a live frontier chat.

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
  1. Local KB + prior ticket cache (dedupe)
  2. Cheap Spot VL / mid LLM / tools
  3. Only if still stuck → backbone escalate (Bedrock …)
  4. Write InvestigationUpdate; optional KB extract
  5. Close, need_evidence, or recommend merchant
```

### Capture LLM (realtime)

- Job: **requirements gathering** — what’s broken, what’s tried, missing angles, legal stops.  
- Model class: on-device pack + small/cheap coach (Haiku / Nova / Spot).  
- **Not** responsible for solving advanced math, rare languages, or gold-label vision.

### Batch investigator

- Drain queue ASAP under Spot/API budget.  
- Be **complete**: dig until DIY, need-more-evidence, merchant-ready, or closed.  
- Be **non-redundant**: normalize queries; hit cache/KB first; one frontier call per unique miss; share results across similar tickets in-region.

### Backbone escalate (rare)

Use Bedrock (or equivalent) when the cheap path cannot:

- Advanced math / formal reasoning  
- Rare language beyond Argos / local pack  
- Low-confidence VL on critical evidence  
- Legal-sensitive “stop and redirect” wording that must be gold-quality  

Then: write gold onto the Problem → **cache** normalized Q → optional redacted **KB** doc → training row for distill. Next identical ask should be **$≈0**.

Flag: `relay.ai.frontier` — **Project job only**, never live capture session.

---

## Cost intuition

Monthly frontier $ ≈ \(X \times (1-h) \times c\) where \(X\) = escalates attempted, \(h\) = cache/KB hit rate, \(c\) ≈ **$0.005–0.02** per unique text call (Haiku→Sonnet). Vision escalates cost more per image but should stay a **small %** of Projects. See prior cost notes in plan `08` and conversation planning — discipline on cache + batch keeps frontier in **tens to low hundreds $/mo** at pilot/early scale, not a second SaaS bill.

---

## Product copy

- No on-demand deep LLM.  
- Smart capture → queue ticket → batch investigate thoroughly.  
- Bedrock/frontier = rare backbone escalate inside the batch worker.  
- Priority = faster queue, not a weaker free answer or live Sonnet.
