# MyProblem / Clevertree Chat / QuizGate UI kit

Max and simple. Static design reference, not a running application.

**Vendored for Re-SimpleMax.** Live surfaces: site (`src/styles/ui-kit-tokens.css`, `/public/design/ui-kit/`), Relay extension (`extensions/capture/tokens.css` + icons), APK (FixIt / AppColors aligned).

- `screen-board.html`: self-contained responsive visual reference with 20 screens/states and an icon gallery. Open in a browser. Controls are deliberately non-interactive.
- `tokens.css`: reusable design-system variables.
- `icons.svg`: SVG symbol sprite. Example: `<svg width="24" height="24" aria-hidden="true"><use href="icons.svg#chat"/></svg>`.
- `icons/`: 31 standalone SVGs, all with a 24 × 24 viewBox, currentColor, rounded 1.8px strokes.

Example content and counts are illustrative. The screen-by-screen interaction contract is in the accompanying response. No backend or extension implementation is included. Visual board is a static browser mockup; it has not been validated on physical devices or with assistive technology.
