# To-Do: Homepage Relay Vision Update (for Cursor)

**Repo:** `paradigm-threat/myproblem` (GitHub mirror; production deploys from GitLab `clevertree/myproblem` → Vercel)
**Date opened:** 2026-11-24
**Draft reference:** `docs/drafts/homepage-relay-vision-draft.md`
**Priority:** High — this is the public face of the Simple Max / Networker promotion.

---

## Context for the LLM

MyProblem is a local-first PWA for problem intake (IndexedDB outbox, FIFO sync, PWA service worker, mic/camera capture). The site also promotes the **Relay** vision: unifying data across existing social networks (Nextdoor, Facebook, X, Instagram, Reddit, etc.) via shallow, session-bound gathering done by human **Networkers** using the Relay browser extension (MV3, Chrome side panel). End users never install anything — they keep using their existing networks and get cross-network updates organized by incident and topic.

The homepage currently leads with generic "every problem deserves a way forward" copy. The new direction reframes it around the reader's existing online helplessness (following local channels, having links but no bandwidth to reply to every thread) and positions MyProblem as the free, immediate way to turn that into agency — organizing a "meta internet" on top of the real one.

Key source docs already in-repo:
- `docs/simple-max.md` — Simple Max strategy (simplest UI for end users, max reach/features/performance)
- `docs/capture-extension.md` — Networker role + extension mechanics
- `docs/capture-guidance.md`, `docs/capture-follow-up.md` — capture workflow
- Validated commercial diagram: generate/obtain `public/networkers-unify.png` (see draft for alt text and placement)

Tech stack: Next.js App Router, TypeScript, CSS modules via `globals.css` (existing classes: `.hero`, `.hero-bar`, `.hero-title`, `.hero-lead`, `.eyebrow`, `.cta-row`, `.btn-primary`, `.btn-secondary`, `.relay-promo`, `.section-graphic`, `.steps`, `.people-promise`, `.project-flow`). Do **not** introduce new CSS frameworks. Reuse existing class names; add new ones only if a section genuinely needs layout the current ones can't express, and keep them consistent with the file's naming.

---

## Tasks

### 1. Add the diagram asset
- [ ] Save the validated Networker unification diagram as `public/networkers-unify.png` (or `.webp` if you convert; update references accordingly).
- [ ] Confirm it renders at reasonable size on mobile (the site already uses `<picture>` with portrait sources for other graphics — follow that pattern if needed).

### 2. Update the homepage hero (`src/app/page.tsx`)
- [ ] Replace `hero-title` with: **You already care. Now every link you have pulls weight.**
- [ ] Replace `hero-lead` with the proposed copy from the draft (the helplessness → agency reframing, Simple Max mention, no-card promise, tip line). Keep the existing `<strong className="emph">` usage pattern for emphasis terms.
- [ ] Keep the eyebrow, CTA row, and hero media as-is unless a small label tweak is clearly better.
- [ ] Do not remove the "Powered by Relay" line or the `/how-we-run` and `/dev` links.

### 3. Update the "Be a Networker" section (`src/app/page.tsx`, `.relay-promo`)
- [ ] Replace the section body with the proposed copy from the draft: Networker = someone already in the communities they want to help; shallow session-bound gathering via the extension; one Networker covers a collection or a few; batch sanitization safety pipeline; end users never install anything; meta-layer syncs underneath.
- [ ] Insert the diagram (`/networkers-unify.png`) with the alt text from the draft, wrapped in a `<figure className="section-graphic">` like the other sections use, placed after the paragraphs and before the CTA.
- [ ] Keep the existing "Get Relay for Networkers" button pointing at `/extension`.
- [ ] Preserve `aria-labelledby` and heading ids for accessibility.

### 4. Create the dedicated Networkers page (recommended)
- [ ] Add `src/app/networkers/page.tsx` following the structure of `src/app/extension/page.tsx` (same layout primitives: `SiteHeader`, `main`, section classes).
- [ ] Content: condensed Simple Max narrative, the diagram, step-by-step Networker role, safety pipeline (batch → scrub PII → sanitize photos → reduce video to stills → human/AI review → trim post-back), and a CTA to `/extension`.
- [ ] Add it to `src/app/sitemap.ts` if that file enumerates static routes.
- [ ] Add a nav link in `src/components/SiteHeader.tsx` only if it doesn't clutter the existing header (it currently has home/submit/extension links — judge whether a fourth fits; if not, skip and rely on in-page links).

