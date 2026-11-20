# Batch phases (Relay-wide SoT)

**Canonical product phases for MyProblem, QuizGate, and Clevertree Chat.**  
Other docs point here when they talk about Cursor-as-batch, Spot go-live, or the shared queue.

Related: [`projects.md`](./projects.md) · [`intake-batch-infra.md`](./intake-batch-infra.md) · [`batched-agent-work.md`](./batched-agent-work.md) · [`cursor-batch-playbook.md`](./cursor-batch-playbook.md) · [`ephemeral-media.md`](./ephemeral-media.md) · [`knowledge-base.md`](./knowledge-base.md) · [`confidence-gauge.md`](./confidence-gauge.md) · LLC [`../relay/clevertree-llc-plan/07-step-by-step.md`](../../relay/clevertree-llc-plan/07-step-by-step.md) (maps to these phases).

---

## Locked decisions

| Topic | Decision |
|---|---|
| Always-on Intake / API | **Cache + enqueue only** — uploads of any format/topic, IRC log batches, capture batches. **No git/repo mutations** until a batch agent runs |
| Phase 1 batch agent | **Cursor** on the operator machine (**ask + local cron**) |
| Phase 2 | Ephemeral **Rackspace Spot** batch worker go-live when parity, tests, fine-tune, and operator confidence allow |
| Queue | **One shared batch queue** for MyProblem, QuizGate, and Clevertree |
| Ticket remotes | **Private** — UUID tips + `comments` / debates |
| KB remotes | **Public** — redacted advice, best sources, prompts, escalate recipes (cite live web; do not mirror it) |
| Pilot remotes | `myproblem-tickets-georgia`, `myproblem-tickets-israel`, one `myproblem-kb` with `georgia/` + `israel/` (+ `general/`) partitions |
| Progressive mint | Extra private+public **pairs** only when a craft does not fit (e.g. FixIt) — not one repo per ticket |
| Uploads | **Bunny** for all sites, via **per-repo upload-source** config (user upload + server curation / choice-frame re-upload) |
| Forum platforms | **Per-repo** `forum-platforms.json` (like Bunny): how `[[nd:group/post]]` maps to Nextdoor URLs; craft IRC e.g. `#ga-savannah-cat-rescue` — not a Relay-global UUID space |
| Forum collections | Localized roster of groups to sync (e.g. `savannah-cat-rescue`); not a category; tip home stays the region remote |
| IRC / WS chat logs | Host cache ephemeral; batch may store minimized transcripts in comments SoT (`pages/<page>/chat/`, short ids) unless `chat_store: never` |
| Confidence | (a) MyProblem Understanding/Solution on tips/replies; (b) **operator** batch-run confidence (correct / accurate / fast) as Phase 2 gate |
| Train | Rules, fixtures, server/Cursor parity tests, **and** fine-tune for task ability before Phase 2 |
| Capacity | **No paid lane** — everyone uses Spot / gifted reliable capacity; busy = honest wait |

---

## Unified tip (every product)

A **Relay tip** is the simplest shared unit. Product meaning is a lens on the same structure:

| Product | Tip means | Notes |
|---|---|---|
| MyProblem / FixIt | Repair / DIY / service **problem** | Private tip remotes; Clevertree `comments` may bind to the **same UUID** as the chat room |
| QuizGate | Whole **user** (progress over time) | `users/<uuid>/` on the QuizGate tip remote — may split later |
| Clevertree | **Topic** / forum room | Comments SoT page; may use another product’s tip UUID or an external-id translation — **no forced new UUID** |

Batch always starts by **inventorying all tips that exist** in each configured repo (not only queue jobs), then curates: assess, run pending jobs, update standing files, stamp confidence, purge obsolete cache/Bunny, or **delete** tips that are closed / empty and no longer needed publicly.

**Delete defaults:** remove tip trees with empty content (`intake=listening` / empty title / no evidence / no public slug), and closed tips with empty content. Anything with real body, media, slug, or QuizGate day progress → curate or list for human — do not silent-delete.

---

## Phase map

```
Clients / apps / IRC / APIs
        │
        ▼
Always-on Intake ── cache media + enqueue job payloads (shared queue)
        │
        ├── Phase 1 ──► Cursor (ask + cron) ──► private tips + public KB + Bunny
        │                    │
        │                    └── iteratively build Spot batch stack + tests
        │
        └── Phase 2 ──► Spot worker (same queue contract) ──► same remotes + wipe
```

| Product phase | What is live | Who mutates git |
|---|---|---|
| **Phase 1** | Products + Intake cache/queue | **Cursor only** |
| **Phase 1.5** | Same + fixtures, parity tests, fine-tune/eval | Cursor (default); Spot in dry-run |
| **Phase 2** | Spot batch automation | **Spot worker** (Cursor = exception / escalate) |

**Intake live ≠ Phase 2.** The always-on host may be up and caching while Spot batch is not yet the go-live drain.

