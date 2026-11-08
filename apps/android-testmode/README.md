# MyProblem (Android)

Ticket-first product shell + Test Mode frame-gate lab.

Docs: [`docs/apk-ticket-ux.md`](../../docs/apk-ticket-ux.md) · [`docs/progressive-transcription.md`](../../docs/progressive-transcription.md) · [`docs/anonymous-tickets.md`](../../docs/anonymous-tickets.md) · [`docs/capture-guidance.md`](../../docs/capture-guidance.md)

## Product shell (local drafts)

- Onboarding: choose start mode — **Text** / **Audio** / **Audio+frames**
- Home: **open** tickets only; closed hidden (Settings → Show archived)
- Big **New ticket** enters the sticky start mode immediately
- Ticket timeline + status chips; Manual fill when intake would need text
- Evidence stays local for now (no server upload yet); stills only — **no video files**
- Menu → **Test Mode** for the offline frame gate

## Test Mode (debug)

- Camera on/off, ContextBuilder, L1 hints, ML Kit OCR, coach log
- Dual CameraX Preview + ImageAnalysis
- Offline (no upload from Test Mode)

```bash
adb logcat -s MyProblemCoach:I MyProblemCtx:I MyProblemOcr:W
```

## Build / install

```bash
cd apps/android-testmode
./gradlew :app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n app.myproblem.testmode/.MainActivity
```

## Package

`app.myproblem.testmode`
