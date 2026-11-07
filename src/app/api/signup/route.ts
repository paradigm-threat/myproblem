import { NextResponse } from "next/server";
import { ensureSignupsTable, insertSignup } from "@/lib/db";
import {
  allowRequest,
  isHoneypotTriggered,
  validateSignupBody,
} from "@/lib/signupValidation";

const rate = new Map<string, { count: number; reset: number }>();

function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!allowRequest(rate, ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await req.json()) as Record<string, unknown>;

    if (isHoneypotTriggered(body)) {
      return NextResponse.json({ ok: true });
    }

    const validated = validateSignupBody(body);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.error },
        { status: validated.status },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Signup storage not configured yet" },
        { status: 503 },
      );
    }

    await ensureSignupsTable();
    const row = await insertSignup({
      role: validated.data.role,
      name: validated.data.name,
      email: validated.data.email,
      businessName: validated.data.businessName,
      region: validated.data.region,
      message: validated.data.message,
    });

    return NextResponse.json({ ok: true, id: row.id });
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
