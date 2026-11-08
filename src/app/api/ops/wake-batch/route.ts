import { NextResponse } from "next/server";
import { proxyToIntake, intakeBaseUrl } from "@/lib/tickets/proxy";

/** Ops wake lives on Intake (git job scan). Vercel only proxies. */
export async function POST(req: Request) {
  const proxied = await proxyToIntake(req, "/api/ops/wake-batch");
  if (proxied) return proxied;
  return NextResponse.json(
    {
      error: "ops_on_intake",
      intake: intakeBaseUrl() || "https://intake.myproblem.app",
    },
    { status: 410 },
  );
}

export async function GET(req: Request) {
  return POST(req);
}
