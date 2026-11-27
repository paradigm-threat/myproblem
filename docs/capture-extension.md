# Relay — MyProblem capture extension

**Public page:** [https://myproblem.app/extension](https://myproblem.app/extension)  
**Networker UI (canonical):** CleverTree Chat [`fronts/relay-extension/`](../../clevertree-chat/fronts/relay-extension/) + shared room [`fronts/room/`](../../clevertree-chat/fronts/room/)  
**Gather engine (this repo):** [`extensions/capture/`](../extensions/capture/) — content scripts / Lab until Relay background owns gather end-to-end  
**Design kits:** `clevertree-chat/design/{relay-ui-kit,clevertree-kit}/`  
**Related:** [`social-group-monitor.md`](./social-group-monitor.md) · [`ephemeral-media.md`](./ephemeral-media.md) · [`pii-and-privacy.md`](./pii-and-privacy.md) · [`batched-agent-work.md`](./batched-agent-work.md) · [`clevertree-chat.md`](./clevertree-chat.md) · [`android-retired.md`](./android-retired.md)

**Simple Max:** one CleverTree room component (web / embed / side panel modes). Extension wraps it with always-on **Refresh**; embed never gets gather. MyProblem consumes CleverTree — do not fork a second chat UI here.

---

## One-sentence rule

> **Session-bound read-only gather while a Networker browses; each post is a ticket candidate; batch SI files topics; humans always edit and send. Not a bot scraper.**

---

## Why

Social feeds keep posts behind login and shut down bot scrapers. Important posts also get buried. Relay automates gather **inside a real session**. Casual ask / record stays on the website **public room** (`/#room`) or APK — not in the extension.

---

## Install (load unpacked)

1. Chrome → `chrome://extensions` → Developer mode → **Load unpacked**
2. Select `extensions/capture`
3. Open a logged-in Nextdoor group → side panel → **Refresh / Gather** when stale

---

## Gather state machine

| State | UI |
|---|---|
| **Idle** | Up to date · secondary Refresh |
| **NeedsRefresh** | Notice with plain-language lookback (“About N days to catch up”) · primary **Refresh / Gather** |
| **Gathering** | Progress in panel + **max-z host-page overlay** (“Please wait”) |
| **Success** | New posts gathered · new topics counts |
| **Failed** | **Report problem** (one press → diagnostics) · Try again |
| **Lookback** | Since last refresh (default) · or 7 / 14 / 30 days for **next gather only** |

**Default lookback** = time since last successful gather for this device (proxy until tip-repo group commit age is wired). Cap ~30 days.

### Main tab

| Control | Behavior |
|---|---|
| Refresh / Gather | Deep capture walk; host overlay while running |
| Topics & threads | Session tickets / TNR matches; latest first |
| Craft room | Prepends `[[nd:group/post]]`; Clevertree WS → IRC `#ga-savannah-cat-rescue` |
| Foot links | Submit on website · Clevertree Chat |

**Lab tab** — Capture page, Mark ready, Validate, Upload, Probe, Copy debug, Export, media ZIP, Import, Clear. Raw JSON stays here.

**Never auto-sends. Never auto-uploads.**

External ids: [`../content/channels/EXTERNAL_ID.md`](../content/channels/EXTERNAL_ID.md) · collection [`../content/collections/savannah-cat-rescue.json`](../content/collections/savannah-cat-rescue.json)

---

## Reply policy (non-spam)

- Templates from batch / tip / KB — helpful, specific, no fake urgency
- Prefer public MyProblem / channel links
- Soft-stop on harassment / poison vigilantism
- Human edits before send — always

---

## Schema sketch

See [`social-group-monitor.md`](./social-group-monitor.md) export `v1`. Each post is one ticket unit with `external_ref`.

### Media download

Session media may be stored locally for batch packaging; batch picks useful stills for public tips ([`ephemeral-media.md`](./ephemeral-media.md)).
