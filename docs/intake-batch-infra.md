# Intake + Batch infra

Two-tier servers for MyProblem tickets. Naming and roles are locked here.

**Product phases:** [`batch-phases.md`](./batch-phases.md) — Phase 1 uses **Cursor** as the batch SI (shared multi-site queue); Phase 2 is automated **CPU + API providers**. **Same procedure** either way: drain jobs → providers → per-repo **commit queue** → **merge phase** → remotes. Intake is **cache + enqueue** for repo-bound work; tip/KB/comments remotes update only after merge.

**AI:** providers only (Groq / Bedrock / peers) — [`providers-ai.md`](./providers-ai.md). No Spot A30 / batch GPU worker.

## Names

| Name | What |
|------|------|
| **Intake** | Always-on ticket host: `relay-gateway` (render) + commit worker (mutations) |
| **`myproblem-intake`** | Linode **pub1** (`pub1.relaygateway.net`, `us-iad`) — shared with Relay/Ergo; former Rackspace Spot cloudspace abandoned |
| **`relay.ai.intake`** | Feature flag |
| **Batch** | Cursor (Phase 1) or automated CPU drain (Phase 2) calling providers |
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
   │  Phase 2: CPU worker + Groq/Bedrock/peers
   └── SI drain → providers (ASR/VL/video/decide) → commit queue → merge → tip/KB; Bunny; wipe scratch; log $/request
```

| | Intake | Batch |
|--|--------|-------|
| Hardware | Linode Shared 8 GB `pub1` (`us-iad`) | Phase 1: operator Cursor; Phase 2: CPU worker (no GPU fleet) |
| Role | Gateway + **cache/enqueue** (+ SSR of committed tips) | Provider ASR/VL/Project + tip/KB commits |
| Images | Accept JPEG (hash, enqueue `vision`) — **no VL/OCR on Intake** | Provider VL / choice-media |
| ASR | Enqueue job file only | Groq `whisper-large-v3` (or peer) from batch |
| Video | Enqueue deferred inbox only | Provider video understanding |
| Capacity | Always-on | **No paid lane** — shared provider budget; busy = honest wait |

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
| `asr` | Batch (provider Whisper) |
| `vision` | Batch (provider VL / video) |
| `intake` | Intake light LLM (optional) |
| `project` | Batch deep investigate via providers |

**Wake / schedule Batch when** queued job depth ≥ N, or oldest age ≥ T, or daily window / Cursor cron. Scan is **server-local** — never a public list API. Phase 1: Cursor drains the shared queue ([`cursor-batch-playbook.md`](./cursor-batch-playbook.md)). Phase 2: automated CPU drain (no A30 wake scripts as product path).

**Process-jobs note:** Any Intake helper that still commits tips today is **transitional**; end state is enqueue-only + batch writer ([`batch-phases.md`](./batch-phases.md)).

## Live provision (Intake)

| Field | Value |
|-------|--------|
| Host | Linode **pub1** — `pub1.relaygateway.net` (`172.234.148.70`, `us-iad`) |
| Role | Relay gateway + Clevertree chat-host (`:8790`) + Ergo IRC |
| Deploy chat-host | Sibling `clevertree-chat`: `bash infra/deploy-chat-host.sh` (SSH/systemd; no LKE) |
| Public chat API | `https://api.clevertree.chat` |
| Public ticket host | `https://intake.myproblem.app` (chat paths on pub1; ticket `:8787` cutover pending) |
| Process | `POST /api/ops/process-jobs` drains cache → provider transcript → purge + job file `done` |

**Abandoned:** Rackspace Spot cloudspace `myproblem-intake` / kubeconfig `~/.kube/myproblem-intake.yaml`. Do not refresh Spot OIDC.

Details: [`myproblem-tickets/infra/INTAKE_HOST.md`](../../myproblem-tickets/infra/INTAKE_HOST.md) · Clevertree [`infra/linode/`](../../clevertree-chat/infra/linode/)

## Marketing (this repo on Vercel)

- Site + APK artifact only.
- No `/api/tickets*` ticket runtime; no Neon tip/job tables for tickets.

## Code homes

- Regional ticket Relay apps + workers: sibling [`myproblem-tickets`](../../myproblem-tickets/) (scaffolds georgia/israel trees)
- Marketing + APK demo: this repo (Vercel)
- Fixture golden eval: `npm run test:fixture-asr`

## Related

- [`batch-phases.md`](./batch-phases.md)
- [`providers-ai.md`](./providers-ai.md)
- [`cursor-batch-playbook.md`](./cursor-batch-playbook.md)
- [`pii-and-privacy.md`](./pii-and-privacy.md)
- [`anonymous-tickets.md`](./anonymous-tickets.md)
- [`ephemeral-media.md`](./ephemeral-media.md)
- [`progressive-transcription.md`](./progressive-transcription.md)
- [`apk-ticket-ux.md`](./apk-ticket-ux.md)
- [`abandoned/spot-ai-mvp.md`](./abandoned/spot-ai-mvp.md) — historical GPU plan (abandoned)