LLC plan “Phase 0.5” Spot benches and “Phase 1” pilot language map onto **product Phase 1 / 1.5** until the go-live bar below is met — then call it **product Phase 2**.

---

## Phase 1 — Products live; batch is Cursor

1. Sites accept work; Intake stores **job payloads + media cache** (and IRC batches). Nothing creates tip/KB/comments commits until batch runs.
2. Product-specific auto-drains (QuizGate day-batch tip writer, Clevertree live SoT write, heuristic GPU wake) are **subordinated** to this contract: the shared queue is the SoT for pending work; Cursor is the sole repo writer.
3. Cursor (on ask or cron) — see [`cursor-batch-playbook.md`](./cursor-batch-playbook.md):
   - **Step 0:** inventory **all tips** per remote (MyProblem/FixIt problems, QuizGate users, Clevertree topics).
   - Curate each tip; drain shared-queue jobs `{site, kind, payload_ref, media_refs, rules_ref}`.
   - Download needed Bunny/cache inputs; run site playbooks; delete empty/obsolete tips per delete defaults.
   - Commit only allowed standing outputs to **private** tip remotes and **public** KB; Bunny choice-media; wipe scratch.
   - Stamp user-facing confidence (MyProblem gauges) and **operator run confidence** (correct / accurate / fast).
   - Extend the batch-server stack, instructions, and tests so Phase 2 matches Cursor.

### Site duties (Phase 1)

| Site | Tip lens | Cursor work |
|---|---|---|
| MyProblem / FixIt | Problem | Inventory tips; Understanding/Solution; frame-select → Bunny; purge/delete empty shells; KB writes; capture-batch; FixIt pack when remotes exist |
| QuizGate | User | Inventory `users/<uuid>/`; refresh profile from day-batch; parent-safe; no open generative feed; Bunny per upload source |
| Clevertree | Topic | Inventory pages; drain IRC/enqueue; bind rooms to foreign tip UUIDs when mounted; no vote/side-taking; Cursor sole SoT writer |

---

## Phase 1.5 — Parity hardening

- Golden fixtures from real Phase 1 tickets, IRC, and packs.
- Unit + scenario tests: media wipe; no repo write without batch; Bunny choice-media; KB cite-don’t-cache; confidence thresholds; multi-tenant queue routing.
- Fine-tune / eval loop against operator confidence metrics.
- Clevertree queue cutover and QuizGate batch writer aligned to the **same job schema** Cursor already drains.

---

## Phase 2 — Spot batch go-live

- Ephemeral Spot worker reconstructs from rules, drains the **same queue**, same wipe + Bunny + remotes contract.
- Cursor becomes escalation / exception path, not the default drain.
- **Go-live bar (all required):**
  - Operator confidence on task correct / accurate / fast meets the recorded threshold (see ops log / eval sheet).
  - Parity tests green against Cursor golden fixtures.
  - Fine-tune (or documented decision that base weights suffice) for the batch task set.
  - Wipe + no-residual-scratch checks pass on Spot tear-down.
  - Multi-site queue routing verified for MyProblem + QuizGate + Clevertree job kinds.

---

## Remotes (privacy)

| Remote | Visibility | Holds |
|---|---|---|
| `myproblem-tickets-georgia` / `-israel` | private | UUID tips + `comments` |
| `myproblem-kb` | public | partitions `georgia/` `israel/` `general/` — advice, sources, prompts, escalate recipes |
| Later craft pairs (e.g. FixIt) | private + public pair | Only when catalog has no fit |

Do **not** put private tips and public KB on one git remote: clone/fetch would leak tips. Cursor checks out the pair side by side as one workspace.

---

## Bunny (all sites)

Each tip/KB/debate remote declares its **upload source** (Bunny zone/path today). Users upload; batch re-uploads scrubbed choice frames and deletes superseded cache objects. Swapping providers later = change per-repo config, not product code paths that assume a hard-coded host.

---

## Confidence (two layers)

1. **User-facing (MyProblem):** Understanding + Solution gauges — [`confidence-gauge.md`](./confidence-gauge.md). Show in replies/tips whenever possible.
2. **Operator (Phase 2 gate):** Per batch-run scores for correct / accurate / fast. Drive fine-tune and go/no-go for Spot automation.

---

## KB content rule

Public KB is for **SI-useful** residue: best sources, investigation prompts, escalate paths (Bedrock, Grok, …), ticket-driven assessments. **Cite** the live web; **do not** fill the KB with scrapes that go stale. See [`knowledge-base.md`](./knowledge-base.md).

---

## Video

- **Realtime path:** stills (+ audio on APK) only — no live server video analysis.
- **Deferred:** video/audio may sit in Batch inbox → `media_frame_select` → Bunny choice stills → purge unused.

---

## Status

| Item | State |
|---|---|
| Product Phase | **1** (Cursor-as-batch) |
| Shared queue schema | Spec in playbook; wire Intake enqueue to match |
| Spot Phase 2 | Not go-live until bar above |
| LLC Phase 0.5 benches | Optional; does not unlock product Phase 2 alone |
