import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProblemTicketView } from "@/components/ticket/ProblemTicketView";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE, SITE_URL, TICKET_TRAINING_NOTICE } from "@/lib/contact";
import { toPublicProblemView } from "@/lib/tickets/publicView";
import {
  loadSeedPublicTicket,
  seedToPublicProblemView,
} from "@/lib/tickets/seedPublicTicket";
import { resolveSlugOnIntake } from "@/lib/tickets/slugResolve";
import type { PublicProblemView } from "@/lib/tickets/slugResolve";

type Ctx = { params: Promise<{ slug: string }> };

async function loadPublicProblem(slug: string): Promise<PublicProblemView | null> {
  const resolved = await resolveSlugOnIntake(slug);
  if (resolved?.tip) {
    return toPublicProblemView(resolved.tip, resolved.slug, resolved.region);
  }
  const seed = await loadSeedPublicTicket(slug);
  if (seed) return seedToPublicProblemView(seed);
  return null;
}

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { slug } = await params;
  const problem = await loadPublicProblem(slug);
  if (!problem) {
    return { title: "Problem not found", robots: { index: false, follow: false } };
  }
  const description =
    problem.description.slice(0, 160) ||
    "Anonymous problem page on MyProblem — advice organized by solution route.";
  return {
    title: problem.title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/t/${encodeURIComponent(problem.slug)}` },
    openGraph: {
      title: `${problem.title} · MyProblem`,
      description,
      url: `${SITE_URL}/t/${encodeURIComponent(problem.slug)}`,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${problem.title} · MyProblem`,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export default async function TicketSlugPage({ params }: Ctx) {
  const { slug } = await params;
  const problem = await loadPublicProblem(slug);
  if (!problem) notFound();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader variant="demo" />
      <main id="main" className="ticket-page site">
        <ProblemTicketView problem={problem} />
        <p className="ticket-footer-note">
          {TICKET_TRAINING_NOTICE} Public link is this short slug while the
          problem is live.{" "}
          <Link href="/privacy">Privacy</Link>
          {" · "}
          <Link href="/terms">Terms</Link>
        </p>
      </main>
    </>
  );
}
