import { describe, expect, it } from "vitest";
import {
  extractMediaUrls,
  formatChannelMediaPost,
} from "./channelMedia";

describe("formatChannelMediaPost", () => {
  it("emits one-line voice caption with mp:media marker", () => {
    const line = formatChannelMediaPost({
      kind: "audio",
      url: "https://myproblem-stills.b-cdn.net/chat-public/mp-general/abc.webm",
      channelIrc: "#mp-general",
    });
    expect(line).not.toMatch(/\n/);
    expect(line).toContain("Public voice note:");
    expect(line).toContain(
      "[[mp:media kind=audio url=https://myproblem-stills.b-cdn.net/chat-public/mp-general/abc.webm channel=#mp-general]]",
    );
  });

  it("labels video notes", () => {
    const line = formatChannelMediaPost({
      kind: "video",
      url: "https://cdn.example/chat-public/x.webm",
      channelIrc: "ga-savannah-cat-rescue",
    });
    expect(line).toMatch(/^Public video note:/);
    expect(line).toContain("channel=#ga-savannah-cat-rescue");
  });
});

describe("extractMediaUrls", () => {
  it("finds Bunny chat-public URLs", () => {
    const urls = extractMediaUrls(
      "see https://myproblem-stills.b-cdn.net/chat-public/mp-general/a.webm thanks",
    );
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain("chat-public");
  });

  it("ignores unrelated links", () => {
    expect(extractMediaUrls("https://example.com/foo")).toEqual([]);
  });
});
