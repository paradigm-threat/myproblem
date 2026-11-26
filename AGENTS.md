<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Public room (homepage SoT)

- Homepage embeds Clevertree room → default IRC `#mp-general` (`src/lib/chat/channels.ts`). `/submit` client-redirects to `/#room`.
- `/c/[channel]` allowlist: `mp-general`, `ga-savannah-cat-rescue`; unknown → general. Hidden room menu only.
- Submit overlay: type / speak / video → Bunny (`/api/chat-media/upload`) → `/api/chat/post` into active channel with `[[mp:media …]]` markers. No tip-repo queue as public submit SoT.
- Tickets mint **only** when batch SI decides channel traffic needs tracking — never on every public post.
- Text SI is **manual**: channel `!investigate` / room Investigate (Free-tier soft budgets on chat-host). Whisper ASR stays automatic on media. See [`docs/providers-ai.md`](docs/providers-ai.md).
- Narrative: public chat + AI free forever; private chat = paid lane (infra + provider time); donations for public utility — no tip-push.
- Room assets: `public/chat-room/` (from clevertree-chat `fronts/room/`).
- **Themes (independent):** site chrome uses `localStorage` key `myproblem.theme` on `<html data-theme>`; embedded Clevertree room uses `clevertree.room.theme` on `.room` only — no forced coupling. Default both = `prefers-color-scheme`.
- Docs SoT: [`docs/web-submit.md`](docs/web-submit.md) · [`docs/simple-max.md`](docs/simple-max.md).
