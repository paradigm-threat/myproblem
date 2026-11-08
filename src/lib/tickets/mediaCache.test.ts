import { describe, expect, it, afterEach } from "vitest";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
  cacheRoot,
  writeEvidenceCache,
  resolveCacheUri,
  purgeEvidenceFile,
  purgeTicketCache,
} from "./mediaCache";

describe("mediaCache", () => {
  const ticket = "test-ticket-cache";

  afterEach(() => {
    purgeTicketCache(ticket);
  });

  it("writes cache:// uri and resolves to a real file", () => {
    const buf = Buffer.from("audio-bytes");
    const { uri, path } = writeEvidenceCache(ticket, "ev1", buf, ".bin");
    expect(uri).toBe(`cache://${ticket}/ev1.bin`);
    expect(existsSync(path)).toBe(true);
    expect(resolveCacheUri(uri)).toBe(path);
  });

  it("purges file and clears resolvable path", () => {
    const { uri } = writeEvidenceCache(ticket, "ev2", Buffer.from("x"), ".bin");
    expect(purgeEvidenceFile(uri)).toBe(true);
    expect(resolveCacheUri(uri)).toBeNull();
  });

  it("uses TICKETS_CACHE_DIR when set", () => {
    const prev = process.env.TICKETS_CACHE_DIR;
    const custom = join(process.cwd(), ".data", "cache-test-custom");
    process.env.TICKETS_CACHE_DIR = custom;
    try {
      expect(cacheRoot()).toBe(custom);
    } finally {
      if (prev === undefined) delete process.env.TICKETS_CACHE_DIR;
      else process.env.TICKETS_CACHE_DIR = prev;
      rmSync(custom, { recursive: true, force: true });
    }
  });
});
