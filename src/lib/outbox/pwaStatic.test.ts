import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "../../..");

describe("PWA static contracts", () => {
  it("manifest starts at homepage room", () => {
    const manifest = JSON.parse(
      readFileSync(join(root, "public/manifest.webmanifest"), "utf8"),
    ) as { start_url?: string; display?: string };
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
  });

  it("allows same-origin mic/camera for Record", () => {
    const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
    expect(nextConfig).toContain("microphone=(self)");
    expect(nextConfig).toContain("camera=(self)");
  });

  it("service worker caches homepage shell and offline page", () => {
    const sw = readFileSync(join(root, "public/sw.js"), "utf8");
    expect(sw).toMatch(/"\/"/);
    expect(sw).toMatch(/offline\.html/);
    expect(sw).toMatch(/manifest\.webmanifest/);
    expect(sw).not.toMatch(/\/submit/);
  });

  it("retires /submit page into homepage room", () => {
    const submit = readFileSync(join(root, "src/app/submit/page.tsx"), "utf8");
    expect(submit).toMatch(/\/#room/);
    expect(submit).not.toMatch(/SubmitTicketForm/);
  });
});
