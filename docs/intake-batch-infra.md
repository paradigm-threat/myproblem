# Intake + Batch infra

Two-tier servers for MyProblem tickets. Naming and roles are locked here.

**Product phases:** [`batch-phases.md`](./batch-phases.md) — Phase 1 uses **Cursor** as the batch SI (shared multi-site queue); Spot is Phase 2. **Same procedure** either way: drain jobs → per-repo **commit queue** → **merge phase** → remotes. Intake is **cache + enqueue** for repo-bound work; tip/KB/comments remotes update only after merge.

## Names

| Name | What |
|------|------|
| **Intake** | Always-on ticket host: `relay-gateway` (render) + commit worker (mutations) |
| **`myproblem-intake`** | Rackspace cloudspace / host in `us-east-iad-1` |
| **`relay.ai.intake`** | Feature flag |
| **Batch** | Ephemeral GPU worker |
| **`myproblem-batch`** | SJC A30 cloudspace (create → drain → delete) |
| **`myproblem-tickets-georgia`** | Regional Relay app git SoT (Georgia) |
| **`myproblem-tickets-israel`** | Regional Relay app git SoT (Israel) |

UI copy still uses **coachLine**; the **host** is Intake (do not name infra “coach”).

**Vercel** hosts the marketing site and APK download only — **not** the ticket API.

## Split

```
APK / ticket web / capture / IRC
   │  gated stills + audio (realtime never video); region = georgia | israel
   ▼
Intake (IAD) ── always-on cache + enqueue (shared queue)
   │  media inbox / job payloads / slug map / SSR of already-committed tips
   │  NO tip/KB git mutations in Phase 1 until batch runs
   ▼
Batch agent
   │  Phase 1: Cursor (ask + cron) — all Relay sites
   │  Phase 2: Spot SJC A30 ──► Whisper + VL/Project; then self-delete
   └── SI drain → commit queue → merge phase → private tip remotes + public KB; Bunny; wipe scratch
```

| | Intake | Batch |
|--|--------|-------|
| Hardware | `gp.vs1.large-iad` (~pennies–$0.08/hr) | Phase 2: `gpu.vs2.xlargeplusplus-sjc` (~$0.15/hr Spot); Phase 1: operator Cursor |
| Role | Gateway + **cache/enqueue** (+ SSR of committed tips) | Whisper + deep VL/Project + tip/KB commits |
| Images | Accept JPEG (hash, enqueue `vision`) — **no VL/OCR** | OCR / VL / imggen / choice-media |
| ASR | Enqueue job file only | Groq `whisper-large-v3` (or Cursor Phase 1 equivalent) |
| Capacity | Always-on | **No paid lane** — Spot / gifted reliable only |

## Ticket SoT (git, dual-region)

- Two Relay apps — **not** one world repo. APK picks region at create.
- Layout: `tickets/<uuid>/tip.json`, `index.md`, `jobs/<id>.json` (text only).
- **UUID = access** (capability). No list/browse of tickets or repo trees.
- Evidence **links** URI + sha256; **no binaries in git**.
- Close without `preserve` → delete tip tree; with `preserve` → keep closed tip.
- Mesh clones trim history (~**48h**); one offline master backup for integrity/anti-fraud only.
- PII: see [`pii-and-privacy.md`](./pii-and-privacy.md).
- Public share: `myproblem.app/t/[slug]`; SI suggests topical slug via `POST /api/tickets/:id/suggest-slug` after context is clear (human may edit + apply). Scrubbed Bunny stills while live; expire on solve.

Job bins are **files** under each tip (not Neon):

| Bin | Who runs it |
|-----|-------------|
| `asr` | Batch (Whisper) |
| `vision` | Batch (OCR/VL) |
| `intake` | Intake light LLM |
| `project` | Batch deep investigate |

**Wake Batch when** queued job depth ≥ N, or oldest age ≥ T, or daily window / Cursor cron. Scan is **server-local** — never a public list API. Phase 1: Cursor drains the shared queue ([`cursor-batch-playbook.md`](./cursor-batch-playbook.md)). Phase 2: Spot wake scripts.

**Self-decommission (Phase 2):** Spot Batch drains ready GPU jobs, then `deleteSpotNodePool` + `deleteCloudspace` for `myproblem-batch`.

**Process-jobs note:** Any Intake helper that still commits tips today is **transitional**; end state is enqueue-only + batch writer ([`batch-phases.md`](./batch-phases.md)).

## Live provision (Intake)

| Field | Value |
|-------|--------|
| Cloudspace | `myproblem-intake` |
| Region | `us-east-iad-1` |
| Pool | `gp.vs1.large-iad` Spot |
| Public ticket host | `https://intake.myproblem.app` (gateway + worker) |
| Batch | Wake via `infra/scripts/spot-wake-batch.sh` |
| Process | `POST /api/ops/process-jobs` drains cache → transcript → purge + job file `done` |

Details: [`myproblem-tickets/infra/INTAKE_HOST.md`](../../myproblem-tickets/infra/INTAKE_HOST.md)

## Marketing (this repo on Vercel)

- Site + APK artifact only.
- No `/api/tickets*` ticket runtime; no Neon tip/job tables for tickets.

## Code homes

- Regional ticket Relay apps + workers: sibling [`myproblem-tickets`](../../myproblem-tickets/) (scaffolds georgia/israel trees)
- Marketing + APK demo: this repo (Vercel)
- Fixture golden eval: `npm run test:fixture-asr`

## Related

- [`batch-phases.md`](./batch-phases.md)
- [`cursor-batch-playbook.md`](./cursor-batch-playbook.md)
- [`pii-and-privacy.md`](./pii-and-privacy.md)
- [`anonymous-tickets.md`](./anonymous-tickets.md)
- [`ephemeral-media.md`](./ephemeral-media.md)
- [`progressive-transcription.md`](./progressive-transcription.md)
- [`spot-ai-mvp.md`](./spot-ai-mvp.md)
- [`apk-ticket-ux.md`](./apk-ticket-ux.md)
