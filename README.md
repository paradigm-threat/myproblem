# MyProblem (`myproblem.app`)

**MyProblem** (`myproblem.app`) — free forever for public chat + channel AI ($0, **zero obligation** for shops to respond). **Submit = talk in the public room** (`#mp-general` on the homepage; `/submit` → `/#room`). Type / speak / video posts into IRC — tips mint only when batch SI needs tracking. **Relay** session capture + reply-assist ([`/extension`](https://myproblem.app/extension), [`extensions/capture`](extensions/capture)). Zero-salary Relay vision. **Work in progress — building as we go.** Status + how to help: [`docs/dev.md`](docs/dev.md) · https://myproblem.app/dev

**Investigation model:** public-room intake + Networker gather → **batch Projects** investigate ASAP via **Groq / Bedrock / peer providers** (**KB + context first**; stronger models escalate after miss). **No batch GPU fleet.** We **publicize $/request**; private chat (paid lane) + donations fund infra and provider time — not tip-push on the homepage. See [`docs/web-submit.md`](docs/web-submit.md) · [`docs/providers-ai.md`](docs/providers-ai.md) · [`docs/projects.md`](docs/projects.md).

**Tickets (when batch mints them):** anonymous by default (**UUID = access** + APK local backup); free recover email/register to avoid loss on phone change. Dossier in **regional Relay git** (`myproblem-tickets-georgia` / `-israel`); audio/stills off-repo (Bunny prefer). No Neon tip/queue. No PII on server tips. See [`docs/anonymous-tickets.md`](docs/anonymous-tickets.md) · [`docs/pii-and-privacy.md`](docs/pii-and-privacy.md) · [`docs/intake-batch-infra.md`](docs/intake-batch-infra.md).

**Local knowledge (primary learning):** sibling repo **`myproblem-kb`** — Georgia/Israel **git Markdown** for **problem-solving** (local resources + DIY), not a search-ad mirror. Speculative (user + AI only); **no boosting**; cite live web, don’t cache it; re-test / refine / ditch; don’t forget. Includes general how-tos such as [nearly-free websites (Vercel + LLM)](../myproblem-kb/general/web/set-up-website-nearly-free.md). **Coming soon:** in-product coding / site-building help ([`docs/coding-and-websites.md`](docs/coding-and-websites.md)). See [`docs/knowledge-base.md`](docs/knowledge-base.md).

## Stack

- Next.js (App Router) on Vercel — marketing, homepage public room, `/extension`, public `/t/`, chat proxies
- MV3 **Relay / MyProblem X** — [`extensions/capture`](extensions/capture) (Nextdoor session harvest; not a bot scraper)
- Clevertree chat host + Intake cache/enqueue (`relay-gateway`; tip/KB commits from batch only)
- Bunny for `chat-public/` speak/video + tip choice-media
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
| [`docs/web-submit.md`](docs/web-submit.md) | **Channel-first** public ask (room = submit) |
| [`docs/simple-max.md`](docs/simple-max.md) | Simple Max + public room SoT |
| [`docs/capture-extension.md`](docs/capture-extension.md) | MyProblem X — load unpacked, reply paste policy |
| [`docs/social-group-monitor.md`](docs/social-group-monitor.md) | Group capture, curator rubric, Georgia stray-cats |
| [`docs/anonymous-tickets.md`](docs/anonymous-tickets.md) | Anon UUID tickets; free recover; Relay tip + object store |
| [`docs/progressive-transcription.md`](docs/progressive-transcription.md) | Audio Evidence → first ASR; LLM retranscription; no video |
| [`docs/providers-ai.md`](docs/providers-ai.md) | **Canonical** — providers-only AI, cost publicity, no GPU fleet |
| [`docs/backbone-escalate.md`](docs/backbone-escalate.md) | Provider escalate + $/request in batch |
| [`docs/knowledge-base.md`](docs/knowledge-base.md) | Git Markdown KB (primary learning) + channels + browser honesty |
| [`docs/topical-repos.md`](docs/topical-repos.md) | Progressive topical ticket+KB repos; human mint; server cache if missing |
| [`docs/fixit-and-repair.md`](docs/fixit-and-repair.md) | Repair scope; public `/t/` tickets; Bunny scrub; garage pilot |
| [`docs/clevertree-chat.md`](docs/clevertree-chat.md) | Clevertree on tickets + public `/t/` solution routes |
| [`docs/coding-and-websites.md`](docs/coding-and-websites.md) | Nearly-free sites (KB) + coding/site-build assist coming soon |
| [`docs/batched-agent-work.md`](docs/batched-agent-work.md) | **Major coming soon:** batched coding/docs/media vs realtime Cursor/Codex |
| [`docs/abandoned/spot-ai-mvp.md`](docs/abandoned/spot-ai-mvp.md) | Abandoned Spot GPU MVP (historical) |
| [`docs/context-for-server.md`](docs/context-for-server.md) | Client gate vs server SEND |
| [`docs/infra-definition.md`](docs/infra-definition.md) | Free vs premium workload physics |

## Contact

ari@asu.edu
