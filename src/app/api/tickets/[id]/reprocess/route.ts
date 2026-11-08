import { NextResponse } from "next/server";
import { proxyToIntake, intakeBaseUrl } from "@/lib/tickets/proxy";

type Ctx = { params: Promise<{ id: string }> };

/** Reprocess on Intake git SoT — Vercel proxies or 410. */
export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const proxied = await proxyToIntake(req, `/api/tickets/${id}/reprocess`);
  if (proxied) return proxied;
  return NextResponse.json(
    {
      error: "tickets_moved",
      intake: intakeBaseUrl() || "https://intake.myproblem.app",
    },
    { status: 410 },
  );
}
