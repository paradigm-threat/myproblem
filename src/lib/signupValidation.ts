import type { SignupRole } from "@/lib/types";

export const SIGNUP_ROLES: SignupRole[] = [
  "business",
  "user",
  "investor",
  "region_interest",
];

export type SignupPayload = {
  role: SignupRole;
  name: string;
  email: string;
  businessName: string | null;
  region: string | null;
  message: string | null;
};

export type SignupValidationOk = { ok: true; data: SignupPayload };
export type SignupValidationErr = { ok: false; error: string; status: number };
export type SignupValidationResult = SignupValidationOk | SignupValidationErr;

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isHoneypotTriggered(body: Record<string, unknown>): boolean {
  return typeof body.company_website === "string" && body.company_website.trim().length > 0;
}

export function validateSignupBody(
  body: Record<string, unknown>,
): SignupValidationResult {
  const role = body.role as SignupRole;
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const businessName =
    body.businessName != null ? String(body.businessName).trim() : null;
  const region = body.region != null ? String(body.region).trim() : null;
  const message = body.message != null ? String(body.message).trim() : null;

  if (!SIGNUP_ROLES.includes(role)) {
    return { ok: false, error: "Invalid role", status: 400 };
  }
  if (!name || name.length > 120) {
    return { ok: false, error: "Name required", status: 400 };
  }
  if (!email || !isEmail(email) || email.length > 200) {
    return { ok: false, error: "Valid email required", status: 400 };
  }
  if (role === "business" && (!businessName || businessName.length > 160)) {
    return { ok: false, error: "Business name required", status: 400 };
  }

  return {
    ok: true,
    data: { role, name, email, businessName, region, message },
  };
}

/** Simple sliding window rate limit — returns false when blocked. */
export function allowRequest(
  store: Map<string, { count: number; reset: number }>,
  key: string,
  limit = 8,
  windowMs = 60_000,
  now = Date.now(),
): boolean {
  const entry = store.get(key);
  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}
