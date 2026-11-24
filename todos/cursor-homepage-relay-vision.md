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

---

## Out of scope

- Changing the businesses / people / projects sections (separate pass).
- Modifying the extension itself or any service worker behavior.
- GitLab-side deploy automation changes.
- Updating `docs/simple-max.md` (already merged; this to-do only covers the *public site* presentation of it).

---

## Done when

Homepage hero and Be a Networker section match the draft, diagram is live on the page, optional `/networkers` page exists, build is clean, and the GitLab mirror has the same changes ready for Vercel.
