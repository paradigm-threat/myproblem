import { mkdirSync, writeFileSync, unlinkSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

/** Ephemeral upload root — never commit; purge after Batch success. */
export function cacheRoot(): string {
  if (process.env.TICKETS_CACHE_DIR) return process.env.TICKETS_CACHE_DIR;
  if (process.env.VERCEL === "1") return join(tmpdir(), "myproblem-cache");
  return join(process.cwd(), ".data", "cache");
}

export function evidenceCachePath(ticketId: string, evidenceId: string, ext: string): string {
  const dir = join(cacheRoot(), ticketId);
  mkdirSync(dir, { recursive: true });
  return join(dir, `${evidenceId}${ext.startsWith(".") ? ext : `.${ext}`}`);
}

export function writeEvidenceCache(
  ticketId: string,
  evidenceId: string,
  buf: Buffer,
  ext: string,
): { path: string; uri: string } {
  const path = evidenceCachePath(ticketId, evidenceId, ext);
  writeFileSync(path, buf);
  return { path, uri: `cache://${ticketId}/${evidenceId}${ext.startsWith(".") ? ext : `.${ext}`}` };
}

export function resolveCacheUri(uri: string): string | null {
  if (!uri.startsWith("cache://")) return null;
  const rest = uri.slice("cache://".length);
  const [ticketId, file] = rest.split("/");
  if (!ticketId || !file) return null;
  const path = join(cacheRoot(), ticketId, file);
  return existsSync(path) ? path : null;
}

export function purgeEvidenceFile(uri: string | undefined | null): boolean {
  if (!uri) return false;
  const local = resolveCacheUri(uri);
  if (local && existsSync(local)) {
    unlinkSync(local);
    return true;
  }
  // Legacy file:// from older local runs
  if (uri.startsWith("file://")) {
    const p = uri.slice("file://".length);
    if (existsSync(p)) {
      unlinkSync(p);
      return true;
    }
  }
  return false;
}

export function purgeTicketCache(ticketId: string) {
  const dir = join(cacheRoot(), ticketId);
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
}
