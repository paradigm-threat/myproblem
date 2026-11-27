# MyProblem X (browser extension) — gather engine (legacy UI)

Session-bound capture + human-approved reply paste for locked social feeds (Nextdoor pilot).

**Networker chat + Refresh UI (canonical):** load unpacked from CleverTree Chat  
`/home/ari/dev/clevertree-chat/fronts/relay-extension`  
(shared room component in `fronts/room/`). Do **not** fork a second chat UI here.

This folder still holds the **gather / deep-capture / upload** content-script engine until Relay’s background fully owns those jobs. Product page: [https://myproblem.app/extension](https://myproblem.app/extension)

## Load unpacked (Chrome) — gather-only / legacy panel

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Preferred:** Load unpacked → `/home/ari/dev/clevertree-chat/fronts/relay-extension`  
   **Legacy gather Lab UI:** Load unpacked → this folder:  
   `/home/ari/dev/myproblem/extensions/capture`
4. Pin **MyProblem X** from the puzzle-piece menu (icon only enables on social hosts — see `lib/social-hosts.js`)
5. In a normal Chrome window (not the Cursor browser), open Nextdoor **logged in**
6. Open the group: `https://nextdoor.com/g/z0m2zzlro/` (Savannah Stray Cats)
7. Use **Fix connection** in the side panel (or F5) so the content script attaches
8. Click the extension icon on a Nextdoor tab (side panel opens; greyed/hidden on non-social tabs)
9. Scroll the feed so posts are visible → **Capture this page**
10. If threads look wrong/empty → **Copy debug for Cursor** → paste into Cursor chat

After any extension code update: `chrome://extensions` → MyProblem X → **Reload**, then F5 the Nextdoor tab again.

## Side panel

| Action | Purpose |
|---|---|
| Capture this page | Harvest visible cards + full DOM debug session |
| Deep capture | Expand see more; prefer open post; walk feed opening each thread |
| Mark ready | Package scrubbed `myproblem.capture_batch.v1` locally (no upload) |
| Resubmit / Validate | Re-walk or reclassify every post; refresh gates/stats |
| Upload to server | Enabled only when ready + new outbound; Intake stub for now |
| Probe DOM only | DOM/testid/selector inventory without merging new threads |
| Copy debug for Cursor | Clipboard JSON: probe, errors, gaps — paste into Cursor |
| Export JSON | Scrubbed v1 batch JSON only |
| Fetch media now | Download ticket media into local IndexedDB (SW fetch) |
| Export ZIP (JSON + media) | One STORE zip: `batch.json` + `media/<threadId>/…` |
| Upload to server | Gated stub → Intake multipart inbox (Bunny key server-side) |
| Import batch JSON | Merge Cursor/batch output including `reply_templates` (v0 or v1) |
| Paste into page | Inject template into composer (clipboard fallback) |

Each post is a ticket candidate (`gate: ticket` or `outlier`). Outliers appear in channel stats only. Deferred video is Batch-only ([docs/ephemeral-media.md](../../docs/ephemeral-media.md)).

## Debug session (required iteration loop)

Every Capture/Probe stores `last_dom_probe` with:

- login-gate hints (logged out?)
- selector hit counts
- top `data-testid` / `role` inventory
- truncated `outerHTML` + CSS path samples of candidate cards
- GraphQL/API op names seen
- extract errors / zero-thread cases

**You paste that into Cursor; we update selectors; you Reload + try again.** That is the supported way to tune against Nextdoor’s locked DOM.

## Honest Limits

- Never auto-sends replies
- Scrubs phones, emails, payment handles, street-like lines before export
- Headless login scrape / bot farms are out of policy

Docs: [`../../docs/capture-extension.md`](../../docs/capture-extension.md) · [`../../docs/social-group-monitor.md`](../../docs/social-group-monitor.md)
