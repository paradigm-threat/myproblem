import { NextResponse } from "next/server";
import { ensureSignupsTable, insertSignup } from "@/lib/db";
import type { SignupRole } from "@/lib/types";

const ROLES: SignupRole[] = ["business", "user", "investor", "region_interest"];

const rate = new Map<string, { count: number; reset: number }>();

function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimit(ip: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  const entry = rate.get(ip);
  if (!entry || now > entry.reset) {
    rate.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await req.json()) as Record<string, unknown>;

    // Honeypot — bots fill this; humans never see it
    if (typeof body.company_website === "string" && body.company_website.trim()) {
      return NextResponse.json({ ok: true });
    }

    const role = body.role as SignupRole;
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const businessName =
      body.businessName != null ? String(body.businessName).trim() : null;
    const region = body.region != null ? String(body.region).trim() : null;
    const message = body.message != null ? String(body.message).trim() : null;

    if (!ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (!name || name.length > 120) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    if (!email || !isEmail(email) || email.length > 200) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (role === "business" && (!businessName || businessName.length > 160)) {
      return NextResponse.json(
        { error: "Business name required" },
        { status: 400 },
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
      role,
      name,
      email,
      businessName,
      region,
      message,
    });

    return NextResponse.json({ ok: true, id: row.id });
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
