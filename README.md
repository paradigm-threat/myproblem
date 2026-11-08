# MyProblem (`myproblem.app`)

Coming-soon site for **MyProblem** — free AI front door for local businesses ($0 forever, **zero obligation** — ignore requests like a social feed); **tickets** (audio + stills), not a phone we answer — VoIP later; Problems not chats; zero-salary Relay vision.

**Investigation model:** no on-demand frontier LLM or premium vision. Smart-enough realtime **captures** (stills + audio; no server video) → queues a JIRA-like ticket → **batch Projects** investigate ASAP. Bedrock = rare escalate. See [`docs/projects.md`](docs/projects.md) · [`docs/backbone-escalate.md`](docs/backbone-escalate.md).

**Tickets:** anonymous by default (server UUID + APK local backup); free recover email/register to avoid loss on phone change. Dossier on Relay tip; audio/stills in cheap object store (Bunny prefer). See [`docs/anonymous-tickets.md`](docs/anonymous-tickets.md).

**Local knowledge:** Georgia- and Israel-scoped public KB (redacted) + **channels** (any unique id). See [`docs/knowledge-base.md`](docs/knowledge-base.md).

## Stack

- Next.js (App Router) on Vercel
- Neon Postgres for waitlist / thin queue index (`DATABASE_URL`)
- Object store for audio/stills (plan: Bunny or S3-compatible; Blob token may be interim)
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
| [`docs/knowledge-base.md`](docs/knowledge-base.md) | Shared local KB + channels (any unique id) |
| [`docs/spot-ai-mvp.md`](docs/spot-ai-mvp.md) | Spot GPU test standup |
| [`docs/context-for-server.md`](docs/context-for-server.md) | Client gate vs server SEND |
| [`docs/infra-definition.md`](docs/infra-definition.md) | Free vs premium workload physics |

## Contact

ari@asu.edu
