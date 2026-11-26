# MyProblem (Android)

Channel-first product shell: public Clevertree/IRC room (`#mp-general`) + secondary tickets + Test Mode lab.

Docs: [`docs/apk-ticket-ux.md`](../../docs/apk-ticket-ux.md) · [`docs/simple-max.md`](../../docs/simple-max.md) · [`docs/clevertree-chat.md`](../../docs/clevertree-chat.md)

## Product shell

- **Home = public room** WebView (`https://myproblem.app/c/mp-general`, same as `/#room`)
- Ask = type / speak / video in-channel → Bunny → `/api/chat/post` (same APIs as web)
- **Tickets** are secondary — only when AI/batch opens one (no tip-mint CTA on home)
- Networker (opt-in): keep existing tips moving; social gather stays in Relay Chrome
- Endpoints: `ChatEndpoints.kt` (aligned with site `src/lib/contact.ts` + `src/lib/chat/channels.ts`)
- Menu → **Test Mode** (debug) for the offline frame gate

## Test Mode (debug)

- Camera on/off, ContextBuilder, L1 hints, ML Kit OCR, coach log
- Dual CameraX Preview + ImageAnalysis
- Offline (no upload from Test Mode)

```bash
adb logcat -s MyProblemCoach:I MyProblemCtx:I MyProblemOcr:W
```

## Build / install / test

```bash
cd apps/android-testmode
./gradlew :app:assembleDebug
./gradlew :app:testDebugUnitTest
# or from repo root:
npm run test:android

adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n app.myproblem.testmode/.MainActivity
```

## Package

`app.myproblem.testmode` (debug) / `app.myproblem` (release)
