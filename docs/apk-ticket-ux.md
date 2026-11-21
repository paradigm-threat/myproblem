# APK ticket-first UX

Product home for the Android app **beyond Test Mode**: open-ticket list, big **New ticket**, onboarding-chosen start mode, multimodal Evidence, and a ticket **timeline** that feels competitive with modern LLM apps — without pretending frontier answers are instantaneous.

Related: [`anonymous-tickets.md`](./anonymous-tickets.md) · [`pii-and-privacy.md`](./pii-and-privacy.md) · [`progressive-transcription.md`](./progressive-transcription.md) · [`intake-fixtures.md`](./intake-fixtures.md) · [`intake-batch-infra.md`](./intake-batch-infra.md) · [`projects.md`](./projects.md) · [`capture-guidance.md`](./capture-guidance.md) · [`capture-follow-up.md`](./capture-follow-up.md) · [`context-for-server.md`](./context-for-server.md).

**Status:** UX contract + APK shell. TicketsApi → **`https://intake.myproblem.app`** (regional git SoT; UUID = access; region georgia|israel). Vercel is marketing/APK only. Media is device-local + ephemeral server cache ([`ephemeral-media.md`](./ephemeral-media.md)). Capture surface: **Chat + Record** (Max and simple). Live realtime coaching is deferred.

### Phone E2E

CameraX keeps UIAutomator from reaching idle, so automated phone↔server checks use the debug broadcast receiver + script:

```bash
# device unlocked + USB debugging
bash scripts/e2e-phone-apk.sh
```

Flow covered: APK create → upload audio/still → wake → process/purge → reprocess gate (empty fail / context reupload) → sync pull.

---

## One-sentence rule

> **Ticket-first home; New ticket is Chat or Record; Record is one deferred clip (mic and camera toggles); the batch investigates thoroughly; deep work is a batched Project.**

**Max and simple:** two starts only. Live rolling stills / chunked realtime coaching is shelved ([`capture-follow-up.md`](./capture-follow-up.md)). The ticket screen shows **Understanding N%** and **Solution N%** once the server has scored the problem ([`confidence-gauge.md`](./confidence-gauge.md)). Solution stays “still learning the problem” while questions are open. Under the solution threshold the line says we are not confident enough to advise further. After the batch pass gives up, the line says a person should continue.

---

## Same design as the site

The app draws the FixIt screens itself. It does not load myproblem.app in a WebView.

Shared screens use the tokens in `src/styles/fixit-theme.css`: navy `#070d18`, glass `#0f1a2c`, mint `#5fd4a4`, ticket blue `#4eb8ff`, gold `#f0c14b`. A window under 900px is the phone layout. At 900px or wider, a ticket uses the desktop arrangement (content capped at 960, questions in two columns). The status card uses the same words as `src/lib/tickets/ticketStatus.ts`.

Camera, microphone, and the on-device ticket list stay native. Marketing, privacy, and terms stay on the website and open in the browser.

## Information architecture

| Screen | Purpose |
|---|---|
| **Home** | **Open** tickets only (title, status chip, last update). Closed/archived hidden (Settings → Show archived). Big **New ticket**. Menu: Settings, Test Mode (debug). |
| **New ticket** | Chooser: **Chat** / **Record** — then opens that mode. |
| **Ticket detail** | Timeline of Evidence + server cards; compose to add text. |
| **Manual fill** | When intake returns `needs_user_text` — title + description; re-queue intake. |
| **Test Mode** | Debug frame gate lab — not product home. |

---

## Two start modes (Max and simple)

### Chat
- Form: **title first**, then description / what you tried.
- Local draft until Send → create ticket + text fields.
- Camera and microphone stay off.

### Record
- One feed. **Mic** and **Camera** toggles; the person can turn video on mid-recording.
- Always one deferred **mp4** (`lane: batch`, `scrubbed_locally: false`). Camera off → black/covered preview feel; mic off → muted audio. Not a second start mode.
- Local ticket on Record start; **no** sync until Send. No rolling clips, no unique-frame gate, no live question band.
- Stop → Send uploads the file to the private batch inbox. Phone may keep the clip until Send finishes. Server copy is temporary; batch scrubs or deletes ([`ephemeral-media.md`](./ephemeral-media.md)).
- Follow-up capture instructions after batch: later ([`capture-follow-up.md`](./capture-follow-up.md)).

**Legacy:** old tickets may still be `AUDIO` or `AUDIO_FRAMES` (Live). Those modes are not on the chooser.

---

## Upload and intake

**Chat:** create on Send. **Record:** create server ticket on sync after Send, then upload `kind: video` with `lane: batch`.

Cheap **intake** outcomes after batch / ASR (not full Project):

| Outcome | Client |
|---|---|
| `named_and_questions` | Title + summary + 1–3 question chips |
| `advice_ready` | Actionable advice card; Project optional |
| `queue_project` | Honest ETA; large LLM batch ([`projects.md`](./projects.md)) |
| `needs_user_text` | Manual fill / clarify coach |

### Proposed vs locked fields

```json
{
  "title": { "value": "...", "source": "intake|user", "locked": false },
  "description": { "value": "...", "source": "intake|user", "locked": false },
  "coachLine": "Please state your problem."
}
```

Until `locked`, server/intake may revise. After user save, source=`user`, locked=true — never auto-overwrite (optional non-destructive “Suggested rename” later).

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
