# Spot AI MVP — test infrastructure (not permanent)

Living plan after APK Test Mode + Relay Spot docs. Research: [MyProblem APK server needs](95c99f78-e4c4-4a29-9242-fe486ef3fc3e).

**Goal:** Rent interruptible Rackspace Spot long enough to build/test **image recognition**, then **voice→transcript→Problem chat**. Tear down when idle.

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

## Relay reuse — install-time feature flags

Do **not** fork a separate AI product. Spot box = Relay worker profile:

| Flag | Default mesh | Spot AI worker |
|---|---|---|
| `relay.ai.vision` | off | VL on SEND frames |
| `relay.ai.ocr` | off | GPU OCR |
| `relay.ai.asr` | off | whisper → transcript Evidence |
| `relay.ai.chat` | off | brief-compiler + LLM |
| `relay.ai.frontier` | off | low-confidence API escalate |

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
2. Create Spot A30 SJC pool; Docker OCR+VL; `/ready` health.
3. Add Vercel `/api/vision/worthy` proxy → Spot.
4. Add Relay `relay.ai.*` flags; Spot joins as flagged worker.
5. Flip Test Mode “would upload” → real POST (web, then APK + INTERNET).
6. Add ASR second (mic → whisper on same A30).
7. Bench CSV → tear down Spot.

## Out of scope for this MVP

Always-on reliable GPU, multi-region, full WebRTC SFU, L2 HF pack CDN, billing, merchant match.

## Related

- [`context-for-server.md`](./context-for-server.md)
- [`onboard-ai.md`](./onboard-ai.md)
- [`infra-definition.md`](./infra-definition.md)
- [`../../relay/clevertree-llc-plan/09-rackspace-spot-vision-prototype.md`](../../relay/clevertree-llc-plan/09-rackspace-spot-vision-prototype.md)
