import { describe, expect, it } from "vitest";
import {
  DEFAULT_CHANNEL_SLUG,
  demoChannelList,
  normalizeChannelSlug,
  resolveChannel,
} from "./channels";

describe("resolveChannel", () => {
  it("defaults homepage-style empty slug to mp-general", () => {
    const ch = resolveChannel(undefined);
    expect(ch.slug).toBe(DEFAULT_CHANNEL_SLUG);
    expect(ch.ircChannel).toBe("#mp-general");
    expect(ch.path).toBe("/c/mp-general");
  });

  it("resolves mp-general and ga-savannah-cat-rescue", () => {
    expect(resolveChannel("mp-general").ircChannel).toBe("#mp-general");
    expect(resolveChannel("#ga-savannah-cat-rescue").ircChannel).toBe(
      "#ga-savannah-cat-rescue",
    );
  });

  it("maps collection alias savannah-cat-rescue to ga channel", () => {
    const ch = resolveChannel("savannah-cat-rescue");
    expect(ch.slug).toBe("ga-savannah-cat-rescue");
    expect(ch.path).toBe("/c/ga-savannah-cat-rescue");
  });

  it("unknown slug still returns a room (mp-general)", () => {
    const ch = resolveChannel("totally-unknown-xyz");
    expect(ch.ircChannel).toBe("#mp-general");
  });

  it("demo allowlist is exactly two rooms", () => {
    const list = demoChannelList();
    expect(list).toHaveLength(2);
    expect(list.map((c) => c.slug).sort()).toEqual([
      "ga-savannah-cat-rescue",
      "mp-general",
    ]);
  });

  it("normalizes hash and case", () => {
    expect(normalizeChannelSlug("#MP-General")).toBe("mp-general");
  });
});
