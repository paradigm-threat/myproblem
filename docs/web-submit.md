# Web ticket submit (`/submit`)

Browser intake for MyProblem tickets. **Max and simple** — same tip model as the APK.

**Design SoT:** [`design/ui-kit/`](../design/ui-kit/) (tokens, icons, `screen-board.html` screens 02–03).

## Flow

1. `POST /api/tickets` with `mint_slug: false` (private tip + claim).
2. `PATCH /api/tickets/:id` — description (title = first non-empty line, or “Untitled problem”).
3. Optional media (≤ **5** audio/video files total):
   - **Record** — one continuous clip; mic/camera toggles mid-session; Teams-like.
   - **Upload** — audio and/or video files.
   - `POST /api/tickets/:id/evidence` — multipart → Intake JSON+base64. Video uses `kind: video`, `lane: batch`, `scrubbed_locally: false`.
4. Optional: `POST /api/tickets/:id/suggest-slug` with `apply: true` for a public `/t/<slug>`.
5. Remember uuid + claim + slug in on-device vault.

## Copy (honest media)

Anonymous by default. Media goes through Intake → **Bunny** temporary storage. Batch SI processes then **deletes**; lasting keep = reduced choice stills only.

## Public slug (opt-in)

- Checkbox warns: others with the link can view/comment while the slug exists.
- Owner may **unpublish** — public link 404s; tip remains.
- **Never** put `ticket_uuid` in public nav, share CTAs, OG, or the address bar.

## Networkers

Casual Askers use `/submit`. **The primary way to be a Networker** is the **Relay** browser extension ([`/extension`](https://myproblem.app/extension)) — garden-wall gather cannot run in the APK. Site nav labels that path “Networkers.”

Related: [`anonymous-tickets.md`](./anonymous-tickets.md) · [`ephemeral-media.md`](./ephemeral-media.md) · [`apk-ticket-ux.md`](./apk-ticket-ux.md) · [`capture-extension.md`](./capture-extension.md).
