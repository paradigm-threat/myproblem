import { NextResponse } from "next/server";
import { proxyToIntake, intakeBaseUrl } from "@/lib/tickets/proxy";

/** Job drain lives on Intake. Vercel only proxies. */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const proxied = await proxyToIntake(req, `/api/ops/process-jobs${url.search}`);
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
