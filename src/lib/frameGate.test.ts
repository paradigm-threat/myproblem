import { describe, expect, it } from "vitest";
import {
  applyOcrLayer,
  averageHash,
  decideGate,
  hammingDistance,
  sectorFromYaw,
} from "./frameGate";

describe("sectorFromYaw", () => {
  it("returns 0..7", () => {
    for (let y = -180; y < 180; y += 10) {
      const s = sectorFromYaw(y);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThan(8);
    }
  });
});

describe("decideGate", () => {
  const base = {
    feedOn: true,
    brightness: 0.4,
    blurScore: 0.1,
    glareScore: 0.01,
    shakeScore: 0.01,
    frameDiffEnergy: 0.01,
    uniqueDistance: 20,
    sectorId: 1,
    sectorsFilled: [] as number[],
    scenarioActive: false,
  };

  it("drops when shaking", () => {
    const r = decideGate({ ...base, shakeScore: 1.5 });
    expect(r.decision).toBe("DROP");
    expect(r.dropReason).toBe("motion/shake");
    expect(r.isShaking).toBe(true);
  });

  it("drops duplicates", () => {
    const r = decideGate({ ...base, uniqueDistance: 2 });
    expect(r.dropReason).toBe("duplicate");
  });

  it("marks send when stable and unique", () => {
    const r = decideGate(base);
    expect(r.decision).toBe("SEND");
  });

  it("drops filled sector when scenario on", () => {
    const r = decideGate({
      ...base,
      scenarioActive: true,
      sectorId: 3,
      sectorsFilled: [3],
    });
    expect(r.dropReason).toBe("wrong angle");
  });

  it("wrong_target when blue hint and gray samples", () => {
    const gray = Array.from({ length: 16 * 3 }, (_, i) =>
      i % 3 === 0 ? 0 : i % 3 === 1 ? 0.05 : 0.4,
    );
    const r = decideGate({
      ...base,
      hsvSamples: gray,
      captureRequest: {
        id: "cr_blue",
        hints: [{ type: "color", h: 210, s: 0.45, v: 0.4, minFraction: 0.04 }],
      },
    });
    expect(r.dropReason).toBe("wrong_target");
  });

  it("worthy when blue hint and blue samples", () => {
    const blue = Array.from({ length: 16 * 3 }, (_, i) =>
      i % 3 === 0 ? 210 : i % 3 === 1 ? 0.5 : 0.45,
    );
    const r = decideGate({
      ...base,
      hsvSamples: blue,
      captureRequest: {
        id: "cr_blue",
        hints: [{ type: "color", h: 210, s: 0.45, v: 0.4, minFraction: 0.04 }],
      },
    });
    expect(r.decision).toBe("SEND");
  });

  it("text hint yields KEEP pending OCR capability", () => {
    const r = decideGate({
      ...base,
      ocrText: "",
      captureRequest: {
        id: "cr_text",
        hints: [{ type: "text", minLen: 2 }],
      },
    });
    expect(r.decision).toBe("KEEP");
    expect(r.dropReason).toBe("ocr_pending");
  });
});

describe("applyOcrLayer", () => {
  const kept = {
    decision: "KEEP" as const,
    dropReason: "ocr_pending" as const,
    isMoving: false,
    isShaking: false,
    colorMatch: 1,
    textMatch: 0,
  };
  const req = {
    id: "cr_text",
    hints: [{ type: "text" as const, contains: "SERIAL", minLen: 2 }],
  };

  it("sends on match", () => {
    const r = applyOcrLayer(kept, req, "Device SERIAL 1");
    expect(r.decision).toBe("SEND");
  });

  it("wrong_text on miss and same_text when rejected", () => {
    const miss = applyOcrLayer(kept, req, "MODEL ONLY");
    expect(miss.dropReason).toBe("wrong_text");
    const same = applyOcrLayer(kept, req, "MODEL ONLY", new Set(["model only"]));
    expect(same.dropReason).toBe("same_text");
  });
});

describe("averageHash", () => {
  it("identical buffers have zero distance", () => {
    const g = new Uint8Array(64 * 48);
    for (let i = 0; i < g.length; i++) g[i] = i % 200;
    const a = averageHash(g, 64, 48);
    const b = averageHash(g, 64, 48);
    expect(hammingDistance(a, b)).toBe(0);
  });
});
