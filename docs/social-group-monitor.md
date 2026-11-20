# Social group monitor (extension-primary)

**Extension:** [`capture-extension.md`](./capture-extension.md) · [myproblem.app/extension](https://myproblem.app/extension)  
**Pilot collection:** [`../content/collections/savannah-cat-rescue.md`](../content/collections/savannah-cat-rescue.md) (Savannah Cat Rescue)  
**Tip home:** `myproblem-tickets/regions/georgia`  
**Related:** [`knowledge-base.md`](./knowledge-base.md) · [`topical-repos.md`](./topical-repos.md) · [`pii-and-privacy.md`](./pii-and-privacy.md) · [`clevertree-chat.md`](./clevertree-chat.md)

---

## Locked posture

| Rule | Detail |
|---|---|
| Extension-primary | Logged-out = no posts. Capture runs in the neighbor’s browser session. |
| No bot scrape | Platforms hunt bots; headless login harvest is forbidden. |
| Per-post ticket | Each social **post** is a ticket candidate — never one ticket for an entire group session. |
| Cursor-as-batch (Phase 1) | Export scrubbed JSON or Intake inbox → process `gate=ticket` in Cursor on the shared queue; Intake caches only until batch commits ([`batch-phases.md`](./batch-phases.md)). |
| PII scrub | Names/phones/streets/payment handles stripped before export or tips. |
| Reply-assist | Batch AI templates; human sends on the social network. |

---

## Access lanes

1. **MyProblem X** — in-view harvest + reply paste (primary)
2. **Interim paste/export** — trusted human paste into scrub path
3. **Partner Search API** — public “anyone” posts later (not group feed)
4. **Headless login** — out of policy

---

## Nextdoor notes (observed)

| Endpoint | Logged out |
|---|---|
| `GET /api/groups-public/{id}/` | Metadata only (name, members, about) — **no posts** |
| `POST /api/gql/*` | Persisted GraphQL; `getMe` → `me: null` when anonymous |

Authenticated feed cards are harvested from the **DOM** while scrolling. Selector failures emit **debug** for Cursor iteration.

---

## Curator rubric (ticket vs outlier)

**`gate: "ticket"`** when there is an open need MyProblem can help with (advice, coordination, local services). That post becomes **one tip/ticket** with `external_ref` (site + post id + URL).

**`gate: "outlier"`** for promo, memorial closures, empty hellos, off-topic spam (e.g. house cleaning in a cat group). Outliers stay in the capture session for **channel stats + a link** only — no tip mint, no topics, no reply-template batch — unless someone later opens Clevertree Chat on that URL on demand.

### Anonymized Savannah sample (member group: Stray Cats)

| Theme | Gate | Suggested topics / reason |
|---|---|---|
| Rehome / adopt kitten(s) | ticket | `rehome`, `local-services` |
| Missing cat (description + coarse area) | ticket | `lost-found` |
| Colony unsafe / need relocate | ticket (no doxx) | `colony-care`, `tnr` |
| “Is this your cat?” | ticket | `lost-found` |
| Mama + kittens need TNR | ticket | `tnr`, `volunteer` |
| Colony feeder wanted | ticket | `volunteer`, `colony-care` |
| Foster / supplies for rescue | ticket | `foster`, `supplies` |
| Injured community cat | ticket | `vet-path` |
| House cleaner / business promo | outlier | `off-topic` / `promo` |
| Memorial / goodbye update | outlier | `memorial` |
| `#reunited` | Close related tip / stats | `lost-found` |

### Reply-assist (useful info — not every post)

Batch may draft **ephemeral** reply templates for humans to paste on the origin network. Reply **bodies need not** live in git. What **must** live in the KB is the determination layer:

| Class | Action |
|---|---|
| `useful_info` | Draft from Georgia playbooks ([`myproblem-kb/.../community-animals/`](../../myproblem-kb/georgia/services/community-animals/page.md)) |
| `coordinate_soft` | Light process / channel pointer — helper match, not a clinic dump |
| `skip` | Promo, raffle, Amazon list, resolved found, repeat flyer, empty hello |
| `harvest_only` | Clinic/path named in comments → update **network** notes; usually no pile-on reply |

Gate detail: [`reply-assist-gate.md`](../../myproblem-kb/georgia/services/community-animals/reply-assist-gate.md). Network notes are **word of mouth / volunteer-reported** — cite-don’t-cache the open web; no boosting. Future trap volunteers for zones land under `community-animals/network/` as coordination capacity.

### Collection SoT + craft IRC (minimal)

| Layer | Holds |
|---|---|
| Collection ([`content/collections/savannah-cat-rescue.json`](../content/collections/savannah-cat-rescue.json)) | Localized **roster** of groups, topic **union**, `#ga-savannah-cat-rescue` / `ws_topic` — **no post catalog** |
| Forum platforms (per tip repo, like Bunny) | [`schema/forum-platforms.defaults.json`](../../myproblem-tickets/schema/forum-platforms.defaults.json) + [`regions/georgia/forum-platforms.json`](../../myproblem-tickets/regions/georgia/forum-platforms.json) |
| Origin ref tags | `[[nd:{group}/{post}]]` / `[[ndg:{group}]]` — see [`EXTERNAL_ID.md`](../content/channels/EXTERNAL_ID.md) |

A **collection** is not a category: it is the set of Savannah cat forums we sync regularly (health + strays/TNR/…). Alias `savannah-stray-cats` → this collection.

Cleverchat does **not** invent a second comment system for Nextdoor. Origin replies stay on Nextdoor; helper debate uses craft IRC via host WS. Tags are ephemeral; UI shows a link icon.

Topic vocabulary (session): `cat-health`, `lost`, `found`, `sighting`, `medical`, `tnr`, `rehome`, `foster`, `relocate`, `feeding`, `supplies`, `fundraiser`, `volunteer`, `colony-care` (plus outlier reasons).

---

## External post ↔ tip association

| Field | Meaning |
|---|---|
| `external_ref.site` | e.g. `nextdoor` |
| `external_ref.post_id` | Stable platform id when known |
| `external_ref.url` | Canonical `/p/…` (or best available) link |

One qualifying post → one georgia tip (when Intake/batch mints). Group/channel is **metadata** (`channel_hint`, `source`), not the ticket. Outlier posts are counted on the channel (`stats.by_reason`) without writing outlier bodies into the tip repo.

---

## Session lifecycle (local)

| Action | Behavior |
|---|---|
| Capture / Deep capture | Merge posts into the local session (draft). |
| **Mark ready** | Package scrubbed batch; set `status=ready`; stamp `ready_at` / `validated_at`; compute content hash. **No server upload.** |
| **Resubmit / Validate** | Re-walk / re-classify every post; bump `validation_pass`; refresh package. If content hash ≠ last upload → `upload.state=pending_new`. |
| **Upload to server** | Separate control. Enabled only when `status=ready` and there is new outbound work (`never` or `pending_new`). Multipart JSON + media → Intake cache / Bunny **inbox** (stub until wired). Extension never holds Bunny API keys. |
| **Export batch + media** | Scrubbed JSON plus locally downloaded image/video/audio sidecars for ticket-gate posts. |

### Media (local + Bunny)

- Ticket-gate posts may carry `media[]` (image / video / audio / other) downloaded in-session — **no local scrub** (`scrubbed_locally: false`). Outliers skip media by default.
- Upload path: Intake inbox → Batch `media_frame_select` / vision / ASR → choice stills on public Bunny → delete unused video/audio ([`ephemeral-media.md`](./ephemeral-media.md)).
- Public tip links **stills only**.

---

## Export schema `myproblem.capture_batch.v1`

```json
{
  "schema": "myproblem.capture_batch.v1",
  "channel_hint": "savannah-cat-rescue",
  "region_hint": "georgia",
  "source": { "site": "nextdoor", "group_secure_id": "z0m2zzlro", "group_name": "Savannah Stray Cats" },
  "captured_at": "ISO",
  "status": "ready",
  "ready_at": "ISO",
  "validated_at": "ISO",
  "validation_pass": 1,
  "upload": {
    "state": "never",
    "last_uploaded_at": null,
    "last_content_hash": null
  },
  "stats": {
    "ticket_count": 2,
    "outlier_count": 1,
    "by_reason": { "off-topic": 1 }
  },
  "threads": [
    {
      "id": "nd_…",
      "gate": "ticket",
      "skip": false,
      "body_redacted": "…",
      "external_ref": { "site": "nextdoor", "post_id": "…", "url": "https://nextdoor.com/p/…" },
      "suggested_topics": ["lost-found"],
      "value_rank": 0.8,
      "media": [{
        "id": "m1",
        "kind": "image",
        "source_url": "https://…",
        "local_name": "nd_…_0.jpg",
        "sha256": "…",
        "bytes": 12345,
        "scrubbed_locally": false
      }],
      "reply_templates": [{ "id": "r1", "tone": "helpful", "body": "…" }]
    },
    {
      "id": "nd_…",
      "gate": "outlier",
      "skip": true,
      "outlier_reason": "off-topic",
      "body_redacted": "Need a cleaner…",
      "external_ref": { "site": "nextdoor", "post_id": "…", "url": "https://nextdoor.com/p/…" },
      "suggested_topics": [],
      "value_rank": 0.05,
      "reply_templates": []
    }
  ],
  "debug": [{ "reason": "card_parse_failed", "url": "…", "notes": "…" }]
}
```

v0 imports remain accepted (`skip: true` → `gate: "outlier"`). Samples (historical filenames; treat `channel_hint` alias as `savannah-cat-rescue`): [`../content/capture-batches/savannah-stray-cats-sample.v1.json`](../content/capture-batches/savannah-stray-cats-sample.v1.json) · legacy [`../content/capture-batches/savannah-stray-cats-sample.v0.json`](../content/capture-batches/savannah-stray-cats-sample.v0.json).

---

## Clevertree mapping

- Tip UUID = debate topic on georgia home (ticket-gate posts only)
- Solution keys: `tnr`, `lost-found`, `rehome`, `foster`, `colony-care`, `supplies`, `volunteer`, `vet-path`, `local-services`, `useful-info`, `more-evidence`, `other`
- Outlier URLs may mount Clevertree Chat on demand without minting a tip
