# Batched agent work (major coming soon)

**MyProblem is not trying to be a realtime Cursor/Codex chat.** Those tools win at fast interactive coding. We win at **Projects**: you leave clear instructions; a **batch worker** pulls the work, finishes it **completely** (implement, harden, test, deploy when asked), updates the ticket, and **notifies you when it is ready**.

Full LLC plan segment: [`../../relay/clevertree-llc-plan/10-batched-agent-work.md`](../../relay/clevertree-llc-plan/10-batched-agent-work.md).  
Website/KB companion: [`coding-and-websites.md`](./coding-and-websites.md) · KB [nearly-free website](../../myproblem-kb/general/web/set-up-website-nearly-free.md).

---

## The difference

| Realtime IDE agents | MyProblem batched agent Projects |
|---|---|
| Seconds-to-minutes chat loops | Minutes-to-hours (honest ETA) queue |
| Human steers every turn | Instructions up front; thorough autonomous pass |
| “Pair with me now” | “Set it in motion; ping me when done” |
| Always-on interactive GPU/context | Spot/MCP **only while the job runs**, then tear down |

---

## What a batch pass includes

1. Pull repo or workspace (and networking/DNS context if that is the ask).  
2. Understand the ticket ask end-to-end.  
3. Complete the change — not a partial sketch.  
4. Harden: tests, lint, obvious security fixes in scope.  
5. Deploy / upload artifacts if requested.  
6. Report on the ticket timeline; close or wait-for-user.  
7. **Delete ephemeral caches** (clones, encode scratch, temp exports) after publish.

Same pattern covers **programming**, **networking setup**, **documents**, **spreadsheets/office files**, and **heavy media pipelines** (e.g. NLE/timeline projects → verify → final file somewhere durable → purge scratch). We do not keep giant working trees on the shared tip store.

---

## Resources & readiness

- **Extra resources:** mostly larger Spot scratch + longer job leases + coding-model tokens — **not** a second realtime IDE fleet. Reuses Intake + Batch + MCP.  
- **Ready?** Ops pattern: near. Self-serve ticket type: **not yet**.  
- **How fast?** Next major product slice after core ticket/KB loops; dogfood on our own repos first. **Near future**, not vapor — still **check back soon** for public availability.

---

## Product copy (canonical)

- Major coming soon: **batched automated coding and digital work** (docs, spreadsheets, site deploy, even heavy render-style jobs).  
- Not a Cursor clone — **thorough batch completion** with notification.  
- Nearly-free website path already in the KB; in-product “build it for you” follows this batch model.
