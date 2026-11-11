import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { convertPii } from "../../../myproblem-tickets/workers/lib/piiConvert.mjs";
import { PHOTO_PATTERNS, analyzeStill, type PhotoPattern, type PhotoScenario } from "./photoAnalysis";

const CATALOG_PATH = join(__dirname, "../../fixtures/photos/catalog.json");

type Catalog = {
  version: number;
  format: string;
  width: number;
  height: number;
  scenarios: PhotoScenario[];
};

const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8")) as Catalog;

describe("photo fixtures catalog", () => {
  it("has a photo-fixture format and a quality plus OCR set", () => {
    expect(catalog.format).toBe("myproblem.photo_fixtures");
    expect(catalog.version).toBe(1);
    expect(catalog.width).toBeGreaterThanOrEqual(32);
    expect(catalog.height).toBeGreaterThanOrEqual(32);
    expect(catalog.scenarios.length).toBeGreaterThanOrEqual(8);
    const ids = catalog.scenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const focuses = new Set(catalog.scenarios.map((s) => s.focus));
    for (const focus of ["quality_blur", "quality_glare", "duplicate", "ocr_code", "pii_scrub"]) {
      expect(focuses.has(focus)).toBe(true);
    }
  });

  it("only uses patterns the renderer knows", () => {
    for (const s of catalog.scenarios) {
      expect(PHOTO_PATTERNS).toContain(s.pattern);
      expect(["DROP", "KEEP", "SEND"]).toContain(s.expect.decision);
      expect(s.expect.drop_reason.length).toBeGreaterThan(0);
      if (s.prior && s.prior !== "none" && s.prior !== "same") {
        expect(PHOTO_PATTERNS).toContain(s.prior as PhotoPattern);
      }
    }
  });
});

describe("photo analysis", () => {
  for (const scenario of catalog.scenarios) {
    it(`${scenario.id} (${scenario.focus})`, () => {
      const result = analyzeStill(scenario, catalog.width, catalog.height, (text) => convertPii(text).text);
      expect(result.gate.decision).toBe(scenario.expect.decision);
      expect(result.gate.dropReason).toBe(scenario.expect.drop_reason);
      const stored = result.storedText;
      for (const token of scenario.expect.stored_must_include ?? []) {
        expect(stored.toLowerCase()).toContain(token.toLowerCase());
      }
      for (const token of scenario.expect.stored_must_exclude ?? []) {
        expect(stored.toLowerCase().includes(token.toLowerCase())).toBe(false);
      }
    });
  }
});
