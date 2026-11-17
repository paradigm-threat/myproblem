# Ephemeral media (audio / stills)

**Tips and Relay tips hold text + links only — never durable audio/video blobs.**

## Hard rules

| Rule | Detail |
|------|--------|
| Device is master for playback | Audio/video stays on the phone for Play / re-upload. Server does not keep a library of clips. |
| Upload = queue fuel | APK (or light always-on coach) posts **choice** stills — clear + meaningfully unique frames — to Intake as **cache only**. No Bunny on evidence POST. |
| Batch reads the cache | Vision/ASR process temp files; still **cache://** URIs are kept until Batch media finalize. |
| Batch links CDN | Only Batch calls `POST /api/tickets/:id/choice-media` with final `choice_ids` + `confirm_scrubbed: true`. That path uploads to Bunny and writes CDN URIs onto the tip. |
| Unused stills deleted | Still bytes not in `choice_ids` are purged by that Batch call (cache delete; accidental CDN objects removed). |
| Audio purge after ASR | After ASR `done`, Intake deletes the audio temp file and clears `evidence.uri`. |
| No media in git | `*.wav` / `*.mp3` / `*.m4a` / `*.bin` under fixtures and `.data/` stay gitignored. Catalogs + goldens are text. |
| No video Evidence | Stills only. Preview / video feed stays on device; only chosen JPEGs leave the phone. |
| Bunny live stills (public) | Per tip-repo [`media-upload.json`](../../myproblem-tickets/schema/media-upload.v1.json) (shared zone + `path_prefix`). **Expire/delete** on solve, unpublish, or close. Public pages never link raw uploads. |
| Pilot static | Manual scrubbed crops under `public/pilot/<slug>/` on myproblem.app as fallback. |

## Choice still flow

```
APK / light AI: clear + unique frame
   → POST /evidence { kind: still, choice?: true }   # cache only
   → vision job (OCR/text); cache:// kept
   → Batch scrub + pick winners
   → POST /choice-media { choice_ids, confirm_scrubbed: true }
   → Bunny PUT under repo path_prefix; unused cache deleted
```

Destination SoT is **per tip repo** (`regions/georgia|israel|fixit/media-upload.json`). One shared Bunny zone for now; each repo sets `path_prefix`. API key: Intake secret `BUNNY_STORAGE_API_KEY` only.

## Tip Evidence shape

**After ASR (audio):**

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

**After Batch choice-media (still):**

```json
{
  "id": "…",
  "kind": "still",
  "uri": "https://myproblem-stills.b-cdn.net/georgia/tickets/<uuid>/<id>.jpg",
  "sha256": "…",
  "processed": true,
  "choice": true,
  "scrubbed": true,
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
| Intake Spot | `$TICKETS_CACHE_DIR/<ticket>/<evidenceId>` (emptyDir — dies with pod) |
| Local / Docker | `.data/cache/…` |
| Vercel in-process | Prefer proxy to Intake; if local, `/tmp/myproblem-cache/…` (ephemeral per instance) |

## Scrub before public

Batch must blur/remove faces, bodies, street numbers, plates, and strip EXIF before setting `confirm_scrubbed` (`stillScrub.mjs` · [`fixit/batch-prompt-pack.md`](./fixit/batch-prompt-pack.md)). Fail closed — choice-media refuses CDN link without scrub confirmation.

## Related

- [`intake-batch-infra.md`](./intake-batch-infra.md)
- [`progressive-transcription.md`](./progressive-transcription.md)
- [`apk-ticket-ux.md`](./apk-ticket-ux.md)
- [`fixit-and-repair.md`](./fixit-and-repair.md)
