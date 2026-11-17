import { ticketJsonLd } from "@/lib/tickets/ticketSeo";
import type { PublicProblemView } from "@/lib/tickets/slugResolve";

/** Server-only structured data for a public /t/[slug] ticket page. */
export function TicketJsonLd({ problem }: { problem: PublicProblemView }) {
  const data = ticketJsonLd(problem);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
