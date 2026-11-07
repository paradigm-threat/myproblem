# MyProblem (`myproblem.app`)

Coming-soon site for **MyProblem** — free AI front door for local businesses; Problems not chats; zero-salary Relay vision.

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

## Contact

ari@asu.edu
