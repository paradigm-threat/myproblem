# Collection: Savannah Cat Rescue

| Field | Value |
|---|---|
| `collection_id` | `savannah-cat-rescue` |
| Machine entry | [`savannah-cat-rescue.json`](./savannah-cat-rescue.json) |
| Place | Savannah, GA (localized services) |
| Region tip home | `georgia` (`myproblem-tickets-georgia`) |
| Craft IRC | `#ga-savannah-cat-rescue` · WS `ga-savannah-cat-rescue` |
| Place KB | `myproblem-kb/georgia/services/community-animals/` |
| Alias | Former channel id `savannah-stray-cats` |
| Status | Collection live — group roster + topic union; **no post catalog** |

## Motivation

Help **Savannah** neighbors with cat problems in one coordinated place: health, strays, colonies, TNR, lost/found, rehome, supplies. Localize services to the city so helpers and clinics match the place — not a statewide dump. As we find more Savannah cat forums (Nextdoor and later others), they join this **collection** so we can sync them all.

## Use cases

- Cat **health** / medical / vet-path asks
- Lost, found, sightings
- TNR, colony care, feeding, relocate
- Rehome, foster, supplies, fundraiser, volunteer
- Helper debate on craft IRC (not a second Nextdoor comment system)
- Reply-assist drafts humans paste on the origin network

## Sync (all member groups)

| Event | Meaning |
|---|---|
| `session_capture` | Human opens a member group in MyProblem X; deep capture + scrub |
| `batch_organize` | Cursor/Spot batch files tips, topics, KB notes — no post id catalogs in git |
| `reply_assist_draft` | Useful-info / coordinate_soft templates from KB (ephemeral) |
| `human_origin_post` | Human sends on Nextdoor (or posts a MyProblem tip link) |
| `roster_add_group` | New Savannah cat group discovered → append to `groups[]` |

**Goal:** visit every member group regularly; look for updates; post updates when useful. Cadence is human + extension session; batch organizes.

## Member groups

| Site | Id | Name |
|---|---|---|
| Nextdoor | `z0m2zzlro` | Savannah Stray Cats :) |

More Savannah groups will be added here as found. Collection owns the roster; individual group files are not required.

## Honest limits

- No raw social dumps or post id lists in git
- Capture is session-bound (MyProblem X); not a bot scrape
- Origin replies stay on the social network; craft IRC uses `[[nd:group/post]]` tags
- Tip remote stays **georgia** — this collection is not a new tip repo

## Related

- [`../channels/EXTERNAL_ID.md`](../channels/EXTERNAL_ID.md)
- [`../../docs/social-group-monitor.md`](../../docs/social-group-monitor.md)
- [`../../docs/capture-extension.md`](../../docs/capture-extension.md)
- Historical samples (alias channel_hint): [`../capture-batches/savannah-stray-cats-sample.v1.json`](../capture-batches/savannah-stray-cats-sample.v1.json)
