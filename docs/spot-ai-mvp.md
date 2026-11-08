# Spot AI MVP — test infrastructure (not permanent)

Living plan after APK Test Mode + Relay Spot docs.

Research: [MyProblem APK server needs](95c99f78-e4c4-4a29-9242-fe486ef3fc3e) · [Relay Spot / reuse gaps](c76adaea-baea-400e-99d0-a11d45b0c279).

**Goal:** Rent interruptible Rackspace Spot long enough to build/test **image recognition**, then **voice Evidence → batched transcript on the ticket**, then **Project batch investigation** ([`projects.md`](./projects.md) · [`progressive-transcription.md`](./progressive-transcription.md)). Tear down when idle. Phase 0.5 is **designed, not executed** — no `clevertree-llc-plan/bench/` yet.

**Architecture stance:** No on-demand frontier LLM or premium vision. Realtime = **smart-enough capture** (stills only) → queue JIRA-like ticket (anon `ticket_uuid`). Batch **Projects** investigate ASAP (HF/Spot; **region KB git first**; allowed browser research with honest limits). **Bedrock / frontier** = rare escalate after KB miss, then **KB write** ([`backbone-escalate.md`](./backbone-escalate.md) · [`knowledge-base.md`](./knowledge-base.md)). Dossier = **Relay tip**; media = **Bunny/S3-class** object store ([`anonymous-tickets.md`](./anonymous-tickets.md)).

## Hard constraints (from Test Mode)

- Server **never** re-gates frames. Client sends `decision=SEND` + JPEG/WebP + [`ContextPacket`](../apps/android-testmode/app/src/main/java/app/myproblem/testmode/ContextPacket.kt).
- Server returns coach line + next [`capture_request`](./capture-guidance.md).
- **No video file upload** — unique/worthy stills only within rate limits.
- **ASR is ticket Evidence + batch worker — never a client ASR API.** APK posts **audio** (object-store blob); first attach enqueues `asr_job`; open tickets may re-batch via LLM **retranscription** gate. See [`progressive-transcription.md`](./progressive-transcription.md).
- Pack CDN (`GET /api/ondevice-pack/latest`) stays **deferred** until L1 is proven.

## Minimal Spot standup

| Piece | Spec | Why |
|---|---|---|
| **1× GPU Spot** | `gpu.vs2.xlargeplusplus-sjc` (A30), ~$0.15/hr | VL + OCR + optional whisper |
| Optional CPU Spot | IAD `ch.vs1.2xlarge-iad` | Later ffmpeg stills assist only — not video product path |
| Edge | Existing Vercel `myproblem` | Auth stub, rate limit, proxy to Spot |
| Dossier | Regional Relay git tip per `ticket_uuid` | Problem SoT (georgia \| israel) |
| Queue | Job files in regional repo | Leases via git commits |
| Media blobs | Bunny (prefer) or S3-compatible | Audio + stills; links only in tip |
| Ticket HTTP | Intake `relay-gateway` + worker | Vercel = marketing/APK only |

Org: Rackspace Spot **paradigmthreat** (see Relay plan `09`).

```
Phone / web Test Mode
   │  multipart: JPEG + ContextPacket JSON
   ▼
Vercel  POST /api/vision/worthy   (shared secret / allowlist)
   │
   ▼
Spot A30  vision worker
   decode → OCR crops → VL structured JSON
   → Problem patch + coach + capture_request
   → optional Relay tip write (flag on)
```

## Relay reuse — what already exists vs flags to add

**Already in Relay (reuse as-is):** Spot fleet ops / reclaim (`relay-gateway/ops`, terraform), tip/park Problem dossier host, Piper **TTS** (output), Argos offline MT, thin media policy.

**Not in Relay today:** vision/OCR/Whisper workers, WebRTC SFU, Problem patch schema, free/paid GPU pool routing. Live mesh is **CPU** (iad/ord/hkg); SJC A30 is planned only.

Do **not** fork a separate AI product. Spot box = Relay worker profile with install-time flags:

