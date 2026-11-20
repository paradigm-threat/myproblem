# External forum ids (`[[nd:…]]`)

**Scope:** Per tip/region repo (like Bunny `media-upload.json`) — **not** a Relay-global UUID space.

**Defaults:** [`myproblem-tickets/schema/forum-platforms.defaults.json`](../../../myproblem-tickets/schema/forum-platforms.defaults.json)  
**Georgia:** [`myproblem-tickets/regions/georgia/forum-platforms.json`](../../../myproblem-tickets/regions/georgia/forum-platforms.json)

## Wire tags

| Context | Tag | URL |
|---|---|---|
| Post in group | `[[nd:{group}/{post}]]` | `https://nextdoor.com/g/{group}/` + `https://nextdoor.com/p/{post}` |
| Group only | `[[ndg:{group}]]` | `https://nextdoor.com/g/{group}/` |

Example: `[[nd:z0m2zzlro/rsd3LCfX2fB2]]`

## Parse

1. Match `\[\[(ndg?):([^\]]+)\]\]`.
2. If `ndg` → body is `{group}`.
3. If `nd` → split body on first `/`: left = group, right = post (post may contain `-` / `_`).
4. Drop query/hash when building URLs.

## UI

- Composer **prepends** the full tag when group/post context is known.
- Display as a **link icon** only (`hide_raw_tag`); do not show the raw string as chrome.
- Scrub/filter tags out of ordinary paste so they are not mistaken for content.

## Privacy

Do **not** commit post id catalogs into tip/KB/channel git. Tags are ephemeral (IRC/WS/session). **Collections** store the group roster + topic union only.

## Craft IRC

Savannah Cat Rescue collection: `#ga-savannah-cat-rescue` / WS `topic=ga-savannah-cat-rescue` (repo `ga` + collection slug — see georgia `forum-platforms.json` and [`../collections/savannah-cat-rescue.md`](../collections/savannah-cat-rescue.md)).
