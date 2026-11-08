# MyProblem Test Mode (Android)

Single-screen offline frame gate MVP (current build) plus **planned** voice-ticket UX (not built yet). **No server video** — stills only.

## Current (shipped in debug APK)

- Camera on/off
- On-device ContextBuilder (gyro, lighting, blur, uniqueness, angle sectors)
- L1 capture hints (debug: blue → NE → **TEXT/OCR** → off)
- ML Kit Latin OCR (sparse; Play Services model) when text hint on
- Event log: new image in view, sustained blur/shake, OCR text
- Bundled On-Device Pack `assets/ondevice-pack/v1`
- Dual CameraX: GPU Preview + low-res ImageAnalysis
- **No network upload** (no `INTERNET` permission; Play Services may fetch OCR model)

Docs: `docs/onboard-ai.md`, `docs/capture-guidance.md`, `docs/progressive-transcription.md`, `docs/anonymous-tickets.md`

Coach / gate logcat:

```bash
adb logcat -s MyProblemCoach:I MyProblemCtx:I MyProblemOcr:W
```

Hardening notes: JPEG+OCR only on KEEP candidates; OCR epoch ignores stale callbacks after Reset/Hint change; rejected OCR strings capped at 32.

## Planned (not built yet) — voice ticket (anon UUID)

Contracts: [`docs/progressive-transcription.md`](../../docs/progressive-transcription.md) · [`docs/anonymous-tickets.md`](../../docs/anonymous-tickets.md).

| UX | Rule |
|---|---|
| **Mic → new ticket** | Stop recording posts **audio as Evidence** on an anon `ticket_uuid`. APK does **not** call ASR / Whisper. |
| **First ASR** | Server always enqueues batch ASR on first audio (or silence skip). |
| **Transcript UI** | Sync from ticket: `pending` → `ready` → optional `updating` when retranscription gate says yes. |
| **No “Re-transcribe” ASR button** | User adds context; server LLM gate decides retranscription on **open** tickets. |
| **Local backup** | Ticket list + claim material + optional audio cache; warn anon: lose phone → lose tickets unless free recover email. |
| **Camera** | Unique/worthy **stills** only within rate limits — **must not** mux or upload `.mp4` / video Evidence. |

Will require `RECORD_AUDIO` + `INTERNET` when implemented; today the APK stays offline.

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
