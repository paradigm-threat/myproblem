# MyProblem brand icons

Source pack: `myproblem-icon-pack.zip` (2026-11-11). Raster PNG/ICO exports — not SVG.

| Path | Use |
|---|---|
| `../public/favicon.ico` | Browser tab |
| `../public/apple-touch-icon.png` | iOS home screen (180) |
| `../public/icons/` | Web size ladder + Android chrome / adaptive / play-store masters |
| `../public/brand.png` | Transparent 1024 logo |
| `../public/og.png` | Fallback OG mark (512) |
| `../src/app/icon.png` / `apple-icon.png` / `favicon.ico` | Next.js metadata icons |
| `android/res/mipmap-*/` | Android launcher icons (play-store art resized) |
| `android/adaptive-foreground.png` | Adaptive icon foreground layer |
| `ios/` | iOS AppIcon sizes from opaque 1024 |
| `store/google-play-512.png` | Play Store listing |
| `logo-transparent-1024.png` / `ios-app-icon-1024.png` | Masters |
| `qr-card.png` | Print-card QR → `https://myproblem.app/r/card` (also `../public/qr/card.png`) |

**Print card QR:** encodes `/r/card`. That lander sets cookie `mp_from=print_card`, adds `utm_source=print_card&utm_medium=qr&utm_campaign=flyer&from=card`, then: Android → `PLAY_STORE_URL` or `/demo`; iOS → `APP_STORE_URL` or `/`; desktop → `/`. Regenerate with `scripts/generate-card-qr.py` (needs `qrcode[pil]`).

Verify small-size legibility before production if you regenerate from other art.
