# MyProblem X — capture extension

**Public page:** [https://myproblem.app/extension](https://myproblem.app/extension)  
**Code:** [`extensions/capture/`](../extensions/capture/)  
**Related:** [`social-group-monitor.md`](./social-group-monitor.md) · [`ephemeral-media.md`](./ephemeral-media.md) · [`pii-and-privacy.md`](./pii-and-privacy.md) · [`batched-agent-work.md`](./batched-agent-work.md) · [`clevertree-chat.md`](./clevertree-chat.md)

---

## One-sentence rule

> **Session-bound capture while a neighbor browses; each post is a ticket candidate; batch drafts reply templates for qualifiers only; humans always edit and send. Not a bot scraper.**

---

## Why

Social feeds keep posts behind login and shut down bot scrapers. Important posts also get buried or helpers get banned. MyProblem X automates what it can **inside a real session**, then keeps shared knowledge alive on MyProblem (Georgia tips + channels) so mutual aid continues if one person stays connected.

---

## Install (load unpacked)

1. Chrome → `chrome://extensions` → Developer mode → **Load unpacked**
2. Select `extensions/capture`
3. Open a logged-in Nextdoor group → side panel → **Capture this page** or **Deep capture**

---

## Side panel

**Main tab**

| Control | Behavior |
|---|---|
| Deep capture | Always available when connected. Prefers open post detail; on a group feed walks posts then returns |
| Current page / entry | Detects `/g/{group}` vs `/p/{post}`; loads collection SoT (topics + `#ga-savannah-cat-rescue`) or “No entry” |
| Topics | Chips from group entry; filter **session** posts (repo does not store post catalogs) |
| Craft room | Prepends `[[nd:group/post]]` (icon in UI); send via Clevertree `/api/chat` → IRC `#ga-savannah-cat-rescue` |
| Replies ready | Paste templates onto Nextdoor (human sends) |

**Lab tab** — Capture this page, Mark ready, Validate, Upload, Probe, Copy debug, Export JSON/ZIP, Fetch media, Import, Clear cache.

**Never auto-sends.** Paste only fills the box; the user clicks the platform Send. **Never auto-uploads.** Origin comments stay on Nextdoor — no Clevertree comment composer for those threads.

### Session lists

- **Ticket candidates** — `gate=ticket` posts (topics, value, templates)
- **Outliers** — promo / off-topic / memorial etc. (reason + link only; channel stats)

External ids: [`../content/channels/EXTERNAL_ID.md`](../content/channels/EXTERNAL_ID.md) · collection [`../content/collections/savannah-cat-rescue.json`](../content/collections/savannah-cat-rescue.json)
- **Stats strip** — `N tickets · M outliers (by reason)`

---

## Reply policy (non-spam)

- Templates from batch research / tip / KB — helpful, specific, no fake urgency
- Prefer public MyProblem / channel links over private contact dumps
- Soft-stop on harassment / poison vigilantism (safe relocation/TNR framing only)
- Human edits before send — always
- Outliers do **not** get reply templates unless someone later uses Clevertree Chat on that URL

---

## Schema sketch

See [`social-group-monitor.md`](./social-group-monitor.md) export `v1`. Each post is one ticket unit with `external_ref`. Threads carry `gate`, `suggested_topics` (ticket only), `value_rank`, optional `media[]`, optional `reply_templates[]`.

### Media download

- Harvest collects `img` / `video` / `audio` URLs from the card or open detail (what the session can already fetch).
- Ticket-gate posts download into extension storage; `scrubbed_locally: false` always for social/internet sources.
- Outliers do not download media by default.
- Caps: skip files over ~40 MB; note oversize in debug.
- Batch (later) picks unique frames from video, scrubs, publishes stills to Bunny, deletes unused video ([`ephemeral-media.md`](./ephemeral-media.md)).

---

## Nextdoor card roots (v0.1.2+)

Group feed cards use `data-testid="feed-item-card"` (not broad `[data-testid*="post"]`, which matches buttons/timestamps). Per card: `post-body`, `post-timestamp`, `author-test` / `author-children-test`, optional `/p/…` link and `#s_<id>` shell.

After selector changes: **Reload** the extension on `chrome://extensions`, hard-refresh the Nextdoor tab (F5), Capture again, then **Copy debug** if anything still looks off.

**Copy debug** (v0.1.4+) always re-probes the active Nextdoor tab before writing the clipboard, stamps `extension_version` from the live manifest, and sets `stale_probe_warning` if the probe still looks like the pre-`feed-item-card` selector era (~300 fragment “cards”). If status says STALE or `extension_version` is older than the badge in the side panel, you pasted an old clipboard — Clear cache, F5 the tab, Copy again. Expect ~40–50 `feed-item-card` roots on a scrolled group feed, not 300+.

**Capture re-run** (v0.1.5+): each Capture clears the in-page `SEEN` set so you don’t get `cards=43` / `threads=0` from `duplicate_skipped`. Background storage still merges by thread id. Clear cache also sends `MPX_CLEAR_SEEN` to the active Nextdoor tab.

**Deep capture** (v0.1.6+): best when a post is already open (as in the detail modal). Expands “… see more”, reads body + comments, stamps `capture_mode: "detail"`. From a group feed it clicks into up to 12 posts with a short pause between them — keep the Nextdoor tab focused; use **Stop deep** to abort. Does not auto-send replies.

**Deep capture UX** (v0.1.15+): button disables and shows **Deep capture…** while running; when finished it re-enables as **Recapture**. After a feed walk the side panel navigates back to the group feed (or hard-reloads) so stacked Nextdoor post modals clear. Status line reports success (`Deep capture OK · N threads`).

**Ready / Validate / Upload** (v0.1.7+): Mark ready packages locally; Resubmit revalidates; Upload is gated on new outbound content and stays stubbed until Intake.

**Connection pill** (v0.1.8+): green = content script live; red = missing; amber = no Nextdoor tab.

**Fix connection** (v0.1.10+): one in-panel button — inject script → if needed hard-reload the Nextdoor tab → if still dead, `chrome.runtime.reload()` the extension and finish attaching on reopen. No chrome://extensions / manual F5 required after the first Load unpacked.

**Media** (v0.1.11+): harvest downloads ticket-gate image/video/audio into local IndexedDB (`scrubbed_locally: false`). Upload stub posts multipart contract to Intake inbox (Bunny key server-side only).

**Local ZIP export** (v0.1.16+ / hardened v0.1.17): **Fetch media now** pulls ticket media via the service worker (`host_permissions`, no page CORS). **Export ZIP (JSON + media)** builds one STORE zip (`batch.json` + `media/<threadId>/…`) from IndexedDB — no recompress. Stats strip shows media file count. Prefer **Recapture** on the group feed (not detail-only) so `media[]` URLs exist before fetch/export.

**Social-only toolbar** (v0.1.12+): the action icon and side panel are **disabled** unless the active tab’s host is on the whitelist in [`extensions/capture/lib/social-hosts.js`](../extensions/capture/lib/social-hosts.js) (Nextdoor, Facebook, Instagram, X, Reddit, LinkedIn, TikTok, Discord, …). Capture scripts remain Nextdoor-first; other hosts only reveal the UI for future networks.

**Title + version** (v0.1.14+): Chrome’s side-panel chrome shows `MyProblem X · v…` from the manifest `name` (no in-panel version badge).

### Upload multipart contract (Intake — planned)

```
POST {INTAKE}/api/social-capture/upload
Authorization: (session / device token — TBD)
Content-Type: multipart/form-data

fields:
  batch: <myproblem.capture_batch.v1 JSON>
  file: <one part per media local_name, repeated>

→ 202 { inbox_ids[], ticket_hints[] }
→ Intake stores cache/private Bunny inbox; enqueues media_frame_select / vision / asr
→ Batch choice-media → public stills; purge unused video
```

Extension **never** receives `BUNNY_STORAGE_API_KEY`.

---

## Honest Limits

No headless login farms, no auto-comment spam, no raw PII in git exports, no automatic server upload, no local scrub of internet media, no realtime video on the APK SEND path.
