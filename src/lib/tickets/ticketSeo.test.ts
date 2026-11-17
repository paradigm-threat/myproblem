import { describe, expect, it } from "vitest";
import type { PublicProblemView } from "./slugResolve";
import {
  buildTicketMetadata,
  ticketAllowIndex,
  ticketPublicUrl,
  ticketSeoDescription,
  ticketSeoTitle,
  ticketShareText,
} from "./ticketSeo";

const seed: PublicProblemView = {
  ticket_uuid: "pilot",
  slug: "garage-ring-power",
  region: "georgia",
  resolution: "unsolved",
  title: "Garage lights kill outdoor power",
  description: "Outdoor feed drops when lights switch off.",
  coachLine: "",
  stills: [],
  chatTopic: "garage-ring-power",
  source: "seed",
};

const live: PublicProblemView = { ...seed, source: "intake", slug: "listening-box" };

describe("ticketSeo", () => {
  it("brands titles and descriptions as MyProblem tickets", () => {
    expect(ticketSeoTitle(seed)).toContain("Problem ticket · MyProblem");
    expect(ticketSeoDescription(seed)).toMatch(/^Problem ticket on MyProblem\.app/);
    expect(ticketShareText(seed.title)).toContain("problem ticket on MyProblem");
    expect(ticketPublicUrl(seed.slug)).toBe(
      "https://myproblem.app/t/garage-ring-power",
    );
  });

  it("indexes curated seeds only; live Intake stays noindex", () => {
    expect(ticketAllowIndex(seed)).toBe(true);
    expect(ticketAllowIndex(live)).toBe(false);
    const meta = buildTicketMetadata(live);
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });
});
