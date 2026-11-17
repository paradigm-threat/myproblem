import type { TicketTip } from "./types";
import type { PublicProblemView } from "./slugResolve";

export function toPublicProblemView(
  tip: Omit<TicketTip, "claim"> | TicketTip,
  slug: string,
  region: string,
): PublicProblemView {
  // Public page: choice/scrubbed CDN or pilot paths only — never raw cache://.
  const stills = (tip.evidence || [])
    .filter((e) => {
      if (e.kind !== "still" || !e.uri) return false;
      const uri = String(e.uri);
      if (uri.startsWith("cache://")) return false;
      if (uri.startsWith("/pilot/")) return true;
      if (uri.includes("b-cdn.net") && (e.scrubbed === true || e.choice === true)) {
        return true;
      }
      return e.scrubbed === true && !uri.startsWith("cache://");
    })
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
