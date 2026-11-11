import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/lib/contact";

/** Print-card QR lander — attributes traffic and routes to stores when configured. */
const SOURCE = "print_card";
const COOKIE = "mp_from";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function playStoreUrl(): string | null {
  return process.env.PLAY_STORE_URL?.trim() || null;
}

function appStoreUrl(): string | null {
  return process.env.APP_STORE_URL?.trim() || null;
}

function withAttribution(path: string): URL {
  const url = new URL(path, SITE_URL);
  url.searchParams.set("utm_source", SOURCE);
  url.searchParams.set("utm_medium", "qr");
  url.searchParams.set("utm_campaign", "flyer");
  url.searchParams.set("from", "card");
  return url;
}

function platform(ua: string): "android" | "ios" | "other" {
  const u = ua.toLowerCase();
  if (/android/i.test(u)) return "android";
  if (/iphone|ipad|ipod/i.test(u)) return "ios";
  return "other";
}

function destination(ua: string): URL {
  const p = platform(ua);
  if (p === "android") {
    const play = playStoreUrl();
    if (play) return withAttribution(play);
    return withAttribution("/demo");
  }
  if (p === "ios") {
    const app = appStoreUrl();
    if (app) return withAttribution(app);
    return withAttribution("/");
  }
  return withAttribution("/");
}

export function GET(req: NextRequest) {
  const ua = req.headers.get("user-agent") ?? "";
  const target = destination(ua);
  const res = NextResponse.redirect(target, 302);
  res.cookies.set(COOKIE, SOURCE, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: true,
  });
  return res;
}
