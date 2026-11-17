# Ephemeral media (audio / stills)

**Repos and Relay tips hold text + links only — never durable audio/video blobs.**

## Hard rules

| Rule | Detail |
|------|--------|
| Device is master for playback | Audio/video stays on the phone for Play / re-upload. Server does not keep a library of clips. |
| Upload = queue fuel | APK posts bytes to Intake; Intake **caches** under a temp path and enqueues `asr` / `vision`. |
| Batch reads the cache | Batch (or Groq from Intake) processes the temp file, writes **transcript / OCR text** onto the tip. |
| Purge after success | After the job is `done`, Intake **deletes** the temp file and clears `evidence.uri` (keep `sha256`, `kind`, ids). |
| No media in git | `*.wav` / `*.mp3` / `*.m4a` / `*.bin` under fixtures and `.data/` stay gitignored. Catalogs + goldens are text. |
| No video Evidence | Stills only. Preview buffers never leave the device as video files. |
| Bunny live stills (public) | After **scrub**, stills for a **live** public tip may use Bunny CDN URLs (`bunnyMedia.mjs`). **Expire/delete** when ticket is solved, public post removed, or that Evidence is removed. Public pages never link raw uploads. |
| Pilot static | Manual scrubbed crops under `public/pilot/<slug>/` on myproblem.app until Bunny is wired. |

## Tip Evidence shape (after process)

```json
{
  "id": "…",
  "kind": "audio",
  "uri": "",
  "sha256": "…",
  "processed": true,
  "purgedAtMs": 1730000000000,
  "atMs": 1730000000000
}
```

Transcript / OCR rows are **text** Evidence (`kind: "transcript"`) — those stay on the tip forever.

## Reprocess

See [`progressive-transcription.md`](./progressive-transcription.md) § Reprocess.

- First pass: always allowed when new `audio` / `still` arrives.
- Later: only when **new context** would change the outcome (gate).
- Who may ask: **user** (explicit) or **APK on-device LLM** (suggestion). Server still runs the gate; no blind re-ASR.

## Cache locations

| Host | Path |
|------|------|
| Intake Spot | `$TICKETS_DATA_DIR/../cache/<ticket>/<evidenceId>` (emptyDir — dies with pod) |
| Local / Docker | `.data/cache/…` |
| Vercel in-process | Prefer proxy to Intake; if local, `/tmp/myproblem-cache/…` (ephemeral per instance) |

## Scrub before public

Batch must blur/remove faces, bodies, street numbers, plates, and strip EXIF before Bunny or public links (`stillScrub.mjs` · [`fixit/batch-prompt-pack.md`](./fixit/batch-prompt-pack.md)). Fail closed.

## Related

- [`intake-batch-infra.md`](./intake-batch-infra.md)
- [`progressive-transcription.md`](./progressive-transcription.md)
- [`apk-ticket-ux.md`](./apk-ticket-ux.md)
- [`fixit-and-repair.md`](./fixit-and-repair.md)
