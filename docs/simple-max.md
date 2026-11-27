# Simple Max

Relay product principle used across CleverTree surfaces (MyProblem, Relay extension, CleverTree Chat).

## Definition

**Simple** = the default interface stays minimal. Advanced features remain available, but stay out of the way until needed.

**Max** = full capability without premium unlocks, advertising, or artificial feature gates. Limits exist for capacity and safety—not as a sales funnel.

Site copy SoT: homepage `#simple-max`, glossary on [`/how-we-run`](../src/app/how-we-run/page.tsx).

## Networker application

The same principle applies to adoption:

1. **Adoption first.** People already using social networks should not need a new app for basic participation. Value should show up where they already are.
2. **Safety.** No deep scraping, no headless logins, no bot behavior that platforms hunt and kill.

Most people being helped never touch Relay software. They stay on Nextdoor, Facebook, X, and similar groups; Networkers and batch SI organize updates by incident and topic.

## How gather works

### Shallow, session-bound gather

Track groups and threads in existing social networks—shallow only. Enough to know a post exists, check again for updates, and gather it. The Relay browser extension (`extensions/capture`, `/extension`) harvests feed cards from the DOM while a logged-in human browses. It is not a bot scraper.

### The Networker

Networkers run the extension and related tools to keep groups synced by incident and topic. Each gathered post becomes one ticket candidate with an external ref (site, post ID, URL), tagged like `[[nd:group/post]]`.

### Batch, don't dump

The AI path receives batches. It does not dump raw captures into standing stores. It strips PII, scrubs photos, reduces video to stills, and prepares incidents for review before any trim status update returns to origin networks. Detail overflows to regional tip repos as needed.

### End-user experience

Homepage SoT is the public IRC room (`#mp-general` by default; collection rooms via `/c/…`), opened from header Chat. Ask there so publicity is obvious—type, speak, or video. Tip-repo submission queues are not the public submit path.

### Revenue

Public chat and channel AI stay free. Private chat is the paid lane that funds capacity. Seek tax-deductible donations (educational public-utility framing—do not claim 501(c)(3) status until the entity exists). Do not tip-push on the homepage.

## Safety posture

- Extension-primary: logged-out means no posts. Capture runs in a neighbor's browser session.
- No bot scrape. Headless login harvest is out of policy.
- Per-post tickets, never one ticket per group session.
- PII scrub before export or tips. Public tip links are stills only.
- Never auto-posts or auto-sends on the origin social network. Humans still edit origin replies.
- Soft-stop on harassment and poison vigilantism.

## Pilot

Demo allowlist: `#mp-general` and `#ga-savannah-cat-rescue`. Hidden channel menu links only those. Savannah pilot still ties Nextdoor Stray Cats → IRC → CleverTree WS.

## Status

Design and docs live in `myproblem` (`docs/capture-extension.md`, `docs/social-group-monitor.md`). Extension updates continue as gather and reply-assist mature.
