# 01 Brand brief — The Open Commons
Public intelligence. Local help. Open infrastructure.

MyProblem is a public-facing entrance to a civic intelligence network, not a SaaS funnel, tip marketplace or speculative investment product.

## Hierarchy
- CleverTree: parent institutional identity.
- CleverTree Relay Vision: free public SI, interoperable mesh, posted rules only.
- MyProblem: public help, local businesses and private mediated tickets.
- Relay: Networker extension, gather, paste-back, cross-network connector.
- CleverTree Chat: RoomShell and IRC communication; independent appearance.

## Founder pull-quotes
> CleverTree Relay Vision sees SI (superintelligence / structured intelligence) as a public utility that should be free.

> Public help and public channel AI stay free forever.

> No more hidden shadow censorship at all ever.

> Networkers do not sell product; they connect people in place.

> Simplest possible experience + max reach.

## Personality and voice
Civic, human, accountable, pragmatic. Write like a public librarian and infrastructure engineer. Short declarative sentences. Say “Public help is free. Forever.” not “Unlock powerful AI-driven solutions.” Say “Fund or operate network infrastructure,” not “Invest in the next AI revolution.” No promised returns, conversion pressure, premium intelligence claims, or tip-push.

## Visual direction
Contemporary civic architecture, municipal wayfinding, technical diagrams, observational editorial illustration. Mineral white and harbor navy; commons green for public help, ticket blue for privacy, infrastructure gold for capacity. Open-node wordmark: equally accessible endpoints around a junction. No robot, brain or sparkle. Avoid purple glow, cream/terracotta broadsheet, neon, glassmorphism, floating hero badges and hero card grids.

# 02 Visual system
See CSS for complete color tables. Literata display, Public Sans text, IBM Plex Mono technical labels. Display 72–92px desktop / 44–52px mobile; H1 60–76 / 40–48; H2 44–56 / 32–38; H3 24–28 / 22–24; lead 20/18; body 17/16; UI 15/16; captions 13–14. Display weight 500, body 400, UI 550–600. 4px spacing base; 1440px container; 68ch reading width; 12/8/4-column grids; gutters 24/24/16px; section padding 96–128 desktop and 56–72 mobile. Radii 2/6/10/16px. Borders before shadows. Elevation only for overlays. Motion: one 2.4s connection trace, 140ms interface feedback, 220ms room transition; reduced motion removes these.

# 03 Icons
24px outline, 1.75px stroke, rounded caps and joins, currentColor. 20px UI, 24px navigation, 32–48px explanatory. See icons directory. Decorative SVG aria-hidden; standalone controls need accessible names. No tip symbol in hero.

# 04 Components
- Header: opaque, 80px desktop/64 mobile. Home /, Businesses /businesses, Funding /investors, Extension /extension, How we run /how-we-run; theme trigger. Active route underline and aria-current. Mobile menu with theme choices.
- Theme control: Light, Dark, System radio choices with sun/moon/monitor and accessible labels. Persist preference, not resolved theme.
- Buttons: green primary public CTA; outlined secondary; blue private; gold infrastructure. 48px minimum target. No competing signup CTA.
- CTA row: primary and secondary, optional caption “No account required. Public help stays free.”
- Section shell: context label, headline, short copy, one action, integrated art. Alternate art position without changing DOM reading order.
- Vision strip: full-width navy band, “Intelligence should be a free public utility.” Public help and public-channel SI stay free. Private services fund privacy, infrastructure and model usage. Link to vision.
- Room launcher: “Public help room — Powered by CleverTree Chat.” Ask a question in the public network. People and SI can help find an answer. Warn that messages are public and not to post sensitive information. Open actual public IRC, not tip queue. Secondary private ticket link.
- Disclaimer: neutral readable border, 14px; warning color only for genuine risk. Examples are not prices or forecasts.
- Footer: Use (public room, businesses, private tickets); Connect (extension, funding, Chat); Accountability (how we run, posted rules, privacy, disclaimers). “Public intelligence should be free.”

# 05 Pages
## Homepage /
One integrated hero, brand visible, no inset media cards. Art: connected neighborhood with real people helping.

### Help belongs to everyone.
Public help and intelligence. Free forever, without an account.

**Enter the public room** · How it works

Compact vision strip closes the hero; next main section is Businesses.