| Flag | Default mesh | Spot AI worker |
|---|---|---|
| `relay.ai.vision` | off | Light VL on SEND (capture); deep VL in Project batch |
| `relay.ai.ocr` | off | GPU OCR (Spot / HF) |
| `relay.ai.imggen` | off | Batch image/diagram gen (HF weights on Spot or cheap batch API) |
| `relay.ai.asr` | off | Batch Whisper on ticket **audio** Evidence → versioned **transcript** Evidence; LLM gate may re-queue on open tickets ([`progressive-transcription.md`](./progressive-transcription.md); TTS already exists) |
| `relay.ai.chat` | off | brief-compiler + LLM (**prefer Project batch**, not live session) |
| `relay.ai.frontier` | off | **Rare** Bedrock/API escalate inside Project only — cache gold; never live capture |
| `relay.ai.pool` | — | `free_pool` (Spot, busy→429 / enqueue Project) vs `paid_pool` (reliable) |
| `relay.ai.projects` | off | deferred investigation worker: drain queued tickets, write timeline updates |

## Image recognition first (acceptance)

| Metric | Target (pilot) |
|---|---|
| OCR crop p95 | &lt; 300 ms |
| VL structured patch p95 | &lt; 1.5 s |
| Concurrent streams on one A30 | Find knee (1/2/4) |
| Cost | Log `$/hr × latency` in `clevertree-llc-plan/bench/` |

Structured output shape (draft):

```json
{
  "object": "...",
  "damage": "...",
  "labels": [],
  "confidence": 0.0,
  "chat_line": "...",
  "capture_request": { }
}
```

## Ordered next steps

1. Freeze OpenAPI: SEND upload + `capture_request` response (align Android `SEND` / web `frameGate`).
2. **Execute Phase 0.5:** Spot IAD CPU (optional) + **SJC A30**; CUDA Docker OCR+VL; tear-down alarm; sprint ~$50–150 Spot + $50–150 APIs.
3. Thin bench scripts → `clevertree-llc-plan/bench/` CSV (p50/p95); fake `free_pool` / `paid_pool` + 429 busy.
4. Vercel `/api/vision/worthy` proxy → Spot (shared secret).
5. Relay `relay.ai.*` flags; Spot joins as flagged worker; optional demo Problem tip write.
6. Flip Test Mode “would upload” → real POST (web, then APK + INTERNET).
7. ASR second: ticket audio Evidence → batch Whisper (Spot A30 or hosted API **from the worker only**); progressive retranscription gate on open tickets ([`progressive-transcription.md`](./progressive-transcription.md)); keep Piper for TTS reply. **Do not** expose client `/api/transcribe`.
8. **Projects queue:** package ticket → status queue → batch worker drains ASAP (complete, non-redundant); app/email InvestigationUpdate ([`projects.md`](./projects.md)).
9. **Vision media batch:** HF/open VL + optional imggen on Spot A30; cache by pHash/prompt ([`backbone-escalate.md`](./backbone-escalate.md)).
10. **Backbone escalate:** Bedrock/Haiku→Sonnet (text/VL) only after **KB miss**; distill into KB Markdown.
11. **KB git (batch):** category Markdown (PT patterns); research + escalate residues; GA/Israel channels ([`knowledge-base.md`](./knowledge-base.md)).
12. **Browser research tool:** automation where bots allowed; honest “couldn’t see form” updates.
13. If SJC↔GA latency fails targets: IAD CPU + API VL for GA; Spot GPU for **Project batch** distill (decision table in plan `09`).

## Out of scope for this MVP

Always-on reliable GPU, multi-region, full WebRTC SFU, L2 HF pack CDN, billing, merchant match. Full Project notify (email/push) can stub as in-app poll first.

## Related

- [`intake-batch-infra.md`](./intake-batch-infra.md) — **Intake** (always-on) vs **Batch** (ephemeral A30); APK+queue for images
- [`projects.md`](./projects.md) — deferred investigation (primary server path)
- [`anonymous-tickets.md`](./anonymous-tickets.md) — anon UUID; free recover; Relay tip + object store
- [`progressive-transcription.md`](./progressive-transcription.md) — first ASR + LLM retranscription; no video
- [`backbone-escalate.md`](./backbone-escalate.md) — rare Bedrock escalate in batch
- [`knowledge-base.md`](./knowledge-base.md) — git Markdown KB (primary learning) + channels + browser honesty
- [`context-for-server.md`](./context-for-server.md)
- [`onboard-ai.md`](./onboard-ai.md)
- [`infra-definition.md`](./infra-definition.md)
- [`../../relay/clevertree-llc-plan/09-rackspace-spot-vision-prototype.md`](../../relay/clevertree-llc-plan/09-rackspace-spot-vision-prototype.md)
