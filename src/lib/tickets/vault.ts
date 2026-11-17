/**
 * Browser-only identity + on-device ticket history.
 * Visitor UUID is private anon id (synced to Clevertree Chat key).
 * Ticket vault stores private ticket_uuid + live slug — never a server list.
 */

export const VISITOR_STORAGE_KEY = "myproblem.visitor";
export const CLEVERTREE_VISITOR_KEY = "clevertree.visitor";
export const TICKET_VAULT_KEY = "myproblem.ticketVault";

export type VaultTicket = {
  ticket_uuid: string;
  /** Capability secret for owner session — never put in public nav/URLs. */
  claim?: string | null;
  slug?: string | null;
  title?: string;
  seenAt: number;
  resolution?: "unsolved" | "solved";
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/** Mint or read visitor UUID; keep Clevertree Chat board in sync. */
export function getOrCreateVisitorId(): string {
  if (!canUseStorage()) return "";
  let id =
    localStorage.getItem(VISITOR_STORAGE_KEY) ||
    localStorage.getItem(CLEVERTREE_VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
  }
  localStorage.setItem(VISITOR_STORAGE_KEY, id);
  localStorage.setItem(CLEVERTREE_VISITOR_KEY, id);
  return id;
}

export function readTicketVault(): VaultTicket[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(TICKET_VAULT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as VaultTicket[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTicketVault(entries: VaultTicket[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(TICKET_VAULT_KEY, JSON.stringify(entries.slice(0, 100)));
}

/** Remember a ticket on this device (private uuid + optional claim + live slug). */
export function rememberTicket(entry: {
  ticket_uuid: string;
  claim?: string | null;
  slug?: string | null;
  title?: string;
  resolution?: "unsolved" | "solved";
}) {
  if (!entry.ticket_uuid) return;
  const list = readTicketVault().filter((t) => t.ticket_uuid !== entry.ticket_uuid);
  list.unshift({
    ticket_uuid: entry.ticket_uuid,
    claim: entry.claim ?? null,
    slug: entry.slug ?? null,
    title: entry.title,
    resolution: entry.resolution,
    seenAt: Date.now(),
  });
  writeTicketVault(list);
}

export function shareUrlForSlug(slug: string, origin?: string): string {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/t/${encodeURIComponent(slug)}`;
}
