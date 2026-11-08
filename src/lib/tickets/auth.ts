import { timingSafeEqual } from "node:crypto";
import type { TicketTip } from "./types";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Server-to-server / edge shared secret (optional). */
export function hasTicketsApiSecret(req: Request): boolean {
  const secret = process.env.TICKETS_API_SECRET?.trim();
  if (!secret) return false;
  const hdr =
    req.headers.get("x-tickets-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return Boolean(hdr && safeEqual(hdr, secret));
}

/** Ticket owner claim from create response. */
export function claimFromRequest(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (h?.toLowerCase().startsWith("bearer ")) return h.slice(7).trim() || null;
  return req.headers.get("x-ticket-claim")?.trim() || null;
}

/**
 * Authorize ticket read/write:
 * - TICKETS_API_SECRET match → ok (Intake / ops)
 * - else Bearer claim must match tip.claim
 * - if neither secret configured and tip has claim → require claim
 */
export function authorizeTicket(req: Request, tip: TicketTip): { ok: true } | { ok: false; status: number; error: string } {
  if (hasTicketsApiSecret(req)) return { ok: true };

  const claim = claimFromRequest(req);
  if (tip.claim && claim && safeEqual(claim, tip.claim)) return { ok: true };

  // Dev convenience: if no secrets configured at all, allow (local tests)
  if (!process.env.TICKETS_API_SECRET && !process.env.REQUIRE_TICKET_CLAIM) {
    return { ok: true };
  }

  return { ok: false, status: 401, error: "unauthorized" };
}

export function authorizeOps(req: Request): boolean {
  if (hasTicketsApiSecret(req)) return true;
  const secret = process.env.OPS_WAKE_SECRET?.trim();
  if (!secret) return false;
  const got = req.headers.get("x-ops-secret") || claimFromRequest(req);
  return Boolean(got && safeEqual(got, secret));
}
