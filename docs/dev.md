# MyProblem — living project status (Dev)

**Update this file whenever phases move.** Public page: [https://myproblem.app/dev](https://myproblem.app/dev).

**Tone:** Work in progress — building as we go. Looking for help where appropriate :)

---

## Where we are

MyProblem is a free SI (Super Intelligence, i.e. AI) front door for local problems and businesses. People file **tickets** (text + stills; audio in the APK path). Investigation is **batched** (Projects + KB), not a realtime frontier chatbot. Public help tickets live at `/t/<slug>` with Clevertree Chat solution routes. Web can now **submit** a ticket from the browser (`/submit`).

---

## Current stack

| Piece | Role |
|---|---|
| **myproblem.app** (Next.js / Vercel) | Marketing site, `/submit`, public `/t/[slug]`, proxies to Intake |
| **intake.myproblem.app** | Ticket SoT (git tips), evidence upload, slug map, Clevertree board host |
| **myproblem-tickets** | Intake + batch workers, regional tip repos (georgia / israel) |
| **myproblem-kb** | Git Markdown knowledge base (speculative; no boosting) |
| **Clevertree Chat** | Communication on tickets / public pages; SI organizes after batch |
| **Bunny / ephemeral cache** | Evidence = cache only; Batch `choice-media` links scrubbed stills; expire on solve / close / unpublish |
| **Spot / batch** | Deferred investigation workers (wake on demand) |

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

### In progress
- Polish web submit UX; more device QA
- Keep FixIt / public ticket UI iterating from real shares

### Next
- APK capture parity on web (audio chunks, live question band, confidence gauge)
- Recover email / register (free) for durable reclaim
- Human mint for new topical remotes (no `unorganized` catch-all)
- Richer photo tooling (easy capture / scrub guidance) without baking text into images
- Broader region interest beyond GA / Israel pilots

---

## How to help

1. Open a repo in **Cursor** (or similar) and ship a small PR.
2. **QA** on web (`/`, `/submit`, `/t/garage-ring-power`, `/dev`) and on phones.
3. Fix bugs, polish copy/UI, improve docs (especially this file when status changes).
4. Raise PRs on the GitLab remotes above.
5. Email [ari@asu.edu](mailto:ari@asu.edu) for access or coordination.

Helping is welcome :)

---

## Key product docs

- [`anonymous-tickets.md`](./anonymous-tickets.md) — UUID capability, live slugs, web submit
- [`web-submit.md`](./web-submit.md) — browser intake flow
- [`intake-batch-infra.md`](./intake-batch-infra.md) — Intake / Spot
- [`fixit-and-repair.md`](./fixit-and-repair.md) — public repair tickets
- [`clevertree-chat.md`](./clevertree-chat.md) — chat + solution routes
- [`topical-repos.md`](./topical-repos.md) — progressive topics; no unorganized

*Last updated: 2026-11-17*
