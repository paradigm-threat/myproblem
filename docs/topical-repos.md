# Topical multi-repo organization (progressive)

**Terminology:** **SI** = Super Intelligence (i.e. AI) — preferred name for the investigating software.

MyProblem grows **peer topical git repos** for tickets and knowledge — geography beside craft — **as needed**, not as a pre-seeded zoo. People never pick a repo. The SI reads each existing repo’s standing **RULES**, associates a ticket with every match, and homes the tip in the **best** match. When no existing topic fits (or a **new** topic is recommended), Intake **caches the request on the server** and Batch **blocks** until a **human** creates the remotes and catalog row. There is **no `unorganized` catch-all repo**.

Related: [`knowledge-base.md`](./knowledge-base.md) · [`fixit-and-repair.md`](./fixit-and-repair.md) · [`anonymous-tickets.md`](./anonymous-tickets.md) · [`intake-batch-infra.md`](./intake-batch-infra.md) · [`projects.md`](./projects.md) · [`clevertree-chat.md`](./clevertree-chat.md).

---

## One-sentence rule

> **Score only repos that already exist; multi-associate; one home tip; if nothing fits or a new topic is proposed, cache on the server and wait for a human during batch — humans mint private ticket + public KB remotes manually; batch (Cursor Phase 1 / Spot Phase 2) writes tips/KB after remotes exist; public reads KB, tips stay capability-private.**

---

## Locked decisions

| Decision | Rule |
|---|---|
| Progressive growth | Do **not** pre-create `fixit`, `software`, etc. Mint ticket+KB pairs only on clear need. |
| Peer topics | When they exist, `georgia` sits beside craft keys. |
| Renameable keys | Catalog `key` + `aliases[]`. |
| No unorganized | Unmatched tips stay in **server cache / blocked batch**; human mints remotes. |
| Human mint | SI may recommend a key; Batch blocks while remotes missing. |
| Access | Batch commits tips (private) + KB (public) after remotes exist. |
| Privacy | Tips + `comments` on **private** remotes; KB on **public** remotes — not one repo ([`batch-phases.md`](./batch-phases.md)). |

```
Ticket capture
   → load catalog + RULES
   → associations = above threshold
   → home = best match, else cache + proposed_topic + Batch block
   → Human creates remotes + catalog
   → Re-home tip → Clevertree + Batch
```

## Bootstrap

| Piece | Role |
|---|---|
| `myproblem-tickets-georgia` / `-israel` | First catalog entries |
| `myproblem-kb` | Keep until necessary split |
| Server cache + human mint | Replaces catch-all remote |

Prefer craft keys such as **`fixit`** when DIY/physical repair is the home (see [`fixit-and-repair.md`](./fixit-and-repair.md)).

**Social / animals pilot:** place-tied cat tips home in **`georgia`**. The `savannah-cat-rescue` **collection** is a localized roster of Savannah forums (health + strays/…), not a new tip remote ([`social-group-monitor.md`](./social-group-monitor.md)). Mint a craft remote later only if RULES clearly prefer it over georgia.
