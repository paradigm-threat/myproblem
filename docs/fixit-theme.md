# FixIt Theme (v1 locked)

MyProblem problem / ticket pages. Navy glass palette, mobile-first, sticky horizontal chip nav.

## Locked section order
1. Overview (status + hazard callout + story)
2. Photos (simple grid → lightbox)
3. Routes (always visible; cards scroll to Advice and focus keyed Clevertree Chat thread)
4. Advice / Chat (compact inline → expand to full board on same URL)
5. Approaches (curated list)
6. Safety / legal footer

## Nav
- Sticky horizontal chips under hero: Overview · Photos · Routes · Advice / Chat · Approaches · Safety
- Mobile: scrollable chips (“Jump to” sheet only if overflow)
- Desktop: same chips + optional progress
- Not side rail, not bottom-only

## Palette & type
- Navy glass: `#070d18` / `#0f1a2c`
- Mint: `#5fd4a4`
- Ticket blue: `#4eb8ff`
- Warm gold: `#f0c14b`
- Fonts: Fraunces (display) + Manrope (body)

## Key behaviors
- Hazard soft-stop: full callout in hero; thin sticky bar on scroll. Outranks status.
- Share + Remember near top (peer to Advise).
- Advise / join chat near each route.
- Routes never collapse. Empty routes stay quiet “waiting for posts”.
- No charity-fund chrome. Tool/workshop feel via navy + gold.
- Notices fixed: training SI, SI organizes after batch (does not authorize / pick winner), slug-only public URL, scrubbed stills.

## Files
- `css/fixit-theme.css`
- `examples/problem-page-demo.html` — garage-ring-power ticket
- `images/` — navy background + nav icon sheet

## Per-ticket config (v1)
Small object: title, description, hazard, routes, stills, coach/note, chat topic.  
CSS variables only for rare accent overrides later.
