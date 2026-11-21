# Fixit Batch prompt pack (copy when remotes are minted)

Use with `myproblem-tickets-fixit` / `myproblem-kb-fixit` after a human mints remotes. Same media rules apply on georgia / israel homes ([`../ephemeral-media.md`](../ephemeral-media.md)).

## Still scrub (before Bunny / public)

See `myproblem-tickets/workers/lib/stillScrub.mjs` — `STILL_SCRUB_INSTRUCTIONS`.

- Blur faces, bodies, street numbers, mailboxes, plates; strip EXIF.
- Fail closed if unsure; ask for box-only re-crop.
- Never publish raw uploads.
- Subject animals/objects (e.g. a kitten being rehomed) may stay visible when they are not identity-bearing.

## Video → unique frames (deferred / social inbox)

When Evidence `kind: video` (or other motion media) arrives in the **Batch inbox** — never on the realtime SEND path:

1. Sample frames (prefer scene changes / sharpness; drop near-duplicates and useless blur).
2. Choose the **minimal unique set** the public tip needs. Example: one clear frame of a cat from a blurry phone video is enough; do not keep the whole video.
3. Run **still scrub** on chosen frames (people/plates/streets fail closed; subject animal may remain).
4. Call Intake `POST /api/tickets/:id/choice-media` with `{ "choice_ids": [...], "confirm_scrubbed": true }`.
5. **Delete** the source video (and unused extracted frames) from cache / Bunny inbox after choice finalize.
6. Tip + public page link **only** the Bunny still CDNs.

Job family name: `media_frame_select`.

## Public slug

After context is clear, call Intake `POST /api/tickets/:id/suggest-slug` (optional `apply: true` with edited slug). Topic + originality; human may override.

## Local resources

See `workers/batch/local-resource-research.mjs`. Cite forums and local pages into place KB (`georgia`) or craft KB (`fixit`). No boosting.

## Ticket-for-humans

Primary artifact is a trimmed tip for human review ([`../fixit-and-repair.md`](../fixit-and-repair.md)). Generic SI framing only; no licensed how-to as the product answer.

## Bunny / choice stills

1. **Realtime:** APK nominates clear + unique frames (`choice: true` on evidence) — cache only.
2. **Deferred:** social/extension (or other) uploads video/audio/still/other into inbox — cache or private Bunny path; not public.
3. After frame-select (if needed) + scrub, call Intake `POST /api/tickets/:id/choice-media` with `{ "choice_ids": [...], "confirm_scrubbed": true }`.
4. That uploads **only** those stills to Bunny using the tip repo’s `media-upload.json` (`path_prefix` georgia|israel|fixit; shared zone for now). Unused cached stills **and unused video/audio** are deleted.
5. Expire on solve / unpublish / close via `bunnyExpireTicketMedia`.
