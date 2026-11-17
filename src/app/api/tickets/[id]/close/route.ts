import { NextResponse } from "next/server";
import { proxyToIntake, intakeBaseUrl } from "@/lib/tickets/proxy";

const INTAKE_PUBLIC = "https://intake.myproblem.app";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const proxied = await proxyToIntake(
    req,
    `/api/tickets/${encodeURIComponent(id)}/close`,
  );
  if (proxied) return proxied;
  return NextResponse.json(
    {
      error: "tickets_moved",
      message: "Set INTAKE_URL or call Intake directly.",
      intake: intakeBaseUrl() || INTAKE_PUBLIC,
    },
    { status: 410 },
  );
}