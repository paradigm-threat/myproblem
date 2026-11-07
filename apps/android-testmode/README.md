# MyProblem Test Mode (Android)

Single-screen offline frame gate MVP.

- Camera on/off
- On-device ContextBuilder (gyro, lighting, blur, uniqueness, angle sectors)
- L1 capture hints (debug inject: require blue / NE sector → `wrong_target`)
- Bundled On-Device Pack `assets/ondevice-pack/v1` (version in HUD)
- Worthy vs drop HUD + rental-style all-angles gauge
- **No network upload** (no `INTERNET` permission)

Docs: `docs/onboard-ai.md`, `docs/capture-guidance.md`

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
