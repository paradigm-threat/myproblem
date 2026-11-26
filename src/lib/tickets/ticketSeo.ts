import type { Metadata } from "next";
import { OG_IMAGE, SITE_URL } from "@/lib/contact";
import type { PublicProblemView } from "./slugResolve";

/** Public share URL for a live slug (never include ticket_uuid). */
export function ticketPublicUrl(slug: string): string {
  return `${SITE_URL}/t/${encodeURIComponent(slug)}`;
}

/**
 * Curated pilot seeds may be indexed (listed in sitemap).
 * Live Intake tickets stay noindex — ephemeral anon shares.
 */
export function ticketAllowIndex(problem: PublicProblemView): boolean {
  return problem.source === "seed";
}

export function ticketSeoDescription(problem: PublicProblemView): string {
  const body =
    problem.description.trim().slice(0, 140) ||
    "Anonymous help request with photos and solution routes.";
  const region =
    problem.region === "israel"
      ? "Israel"
      : problem.region === "georgia"
        ? "Georgia"
        : problem.region;
  return `Problem ticket on MyProblem.app${region ? ` (${region})` : ""}. ${body}`;
}

export function ticketSeoTitle(problem: PublicProblemView): string {
  const base = problem.title.trim() || "Untitled problem";
  return `${base} — Problem ticket · MyProblem`;
}

export function ticketShareText(title: string): string {
  const base = String(title || "").trim() || "This problem";
  return `${base} — problem ticket on MyProblem`;
}

export function buildTicketMetadata(problem: PublicProblemView): Metadata {
  const url = ticketPublicUrl(problem.slug);
  const title = ticketSeoTitle(problem);
  const description = ticketSeoDescription(problem);
  const index = ticketAllowIndex(problem);
  return {
    title: { absolute: title },
    description,
    applicationName: "MyProblem",
    authors: [{ name: "MyProblem", url: SITE_URL }],
    creator: "MyProblem",
    publisher: "MyProblem",
    robots: {
      index,
      follow: index,
      googleBot: { index, follow: index },
    },
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: "MyProblem",
      title,
      description,
      url,
      locale: "en_US",
      images: [
        {
          ...OG_IMAGE,
          alt: `${problem.title || "Problem"} — ticket on MyProblem.app`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
    other: {
      "myproblem:kind": "problem-ticket",
      "myproblem:slug": problem.slug,
    },
  };
}

/** JSON-LD for one public ticket page (no uuid in public graph). */
export function ticketJsonLd(problem: PublicProblemView) {
  const url = ticketPublicUrl(problem.slug);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: ticketSeoTitle(problem),
        description: ticketSeoDescription(problem),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: {
          "@type": "CreativeWork",
          name: "MyProblem problem ticket",
          description:
            "An anonymous public problem ticket hosted on MyProblem.app — not a chat thread or forum post.",
          url,
        },
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-US",
        isAccessibleForFree: true,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "MyProblem",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Problem tickets",
            item: `${SITE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: problem.title || problem.slug,
            item: url,
          },
        ],
      },
    ],
  };
}
