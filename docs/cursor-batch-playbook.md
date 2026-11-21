# Cursor batch playbook (Phase 1)

Operator checklist when Cursor is the Relay-wide batch SI (Spot Phase 2 uses the **same** steps).  
Canonical phases: [`batch-phases.md`](./batch-phases.md) — shared across MyProblem, QuizGate, and Clevertree; product tips differ, procedure and tool kit do not.

**Trigger:** human ask in Cursor **or** local cron that opens/resumes a drain session.

---

## Step 0 — Inventory all tips (required)

Before queue drain, list **every tip** in each configured remote:

| Remote | Tip means | Path pattern |
|---|---|---|
| `myproblem-tickets-georgia` / `-israel` / `-fixit` | Problem (repair / DIY / service) | `tickets/<uuid>/` |
| `quizgate-users` | User (progress over time) | `users/<uuid>/` |
| Clevertree comments SoT | Topic (forum room) | `pages/…` (or product mount of a foreign tip UUID) |

For each tip, record: id, status, evidence/jobs, public slug, last activity, whether it should be **curate**, **delete**, or **human-review**.

### Curation matrix

| Condition | Action |
|---|---|
| Empty Listening / empty title, no evidence, no public slug | **Delete** tip tree (+ cancel orphan jobs) |
| Closed + empty content | **Delete** |
| Open with evidence / body / slug / QuizGate day progress | **Curate** (run jobs, update standing files, confidence) |
| Ambiguous or PII-sensitive | **Human-review** list — do not silent-delete |
| Clevertree topic with no posts and no foreign bind | Flag orphan; delete only if policy says empty rooms may go |

### Clevertree UUID binding

A Clevertree room may use **another product’s tip UUID** (or a stable translation of an external id) instead of minting a new UUID. MyProblem/QuizGate tips thus double as chat rooms when mounted — one unified Relay unit.

---

## Before queue drain

1. Confirm workspace checkouts: private ticket remotes + public `myproblem-kb` (and QuizGate / Clevertree remotes as needed).
2. Confirm Bunny credentials / per-repo upload-source configs for remotes you will touch.
3. Finish Step 0 inventory + apply delete defaults.
4. Pull shared queue job list from Intake (or local cache mirror). Job shape:

```json
{
  "site": "myproblem|quizgate|clevertree",
  "kind": "string",
  "payload_ref": "intake://… or path",
  "media_refs": ["…"],
  "rules_ref": "repo rules / ticket rules path"
}
```

5. Prefer FIFO within site unless a job is marked emergency / blocked-on-human-mint.

---

## Per job (drain → commit queue)

Same steps whether this session is Cursor or Spot. Do **not** push remotes mid-drain.

1. **Load rules** from `rules_ref` (repo defaults + per-ticket overrides when present).
2. **Download** only needed cache/Bunny inputs into a scratch directory unique to this job.
3. **Run site playbook** (below). Prefer KB recipes (sources, prompts, escalate paths) before frontier calls ([`backbone-escalate.md`](./backbone-escalate.md)). Perform investigations, mint reply templates, and prepare standing file updates as long as the job requires.
4. **Enqueue a proposed commit** (do not push yet) onto that remote’s **commit queue** for this cycle:
   - Private tip remotes: tip JSON/MD, comments/debate filing, job done markers.
   - Public KB: redacted lessons, best sources, prompts — **cite-don’t-cache** the open web.
   - Include metadata: job id, enqueue time (default priority hint), rules_ref, site/kind.
5. **Bunny:** upload choice frames / curated assets; update tip links in the proposed commit; **delete** superseded inbox/cache objects for this job.
6. **Confidence:**
   - MyProblem: Understanding + Solution on tip/timeline ([`confidence-gauge.md`](./confidence-gauge.md)).
   - Operator: record correct / accurate / fast for this run (feed Phase 2 bar).
7. **Wipe local scratch** (downloads, clones used only for this job, temp exports).
8. Mark intake job **done** / **blocked** (e.g. human mint required) / **failed** with reason.

