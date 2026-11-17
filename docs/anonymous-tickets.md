# Anonymous tickets — UUID capability, free recover, regional git SoT

Tickets are **anonymous by default**. Each Problem is keyed by an unguessable **`ticket_uuid`** (API + private device transfer). **Public share links use a short live slug only** (`/t/<slug>`). Durable recovery is optional and **always free**: secret recover email and/or register. Pure anon must warn that **losing the phone (without local backup or recover email) loses those tickets**.

Related: [`projects.md`](./projects.md) · [`apk-ticket-ux.md`](./apk-ticket-ux.md) · [`pii-and-privacy.md`](./pii-and-privacy.md) · [`intake-batch-infra.md`](./intake-batch-infra.md) · [`infra-definition.md`](./infra-definition.md) · [`clevertree-chat.md`](./clevertree-chat.md) · plan [`06-infrastructure.md`](../../relay/clevertree-llc-plan/06-infrastructure.md).

---

## One-sentence rule

> **Anon = device + local backup of UUIDs; public web uses temporary live slugs (API resolve only); attach a free recover email or register if you don’t want a lost phone to lose your tickets. Dossier lives in a regional Relay git tip (text + media links); audio/stills live off-repo. No PII on the server tip.**

---

## Live slugs (public permalink) vs private UUID

| | Live slug | `ticket_uuid` |
|---|---|---|
| **Public URL** | Yes — `/t/<slug>` only | **No** — never in share UI, OG, or address bar |
| **Lookup** | Intake `GET /api/slugs/:slug` (one at a time) | Tip APIs / claim paths |
| **Map SoT** | Private Relay file `live-slugs.json` per region (repo **not** world-readable) | Tip path key |
| **Kill switch** | Drop row on solved / closed / TTL / revoke → public link **404** | May still reach preserved tip with uuid+claim privately |

- Mint on create; return `slug` + `ticket_uuid` + `claim` to the creator client only.
- Web vault (`localStorage`) stores private uuid + current slug on-device. No server ticket directory.
- Ticket pages are `noindex`; `/t/` is disallowed in robots.

## Resolution (problem solved?)

- Tip field `resolution`: `unsolved` \| `solved` (default `unsolved`).
- **Only batch SI** sets it (ops `POST /api/tickets/:id/resolution`). Live clients get `403` if they try PATCH.
- Humans claim fixes in Clevertree Chat; rule sheets decide validation + **raiser weight** ([`clevertree-chat` defaults](../../clevertree-chat/docs/default-rules.md) · [`comments-rules.myproblem.md`](../../myproblem-tickets/schema/comments-rules.myproblem.md)).
- On `solved`, live slug is dropped.

Tip also stores `raiser_visitor_id` at create for rule-sheet weight — not a public identity.

---

## Identity ladder

| Mode | What the user has | Lose phone alone? | Anonymous? |
|---|---|---|---|
| **Pure anon** | APK/web local backup of ticket UUIDs (+ live slug while mapped) | **Yes — tickets gone** (must warn in UI) | Yes |
| **Recover email** | Secret email on server (not public); magic link / OTP | No — reclaim via inbox | **No** (exits pure anon) |
| **Registered** | Free account linked to same tip ids | No — sign in on new device | **No** |

- **$0** to attach recover email or register. Never paywall recovery.
- Recover email stays **secret** (ops/support only; not on public timeline or KB).

### Server vs APK / web

| Layer | Role |
|---|---|
| **`ticket_uuid`** | Private capability + tip path — **not** listable, **not** public URL |
| **Live slug** | Public share id for `myproblem.app/t/[slug]`; SI suggests topical kebab slug after context is clear (originality vs existing); human may edit; uuid remains durable. `GET /api/slugs/:slug` + seed fallback for pilots |
| **Region** | `georgia` \| `israel` — which Relay tickets repo |
| **APK / web local vault** | Offline safety net (UUID + slug list + optional client PII vault) |
| **Recover email / account** | Cross-device durable root when user opts out of pure anon |

---

## Storage split (regional git + cheap blobs)

```
APK / web (anon or identified)
   │  stills + audio Evidence (never video files); pick region
   ▼
ticket_uuid ──► regional Relay git tip = Problem dossier SoT
   │              tickets/<uuid>/tip.json + jobs/*.json (commits)
   │              NO public list / tree browse
   └──► Object store / ephemeral cache
            audio + still blobs; tip stores URI + hash only
```

| Store | Holds | Does not hold |
|---|---|---|
| **Regional git tip** | Safe problem file, timeline, Evidence **links**, job files | Binaries; raw PII; UUID directories |
| **Object store / cache** | Audio + still bytes | Dossier semantics |
| **Client vault** | Real names/addresses/phones | Never synced to tip by default |

Two repos: **`myproblem-tickets-georgia`**, **`myproblem-tickets-israel`**.

Prefer **Bunny** (or peer CDN/object) for $/GB. See [`05-spend-and-use-of-funds.md`](../../relay/clevertree-llc-plan/05-spend-and-use-of-funds.md).

---

## Anti-enumeration

- Exact-path GET only: `tickets/<uuid>/…` (private API)
- No directory index, search across tips, or “list open tickets” API
- No bulk live-slug map download — `GET /api/slugs/:slug` only
- Wrong UUID or expired slug → `404`
- A **published** human-handoff post is a separate redacted file. `GET /api/public/posts` lists those posts only. It is not a list of private tickets. The claim stays secret.

---

## Retention

- Default `preserve: false`. Creator may explicitly **preserve**.
- **Close** without preserve → delete tip tree + linked media.
- **Close** with preserve → tip stays `closed` in repo.
- Relay mesh trims git history (~48h). Offline master backup for integrity only — see [`intake-batch-infra.md`](./intake-batch-infra.md).

---

## Media rules

| Allowed on ticket | Forbidden server-side |
|---|---|
| Worthy/unique **stills** (APK gate + rate limit) | **Video files** / server-side video analysis |
| **Audio** Evidence → batched ASR | Client `/api/transcribe` |
| Local camera preview (never uploaded as video blob) | Pinning blobs inside the git tip |

See [`pii-and-privacy.md`](./pii-and-privacy.md) · [`progressive-transcription.md`](./progressive-transcription.md).

---

## Notify (deferred Projects)

| Mode | How user learns batch finished |
|---|---|
| Pure anon | In-app poll via local UUID; no email |
| Recover email / account | Optional email + in-app; push later |

---

## Product copy (canonical)

- Tickets start anonymous; **UUID is the key** — we never publish a public ticket list.
- Lose phone without recover email or register → tickets can be gone — we say so up front.
- Recover email or register is **free**.
- Investigation files live in regional Relay git; recordings live in cheap object storage.
- We don’t put your home address or full name on the shared ticket ([`pii-and-privacy.md`](./pii-and-privacy.md)).
