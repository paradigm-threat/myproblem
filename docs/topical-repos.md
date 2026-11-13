# Topical multi-repo organization (progressive)

MyProblem grows **peer topical git repos** for tickets and knowledge — geography beside craft — **as needed**, not as a pre-seeded zoo. People never pick a repo. The AI reads each existing repo’s standing **RULES**, associates a ticket with every match, homes the tip in the **best** match (or **unorganized**), and may **mint / rename** pairs later the same way [Clevertree Chat](https://clevertree.chat) grows and renames topic keys.

Related: [`knowledge-base.md`](./knowledge-base.md) · [`anonymous-tickets.md`](./anonymous-tickets.md) · [`intake-batch-infra.md`](./intake-batch-infra.md) · [`projects.md`](./projects.md) · [`clevertree-chat.md`](./clevertree-chat.md).

---

## One-sentence rule

> **Score only repos that already exist; multi-associate; one home tip; spill into unorganized; mint or rename paired ticket+KB repos only when necessary — AI writes, public reads, ask a human on the ticket when unsure.**

---

## Locked decisions

| Decision | Rule |
|---|---|
| Progressive growth | Do **not** pre-create `house-repair`, `software`, etc. Mint ticket+KB pairs only on durable spill / clear need. |
| Peer topics | When they exist, `georgia` sits beside craft keys — not folders inside one mega-repo forever. |
| Renameable keys | Catalog `key` + `aliases[]` — same spirit as Clevertree Chat topic keys. |
| Qualification | Per-repo `RULES.md` (or fixed path); no public “pick a repo” UI. |
| Home tip | Best-qualifying repo holds `tickets/<uuid>/`; others get thin pointers — no tip duplication. |
| Unorganized | Always-available catch-all when nothing qualifies; growth feedstock. |
| Access | **AI-only** git commits; public read; human consult via ticket before risky mint/rename/merge. |

```
Ticket capture
   → load catalog (active keys only) + each RULES
   → associations = all above threshold
   → home = best match, else unorganized
   → Clevertree Chat on home tip `comments` branch
   → Batch searches all associated KB remotes
   → spill / cluster unorganized → propose mint (ask human if unsure)
   → rename/merge with aliases when keys need cleanup
```

---

## Bootstrap (what exists now)

| Piece | Role |
|---|---|
| Current ticket SoT (`myproblem-tickets-georgia` / `-israel`) | Keep serving; become first catalog entries when the catalog ships |
| Current sibling [`myproblem-kb`](../../myproblem-kb) | Keep as-is until a **necessary** split — **no mass folder→repo migration in this docs pass** |
| **`unorganized` pair** (tickets + KB) | Sole **required** new pair when routing ships — catch-all + growth |

Do not create a fantasy taxonomy of remotes “for later.” Least resistance matches Clevertree Chat: **do not mint a key just to catch a sentence.**

---

## Catalog = renameable topic keys

Standing catalog (Intake + Batch read; public may read) — one entry per topical pair:

| Field | Meaning |
|---|---|
| `key` | Current short id (`georgia`, `house-repair`, `unorganized`) |
| `aliases[]` | Former keys after rename (old associations still resolve) |
| `tickets_remote` | Ticket git remote for this topic |
| `kb_remote` | Sibling KB git remote |
| `rules_path` | Qualification file inside the ticket and/or KB repo (canonical: ticket repo `RULES.md`) |
| `status` | `active` \| `renamed_to` \| `merged_into` |

**Rename:** AI updates `key`, pushes old id into `aliases`, retargets associations that still use the old name. Tip UUID paths do **not** depend on the display key. Ask a human when the rename would move many homes or blur two crafts.

**Merge / split:** propose on a ticket; execute after OK (or alone only for tiny cleanups if RULES explicitly allow).

---

## Standing RULES (per repo, when it exists)

Each active topic carries AI-facing rules, e.g. `RULES.md`:

- Qualifies when / does not qualify when  
- Overlap policy (may co-exist with `georgia`, etc.)  
- Best-home weight hints  
- KB write policy after redaction  
- Rename policy (when this key may change)

Router loads RULES only for **catalog-active** repos — never for hypothetical future topics.

---

## Ticket routing

1. Capture packages the Problem (coarse place is a **field**, not a forced repo pick).  
2. AI scores each **existing** active catalog entry’s RULES against the tip.  
3. All scores above threshold → `associations[]` on the tip (ticket-repo + kb-repo ids).  
4. Highest score → **home** repo (`tickets/<uuid>/` lives there).  
5. Zero matches → home = **`unorganized`**.  
6. Non-home associations store a thin pointer (uuid + home remote + title hash) — not a second dossier.

Clevertree Chat mounts on the **home** tip; comment jobs on that home repo’s `comments` branch ([`clevertree-chat.md`](./clevertree-chat.md)). Project Batch **searches every associated KB** when investigating and writes shareable lessons into the matching KB remotes ([`knowledge-base.md`](./knowledge-base.md)).

---

## Growth (create as necessary)

1. Tips pile in **unorganized**, or clearly fail every existing RULES file.  
2. Batch drafts a new `key`, `RULES.md`, and paired remotes — **does not** mint yet if a human decision is needed.  
3. Decision ask on the ticket when unsure (name, scope, overlap with `georgia`, …).  
4. On go: mint ticket+KB pair, catalog entry, re-associate / move homes out of unorganized when appropriate.  
5. Later: rename/merge like Clevertree Chat key cleanup — **aliases** keep old links working.

Until the human replies on a consult, **do not mint** (wait).

---

## Access model

| Actor | Tips / comments | KB Markdown | Catalog / mint / rename |
|---|---|---|---|
| Public / users | Read via UUID capability | Read (Relay publish) | Read catalog |
| AI service | Commit tip, jobs, comments, associations | Commit articles/dossiers | Mint/rename when RULES allow; ask human when unsure |
| Human | Reply; answer AI decision asks | No direct commit | Approve/deny via ticket |

---

## Product copy (canonical)

- Repos grow **when needed** — not a giant empty taxonomy.  
- AI routes tickets using **standing RULES**; people just describe the problem.  
- One tip home; **many associations**; **unorganized** catches the rest.  
- Keys can **rename**; aliases keep history working.  
- **AI commits**; public reads; humans advise on the ticket when asked.

---

## Implementation checklist (docs → code)

1. Introduce catalog SoT (git file or small Relay app) with `unorganized` + existing georgia/israel entries.  
2. Add `RULES.md` to each active ticket topic repo.  
3. Intake: score → `associations[]` + home remote; no client repo picker.  
4. Mint path: propose → optional human OK → create remotes + catalog row.  
5. Rename path: aliases + association retarget; tip uuid unchanged.  
6. Batch: KB search/write across associations; comment drain on **home** only.  
7. Defer splitting today’s monolithic `myproblem-kb` until a durable need — then mint peers and migrate with aliases.
