import { NextResponse } from "next/server";
import { proxyToIntake, intakeBaseUrl } from "@/lib/tickets/proxy";

const INTAKE_PUBLIC = "https://intake.myproblem.app";

type Ctx = { params: Promise<{ id: string }> };

function gone() {
  return NextResponse.json(
    {
      error: "tickets_moved",
      message: "Ticket API runs on Intake (regional git SoT), not Vercel.",
      intake: intakeBaseUrl() || INTAKE_PUBLIC,
    },
    { status: 410 },
  );
}

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const proxied = await proxyToIntake(req, `/api/tickets/${id}`);
  if (proxied) return proxied;
  return gone();
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const proxied = await proxyToIntake(req, `/api/tickets/${id}`);
  if (proxied) return proxied;
  return gone();
}
