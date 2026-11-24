# Homepage Draft — Relay Vision Update

**Status:** Draft for review. Not yet applied to `src/app/page.tsx`.
**Date:** 2026-11-24
**Related to-do:** `todos/cursor-homepage-relay-vision.md`

---

## Goal

Reframe the homepage hero and Networker section around the Relay vision: turning online helplessness into immediate agency. The page targets people who already follow local channels (cat networks, community groups) and feel stuck — they have a few links to offer but not the bandwidth to reply to every thread. Most threads go unanswered.

This page entices them to join for free and start helping immediately, organizing a **meta internet** — keeping track of real pages inside social networks in a semi-real-time, as-often-as-you-feel-like-it, as-easy-as-possible way. Connect everyone to everyone, every problem to every solution.

## Proposed hero changes (`src/app/page.tsx`)

### Current hero title
> Every problem deserves a way forward.

### Proposed hero title
> You already care. Now every link you have pulls weight.

### Current hero lead
> Write it down or record what happened. Stay connected as people and SI help move it forward. **Max and simple** — full help behind few modes. Free for everyone, anonymous first, no paywall. Free forever. You should never expect to enter a card. If the help was good, tip the person, the SI, or both.

### Proposed hero lead
> Most people who want to help online feel stuck. You follow the local cat groups, the neighborhood pages, the rescue threads — and you have a few links worth sharing, but replying to every unanswered post is a second job nobody signed up for. Most of those threads just sit there.
>
> MyProblem turns that into something you can actually do. Join free. Help as often as you feel like it. You're not installing a new app for strangers to learn — you're organizing the internet you already live in: the groups, the threads, the posts across Nextdoor, Facebook, X, and the rest, synced into one place by incident and topic. People on those networks keep using what they already use. They just start seeing updates they never would have found, and all they have to do is reply.
>
> That's Relay. **Max and simple** — the simplest possible experience for the people being helped, maximum reach for the people helping. Free forever, anonymous first, no paywall. No card expected. If the help was good, tip the person, the SI, or both.

### CTA row (unchanged structure, updated labels)
- Primary: **Try it now** → `/submit`
- Secondary: **Be a Networker** → `/extension`
- Secondary: **Business one-pager (PDF)** → existing PDF path

## Proposed "Be a Networker" section changes

### Current copy
> A Networker keeps help moving — photos, action notes, and gather from groups you already visit. The **primary way to network** is the Relay browser extension (Chrome side panel). The phone app can add evidence to tips; it cannot read other apps' feeds. No automatic posting.

### Proposed copy
> A Networker is anyone who already belongs to the communities they want to help — and is willing to sign into a few familiar pages a day. That's it. No new app to learn, no audience to build, no schedule to keep.
>
> Using the Relay browser extension, a Networker does **shallow, session-bound gathering**: reading what's already visible in their logged-in feeds on Nextdoor, Facebook, X, Instagram, Reddit, and similar platforms, and turning relevant posts into structured tickets. One Networker can cover an entire collection of related groups — say, every Savannah cat rescue page across five networks — or even several collections, as long as the scope stays human-sized.
>
> What makes it safe: captures arrive at the AI server in **batches**, not a live firehose. The server scrubs PII, sanitizes photos, reduces video to choice stills, and prepares incidents for human or AI review before anything posts back as a trim status update on the origin networks. Detail overflows into the repo; social feeds only ever see the clean version.
>
> The people being helped never touch MyProblem. They keep scrolling the groups they already scroll. The meta-layer — the syncing, the deduping, the cross-network linking — happens underneath, in semi-real-time, at whatever cadence the Networkers choose.
>
> [Diagram: `public/networkers-unify.png` — Networkers unify related community groups across social networks. One person. A few platforms. A few focused collections.]
>
> Get started: [Get Relay for Networkers](/extension)

## Diagram asset

- File: `public/networkers-unify.png` (the validated ChatGPT-generated commercial diagram)
- Alt text: "Networkers unify related community groups across social networks. Social network icons on the left feed into a central Networker, who links related groups into one Collection hub on the right. Bottom callout: scalable but focused — one Networker manages a few collections, not unlimited."
- Placement: inside the Be a Networker section, after the explanatory paragraphs, before the CTA.

## New dedicated page (optional, recommended)

Create `src/app/networkers/page.tsx` (or `/simple-max`) with:
- Full Simple Max strategy narrative (condensed from `docs/simple-max.md`)
- The diagram
- The Networker role explained step by step
- Safety pipeline (batch → sanitize → review → trim post-back)
- Link back to `/extension` for install

## Tone notes

- Commercial but warm. Not startup-jargon.
- Lead with the reader's existing helplessness, then the immediate path out of it.
- Never ask them to abandon their current networks. The pitch is *amplify*, not *migrate*.
- "Meta internet" is the umbrella term — use it once, early, and let the concrete examples carry the rest.
