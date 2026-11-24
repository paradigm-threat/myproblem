import { describe, expect, it } from "vitest";
import { mediaKindForFile, toSummary, type OutboxSubmission } from "./types";

describe("outbox types", () => {
  it("classifies media kinds from mime", () => {
    expect(mediaKindForFile({ type: "video/webm" })).toBe("video");
    expect(mediaKindForFile({ type: "audio/webm" })).toBe("audio");
    expect(mediaKindForFile({ type: "image/jpeg" })).toBe("still");
    expect(mediaKindForFile({ type: "" })).toBe("still");
  });

  it("summarizes pending media bytes and kinds", () => {
    const sub: OutboxSubmission = {
      clientSubmissionId: "s1",
      createdAt: 10,
      status: "queued",
      visitorId: "v",
      region: "georgia",
      title: "Lamp",
      description: "Dark",
      wantPublic: false,
      publicSlug: "",
      media: [
        {
          localId: "a",
          kind: "video",
          filename: "a.webm",
          mime: "video/webm",
          blob: new Blob(["12345"], { type: "video/webm" }),
          uploaded: false,
        },
        {
          localId: "b",
          kind: "audio",
          filename: "b.webm",
          mime: "audio/webm",
          blob: new Blob(["ab"], { type: "audio/webm" }),
          uploaded: true,
        },
      ],
    };
    const summary = toSummary(sub);
    expect(summary.mediaCount).toBe(2);
    expect(summary.uploadedCount).toBe(1);
    expect(summary.mediaBytes).toBe(7);
    expect(summary.mediaKinds.sort()).toEqual(["audio", "video"]);
    expect(summary.title).toBe("Lamp");
  });
});
