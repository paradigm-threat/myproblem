# Spot AI MVP — test infrastructure (not permanent)

Living plan after APK Test Mode + Relay Spot docs.

Research: [MyProblem APK server needs](95c99f78-e4c4-4a29-9242-fe486ef3fc3e) · [Relay Spot / reuse gaps](c76adaea-baea-400e-99d0-a11d45b0c279).

**Goal:** Rent interruptible Rackspace Spot long enough to build/test **image recognition**, then **voice→transcript→Problem chat**, then **Project batch investigation** ([`projects.md`](./projects.md)). Tear down when idle. Phase 0.5 is **designed, not executed** — no `clevertree-llc-plan/bench/` yet.

**Architecture stance:** Realtime Spot calls are for **capture coaching** only. Full ticket research runs as deferred **Projects** on the free/batch pool when capacity exists—cheaper than fake realtime at best quality.

## Hard constraints (from Test Mode)

- Server **never** re-gates frames. Client sends `decision=SEND` + JPEG/WebP + [`ContextPacket`](../apps/android-testmode/app/src/main/java/app/myproblem/testmode/ContextPacket.kt).
- Server returns coach line + next [`capture_request`](./capture-guidance.md).
- ASR/transcription is **not** in the APK contract yet — design it as Evidence attached to a Problem, same as photos.
- Pack CDN (`GET /api/ondevice-pack/latest`) stays **deferred** until L1 is proven.

## Minimal Spot standup

| Piece | Spec | Why |
|---|---|---|
| **1× GPU Spot** | `gpu.vs2.xlargeplusplus-sjc` (A30), ~$0.15/hr | VL + OCR + optional whisper |
| Optional CPU Spot | IAD `ch.vs1.2xlarge-iad` | Later WebRTC/ffmpeg ingest only |
| Edge | Existing Vercel `myproblem` | Auth stub, rate limit, proxy to Spot |
| Storage | Neon + Blob (already) | Problem metadata / future evidence |

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
| `relay.ai.vision` | off | VL on SEND frames |
| `relay.ai.ocr` | off | GPU OCR |
| `relay.ai.asr` | off | whisper → transcript Evidence (new; TTS already exists) |
| `relay.ai.chat` | off | brief-compiler + LLM (**prefer Project batch**, not live session) |
| `relay.ai.frontier` | off | low-confidence API escalate (**Project job**, not realtime) |
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
7. ASR second (mic → whisper on same A30); keep Piper for TTS reply.
8. **Projects queue:** package ticket → enqueue → batch worker on Spot drain; app/email InvestigationUpdate; merchant submit always optional ([`projects.md`](./projects.md)).
9. If SJC↔GA latency fails targets: IAD CPU + API VL for GA; Spot GPU for **Project batch** distill (decision table in plan `09`).

## Out of scope for this MVP

Always-on reliable GPU, multi-region, full WebRTC SFU, L2 HF pack CDN, billing, merchant match. Full Project notify (email/push) can stub as in-app poll first.

## Related

- [`projects.md`](./projects.md) — deferred investigation (primary server path)
- [`context-for-server.md`](./context-for-server.md)
- [`onboard-ai.md`](./onboard-ai.md)
- [`infra-definition.md`](./infra-definition.md)
- [`../../relay/clevertree-llc-plan/09-rackspace-spot-vision-prototype.md`](../../relay/clevertree-llc-plan/09-rackspace-spot-vision-prototype.md)
