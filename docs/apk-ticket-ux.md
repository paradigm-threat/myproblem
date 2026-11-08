# APK ticket-first UX

Product home for the Android app **beyond Test Mode**: open-ticket list, big **New ticket**, onboarding-chosen start mode, multimodal Evidence, and a ticket **timeline** that feels competitive with modern LLM apps — without pretending frontier answers are instantaneous.

Related: [`anonymous-tickets.md`](./anonymous-tickets.md) · [`pii-and-privacy.md`](./pii-and-privacy.md) · [`progressive-transcription.md`](./progressive-transcription.md) · [`intake-fixtures.md`](./intake-fixtures.md) · [`intake-batch-infra.md`](./intake-batch-infra.md) · [`projects.md`](./projects.md) · [`capture-guidance.md`](./capture-guidance.md) · [`context-for-server.md`](./context-for-server.md).

**Status:** UX contract + APK shell. TicketsApi → **`https://intake.myproblem.app`** (regional git SoT; UUID = access; region georgia|israel). Vercel is marketing/APK only. Media is device-local + ephemeral server cache ([`ephemeral-media.md`](./ephemeral-media.md)).

### Phone E2E

CameraX keeps UIAutomator from reaching idle, so automated phone↔server checks use the debug broadcast receiver + script:

```bash
# device unlocked + USB debugging
bash scripts/e2e-phone-apk.sh
```

Flow covered: APK create → upload audio/still → wake → process/purge → reprocess gate (empty fail / context reupload) → sync pull.

---

## One-sentence rule

> **Ticket-first home; New ticket jumps into your chosen start mode; stream Evidence; server intake names the Problem or asks you to type; deep work is a batched Project.**

---

## Information architecture

| Screen | Purpose |
|---|---|
| **Home** | **Open** tickets only (title, status chip, last update). Closed/archived hidden (Settings → Show archived). Big **New ticket**. Menu: Settings, Test Mode (debug). |
| **New ticket** | Chooser: **Text** / **Audio** / **Audio + frame analysis** — then opens that mode. No onboarding start-mode gate. |
| **Ticket detail** | Timeline of Evidence + server cards; compose to add text / mic / stills. |
| **Manual fill** | When intake returns `needs_user_text` — title + description; re-queue intake. |
| **Test Mode** | Debug frame gate lab — not product home. |

---

## Three start modes (chosen per New ticket)

### Text only
- Form: **title first**, then description / what you tried.
- Local draft until Send → create ticket + text fields (later: `POST` ticket).
- No mic/camera until user adds them on detail.

### Audio only (live intake — no later Submit)
- Mic start → **create ticket UUID immediately** (server + local); audio/context stream to that id.
- While talking, **proposed** title/description update as understanding improves (server intake on chunks; APK shows them live).
- Stop via button or spoken **“stop recording”** → flush final audio; intake may still refine.
- User edit of title/description → **locked** (committed); auto-guess must not overwrite.
- No separate Submit — ticket is already on the server; light intake may hand off to Project queue.

#### Realtime status (coach + chip, lockstep)

| Stage | Chip | Coach | When |
|---|---|---|---|
| Listening (prompt) | Listening | **Please state your problem.** | Mic live, no usable partial yet |
| Listening (partial) | Listening | **Got it — keep talking to refine…** | First proposed title/desc |
| Listening (refine) | Listening | Refine + soft **Say “stop recording” when you’re done.** | Stronger draft while still recording |
| Transcribing | Transcribing | **Transcribing…** | Stop flushed; ASR finishing — **before** figuring out |
| Figuring out | Figuring out… | **Figuring out…** | Intake naming / questions |
| Clarify | Needs details | **Please clarify… / wait for server** | Too little audio or no title |
| Terminal | Questions / Advice ready / Investigating | Outcome summary | After intake decision |

**Timeliness:** never skip **Transcribing** into **Figuring out**; never return to Listening after stop.

**Timeline / log:** major ticket mutations only (opened, final audio, user lock, server title/questions/advice). Not every chunk or coach refresh. See [`intake-fixtures.md`](./intake-fixtures.md).

### Audio + frame analysis
- Starts mic + camera **stills** path (Preview + ContextBuilder).
- **Never** mux or upload video files — unique/worthy JPEGs only.
- VL/intake may name from a clear still alone (e.g. flat tire); else Manual fill.

---

## Upload and intake

**Immediate ticket** on Audio/AV start. Stream Evidence as produced (audio **chunks** ~2–4s + final, worthy still, text patch). Cheap **intake** (not full Project):

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
