# Room themes (swappable packs)

IRC-client style theming: **base** (structure) + separate **light** / **dark** packs.

| File | Role |
|------|------|
| `base.css` | Fonts, spacing, radii, motion — shared by every pack |
| `light.css` | Living Commons light palette |
| `dark.css` | Living Commons dark palette + OS `prefers-color-scheme` when pref is `system` |
| `index.css` | Imports all three |

Preference key: `localStorage clevertree.room.theme` = `system` (default) | `light` | `dark`.

Room root uses:
- `data-theme-pref` — stored preference
- `data-theme` — resolved `light` | `dark` (for components that need a concrete scheme)

To add a future pack (e.g. `high-contrast`), add `themes/high-contrast.css` and register it in JS; keep light/dark files intact.
