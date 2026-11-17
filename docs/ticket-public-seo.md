# Public ticket SEO (`/t/[slug]`)

How MyProblem renders share/search metadata for problem tickets.

## Not Relay SSR for public HTML

| Layer | Role |
|-------|------|
| **Vercel / Next.js App Router** | Renders `https://myproblem.app/t/[slug]` HTML + `<head>` metadata (SSR / RSC). |
| **Intake** (`intake.myproblem.app`) | Resolves live slug → tip via `GET /api/slugs/:slug`. Tip SoT is regional git. |
| **Relay gateway** | Hosts tip dossier / Clevertree mounts on Intake — **not** the public marketing HTML for `/t/`. |

Flow:

```
Crawler or browser
  → myproblem.app/t/<slug>   (Next.js on Vercel)
  → generateMetadata + page RSC
  → seed JSON (pilot) OR fetch Intake /api/slugs/<slug>
  → HTML + Open Graph + JSON-LD
```

Pilot seeds under `content/public-tickets/` are bundled at build time so those pages stay online without Intake. Live tickets use `cache: "no-store"` Intake fetches.

## Branding rules

- Title: `{problem title} — Problem ticket · MyProblem`
- Description starts with `Problem ticket on MyProblem.app (region). …`
- Canonical / `og:url`: `https://myproblem.app/t/<slug>` only — **never** uuid
- Visible kicker on the page: “Problem ticket on MyProblem.app”
- Share sheet text: `{title} — problem ticket on MyProblem`

## Indexing

| Kind | `robots` | Sitemap |
|------|----------|---------|
| Curated seed (`source: "seed"`) | index | yes (explicit entries) |
| Live Intake tip | **noindex** | no |
| Missing / unpublished | noindex | — |

Live tickets stay out of search indexes because they are ephemeral anonymous shares. Share previews (Slack, iMessage, social) still get full Open Graph cards.

## Code

- [`src/lib/tickets/ticketSeo.ts`](../src/lib/tickets/ticketSeo.ts) — title/description/OG helpers
- [`src/app/t/[slug]/page.tsx`](../src/app/t/[slug]/page.tsx) — `generateMetadata` + page
- [`src/components/ticket/TicketJsonLd.tsx`](../src/components/ticket/TicketJsonLd.tsx) — per-ticket JSON-LD

Related: [`anonymous-tickets.md`](./anonymous-tickets.md) · [`fixit-and-repair.md`](./fixit-and-repair.md) · [`intake-batch-infra.md`](./intake-batch-infra.md).
