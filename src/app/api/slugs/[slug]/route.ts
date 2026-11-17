import { NextResponse } from "next/server";
import { proxyToIntake, intakeBaseUrl } from "@/lib/tickets/proxy";

const INTAKE_PUBLIC = "https://intake.myproblem.app";

type Ctx = { params: Promise<{ slug: string }> };

function gone() {
  return NextResponse.json(
    {
      error: "tickets_moved",
      message: "Slug resolve runs on Intake (private Relay map), not Vercel.",
      intake: intakeBaseUrl() || INTAKE_PUBLIC,
    },
    { status: 410 },
  );
}

/** Single-slug resolve proxy — never list the map. */
export async function GET(req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const encoded = encodeURIComponent(slug);
  const proxied = await proxyToIntake(req, `/api/slugs/${encoded}`);
  if (proxied) return proxied;
  return gone();
}
