# APK channel-first UX

Product home for the Android app: the **public Clevertree/IRC room** (default `#mp-general`), matching the website. Asking = talking in the room (type / speak / video → Bunny → channel post). Tips/tickets are created **only when AI/batch decides** they are needed — not on every ask.

Related: [`simple-max.md`](./simple-max.md) · [`anonymous-tickets.md`](./anonymous-tickets.md) · [`clevertree-chat.md`](./clevertree-chat.md) · web room mount `src/components/chat/PublicRoomMount.tsx`.

**Status:** APK shell in [`apps/android-testmode`](../apps/android-testmode). Room WebView → `https://myproblem.app/c/mp-general` (same as `/#room`). Chat API base `https://intake.myproblem.app`. Constants: `ChatEndpoints.kt` (aligned with `src/lib/contact.ts` + `src/lib/chat/channels.ts`).

**Design SoT:** [`design/ui-kit/`](../design/ui-kit/). Site tokens also in `src/styles/ui-kit-tokens.css` / FixIt.

### Phone E2E

CameraX keeps UIAutomator from reaching idle, so automated phone↔server checks use the debug broadcast receiver + script:

```bash
# device unlocked + USB debugging
bash scripts/e2e-phone-apk.sh
```

Legacy tip create → upload → sync remains available for debug receivers; it is **not** the product submit path.

---

## One-sentence rule

> **Room-first home; ask in `#mp-general` (type / speak / video); tickets only when the batch needs one; public chat + AI free forever.**

---

## Same product as the site

| Surface | Implementation |
|---|---|
| **Public room** | WebView of `/c/mp-general` (web CTA is `/#room`) — Clevertree room assets + Intake chat WS |
| **Submit** | In-room overlay → `/api/chat-media/upload` (Bunny) → `/api/chat/post` into active channel |
| **Tickets list** | Native secondary screen — batch-opened or legacy local drafts only |
| **Ticket detail / Networker** | Native FixIt Compose (tokens in `AppColors.kt` / `SiteLayout.kt`) |
| **Marketing / privacy / terms** | Browser link-out |

Do **not** restore tip-repo queue or “New ticket” as the foundation Asker path.

Shared FixIt tokens: navy `#070d18`, glass `#0f1a2c`, mint `#5fd4a4`, ticket blue `#4eb8ff`, gold `#f0c14b`. Phone &lt; 900px; ≥900px desktop arrangement for ticket detail.

## Roles: Asker (default) vs Networker (opt-in)

| Role | Default? | Job |
|---|---|---|
| **Asker** | Yes | Ask in the public room. Tickets appear later if batch opens one. |
| **Networker** | Opt-in | Keep **existing** tips moving: photos, action notes. Social gather → Relay Chrome [`/extension`](https://myproblem.app/extension). |

## Information architecture

| Screen | Purpose |
|---|---|
| **Onboarding** | Public room ready + optional Networker. |
| **Room (home)** | WebView of `#mp-general`. Primary ask path. |
| **Tickets** | Secondary list of open/archived tips — no mint CTA. |
| **Networker home** | Tips that need a photo/action; Relay Chrome link. |
| **Ticket detail** | Timeline for a tip the batch (or legacy path) already opened. |
| **Legacy new-\*** | Debug / E2E tip-mint only — not linked from product chrome. |
| **Test Mode** | Debug frame gate lab — not product home. |

---

## Narrative (copy if shown)

- Public chat + channel AI: **free forever**
- Private chat: paid lane later (funds infra + provider time) — do not tip-push on room home
- Donations for public utility — no tip-push CTAs

---

## Sync status (when a ticket exists)

Every ticket shows replication state separately from intake:

| Presence | Meaning |
|---|---|
| **Local only** | Never successfully registered on the server |
| **Online** | Has `serverTicketId` / tip; durable on server |

| Health | UI |
|---|---|
| **Synced** | Green — local rev == remote rev |
| **Local ahead** / **Uploading…** | Local mutations not yet acked |
| **Server ahead** / **Updating…** | Remote newer; auto-pull |
| **Syncing…** | Progress bar |
| **Sync error** | Did not finish within ~8s — message + Retry |

TicketsApi → `https://intake.myproblem.app` remains for syncing tips the batch opened. Do not call `createTicket` from Asker home.

---

## APK implementation notes

Module: [`apps/android-testmode`](../apps/android-testmode). Navigation: Onboarding → **Room** → Tickets / Ticket detail / Networker / Settings / Test Mode. Unit tests: `npm run test:android` (`:app:testDebugUnitTest`).
