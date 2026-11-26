# MyProblem — living project status (Dev)

**Update this file whenever phases move.** Public page: [https://myproblem.app/dev](https://myproblem.app/dev).

**Tone:** Work in progress — building as we go. Looking for help where appropriate :)

---

## Where we are

MyProblem is a free-forever SI (Super Intelligence, i.e. AI) front door for everyone — local problems and businesses. **Submit = talk in the public IRC / Clevertree room** (homepage `#mp-general`; collection rooms via `/c/…`). Type, speak, or video posts into the channel. Investigation is **batched** (Projects + KB), not a realtime frontier chatbot. Tips / `/t/<slug>` pages exist when batch SI decides channel traffic needs durable tracking — **not** on every homepage ask. `/submit` redirects to `/#room`.

---

## Current stack

| Piece | Role |
|---|---|
| **myproblem.app** (Next.js / Vercel) | Marketing site, homepage public room, `/extension`, public `/t/[slug]`, chat proxies |
| **MyProblem X / Relay** | Session capture + reply-assist extension (`extensions/capture`) — not a bot scraper |
| **intake.myproblem.app** | Always-on **cache + enqueue** (media inbox, job payloads, slug map, Clevertree board host). **No tip/KB git commits until batch** — see [`batch-phases.md`](./batch-phases.md) |
| **myproblem-tickets-*** | Private regional tip remotes (georgia / israel) + `comments` — written by batch (Cursor Phase 1 / automated Phase 2) |
| **myproblem-kb** | Public git Markdown KB (speculative; no boosting; cite-don’t-cache) |
| **Clevertree Chat** | Public rooms + ticket-mounted chat; SI organizes in batch |
| **Bunny** | `chat-public/` uploads for speak/video; tip choice-media; purge unused |
| **AI** | Groq / Bedrock / peers — text, ASR, VL, video; **no batch GPU** — [`providers-ai.md`](./providers-ai.md) |
| **Batch (Phase 1)** | **Cursor-as-batch** (ask + local cron) on shared multi-site queue — [`cursor-batch-playbook.md`](./cursor-batch-playbook.md) |
| **Batch (Phase 2)** | CPU + providers — not go-live until parity + eval + operator confidence |

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
- **Homepage Clevertree room** (`#mp-general`); `/submit` → `/#room`; type/speak/video → Bunny → channel
- Unpublish-slug API (drop public link; tip kept)
- This `/dev` page + living `docs/dev.md`
- Intake production Spot redeploy with `mint_slug`, `suggest-slug`, `unpublish-slug`, Bunny expire helpers

### Now (live / in pilot)
- **Channel-first intake** — public room is submit SoT; tip mint only via batch when needed ([`web-submit.md`](./web-submit.md))
- Clevertree on IRC + optional tip UUID rooms when batch mounts them
- **Relay** capture + reply-assist + local ZIP/media export ([`capture-extension.md`](./capture-extension.md), [`/extension`](https://myproblem.app/extension))
- Confidence gauges (Understanding / Solution)
- KB cite-don’t-cache + private tip remotes (Georgia / Israel); FixIt remote waits for a real repair tip
- Phase 1 Cursor-as-batch / Intake cache+enqueue — [`cursor-batch-playbook.md`](./cursor-batch-playbook.md)
- Providers-only AI + public cost narrative on home [`#si-different`](https://myproblem.app/#si-different)

### Next (planned)
- Phase 2 automated batch (CPU + providers; go-live after parity + eval + operator confidence)
- IRC / `[[mp:media]]` → `channel_asr` enqueue on Intake; Groq transcript reply when keyed (else pending / dry-run)
- Deferred tip video → choice stills + Bunny per-repo; purge unused
- Batched coding / docs / networking Projects (not a realtime IDE)
- Shared multi-site queue drain for QuizGate (tip = user) + Clevertree (tip = topic) in production
- Recover email / register; broader regions; FixIt topical remote when minted
- Private chat (paid lane) billing

---

## How to help

1. Open a repo in **Cursor** (or similar) and ship a small PR.
2. **QA** on web (`/`, `/#room`, `/submit` → room, `/extension`, `/t/garage-ring-power`, `/dev`) and on phones; load-unpacked Relay on a logged-in Nextdoor group.
3. Fix bugs, polish copy/UI, improve docs (especially this file when status changes).
4. Raise PRs on the GitLab remotes above.
5. Email [ari@asu.edu](mailto:ari@asu.edu) for access or coordination.

Helping is welcome :)

---

## Key product docs

- [`batch-phases.md`](./batch-phases.md) — Phase 1 / 1.5 / 2 SoT (Cursor → automation)
- [`cursor-batch-playbook.md`](./cursor-batch-playbook.md) — multi-site Cursor drain checklist
- [`web-submit.md`](./web-submit.md) — **channel-first** public ask (not tip form)
- [`simple-max.md`](./simple-max.md) — Simple Max + public room SoT
- [`anonymous-tickets.md`](./anonymous-tickets.md) — UUID capability when batch mints tips
- [`capture-extension.md`](./capture-extension.md) — Relay / MyProblem X
- [`social-group-monitor.md`](./social-group-monitor.md) — Nextdoor / group capture + curator rubric
- [`intake-batch-infra.md`](./intake-batch-infra.md) — Intake / hardware roles
- [`fixit-and-repair.md`](./fixit-and-repair.md) — public repair tickets
- [`clevertree-chat.md`](./clevertree-chat.md) — chat + solution routes
- [`topical-repos.md`](./topical-repos.md) — progressive topics; no unorganized