### 5. QA
- [ ] `npm run build` (or the repo's equivalent) passes with no TypeScript errors.
- [ ] Hero and Networker section read correctly at 375px and 1280px widths.
- [ ] All existing links (`/submit`, `/extension`, `/how-we-run`, `/dev`, business PDF) still resolve.
- [ ] No PII or internal-only references leaked into public copy (the draft is public-facing).
- [ ] Image alt text present and descriptive.

### 6. Deploy note
- [ ] This GitHub mirror does **not** auto-deploy. Production ships from GitLab `clevertree/myproblem` → Vercel. After the changes land on GitHub main, mirror them to the GitLab origin (same commit message is fine) so Vercel picks them up.
- [ ] Optional: push to a `gh-pages`-style preview branch first if you want to eyeball the copy at `paradigm-threat.github.io/myproblem` before touching production.

### 7. Wear OS + iOS expansion (roadmap addition, 2026-11-25)
- [ ] **Do not build native apps in this pass** — this section is planning context for a future to-do. Homepage copy should mention wearables only as a teaser ("coming to Wear OS and Apple Watch") with a waitlist signup or "in development" label. No promised dates.
- [ ] **Wear OS path:** Voice-first capture app on Wear OS (Kotlin + Jetpack Compose for Wear OS). Mic records a short problem description; local outbox via Room/DataStore; Data Layer API syncs queued items to the paired phone, which hands them to the existing MyProblem intake pipeline. Recommended dev device: **Pixel Watch 5** (~$300, Wear OS 7, Gemini built-in, reference device for Google's samples). Battery-focused alternative: **OnePlus Watch 3** (Wear OS 5, multi-day battery, ~$340 US / cheaper in EU — European units work in the US with a USB-C plug adapter; warranty/returns are the catch). **Samsung Galaxy Watch 9** (~$269) is the third option for Samsung-phone users.
- [ ] **Watch constraints to respect in any future spec:** no camera on any watch (voice + text only), no cellular on the OnePlus Watch 3 (phone or Wi-Fi required for upload; local queue survives offline), Gemini is the only polished built-in AI on Wear OS — Grok has no official Wear OS client (unofficial sideloaded clients exist but are incomplete).
- [ ] **iOS path:** Apple Watch cannot run standalone — every watchOS app needs a companion iPhone app, so an **iOS release of MyProblem is the gate** for Apple Watch support. Once iOS exists: SwiftUI watch app with mic capture, SwiftData/Core Data local storage, background sync when the phone is nearby. More locked down than Wear OS on background tasks, but fine for short voice notes and a queued outbox. Maintaining two native codebases (Kotlin + Swift) is the cost.
- [ ] **Positioning for the site:** the watch is not a replacement for phone/web — it's the fastest "I'm here, here's the update" surface. Networkers could log or check a group's status from the wrist. The smartwatch AI-chat space is thin (Gemini is a voice-command layer, not persistent multi-turn chat tied to local data), so a MyProblem-style offline-capable watch client has a real opening.
- [ ] **When ready:** open a separate to-do file (e.g. `todos/cursor-wearos-ios-expansion.md`) with full native-app task breakdown, or have Cursor scaffold from this section.

---

## Out of scope

- Changing the businesses / people / projects sections (separate pass).
- Modifying the extension itself or any service worker behavior.
- GitLab-side deploy automation changes.
- Updating `docs/simple-max.md` (already merged; this to-do only covers the *public site* presentation of it).
- Building actual Wear OS or watchOS apps in this pass (section 7 is roadmap context only).

---

## Done when

Homepage hero and Be a Networker section match the draft, diagram is live on the page, optional `/networkers` page exists, build is clean, the GitLab mirror has the same changes ready for Vercel, and the wearable/iOS roadmap is documented for the next to-do.
