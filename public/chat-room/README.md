# Clevertree public IRC room UI

Shared room chrome for web embed, full page, Relay side panel, and the Android AAR ([`docs/android-room.md`](../../docs/android-room.md)).

- **Demo embed:** [`embed.html`](embed.html) (seed messages)
- **Production / APK shell:** [`live.html`](live.html) — query `channel`, `api`, `title`, `collection`, `topic`, `theme`, `ai` (no seeds)

## Themes (independent of host)

Swappable packs under [`themes/`](themes/) (IRC-client style — base + light + dark; more packs later):

- Storage key: `clevertree.room.theme` — `system` (default / absent) | `light` | `dark`
- `.room` gets `data-theme-pref` (stored) and `data-theme` (resolved light/dark) + `color-scheme` — **not** on host `<html>`
- OS changes update the room live while pref is `system`
- Host sites (e.g. MyProblem) keep their own key (`myproblem.theme`)
- Design SoT: [`design/clevertree-chat-kit/`](../../design/clevertree-chat-kit/)

Sync copies into MyProblem at `public/chat-room/` after room UI changes (include `themes/`).
