import type { TicketTip } from "./types";
import type { PublicProblemView } from "./slugResolve";

export function toPublicProblemView(
  tip: Omit<TicketTip, "claim"> | TicketTip,
  slug: string,
  region: string,
): PublicProblemView {
  const stills = (tip.evidence || [])
    .filter((e) => e.kind === "still" && e.uri)
    .map((e) => ({ id: e.id, uri: e.uri }));
  return {
    ticket_uuid: tip.ticket_uuid,
    slug,
    region,
    resolution: tip.resolution === "solved" ? "solved" : "unsolved",
    title: tip.fields?.title?.value || "My problem",
    description: tip.fields?.description?.value || "",
    coachLine: tip.coachLine || "",
    stills,
    /** Stable Clevertree Chat topic = private ticket uuid (not shown in URL). */
    chatTopic: tip.ticket_uuid,
    hazard: null,
    solutionRoutes: [],
    note: null,
    source: "intake",
  };
}
