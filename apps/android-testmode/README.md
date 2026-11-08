# MyProblem (Android)

Ticket-first product shell + Test Mode frame-gate lab.

Docs: [`docs/apk-ticket-ux.md`](../../docs/apk-ticket-ux.md) · [`docs/progressive-transcription.md`](../../docs/progressive-transcription.md) · [`docs/anonymous-tickets.md`](../../docs/anonymous-tickets.md) · [`docs/capture-guidance.md`](../../docs/capture-guidance.md)

## Product shell (local drafts)

- Home: **open** tickets only; closed hidden (Settings → Show archived)
- **New ticket** → pick **Text** / **Audio** / **Audio+frames** (no onboarding)
- **Audio**: ticket UUID on mic start; coach lines + progressive proposed title/desc; stop via button or “stop recording”; **no later Submit**. Edit locks fields from auto-guess.
- Ticket timeline + sync status chips; edit title/desc to lock vs “Proposed by MyProblem”
- Evidence stays local for now (chunk upload sim until ticket APIs); stills only — **no video files**
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
