import { describe, expect, it } from "vitest";
import {
  asrEligible,
  extractChannelMedia,
  extractMediaUrls,
  formatChannelMediaPost,
  parseChannelMediaMarkers,
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

describe("parseChannelMediaMarkers", () => {
  it("parses kind/url/channel attrs", () => {
    const items = parseChannelMediaMarkers(
      "Public voice note: https://cdn/x.webm [[mp:media kind=audio url=https://cdn/x.webm channel=#mp-general]]",
    );
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      kind: "audio",
      url: "https://cdn/x.webm",
      channel: "#mp-general",
      source: "marker",
    });
  });

  it("dedupes by url", () => {
    const body =
      "[[mp:media kind=audio url=https://cdn/a.webm channel=#mp-general]] " +
      "[[mp:media kind=audio url=https://cdn/a.webm channel=#mp-general]]";
    expect(parseChannelMediaMarkers(body)).toHaveLength(1);
  });
});

describe("extractChannelMedia + asrEligible", () => {
  it("merges markers and bare bunny urls", () => {
    const items = extractChannelMedia(
      "paste https://myproblem-stills.b-cdn.net/chat-public/mp-general/z.webm",
    );
    expect(items).toHaveLength(1);
    expect(asrEligible(items[0])).toBe(true);
  });

  it("skips plain files for ASR", () => {
    const items = extractChannelMedia(
      "[[mp:media kind=file url=https://myproblem-stills.b-cdn.net/chat-public/doc.pdf channel=#mp-general]]",
    );
    expect(items).toHaveLength(1);
    expect(asrEligible(items[0])).toBe(false);
  });
});
