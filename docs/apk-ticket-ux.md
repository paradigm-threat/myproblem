# APK ticket-first UX

Product home for the Android app **beyond Test Mode**: open-ticket list, big **New ticket**, onboarding-chosen start mode, multimodal Evidence, and a ticket **timeline** that feels competitive with modern LLM apps — without pretending frontier answers are instantaneous.

Related: [`anonymous-tickets.md`](./anonymous-tickets.md) · [`progressive-transcription.md`](./progressive-transcription.md) · [`projects.md`](./projects.md) · [`capture-guidance.md`](./capture-guidance.md) · [`context-for-server.md`](./context-for-server.md).

**Status:** UX contract + APK shell (local drafts). Server Evidence upload / intake worker not wired yet.

---

## One-sentence rule

> **Ticket-first home; New ticket jumps into your chosen start mode; stream Evidence; server intake names the Problem or asks you to type; deep work is a batched Project.**

---

## Information architecture

| Screen | Purpose |
|---|---|
| **Onboarding** | Pick default start mode: Text / Audio / Audio+frames. Anon warning; recover email later. |
| **Home** | **Open** tickets only (title, status chip, last update). Closed/archived hidden (Settings → Show archived). Big **New ticket**. Menu: Settings, Test Mode (debug). |
| **New ticket** | Immediately enters the sticky start mode’s surface. |
| **Ticket detail** | Timeline of Evidence + server cards; compose to add text / mic / stills. |
| **Manual fill** | When intake returns `needs_user_text` — title + description; re-queue intake. |
| **Test Mode** | Debug frame gate lab — not product home. |

### Sticky start mode

Chosen once in onboarding; stored in prefs; editable in Settings. Long-press **New ticket** (or Settings “Start with…”) can override for one create in a later polish pass; v1 honors the sticky default only.

---

## Three start modes

### Text only
- Form: **title first**, then description / what you tried.
- Local draft until Send → create ticket + text fields (later: `POST` ticket).
- No mic/camera until user adds them on detail.

### Audio only
- New ticket **starts mic** after permission (also: pick audio file).
- Stop → create ticket → post **audio Evidence** → server `asr_job` ([`progressive-transcription.md`](./progressive-transcription.md)).
- User may **Add details** anytime or wait for intake.
- Insufficient after transcript → Manual fill.

### Audio + frame analysis
- Starts mic + camera **stills** path (Preview + ContextBuilder).
- **Never** mux or upload video files — unique/worthy JPEGs only.
- VL/intake may name from a clear still alone (e.g. flat tire); else Manual fill.

---

## Upload and intake

Stream Evidence as produced (audio stop, worthy still, text patch). Cheap **intake** (not full Project):

| Outcome | Client |
|---|---|
| `named_and_questions` | Title + summary + 1–3 question chips |
| `advice_ready` | Actionable advice card; Project optional |
| `queue_project` | Honest ETA; large LLM batch ([`projects.md`](./projects.md)) |
| `needs_user_text` | Manual fill sheet |

---

## UX principles

- One thumb: Home → New ticket → capture/type → timeline.
- Optimistic local feedback while ASR/intake pending.
- Honest chips: `Listening` / `Transcribing` / `Figuring out…` / `Investigating`.
- Questions as chips until `needs_user_text`.
- Open list = unfinished work; Close archives the ticket.

## Sync status (local vs online)

Every ticket shows replication state separately from intake:

| Presence | Meaning |
|---|---|
| **Local only** | Never successfully registered on the server |
| **Online** | Has `serverTicketId` / tip; durable on server |

| Health | UI |
|---|---|
| **Synced** | Green — local rev == remote rev |
| **Local ahead** / **Uploading…** | Local mutations not yet acked; auto-sync on every change |
| **Server ahead** / **Updating…** | Remote newer; auto-pull |
| **Syncing…** | Progress bar; should settle quickly |
| **Sync error** | Did not finish within ~8s — message + Retry |

Auto-sync runs on any ticket mutation. Behind badges are transient when online; offline / API-down → error without pretending the ticket is synced.

---

## APK implementation notes

Module: [`apps/android-testmode`](../apps/android-testmode) (shell + local store). Navigation: Onboarding → Home → Ticket detail / New-* / Settings / Test Mode. Local JSON ticket backup under app files; anon claim material TBD when API lands.
