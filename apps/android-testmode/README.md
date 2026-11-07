# MyProblem Test Mode (Android)

Single-screen offline frame gate MVP.

- Camera on/off
- On-device ContextBuilder (gyro, lighting, blur, uniqueness, angle sectors)
- Worthy vs drop HUD + rental-style all-angles gauge
- **No network upload** (no `INTERNET` permission)

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
