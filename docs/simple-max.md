# Simple Max — Unifying Social Data Without New UIs

## The problem Relay was always solving

Relay's core problem was unification with safety: one corpus of group and thread data, kept anonymous, with no path for anyone to start spying on houses through it. Two hard constraints shaped everything:

1. **Adoption first.** People already using social networks shouldn't have to be convinced to use new software. The value has to show up where they already are.
2. **Safety.** No deep scraping, no headless logins, no bot behavior that platforms hunt and kill.

## The solution: Simple Max

**Simple** = the simplest possible experience. Most users never touch a new UI at all. They keep using Nextdoor, Facebook, X, and the groups they already belong to, and they still get the benefits — organized updates across networks based on incident and topic. All they have to do is reply.

**Max** = max reach, max features, max performance. One strategy that works across every walled garden without building a separate front door for each.

## How it works

### Shallow, session-bound gather

Track groups and threads in existing social networks — not deep, just shallow. Enough to know a post exists, check it again for updates, and gather it. The **MyProblem X browser extension** (`extensions/capture`, served at myproblem.app/extension) is the key piece: it harvests feed cards from the DOM while a real, logged-in human browses. Things that would be blocked without the right session — inside the walled gardens — become visible because the extension rides an authentic session. It is explicitly not a bot scraper.

### The Networker

The **Networker** is the human role at the center. Networkers run the extension and other tools to keep groups synced and updated across social networks, organized by incident and topic regardless of where they live. Each gathered post becomes one ticket candidate with an external ref (site, post ID, URL), tagged like `[[nd:group/post]]`.

### Batch, don't dump

The AI server receives everything in batches. It does not dump raw captures into the repo. It sanitizes heavily: strips PII (names, phones, streets, payment handles), scrubs photos, reduces video to choice stills, and prepares incidents for human or AI review before anything posts back as a status update. Trim posts land on the social networks per the rules; the full detail overflows to the regional tip repos.

### End-user experience

End users never have to use Relay software. They reply on the network they already use. The Networker gatherer picks up anything new automatically and batches it. Clevertree Chat can mount on outlier URLs on demand without minting a tip. Origin replies stay on the origin network; helper debate happens on Clevertree's WS/IRC side.

## Safety posture

- Extension-primary: logged-out means no posts. Capture runs in a neighbor's browser session.
- No bot scrape. Headless login harvest is out of policy.
- Per-post tickets, never one ticket per group session.
- PII scrub before export or tips. Public tip links are stills only.
- Never auto-sends, never auto-uploads. Humans always edit and send.
- Soft-stop on harassment and poison vigilantism.

## Pilot

Savannah Cat Rescue is the pilot collection: Nextdoor Stray Cats group, IRC `#ga-savannah-cat-rescue`, Clevertree WS topic, regional tip home under `myproblem-tickets/regions/georgia`. Curator rubric gates ticket vs. outlier (promo, memorials, off-topic stay as channel stats only).

## Status

Design and docs are in `myproblem` (`docs/capture-extension.md`, `docs/social-group-monitor.md`). The georgia regional forum-platforms file and live group ID wiring are still pending. Extension updates are expected as the gather state machine and reply-assist mature.
