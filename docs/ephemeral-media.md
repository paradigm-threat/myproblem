# Ephemeral media (two lanes)

**Tips and Relay tips hold text + links only — never durable raw video/audio blobs on the public tip.** Public pages link **Batch-chosen stills** on Bunny after processing.

## Two lanes

| Lane | What may leave the device / session | Scrub where? | Public tip links |
|---|---|---|---|
| **Realtime intake** (APK / web coach SEND) | **Stills only** (+ audio for ASR). **No video upload** on the live path. | On-device gate (unique/worthy frames) + **Batch scrub** before public | Choice stills only |
| **Deferred / social / Bunny inbox** | **Any file type** (video, audio, still, other) into Intake cache or private Bunny inbox | **Batch only** — no client scrub for internet-sourced media (bandwidth) | Choice stills only; unused video/audio/raw deleted |

Realtime avoids video because live hardware is small. Batch (Phase 1 Cursor / Phase 2 CPU + providers — [`batch-phases.md`](./batch-phases.md) · [`providers-ai.md`](./providers-ai.md)) may take its time: provider video/VL, pick unique frames, scrub, then publish stills via the repo’s **Bunny upload source**.

## Hard rules

| Rule | Detail |
|------|--------|
| Device / session is master until upload | Realtime: audio/preview stay on phone. Social: MyProblem X may download what the logged-in browser can already fetch into a **local** batch sidecar. |
| Upload = queue fuel | Evidence POST / social upload lands as **cache or private inbox** — not a public CDN link. |
| Batch reads inbox | Vision / ASR / **`media_frame_select`** (video) process temp files. |
| Batch links CDN | Only Batch calls `POST /api/tickets/:id/choice-media` with final `choice_ids` + `confirm_scrubbed: true`. That path uploads **choice stills** to Bunny and writes CDN URIs onto the tip. |
| Unused deleted | Still bytes not in `choice_ids`, and **video/audio/raw** sources Batch will not keep, are purged (cache + Bunny inbox). |
| Audio purge after ASR | After ASR `done`, Intake deletes the audio temp file and clears `evidence.uri` (unless Batch explicitly keeps a derivative). |
| No media blobs in git | Binaries stay gitignored. Catalogs + goldens are text. |
| No **realtime** video Evidence | Camera preview must not upload a video blob on the live SEND path. Deferred video is allowed via Batch inbox. |
| Bunny live stills (public) | Per tip-repo [`media-upload.json`](../../myproblem-tickets/schema/media-upload.v1.json) (shared zone + `path_prefix`). **Expire/delete** on solve, unpublish, or close. Public pages never link raw uploads or raw video. |
| Internet-sourced media | No local scrub in the extension (save bandwidth). Batch decides frames + scrub. |
| Pilot static | Manual scrubbed crops under `public/pilot/<slug>/` on myproblem.app as fallback. |

## Realtime choice still flow

```
APK / light AI: clear + unique frame
   → POST /evidence { kind: still, choice?: true }   # cache only
   → vision job (OCR/text); cache:// kept
   → Batch scrub + pick winners
   → POST /choice-media { choice_ids, confirm_scrubbed: true }
   → Bunny PUT under repo path_prefix; unused cache deleted
```

## Deferred video / social media flow

```
MyProblem X (or other deferred upload)
   → local download (session can already see the bytes)
   → Upload multipart → Intake cache / private Bunny inbox
        Evidence kind: video | audio | still | other
   → Batch job media_frame_select (video) / asr / vision
   → Pick minimal unique frames (e.g. one clear cat frame; drop blurry dupes)
   → Scrub people/plates/streets when required; subject animals/objects may stay
   → POST /choice-media { choice_ids, confirm_scrubbed: true }
   → Public tip links still CDNs only
   → Delete unused video/audio/raw inbox objects
```

Destination SoT is **per tip repo** (`regions/georgia|israel|fixit/media-upload.json`). One shared Bunny zone for now; each repo sets `path_prefix`. API key: Intake secret `BUNNY_STORAGE_API_KEY` only — **never** in the browser extension.

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

**Inbox video (before finalize — not public):**

```json
{
  "id": "…",
  "kind": "video",
  "uri": "cache://… or private Bunny inbox path",
  "sha256": "…",
  "processed": false,
  "source": "social_capture",
  "atMs": 1730000000000
}
```

After frame select + choice-media, the video Evidence row is purged (or `uri` cleared) like unused stills.

Transcript / OCR rows are **text** Evidence (`kind: "transcript"`) — those stay on the tip forever.

## Reprocess

See [`progressive-transcription.md`](./progressive-transcription.md) § Reprocess.

- First pass: always allowed when new `audio` / `still` / `video` inbox arrives.
- Later: only when **new context** would change the outcome (gate).
- Who may ask: **user** (explicit) or **APK on-device LLM** (suggestion). Server still runs the gate; no blind re-ASR.

## Cache locations

| Host | Path |
|------|------|
| Intake Spot | `$TICKETS_CACHE_DIR/<ticket>/<evidenceId>` (emptyDir — dies with pod) |
| Local / Docker | `.data/cache/…` |
| Vercel in-process | Prefer proxy to Intake; if local, `/tmp/myproblem-cache/…` (ephemeral per instance) |
| Private Bunny inbox | Same zone, non-public path prefix until choice-media promotes stills |

## Scrub before public

Batch must blur/remove faces, bodies, street numbers, plates, and strip EXIF before setting `confirm_scrubbed` (`stillScrub.mjs` · [`fixit/batch-prompt-pack.md`](./fixit/batch-prompt-pack.md)). Fail closed — choice-media refuses CDN link without scrub confirmation.

**Exception for subject matter:** when the ask is about an animal/object (e.g. rehome kitten) and the frame does not identify a person or private location, Batch may keep that subject visible. People and addresses still fail closed.

**Realtime device stills** may use on-device uniqueness gates; **internet-sourced** media skip client scrub.

## Related

- [`intake-batch-infra.md`](./intake-batch-infra.md)
- [`progressive-transcription.md`](./progressive-transcription.md)
- [`apk-ticket-ux.md`](./apk-ticket-ux.md)
- [`fixit-and-repair.md`](./fixit-and-repair.md)
- [`capture-extension.md`](./capture-extension.md)
- [`social-group-monitor.md`](./social-group-monitor.md)
