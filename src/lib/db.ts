import { neon } from "@neondatabase/serverless";
import type { SignupRole } from "@/lib/types";

export type { SignupRole };

export type SignupInput = {
  role: SignupRole;
  name: string;
  email: string;
  businessName?: string | null;
  region?: string | null;
  message?: string | null;
  source?: string;
};

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(url);
}

export async function ensureSignupsTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS signups (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      role TEXT NOT NULL CHECK (role IN ('business', 'user', 'investor', 'region_interest')),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      business_name TEXT,
      region TEXT,
      message TEXT,
      source TEXT NOT NULL DEFAULT 'landing'
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS signups_email_idx ON signups (email)`;
  await sql`CREATE INDEX IF NOT EXISTS signups_created_at_idx ON signups (created_at DESC)`;
}

export async function insertSignup(input: SignupInput) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO signups (role, name, email, business_name, region, message, source)
    VALUES (
      ${input.role},
      ${input.name},
      ${input.email},
      ${input.businessName ?? null},
      ${input.region ?? null},
      ${input.message ?? null},
      ${input.source ?? "landing"}
    )
    RETURNING id, created_at
  `;
  return rows[0] as { id: number; created_at: string };
}
