# MyProblem — living project status (Dev)

**Update this file whenever phases move.** Public page: [https://myproblem.app/dev](https://myproblem.app/dev).

**Tone:** Work in progress — building as we go. Looking for help where appropriate :)

---

## Where we are

MyProblem is a free-forever SI (Super Intelligence, i.e. AI) front door for everyone — local problems and businesses. People file **tickets** (text + stills; audio in the APK path). Investigation is **batched** (Projects + KB), not a realtime frontier chatbot. Public help tickets live at `/t/<slug>` with Clevertree Chat solution routes. Web can now **submit** a ticket from the browser (`/submit`).

---

## Current stack

| Piece | Role |
|---|---|
| **myproblem.app** (Next.js / Vercel) | Marketing site, `/submit`, `/extension`, public `/t/[slug]`, proxies to Intake |
| **MyProblem X** | Session capture + reply-assist extension (`extensions/capture`) — not a bot scraper |
| **intake.myproblem.app** | Always-on **cache + enqueue** (media inbox, job payloads, slug map, Clevertree board host). **No tip/KB git commits until batch** — see [`batch-phases.md`](./batch-phases.md) |
| **myproblem-tickets-*** | Private regional tip remotes (georgia / israel) + `comments` — written by batch (Cursor Phase 1 / Spot Phase 2) |
| **myproblem-kb** | Public git Markdown KB (speculative; no boosting; cite-don’t-cache) |
| **Clevertree Chat** | Communication on tickets / public pages; SI organizes in batch |
| **Bunny** | Per-repo upload source for all Relay sites; evidence cache → batch choice-media; purge unused |
| **Batch (Phase 1)** | **Cursor-as-batch** (ask + local cron) on shared multi-site queue — [`cursor-batch-playbook.md`](./cursor-batch-playbook.md) |
| **Batch (Phase 2)** | Ephemeral Spot workers — not go-live until parity + fine-tune + operator confidence |

---

## Repos (public GitLab URLs)

| Repo | URL |
|---|---|
| Site | https://gitlab.com/clevertree/myproblem |
| Tickets / Intake | https://gitlab.com/clevertree/myproblem-tickets |
| Knowledge base | https://gitlab.com/clevertree/myproblem-kb |

Access may require an invite. Email [ari@asu.edu](mailto:ari@asu.edu) if you want to help and cannot clone.

---

## Phases

**Product batch phases (SoT):** [`batch-phases.md`](./batch-phases.md) — we are in **Phase 1** (Cursor-as-batch; Intake cache-only for repo writes). Marketing **Now / Next** on [`/`](https://myproblem.app/#plan) matches this section.

### Done
- Public ticket pages `/t/[slug]` + FixIt theme (sticky chip nav, photos, routes, compact→expand chat)
- Per-ticket SEO: branded “Problem ticket · MyProblem” titles/OG/JSON-LD; live tips noindex; pilots may index ([`ticket-public-seo.md`](./ticket-public-seo.md))
- SI terminology + training notice on site/legal
- Nextdoor pilot seed `garage-ring-power`
- Intake: topical slug suggest, Bunny expire helpers, still scrub / local research contracts
- Web `/submit` (text + photos) with **opt-in** public slug; mint_slug:false by default on web
- Unpublish-slug API (drop public link; tip kept)
- This `/dev` page + living `docs/dev.md`
- Intake production Spot redeploy with `mint_slug`, `suggest-slug`, `unpublish-slug`, Bunny expire helpers

### Now (live / in pilot)
- Tickets (web submit + public `/t/` pilots) + Clevertree Chat on the **same tip UUID**
- **MyProblem X** capture + reply-assist + local ZIP/media export ([`capture-extension.md`](./capture-extension.md), [`/extension`](https://myproblem.app/extension))
- Confidence gauges (Understanding / Solution)
- KB cite-don’t-cache + private tip remotes (Georgia / Israel); FixIt remote waits for a real repair tip
- Phase 1 Cursor-as-batch / Intake cache+enqueue — [`cursor-batch-playbook.md`](./cursor-batch-playbook.md)
- Ephemeral Spot thesis on home [`#si-different`](https://myproblem.app/#si-different)

### Next (planned)
- Phase 2 Spot batch automation (same queue; go-live after parity + fine-tune + operator confidence)
- Deferred video → choice stills + Bunny per-repo; purge unused
- Batched coding / docs / networking Projects (not a realtime IDE)
- Shared multi-site queue drain for QuizGate (tip = user) + Clevertree (tip = topic) in production
- Recover email / register; broader regions; FixIt topical remote when minted
- APK capture parity on web; richer photo tooling without baking text into images

---

## How to help

1. Open a repo in **Cursor** (or similar) and ship a small PR.
2. **QA** on web (`/`, `/submit`, `/extension`, `/t/garage-ring-power`, `/dev`) and on phones; load-unpacked MyProblem X on a logged-in Nextdoor group.
3. Fix bugs, polish copy/UI, improve docs (especially this file when status changes).
4. Raise PRs on the GitLab remotes above.
5. Email [ari@asu.edu](mailto:ari@asu.edu) for access or coordination.

Helping is welcome :)

---

## Key product docs

- [`batch-phases.md`](./batch-phases.md) — Phase 1 / 1.5 / 2 SoT (Cursor → Spot)
- [`cursor-batch-playbook.md`](./cursor-batch-playbook.md) — multi-site Cursor drain checklist
- [`anonymous-tickets.md`](./anonymous-tickets.md) — UUID capability, live slugs, web submit
- [`web-submit.md`](./web-submit.md) — browser intake flow
- [`capture-extension.md`](./capture-extension.md) — MyProblem X
- [`social-group-monitor.md`](./social-group-monitor.md) — Nextdoor / group capture + curator rubric
- [`intake-batch-infra.md`](./intake-batch-infra.md) — Intake / Spot hardware roles
- [`fixit-and-repair.md`](./fixit-and-repair.md) — public repair tickets
- [`clevertree-chat.md`](./clevertree-chat.md) — chat + solution routes
- [`topical-repos.md`](./topical-repos.md) — progressive topics; no unorganized

*Last updated: 2026-11-19*
