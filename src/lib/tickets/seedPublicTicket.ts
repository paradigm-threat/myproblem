import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { PublicProblemView } from "./slugResolve";

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

const SEED_DIR = join(process.cwd(), "content/public-tickets");

export async function loadSeedPublicTicket(
  slug: string,
): Promise<SeedPublicTicket | null> {
  const key = String(slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  if (!key) return null;
  try {
    const raw = await readFile(join(SEED_DIR, `${key}.json`), "utf8");
    const data = JSON.parse(raw) as SeedPublicTicket;
    if (!data?.slug || !data?.title) return null;
    return data;
  } catch {
    return null;
  }
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
