# Context for the server AI (living doc)

Built from **MyProblem Test Mode** offline gate on device **CPH2419** (2026-11-07).

**Hard rule:** the server never receives dropped frames. Shake, blur, glare, duplicates, and “already have this angle” are decided **on device** inside `ContextBuilder`. The server consumes **worthy frames + a context summary**.

## Client-only (must not be re-decided on server)

| Field | Why client-only | Notes from Test Mode |
|---|---|---|
| `motion.isShaking` / `shakeScore` / `gyroMag` | Bad frames never upload; server would miss shake | Gyro EMA; threshold `SHAKE_DROP≈0.85` |
| `motion.isMoving` / `frameDiffEnergy` | Same | Optical-ish gray diff + IMU |
| `image.blurScore` / `laplacianVar` | Card-scanner class reject | Laplacian variance on downsampled Y |
| `image.glareScore` | Hot-pixel fraction | |
| `image` too dark / too bright | Exposure reject | |
| `uniqueness.pHash` / `uniqueDistance` | Dedupe before network | Observed: after 1 worthy, steady hold → endless `duplicate` drops (working as intended) |
| Drop reason enum | Explains gate to UI / logs | `blur`, `motion/shake`, `duplicate`, `wrong angle`, `wrong_target`, `glare`, … |
| Active `capture_request` capabilities (color/angle/text) | Ask miss never uploads | See [capture-guidance.md](./capture-guidance.md); `wrong_target` / `wrong_text` |

## Server → app (hints, not reject of shake)

| Field | Client use |
|---|---|
| `capture_request` | Narrows SEND to color/shape/angle match |
| `pack_min_version` | Client ignores advanced hints if pack too old |
| Pack CDN manifest URL | Cursor-style On-Device Pack update — [onboard-ai.md](./onboard-ai.md) |

## Split: realtime capture vs Project investigation

**Realtime** (this doc’s SEND path) is only for **smart-enough ticket intake**: coach lines + `capture_request` so the user fills questions, requirements, and **stills**. It is **not** an on-demand frontier solve. **No video files** are uploaded — only unique/worthy stills within rate limits.

**Projects** — deferred, batched server investigation — are the **primary** heavy path once a ticket is packaged and queued by status. The **region KB (git Markdown)** is checked first; Bedrock/frontier is a **rare escalate after KB miss**, then distilled back into the KB. See [`projects.md`](./projects.md) · [`backbone-escalate.md`](./backbone-escalate.md) · [`knowledge-base.md`](./knowledge-base.md). Tickets are anon by default ([`anonymous-tickets.md`](./anonymous-tickets.md)).

**Voice** is not part of the SEND frame path. The client posts **audio Evidence** to the ticket (blob in cheap object store); first attach enqueues ASR; context patches on **open** tickets may run an LLM gate for **retranscription** only. See [`progressive-transcription.md`](./progressive-transcription.md). There is no client `/api/transcribe`.

| Mode | Server job |
|---|---|
| Realtime SEND | Light VL/OCR for coaching; stills only; update ticket fields; never pretend the Problem is fully solved |
| Voice Evidence | Accept audio; enqueue first `asr_job`; LLM-gated retranscription on open tickets |
| Project batch | Deep research ASAP + complete; KB git + cache first; allowed browser research (honest limits); rare Bedrock escalate → KB write; DIY vs merchant; timeline updates |

## Sent with worthy uploads (server needs these for realtime coaching)

| Field | Server use |
|---|---|
| Worthy JPEG/WebP (+ `w`/`h`) | Actual vision / VL |
| `attitude.pitchDeg/rollDeg/yawDeg` | Understand pose; ask for another angle |
| `attitude.sectorId` / `sectorName` | All-angles template progress |
| `scenario.name` + `sectorsFilled` | “Still need NE, W, …” coaching |
| `image.brightness/contrast/complexity` | Soft hints (lighting OK, scene busy) — not for reject |
| `hints.colorMatch` / `shapeMatch` / `poseErr` / `captureRequestId` | Why this frame satisfied the request |
| `pack.version` | Provenance / escalate if stale |
| `uniqueness.pHash` | Optional server-side archive dedupe across sessions |
| `tickMs` / client clocks | Latency telemetry |
| `decision=SEND` (`sendReady=true`) | Assert client already gated (docs formerly said WORTHY) |

## Not for reject — for dialogue

Once a frame is worthy, the server AI should talk like a person about the **problem in view**, using:

- Image contents (what object, damage, labels)
- Sector / missing angles from context
- Complexity / lighting as soft language (“busy desk — isolate the part”)

It should **not** say “you’re shaking” unless the client already attached a non-upload coaching event (future: local-only chat events). Shake is already filtered.

## First ADB iterate observations (CPH2419)

- Feed on → analysis ~2 ms/tick; HUD showed `worthy=1`, then duplicates while phone held still on desk scene.
- `moving=false`, `shaking=false`, `sector=S`, `light≈0.33`, `blur≈0.01`, high complexity (busy desk).
- Preview content (agent-as-server narration): desk with hairbrush on keyboard, pen cup, lotion bottle, studio monitor, window light — **phone not moving**; gate correctly dropped duplicates.
- Angle gauge filled **1/8** (S) after first worthy frame.
- Camera/analysis FPS counters currently track analysis intake (~2 fps) — acceptable for unique-frame MVP; not preview FPS.

## Shared code

| Platform | Gate implementation |
|---|---|
| Android | `apps/android-testmode/.../ContextBuilder.kt` + `ImageStatsMath.kt` |
| Web | `src/lib/frameGate.ts` + `/test-mode` UI |

Unit tests: Android `./gradlew :app:testDebugUnitTest`; Web `npm test`.

## Open questions to refine

1. Should “sector already filled” be `wrong angle` or `angle_done` for clearer UX copy?
2. Raise analysis rate vs battery — still offline-only.
3. When uploading starts: attach last N seconds of **drop reason histogram** (not frames) so server knows user was shaking without seeing bad pixels.
4. Web DeviceOrientation permission UX on iOS Safari (later).
5. L2 HF embedding pack size budget on mid Android (target ≤ ~10–15 MB).

## Related docs

- [projects.md](./projects.md) — deferred server investigation (primary heavy path)
- [anonymous-tickets.md](./anonymous-tickets.md) — anon UUID; free recover email; Relay tip SoT
- [progressive-transcription.md](./progressive-transcription.md) — audio → first ASR; LLM-gated retranscription; no video
- [backbone-escalate.md](./backbone-escalate.md) — rare Bedrock / frontier escalate (after KB miss)
- [knowledge-base.md](./knowledge-base.md) — git Markdown KB; primary learning; browser honesty
- [capture-guidance.md](./capture-guidance.md) — `capture_request` schema + future 3D / voice notes
- [onboard-ai.md](./onboard-ai.md) — L0–L4, HF pins, pack format, CDN
