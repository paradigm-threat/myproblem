# MyProblem (`myproblem.app`)

**MyProblem** (`myproblem.app`) — free forever for everyone ($0, **zero obligation** for shops to respond); **tickets** (audio + stills; web submit at `/submit`); **MyProblem X** session capture + reply-assist ([`/extension`](https://myproblem.app/extension), [`extensions/capture`](extensions/capture)); Problems not chats; zero-salary Relay vision. **Work in progress — building as we go.** Status + how to help: [`docs/dev.md`](docs/dev.md) · https://myproblem.app/dev

**Investigation model:** no on-demand frontier LLM or premium vision. Smart-enough realtime **captures** (stills + audio; no server video) → queues a JIRA-like ticket → **batch Projects** investigate ASAP (**KB git first**; Bedrock = rare escalate after miss). See [`docs/projects.md`](docs/projects.md) · [`docs/backbone-escalate.md`](docs/backbone-escalate.md).

**Tickets:** anonymous by default (**UUID = access** + APK local backup); free recover email/register to avoid loss on phone change. Dossier in **regional Relay git** (`myproblem-tickets-georgia` / `-israel`); audio/stills off-repo (Bunny prefer). No Neon tip/queue. No PII on server tips. See [`docs/anonymous-tickets.md`](docs/anonymous-tickets.md) · [`docs/pii-and-privacy.md`](docs/pii-and-privacy.md) · [`docs/intake-batch-infra.md`](docs/intake-batch-infra.md).

**Local knowledge (primary learning):** sibling repo **`myproblem-kb`** — Georgia/Israel **git Markdown** for **problem-solving** (local resources + DIY), not a search-ad mirror. Speculative (user + AI only); **no boosting**; cite live web, don’t cache it; re-test / refine / ditch; don’t forget. Includes general how-tos such as [nearly-free websites (Vercel + LLM)](../myproblem-kb/general/web/set-up-website-nearly-free.md). **Coming soon:** in-product coding / site-building help ([`docs/coding-and-websites.md`](docs/coding-and-websites.md)). See [`docs/knowledge-base.md`](docs/knowledge-base.md).

## Stack

- Next.js (App Router) on Vercel — marketing, `/submit`, `/extension`, public `/t/`, API proxies
- MV3 **MyProblem X** — [`extensions/capture`](extensions/capture) (Nextdoor session harvest; not a bot scraper)
- Ticket HTTP/SoT: Intake Spot (`relay-gateway` + commit worker)
- Object store for audio/stills (Bunny prefer / ephemeral cache)
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
| [`docs/dev.md`](docs/dev.md) | **Living status** — stack, phases, how to help (`/dev`) |
| [`docs/web-submit.md`](docs/web-submit.md) | Browser ticket submit + opt-in public slug |
| [`docs/capture-extension.md`](docs/capture-extension.md) | MyProblem X — load unpacked, reply paste policy |
| [`docs/social-group-monitor.md`](docs/social-group-monitor.md) | Group capture, curator rubric, Georgia stray-cats |
| [`docs/anonymous-tickets.md`](docs/anonymous-tickets.md) | Anon UUID tickets; free recover; Relay tip + object store |
| [`docs/progressive-transcription.md`](docs/progressive-transcription.md) | Audio Evidence → first ASR; LLM retranscription; no video |
| [`docs/backbone-escalate.md`](docs/backbone-escalate.md) | Rare Bedrock/frontier escalate in batch |
| [`docs/knowledge-base.md`](docs/knowledge-base.md) | Git Markdown KB (primary learning) + channels + browser honesty |
| [`docs/topical-repos.md`](docs/topical-repos.md) | Progressive topical ticket+KB repos; human mint; server cache if missing |
| [`docs/fixit-and-repair.md`](docs/fixit-and-repair.md) | Repair scope; public `/t/` tickets; Bunny scrub; garage pilot |
| [`docs/clevertree-chat.md`](docs/clevertree-chat.md) | Clevertree on tickets + public `/t/` solution routes |
| [`docs/coding-and-websites.md`](docs/coding-and-websites.md) | Nearly-free sites (KB) + coding/site-build assist coming soon |
| [`docs/batched-agent-work.md`](docs/batched-agent-work.md) | **Major coming soon:** batched coding/docs/media vs realtime Cursor/Codex |
| [`docs/spot-ai-mvp.md`](docs/spot-ai-mvp.md) | Spot GPU test standup |
| [`docs/context-for-server.md`](docs/context-for-server.md) | Client gate vs server SEND |
| [`docs/infra-definition.md`](docs/infra-definition.md) | Free vs premium workload physics |

## Contact

ari@asu.edu
