# Fixit Batch prompt pack (copy when remotes are minted)

Use with `myproblem-tickets-fixit` / `myproblem-kb-fixit` after a human mints remotes.

## Still scrub (before Bunny / public)

See `myproblem-tickets/workers/lib/stillScrub.mjs` — `STILL_SCRUB_INSTRUCTIONS`.

- Blur faces, bodies, street numbers, mailboxes, plates; strip EXIF.
- Fail closed if unsure; ask for box-only re-crop.
- Never publish raw uploads.

## Public slug

After context is clear, call Intake `POST /api/tickets/:id/suggest-slug` (optional `apply: true` with edited slug). Topic + originality; human may override.

## Local resources

See `workers/batch/local-resource-research.mjs`. Cite forums and local pages into place KB (`georgia`) or craft KB (`fixit`). No boosting.

## Ticket-for-humans

Primary artifact is a trimmed tip for human review ([`../fixit-and-repair.md`](../fixit-and-repair.md)). Generic SI framing only; no licensed how-to as the product answer.

## Bunny TTL

Upload scrubbed stills via `bunnyMedia.mjs`. Expire on solve / unpublish / Evidence remove.
