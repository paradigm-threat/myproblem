import { NextResponse } from "next/server";
import { proxyToIntake, intakeBaseUrl } from "@/lib/tickets/proxy";

const INTAKE_PUBLIC = "https://intake.myproblem.app";

/** Vercel is marketing/APK only — tickets live on Intake git SoT. */
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

export async function POST(req: Request) {
  const proxied = await proxyToIntake(req, "/api/tickets");
  if (proxied) return proxied;
  return gone();
}

export async function GET(req: Request) {
  // Never list tickets — UUID capability only.
  if (new URL(req.url).pathname.replace(/\/$/, "") === "/api/tickets") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const proxied = await proxyToIntake(req, "/api/tickets");
  if (proxied) return proxied;
  return gone();
}
