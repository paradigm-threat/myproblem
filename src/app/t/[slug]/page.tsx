import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProblemTicketView } from "@/components/ticket/ProblemTicketView";
import { TicketJsonLd } from "@/components/ticket/TicketJsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { toPublicProblemView } from "@/lib/tickets/publicView";
import {
  loadSeedPublicTicket,
  seedToPublicProblemView,
} from "@/lib/tickets/seedPublicTicket";
import { resolveSlugOnIntake } from "@/lib/tickets/slugResolve";
import type { PublicProblemView } from "@/lib/tickets/slugResolve";
import { buildTicketMetadata } from "@/lib/tickets/ticketSeo";
import "@/styles/fixit-theme.css";

type Ctx = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [{ slug: "garage-ring-power" }];
}

async function loadPublicProblem(slug: string): Promise<PublicProblemView | null> {
  // Bundled seeds first — no Intake round-trip, keeps pilot pages static/online.
  const seed = loadSeedPublicTicket(slug);
  if (seed) return seedToPublicProblemView(seed);

  const resolved = await resolveSlugOnIntake(slug);
  if (resolved?.tip) {
    return toPublicProblemView(resolved.tip, resolved.slug, resolved.region);
  }
  return null;
}

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { slug } = await params;
  const problem = await loadPublicProblem(slug);
  if (!problem) {
    return {
      title: { absolute: "Problem ticket not found · MyProblem" },
      description: "This MyProblem.app problem ticket link is missing or was unpublished.",
      robots: { index: false, follow: false },
    };
  }
  return buildTicketMetadata(problem);
}

async function TicketMain({ params }: Ctx) {
  const { slug } = await params;
  const problem = await loadPublicProblem(slug);
  if (!problem) notFound();
  return (
    <>
      <TicketJsonLd problem={problem} />
      <ProblemTicketView problem={problem} />
    </>
  );
}

export default function TicketSlugPage({ params }: Ctx) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader variant="demo" />
      <main id="main" className="ticket-page fixit-theme">
        <Suspense
          fallback={
            <p className="fixit-lead" style={{ padding: "1.25rem 1rem" }}>
              Loading this problem ticket…
            </p>
          }
        >
          <TicketMain params={params} />
        </Suspense>
      </main>
    </>
  );
}
