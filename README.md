# MyProblem (`myproblem.app`)

Coming-soon site for **MyProblem** — free AI front door for local businesses ($0 forever, **zero obligation** — ignore requests like a social feed); **tickets** (audio + stills), not a phone we answer — VoIP later; Problems not chats; zero-salary Relay vision.

**Investigation model:** no on-demand frontier LLM or premium vision. Smart-enough realtime **captures** (stills + audio; no server video) → queues a JIRA-like ticket → **batch Projects** investigate ASAP (**KB git first**; Bedrock = rare escalate after miss). See [`docs/projects.md`](docs/projects.md) · [`docs/backbone-escalate.md`](docs/backbone-escalate.md).

**Tickets:** anonymous by default (**UUID = access** + APK local backup); free recover email/register to avoid loss on phone change. Dossier in **regional Relay git** (`myproblem-tickets-georgia` / `-israel`); audio/stills off-repo (Bunny prefer). No Neon tip/queue. No PII on server tips. See [`docs/anonymous-tickets.md`](docs/anonymous-tickets.md) · [`docs/pii-and-privacy.md`](docs/pii-and-privacy.md) · [`docs/intake-batch-infra.md`](docs/intake-batch-infra.md).

**Local knowledge (primary learning):** sibling repo **`myproblem-kb`** — Georgia/Israel **git Markdown** for **problem-solving** (local resources + DIY), not a search-ad mirror. Speculative (user + AI only); **no boosting**; cite live web, don’t cache it; re-test / refine / ditch; don’t forget. Includes general how-tos such as [nearly-free websites (Vercel + LLM)](../myproblem-kb/general/web/set-up-website-nearly-free.md). **Coming soon:** in-product coding / site-building help ([`docs/coding-and-websites.md`](docs/coding-and-websites.md)). See [`docs/knowledge-base.md`](docs/knowledge-base.md).

## Stack

- Next.js (App Router) on Vercel — **marketing site + APK download only**
- Ticket HTTP/render: Intake Spot (`relay-gateway` + commit worker) — not Vercel
- Waitlist signup may still use Neon (`DATABASE_URL`) — **not** ticket SoT
- Object store for audio/stills (plan: Bunny or S3-compatible)
- Build-time business PDF: `public/myproblem-for-businesses.pdf`

## Remotes

| Remote | URL | Role |
|---|---|---|
| `origin` | https://gitlab.com/clevertree/myproblem | Deploy source → Vercel |
| `github` | https://github.com/paradigm-threat/myproblem | Public mirror (push via HTTPS / `gh`; SSH may hit suspended `clevertree` key) |

Production: https://myproblem.app

## Scripts

```bash
npm run generate:pdf   # refresh business one-pager
npm run build          # runs PDF prebuild + next build
npm run dev
```

## Docs

| Doc | Topic |
|---|---|
| [`docs/projects.md`](docs/projects.md) | Deferred Projects — primary server investigation |
| [`docs/anonymous-tickets.md`](docs/anonymous-tickets.md) | Anon UUID tickets; free recover; Relay tip + object store |
| [`docs/progressive-transcription.md`](docs/progressive-transcription.md) | Audio Evidence → first ASR; LLM retranscription; no video |
| [`docs/backbone-escalate.md`](docs/backbone-escalate.md) | Rare Bedrock/frontier escalate in batch |
| [`docs/knowledge-base.md`](docs/knowledge-base.md) | Git Markdown KB (primary learning) + channels + browser honesty |
| [`docs/coding-and-websites.md`](docs/coding-and-websites.md) | Nearly-free sites (KB) + coding/site-build assist coming soon |
| [`docs/batched-agent-work.md`](docs/batched-agent-work.md) | **Major coming soon:** batched coding/docs/media vs realtime Cursor/Codex |
| [`docs/spot-ai-mvp.md`](docs/spot-ai-mvp.md) | Spot GPU test standup |
| [`docs/context-for-server.md`](docs/context-for-server.md) | Client gate vs server SEND |
| [`docs/infra-definition.md`](docs/infra-definition.md) | Free vs premium workload physics |

## Contact

ari@asu.edu
