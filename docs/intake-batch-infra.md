# Intake + Batch infra

Two-tier servers for MyProblem tickets. Naming and roles are locked here.

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
APK / ticket web
   │  gated stills + audio (never video); region = georgia | israel
   ▼
Intake (IAD) ── relay-gateway + commit worker
   │  exact-path render of tip.json / index.md
   │  git commit tip + jobs into regional repo
   │  wake Spot when queued job files exist
   ▼
Batch (SJC A30) ──► Groq Whisper + VL/Project
   │  lease/done = git commits in same regional repo
   └── empty bins → self-delete cloudspace
```

| | Intake | Batch |
|--|--------|-------|
| Hardware | `gp.vs1.large-iad` (~pennies–$0.08/hr) | `gpu.vs2.xlargeplusplus-sjc` (~$0.15/hr Spot) |
| Role | Gateway SSR + git commits + light Groq | Whisper + deep VL/Project |
| Images | Accept JPEG only (hash, enqueue `vision`) — **no VL/OCR** | OCR / VL / imggen |
| ASR | Enqueue job file only | Groq `whisper-large-v3` |

## Ticket SoT (git, dual-region)

- Two Relay apps — **not** one world repo. APK picks region at create.
- Layout: `tickets/<uuid>/tip.json`, `index.md`, `jobs/<id>.json` (text only).
- **UUID = access** (capability). No list/browse of tickets or repo trees.
- Evidence **links** URI + sha256; **no binaries in git**.
- Close without `preserve` → delete tip tree; with `preserve` → keep closed tip.
- Mesh clones trim history (~**48h**); one offline master backup for integrity/anti-fraud only.
- PII: see [`pii-and-privacy.md`](./pii-and-privacy.md).

Job bins are **files** under each tip (not Neon):

| Bin | Who runs it |
|-----|-------------|
| `asr` | Batch (Whisper) |
| `vision` | Batch (OCR/VL) |
| `intake` | Intake light LLM |
| `project` | Batch deep investigate |

**Wake Batch when** queued job-file depth ≥ N, or oldest age ≥ T, or daily window. Scan is **server-local** — never a public list API.

**Self-decommission:** Batch drains ready GPU jobs, then `deleteSpotNodePool` + `deleteCloudspace` for `myproblem-batch`.

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

- [`pii-and-privacy.md`](./pii-and-privacy.md)
- [`anonymous-tickets.md`](./anonymous-tickets.md)
- [`ephemeral-media.md`](./ephemeral-media.md)
- [`progressive-transcription.md`](./progressive-transcription.md)
- [`spot-ai-mvp.md`](./spot-ai-mvp.md)
- [`apk-ticket-ux.md`](./apk-ticket-ux.md)
