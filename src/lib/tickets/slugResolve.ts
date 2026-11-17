import { intakeBaseUrl } from "./proxy";
import type { TicketTip } from "./types";

const INTAKE_PUBLIC = "https://intake.myproblem.app";

export type SlugResolveResult = {
  slug: string;
  region: string;
  tip: Omit<TicketTip, "claim"> & { claim?: never };
};

export function intakeOrigin(): string {
  return intakeBaseUrl() || INTAKE_PUBLIC;
}

/** Server-side single-slug resolve via Intake (private map). */
export async function resolveSlugOnIntake(slug: string): Promise<SlugResolveResult | null> {
  const key = String(slug || "").trim();
  if (!key) return null;
  const url = `${intakeOrigin()}/api/slugs/${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SlugResolveResult;
    if (!data?.tip || !data.slug) return null;
    return data;
  } catch {
    return null;
  }
}

/** Tip fields safe to send to the browser (no claim). */
export type PublicProblemView = {
  ticket_uuid: string;
  slug: string;
  region: string;
  resolution: "unsolved" | "solved";
  title: string;
  description: string;
  coachLine: string;
  stills: { id: string; uri: string }[];
  chatTopic: string;
  hazard?: string | null;
  solutionRoutes?: string[];
  note?: string | null;
  source?: "intake" | "seed";
};
