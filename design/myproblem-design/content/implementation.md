# Accessibility and implementation checklist

## Accessibility & OS
Target WCAG 2.2 AA: 4.5:1 normal text, 3:1 large text and meaningful graphics/control boundaries. Verify actual rendered states including focus (3:1 adjacent colors). Use strong border for controls; subtle border decorative only. Minimum 48x48 CSS px targets, 200% zoom, reflow at 320px. Keyboard navigation, skip link, dialog focus restoration, radio keyboard behavior, Escape dismisses menus. DOM reading order matches content. No color-only public/private distinction. Support forced colors and reduced motion, mobile safe areas and dynamic viewport sizing. Public composer announces visibility before posting, avoids excessive live announcements, preserves scroll position. Avoid exposing sensitive information. PII-stripped summaries require explicit policy and safeguards.

Site preference `myproblem.theme` on html[data-theme]; room preference `clevertree.room.theme` on .room[data-theme]. Each light/dark/system; default system; independent tokens, native color-scheme, OS changes only in system mode. Site alone controls theme-color. Pre-paint site bootstrap; initialize room before revealing it. Cross-origin iframe uses its own origin storage. Storage failure falls back to system. Test all 9 preference pairs under both OS appearances (18 scenarios), reload, tab sync, blocked storage and hydration. Keep direct public room access where technically possible without JS.

## Next.js proposed structure
```
apps/myproblem/app/{layout.tsx,page.tsx,businesses/,investors/,extension/,how-we-run/,rules/,room/,privacy/,disclaimers/}
apps/relay-extension/src/{components,collection,theme}/
apps/clevertree-chat/src/{RoomShell,Composer,Transcript,theme}/
packages/{design-tokens,ui,theme,content,icons}/
```
Adapt to existing repositories; this is not a verified repo layout.

## Foundation
- [ ] Create semantic palettes; use a single token source to generate CSS.
- [ ] Load and self-host Literata, Public Sans, IBM Plex Mono.
- [ ] Integrate shared icon primitives and custom icons.
- [ ] Bind independent site and room controllers to React state.
- [ ] Inline CSP-compatible pre-paint bootstrap after theme-color meta; server renders system preference; reconcile hydration.
- [ ] Sync browser color-scheme and theme-color.

## Shared components
- [ ] Header and responsive navigation.
- [ ] Accessible three-state theme control.
- [ ] Button and CTA primitives.
- [ ] SectionShell and integrated hero.
- [ ] VisionStrip and disclaimer.
- [ ] RoomLauncher and footer.

## Pages
- [ ] Homepage in required audience order.
- [ ] Businesses with auto shop example.
- [ ] Investors with hardware, mesh and posted rules.
- [ ] Extension with Simple Max workflow.
- [ ] How we run with product family map.
- [ ] Rules, privacy, disclaimers.

## Room and network integration
- [ ] Connect homepage CTA to actual public IRC room.
- [ ] Verify no account required for public help.
- [ ] Remove tip queues from public submission path.
- [ ] Integrate CleverTree Chat RoomShell.
- [ ] Persist room theme independently.
- [ ] Explicit public/private privacy boundaries.

## Art and performance
- [ ] Create 16 illustrations; export responsive AVIF/WebP.
- [ ] Theme-aware image selection.
- [ ] Optimize hero loading and layout stability.
- [ ] One 2.4s network trace, 140ms control response, 220ms room transition.
- [ ] Reduced motion across products.

## Governance and release QA
- [ ] Confirm compatibility protocol, fee limits, funding structure and participation terms.
- [ ] Define visible rules, enforcement and no-shadow-censorship commitment.
- [ ] Confirm private retention and summary safeguards.
- [ ] Verify operational status of private tickets, extension and optional Stripe tips.
- [ ] Test 18 site/room/OS scenarios and storage failures.
- [ ] Test keyboard, contrast, zoom, screen readers, forced colors and responsive layout.
- [ ] Verify free public help on all routes.

## Acceptance
First viewport clearly states public help and intelligence are free forever, no signup, direct public room CTA. Businesses, Networkers and operators are distinct roles. No tip push, private sales funnel, premium intelligence claim or promised return. Commitments must be distinguished from not-yet-operational features without weakening the vision.