---

## Merge phase (after this repo’s drain for the cycle)

Canonical detail: [`batch-phases.md`](./batch-phases.md) — Shared SI batch procedure. Checklist:

1. Confirm no remaining intake jobs for this remote’s cycle slice (or cycle budget closed).
2. Load the **commit queue** for the remote.
3. **Soundness / integrity:** Relay rules + posted `rules.md` / defaults; recheck drain outputs; reject compromised or rule-breaking diffs.
4. **Conflict / mesh:** detect overlapping paths, duplicate tips, push storms; drop or reorder.
5. **Kickback:** remove unsound items from this merge; re-queue the job for a **later** cycle (visible failure — not an infinite inner loop). After retry budget → **failed / human**.
6. **Priority order:** merge accepted commits by rules-driven priority (urgency / value); FIFO enqueue time is the default when rules are silent.
7. **Push** accepted commits to the private tip / public KB / comments remotes; clear commit-queue entries.
8. Record merge summary in the drain report (accepted / kicked / failed).

---

## By site

### MyProblem / FixIt (tip = problem)

Kinds include: `asr`, `vision`, `project`, `media_frame_select`, `capture_batch`, `fixit_pack`, IRC-tied ticket work.

- Inventory `tickets/<uuid>/` first; delete empty Listening shells.
- Mint tip if cache has create intent and remotes exist; else block for human mint ([`topical-repos.md`](./topical-repos.md)).
- Frame-select → scrub → `choice-media` → Bunny; purge unused video/audio ([`ephemeral-media.md`](./ephemeral-media.md) · [`fixit/batch-prompt-pack.md`](./fixit/batch-prompt-pack.md)).
- Capture batches: process `gate: ticket` only for tips/templates; outliers = channel stats ([`social-group-monitor.md`](./social-group-monitor.md)).

### QuizGate (tip = user)

Kinds include: day-batch aggregates, progress_sync, telemetry sync, admin settings.

- Inventory `users/<uuid>/`; refresh profile hints from day-batch cache when present.
- Parent-final-call; no open generative feed on device.
- Curriculum **pack** curation is separate from tip drain.
- Bunny if that remote’s upload source says so.

### Clevertree (tip = topic)

Kinds include: enqueue body filing, IRC log batches, spam ascertain, key mint/rename under rules.

- Inventory pages / bound tip UUIDs; organize map; do not vote or pick winners.
- Prefer binding to MyProblem/QuizGate tip UUIDs when the room is that product’s chat.
- Permanent SoT writes happen **here** (Phase 1), not on live Intake.
- **`kind: irc_log`:** read `var/clevertree-live/queue/irc_log/*.json` (or API `action=drain_irc_logs`). Payload is a JSONL segment of raw lines (`ts`, `topic`, `visitor`, `body`, `source`). Register visitors → short ids in `users/index.json`. If `rules.md` allows (`chat_store: full`, default), append minimized `{"t","u","b"}` lines to `pages/<page>/chat/YYYY-MM-DD.jsonl`. If `chat_store: never`, mark job skipped — do not write transcripts. Craft rooms (e.g. `ga-savannah-cat-rescue`) use the same path as debate rooms.

---

## After drain + merge session

1. Summarize tips inventoried / deleted / curated, jobs done / blocked / failed, commit-queue accepted / kicked, operator confidence.
2. Write a short drain report (e.g. `docs/ops/batch-drain-YYYY-MM-DD.md`) when the pass changes tip remotes (include merge-phase outcomes).
3. Note any batch-server code/docs/tests that must change so Spot Phase 2 matches this run ([`batch-phases.md`](./batch-phases.md) Phase 1.5) — Spot must implement the **same** drain → commit queue → merge procedure.
4. Ensure no leftover scratch dirs or orphaned Bunny inbox objects from this session.

---

## Cron (local)

Example intent (operator machine): periodic inventory+drain during working hours; human ask always wins and can run a full drain immediately. Exact crontab is local ops — keep secrets off git.
