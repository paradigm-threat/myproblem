# Web ticket submit (`/submit`)

Browser intake for MyProblem tickets. Same tip model as the APK; v1 is **simple** (title, description, photos, optional public slug). Capture UX parity with the app (audio, live questions) is later — see [`dev.md`](./dev.md).

## Flow

1. `POST /api/tickets` with `mint_slug: false` (private tip + claim).
2. `PATCH /api/tickets/:id` — lock title/description (claim required).
3. `POST /api/tickets/:id/evidence` — stills on the realtime web path (multipart → Intake JSON+base64). Deferred video uses Batch inbox ([`ephemeral-media.md`](./ephemeral-media.md)).
4. Optional: `POST /api/tickets/:id/suggest-slug` with `apply: true` for a public `/t/<slug>`.
5. Remember uuid + claim + slug in on-device vault.

## Public slug (opt-in)

- Checkbox warns: others with the link can view/comment while the slug exists.
- Owner may **unpublish** (`POST /api/tickets/:id/unpublish-slug`) — public link 404s; tip remains.
- **Never** put `ticket_uuid` in public nav, share CTAs, OG, or the address bar. UUID may show on the owner success screen and in internal session UI.

## Asset lifecycle

**Delete ticket or mark resolved → delete uploaded assets (including photos)** unless instructions say otherwise.

- Close (claim): purge evidence URIs + tip (unless `preserve`).
- Solved (batch/ops): drop live slug + Bunny expire for tip media.

Related: [`anonymous-tickets.md`](./anonymous-tickets.md) · [`ephemeral-media.md`](./ephemeral-media.md) · [`fixit-and-repair.md`](./fixit-and-repair.md).
