# MyProblem (`myproblem.app`)

Coming-soon site for **MyProblem** — free AI front door for local businesses; Problems not chats; zero-salary Relay vision.

**Investigation model:** no on-demand frontier LLM. Smart-enough realtime AI **captures** questions / requirements / photos → queues a JIRA-like ticket → **batch Projects** investigate ASAP and completely. Bedrock/frontier = rare escalate. See [`docs/projects.md`](docs/projects.md) · [`docs/backbone-escalate.md`](docs/backbone-escalate.md).

**Local knowledge:** Georgia- and Israel-scoped public KB (redacted) + **channels** (any unique id); subscribers see associated tickets. See [`docs/knowledge-base.md`](docs/knowledge-base.md).

## Stack

- Next.js (App Router) on Vercel
- Neon Postgres for waitlist / app data (`DATABASE_URL`)
- Vercel Blob for future file storage (`BLOB_READ_WRITE_TOKEN`)
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
| [`docs/backbone-escalate.md`](docs/backbone-escalate.md) | Rare Bedrock/frontier escalate in batch |
| [`docs/knowledge-base.md`](docs/knowledge-base.md) | Shared local KB + channels (any unique id) |
| [`docs/spot-ai-mvp.md`](docs/spot-ai-mvp.md) | Spot GPU test standup |
| [`docs/context-for-server.md`](docs/context-for-server.md) | Client gate vs server SEND |
| [`docs/infra-definition.md`](docs/infra-definition.md) | Free vs premium workload physics |

## Contact

ari@asu.edu
