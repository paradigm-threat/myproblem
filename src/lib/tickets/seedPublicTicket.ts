import type { PublicProblemView } from "./slugResolve";
import garageRingPower from "../../../content/public-tickets/garage-ring-power.json";

export type SeedPublicTicket = {
  schema: string;
  slug: string;
  ticket_uuid: string;
  region: string;
  resolution: "unsolved" | "solved";
  chatTopic: string;
  title: string;
  description: string;
  coachLine?: string;
  hazard?: string;
  solutionRoutes?: string[];
  stills: { id: string; uri: string; alt?: string }[];
  note?: string;
};

/** Bundled pilot seeds — prefer these over Intake so public pages stay online. */
const SEEDS: Record<string, SeedPublicTicket> = {
  "garage-ring-power": garageRingPower as SeedPublicTicket,
};

export function loadSeedPublicTicket(slug: string): SeedPublicTicket | null {
  const key = String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  if (!key) return null;
  return SEEDS[key] || null;
}

export function seedToPublicProblemView(seed: SeedPublicTicket): PublicProblemView {
  return {
    ticket_uuid: seed.ticket_uuid,
    slug: seed.slug,
    region: seed.region,
    resolution: seed.resolution === "solved" ? "solved" : "unsolved",
    title: seed.title,
    description: seed.description,
    coachLine: seed.coachLine || "",
    stills: (seed.stills || []).map((s) => ({ id: s.id, uri: s.uri })),
    chatTopic: seed.chatTopic || seed.slug,
    hazard: seed.hazard || null,
    solutionRoutes: seed.solutionRoutes || [],
    note: seed.note || null,
    source: "seed",
  };
}
