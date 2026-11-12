# MyProblem — Testing Phase Roadmap

**Status (Nov 2026):** Entering testing phase. Core architecture, ticket model, intake flow, and Android testmode shell exist. Almost nothing has been end-to-end product-tested on real devices yet. Product UI is incomplete (a few test pages only).

## Current State Summary

- **Android app** (`apps/android-testmode`): Functional shell for tickets, local store, camera stills + audio capture, frame gating, coach, sync to `intake.myproblem.app`. Mostly test/debug surfaces. No polished product UI.
- **Server / intake**: Ticket HTTP, progressive transcription, Project queue, regional Relay git dossiers, KB-first investigation. You handle server logging and ops.
- **Docs**: Strong contracts for tickets, Projects (batch investigation), capture guidance, confidence gauge, anonymous access, etc.
- **Not yet**: Finished product UI, real device testing of the full simultaneous audio+visual+AI conversation flow, public network posting of tickets, tip flow, iOS, merchant handoff at scale.

**Goal of this phase:** Reach a usable testing build where a person can start a ticket, talk and show a real everyday problem (e.g. “fix this fence”), gather enough evidence while the AI coaches, send a complete package to the server, and get a queued batch Project that investigates thoroughly (tools, DIY, local resources, hire if needed). Prefer free / least-resistance path. Tip optional at the end.

## Next Major Steps

1. **Finish the product UI on Android** (highest priority for other developers / LLM-assisted work)
   - Replace test pages with a clear Home → New ticket → Capture → Timeline flow.
   - Full simultaneous experience: camera preview + audio recording + live AI coaching / questions while the user talks and shows the problem.
   - Stills only to the server (no video files); local preview can feel continuous.

2. **Device testing & observability**
   - Real phones (various Android versions/hardware). End-to-end: start ticket → capture → upload → server intake → Project queue.
   - Server logging (you own this) so we can see what tickets actually look like and where the flow breaks.
   - Performance and UX fine-tuning (battery, latency of coach, frame quality, reliability of stop/start).

3. **Everyday problem catalog & investigation path**
   - Validate the full loop on concrete cases (fence repair, clogged sink, etc.): analyze, identify tools needed, scan existing tools, recommend what to buy and where, fall back to local hired help.
   - Least path of resistance, preferably free. Public post of the (PII-safe) ticket on the MyProblem network so others + automated AI can help.
   - Optional tip at the end (Lyft-style). No tip = process stays completely free.

4. **Stabilize & expand**
   - Once Android testing is solid: iOS counterpart, more public network features, merchant/human handoff, refined KB growth.

## Timeline (rough)

| Phase | Focus | Outcome |
|-------|--------|---------|
| **Now – next 1–2 weeks** | Product UI completion + first real device tests | Usable Android capture → ticket → Project flow on physical devices |
| **Testing phase** | Everyday problems, tool/DIY/hire paths, public posting, tip | Validated free-first experience; server logs + user feedback drive fixes |
| **After** | iOS, scale, merchant network, more automation | Broader pilot (Georgia & Israel) |

## What We Need from Other Developers

Connect the Android APK (or later iOS) and follow the companion **Developer Testing Phase** document. Use an LLM to implement the missing product UI and experience while staying inside the existing architecture (tickets, stills+audio, batch Projects, free-forever + optional tip). Device testing is the real validation.

Server-side logging and batch investigation remain with the core team for now.

See also: `docs/apk-ticket-ux.md`, `docs/projects.md`, `docs/capture-guidance.md`, `docs/progressive-transcription.md`.
