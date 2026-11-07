# Export HF → On-Device Pack (DEFERRED)

Do **not** run this in production until L1 color/angle hints are proven on device.

## Intent

Pin a Hugging Face checkpoint, convert/quantize, drop into `ondevice-pack/vN/`, publish via Vercel Blob + `GET /api/ondevice-pack/latest`.

## Planned pins (from [docs/onboard-ai.md](../docs/onboard-ai.md))

1. Primary L2: `Xenova/mobileclip_s0` (ONNX) or `timm/mobilenetv3_small_100.lamb_in1k` → TFLite
2. Alt ready TFLite: `Synaptics/MobileNetV2`, `litert-community/efficientnet_b1`

## Steps (when un-deferred)

1. `hf download <repo> --revision <sha>`
2. Convert to TFLite / keep ONNX for web; quantize int8 where quality holds
3. Write `models/embedding.tflite` + update `manifest.json` `models` + `hfProvenance`
4. Sign zip (ed25519); upload Blob; bump `/api/ondevice-pack/latest`
5. APK loader verifies signature and swaps

## Out of scope now

- Training new classifiers
- On-device LLM
- Live CDN API route (stub only after L1)
