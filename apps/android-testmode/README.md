# MyProblem Test Mode (Android)

Single-screen offline frame gate MVP.

- Camera on/off
- On-device ContextBuilder (gyro, lighting, blur, uniqueness, angle sectors)
- L1 capture hints (debug: blue → NE → **TEXT/OCR** → off)
- ML Kit Latin OCR (sparse; Play Services model) when text hint on
- Event log: new image in view, sustained blur/shake, OCR text
- Bundled On-Device Pack `assets/ondevice-pack/v1`
- Dual CameraX: GPU Preview + low-res ImageAnalysis
- **No network upload** (no `INTERNET` permission; Play Services may fetch OCR model)

Docs: `docs/onboard-ai.md`, `docs/capture-guidance.md`

Coach / gate logcat:

```bash
adb logcat -s MyProblemCoach:I MyProblemCtx:I MyProblemOcr:W
```

Hardening notes: JPEG+OCR only on KEEP candidates; OCR epoch ignores stale callbacks after Reset/Hint change; rejected OCR strings capped at 32.

## Build / install

```bash
cd apps/android-testmode
./gradlew :app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n app.myproblem.testmode/.MainActivity
```

Context logs:

```bash
adb logcat -s MyProblemCtx:I
```

## Package

`app.myproblem.testmode`