### Good businesses are good neighbors.
Answer questions in your community. Share what you know. Sometimes a helpful conversation becomes paid work.
**Are you a business?** → /businesses

### Connect people where they already are.
People shouldn't have to join another app to get help. Relay helps Networkers bring useful questions into the public network and carry answers back.
**Get to know Relay** → /extension

### Help build the network.
Free public intelligence needs real infrastructure. Fund capacity or operate a compatible Relay node under publicly posted rules.
**Explore funding and node operation** → /investors

### The same help. A different privacy boundary.
Public: free forever, no account, public conversations, people and SI, optional support only. Private: mediated ticket, same help quality, metered model usage, infrastructure and provider costs. Payment covers private service, not superior intelligence. Optional tips to people/SI/both via Stripe later; no homepage tip push.

### Nothing hidden.
Every participating Relay network must publish its rules. Local legal restrictions must be visible. No hidden shadow censorship. Link to how we run, posted rules, privacy and disclaimers.

## /businesses
### Be helpful. Be local.
Answer questions, share your expertise and connect with people who need your services. Public participation is free.
**Visit the public room** · See how it works

### A conversation, not a purchased lead.
Someone asks why their car makes an unfamiliar sound. A mechanic offers useful guidance in the public room. The person may thank them, leave an optional tip when available, or bring the car in for paid work. No purchased lead or hiring obligation. Illustration, not forecast.

Public questions are free to ignore; private tickets can compensate provider time. Relay mediates official tickets. Businesses use the network, not operate hardware. Separate funding role if desired.

### Start by being useful.
See what people are asking in the public room. Answer when you have something helpful to contribute.
**Enter the public room**

## /investors
### Build the infrastructure for free intelligence.
Fund capacity or operate Relay-compatible hardware. Keep public intelligence accessible under rules everyone can see.
**Explore node operation** · Read the commitments

Free intelligence requires real infrastructure: servers, networking, storage, electricity and model capacity. Fund capacity without operating it yourself, or host hardware and connect to the wider network.

### Local infrastructure. Shared compatibility.
Operators may host their own infrastructure, adapt source code and configure services for their region. They must maintain cross-network compatibility based on the Relay Vision. Incompatible isolation is not acceptable.

### No more hidden shadow censorship at all ever.
Participating networks must publicly disclose censorship rules, including restrictions required by local law (including religious restrictions where applicable). Everyone must be able to see the rules. This does not imply identical rules everywhere or unlimited permitted content.

### Cover the cost of service. Keep the commons free.
Private service may cover metered model usage, infrastructure fee and compensated provider time. Example: $0.65 of model use, plus applicable fees. Illustration only, not price or return forecast. Operators may set fees within accepted limits; actual caps and terms remain to be defined.

Proposed checklist: free public SI, required Relay interfaces, cross-network connection, regional adaptation within compatibility, published restrictions, no hidden censorship, accepted fee limits, privacy, operational security, visible operator identity and rules record.

**Discuss infrastructure participation** (not Invest now until terms and legal requirements are established).

## /extension
### Help travels further when people connect it.
Relay helps Networkers gather questions from existing communities and bring useful answers back.
**Explore the Relay extension** · Read the Networker guide

Notice a post in Nextdoor, Facebook, X or another existing community → gather selected context in a real logged-in browser session → tag into collection IRC → batch/LLM or human drafts → human review and paste back to origin. No forcing new apps, headless login harvesting, bot scraping or mass posting. Respect platform permissions and privacy.

## /how-we-run
### Nothing hidden.
Intelligence should be a free public utility. The infrastructure that supports it should be connected, accountable and governed by rules everyone can see. This is the CleverTree Relay Vision.

Editorial document with version history: founding vision, public help, private services, shared knowledge, Simple Max, product family, governance, posted rules, fees, accountability, disclaimers. Proposed private summaries must strip PII and follow a defined privacy policy; anonymity cannot be guaranteed by automated stripping alone.

Rules directory: operator/region, jurisdiction, restrictions, legal/policy basis, enforcement and notification process, effective date, change history, contact/review process. Missing rules must be identified, not treated as unrestricted. No hidden shadow censorship.

## Sibling products
Relay: compact browser utility, selection/gather/review/paste-back workflow. Chat: dense communication surface, RoomShell, composer, transcript, public/private labels and independent theme. Share fonts, icons, semantic tokens and vision; do not turn tools into marketing pages.
