# Onboard AI ↔ server AI (living doc)

On-device stack for MyProblem Test Mode / future Problem capture. **Not** a phone LLM.

| On phone | On server (Spot / API) |
|---|---|
| L0 classical gate (shake/blur/unique) | Problem brief, chat, templates |
| L1 hint scorers (color, shape stub, angle) | Deductive `capture_request` |
| L2+ tiny nets from Hugging Face (pack) | VL + chat LLM; rare frontier |
| Coach HUD | Brief updates; may stop camera |

## Layers (L0–L4)

| Layer | Tech | Role | Status |
|---|---|---|---|
| L0 Classical | Kotlin `ImageStatsMath`, gyro | Shake/blur/unique/sectors | **Shipped** in Test Mode |
| L1 Hint filters | HSV color fraction; yaw/sector; bbox aspect stub | Match `capture_request` | **APK** |
| L2 Tiny embedding | TFLite / ORT Mobile from HF | Uniqueness + “same region” | **Deferred** (see below) |
| L3 Nano detector | YOLO-nano / MediaPipe | Coarse class/ROI | Phase 2 |
| L4 Pose / 3D guide | Attitude + mesh overlay | Turn-with-you / auto-best angle | Docs only — see [capture-guidance.md](./capture-guidance.md) |

Budget: **&lt; ~30–50 ms/tick** on mid phones (e.g. CPH2419). Inference via TFLite + NNAPI when L2 lands.

## Hugging Face reuse (pin, don’t reinvent)

Prefer download + convert + pin in pack over training.

| Need | Model | Repo | Notes |
|---|---|---|---|
| L2 embedding | MobileCLIP-S0 | [Xenova/mobileclip_s0](https://huggingface.co/Xenova/mobileclip_s0) | ONNX; web Transformers.js; Android → TFLite or ORT Mobile |
| L2 CLIP family | MobileCLIP-S2 | [apple/MobileCLIP-S2-OpenCLIP](https://huggingface.co/apple/MobileCLIP-S2-OpenCLIP) | Check Apple AMLR |
| L2 backbone | MobileNetV3-Small | [timm/mobilenetv3_small_100.lamb_in1k](https://huggingface.co/timm/mobilenetv3_small_100.lamb_in1k) | Apache-2.0 |
| Ready TFLite | MobileNetV2 | [Synaptics/MobileNetV2](https://huggingface.co/Synaptics/MobileNetV2) | MIT |
| LiteRT zoo | EfficientNet-B1 | [litert-community/efficientnet_b1](https://huggingface.co/litert-community/efficientnet_b1) | Drop-in LiteRT |
| iOS later | Core ML MobileCLIP | [apple/coreml-mobileclip](https://huggingface.co/apple/coreml-mobileclip) | After Android+web stable |

**We still write:** L0/L1 glue, pack loader + signatures, thresholds JSON, HF→quantized pack conversion script.

**Workflow:** pin `repo_id` + `revision` in `manifest.json` → CI converts → publish On-Device Pack. Improve basics by shipping a new pack, not a new backbone.

## On-Device Pack format

Bundled at `apps/android-testmode/app/src/main/assets/ondevice-pack/v1/`:

```json
{
  "version": "1.0.0",
  "minApp": 1,
  "packDisabled": false,
  "thresholds": {
    "shakeDrop": 0.85,
    "blurDrop": 0.62,
    "colorMinFraction": 0.04,
    "yawTolDeg": 20
  },
  "models": [],
  "hfProvenance": [],
  "coachDefaults": {
    "holdStill": "Hold still",
    "moreColor": "Get more of the target color in frame"
  },
  "signature": null
}
```

- `models[]` — later: `{ "id", "file", "format": "tflite"|"onnx", "role": "embedding" }`
- `hfProvenance[]` — `{ "repo_id", "revision", "role" }` for audit
- `signature` — ed25519 over zip bytes (null in v1 bundled baseline; verify hook in loader)

### Cursor-style updates (no Play for every tweak)

| Channel | Contents | Cadence |
|---|---|---|
| Play APK | UI, gate runtime, TFLite interpreter, pack loader | Rare |
| On-Device Pack (Blob/CDN) | manifest, `*.tflite`, thresholds, coach strings | Often |
| Live `capture_request` | Per-Problem hints | Every turn |

Loader: `GET /api/ondevice-pack/latest` → version compare → download → **verify signature** → atomic swap. Fallback: bundled assets. Kill switch: `packDisabled` → L0 only.

**Deferred (L2 + CDN):** convert pinned HF checkpoint → quantized TFLite/ONNX into pack; Vercel Blob + `/api/ondevice-pack/latest`. Do not implement until L1 proven on device. Stub notes in [scripts/export_hf_to_pack.md](../scripts/export_hf_to_pack.md).

## Server ↔ onboard contract

- Server **never** re-decides shake/blur/glare/duplicate.
- Server **sends:** `capture_request`, optional `ref_embedding` / mask id, `pack_min_version`.
- Client **sends** with worthy frames: `color_match`, `shape_match`, `pose_err`, `pack.version`, sector.
- If pack too old for a hint type: ignore that hint (or prompt update) — do not upload junk.

See also [capture-guidance.md](./capture-guidance.md) and [context-for-server.md](./context-for-server.md).

## APK entry points

| Piece | Path |
|---|---|
| Gate | `ContextBuilder.kt` + `CaptureHints.kt` |
| Color/angle scorers | `HintScorers.kt` (+ RGB sample from `FrameAnalyzer`) |
| Pack | `OnDevicePackLoader.kt` + `assets/ondevice-pack/v1/` |
| HUD | `TestModeScreen` shows pack version + active coach |
