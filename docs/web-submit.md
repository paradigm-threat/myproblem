# Public-room submit (channel-first)

**Homepage SoT is the public Clevertree / IRC room** — not a tip-mint form.

Design tokens still live under [`design/ui-kit/`](../design/ui-kit/). Product path: ask in-channel.

## Flow (live)

1. Open [`/`](https://myproblem.app/) → `#room` (or `/c/mp-general`, `/c/ga-savannah-cat-rescue`).
2. **Talk** in the room composer — that *is* submit.
3. Or use **Type / speak / video**:
   - Text → `POST /api/chat/post` → Clevertree host → IRC (`#mp-general` by default).
   - Speak / video / file → `POST /api/chat-media/upload` (Bunny `chat-public/…`) → post CDN URL + `[[mp:media …]]` marker into the same channel.
4. `/submit` **client-redirects** to `/#room` (no `SubmitTicketForm`, no tip UUID).

Allowlist: [`src/lib/chat/channels.ts`](../src/lib/chat/channels.ts). Unknown `/c/…` → `#mp-general`.

## Tickets (batch only)

Public room posts **do not** mint tip UUIDs and **do not** write tip-repo queues.

Batch SI (Phase 1 Cursor / Phase 2 providers) may create or update a tip **only when** channel traffic needs durable tracking — same posture as Networker gather candidates. Live path never auto-mints.

## Media → ASR / VL

- Client never calls `/api/transcribe`.
- Voice/video land as **public media URLs in IRC**.
- Batch drains IRC / Clevertree queue, detects Bunny `chat-public/` URLs or `[[mp:media kind=… url=…]]`, then runs provider ASR/VL when useful.
- Until that drain hook is fully wired on Intake, media is still visible in-channel for humans + AI; transcription is **batch-only**, not realtime.

See [`progressive-transcription.md`](./progressive-transcription.md) (channel section) · [`providers-ai.md`](./providers-ai.md).

## Copy

Anonymous by default. Public channel = public. Free forever for public chat + channel AI. Private chat is the paid lane later. Donations fund the public utility — no tip-push on the homepage.

## Networkers

Casual askers use the **public room**. Networkers use the **Relay** extension ([`/extension`](https://myproblem.app/extension)) for garden-wall gather — not the retired ticket form.

Related: [`simple-max.md`](./simple-max.md) · [`anonymous-tickets.md`](./anonymous-tickets.md) · [`clevertree-chat.md`](./clevertree-chat.md) · [`dev.md`](./dev.md).

## Legacy

`SubmitTicketForm` + IndexedDB outbox → `/api/tickets` remain in-repo for APK / historical flush tests. They are **not** mounted on `/`, `/submit`, or `/c/…`. Mounting the form component only redirects to `/#room`.
