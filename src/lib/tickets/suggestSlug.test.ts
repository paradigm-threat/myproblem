import { describe, expect, it } from "vitest";
import { suggestPublicSlug } from "./suggestSlug";

describe("suggestPublicSlug", () => {
  it("suggests a topic-shaped slug from title", () => {
    const r = suggestPublicSlug({
      title: "Garage lights kill outdoor Ring power",
      description: "Always-on outlet dies when switch turns lights off",
      existingSlugs: [],
    });
    expect(r.suggested).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(r.suggested.length).toBeGreaterThanOrEqual(4);
    expect(r.suggested.includes("garage") || r.suggested.includes("ring")).toBe(
      true,
    );
  });

  it("avoids collisions with existing slugs", () => {
    const first = suggestPublicSlug({
      title: "Garage Ring power",
      existingSlugs: [],
    });
    const second = suggestPublicSlug({
      title: "Garage Ring power",
      existingSlugs: [first.suggested],
    });
    expect(second.suggested).not.toBe(first.suggested);
  });

  it("rejects generic-only blocked names by adding distinctive tokens", () => {
    const r = suggestPublicSlug({
      title: "help",
      description: "electrical repair diy",
      existingSlugs: ["help", "electrical", "repair"],
    });
    expect(r.suggested).not.toBe("help");
    expect(r.suggested).not.toBe("electrical");
  });
});
