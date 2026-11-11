/**
 * Synthetic stills for photo-analysis fixtures. Patterns are grayscale so the
 * on-device gate can be scored without a vision model.
 */

import { averageHash, applyOcrLayer, decideGate, hammingDistance, type GateResult } from "./frameGate";
import { measureGray, type ImageStats } from "./imageStats";

export const PHOTO_PATTERNS = [
  "vertical_stripes",
  "soft_ramp",
  "checker_glare",
  "checker_dark",
  "checker_bright",
  "left_right",
] as const;

export type PhotoPattern = (typeof PHOTO_PATTERNS)[number];

export function renderPattern(name: PhotoPattern, cols: number, rows: number): Uint8Array {
  const gray = new Uint8Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let v = 128;
      if (name === "vertical_stripes") v = x % 2 === 0 ? 40 : 180;
      else if (name === "soft_ramp") v = Math.round(40 + (140 * x) / Math.max(1, cols - 1));
      else if (name === "checker_glare") v = (x + y) % 2 === 0 ? 255 : 80;
      else if (name === "checker_dark") v = (x + y) % 2 === 0 ? 0 : 30;
      else if (name === "checker_bright") v = (x + y) % 2 === 0 ? 244 : 235;
      else if (name === "left_right") v = x < cols / 2 ? 20 : 200;
      gray[y * cols + x] = v;
    }
  }
  return gray;
}

export type PhotoExpect = {
  decision: "DROP" | "KEEP" | "SEND";
  drop_reason: string;
  stored_must_include?: string[];
  stored_must_exclude?: string[];
};

export type PhotoScenario = {
  id: string;
  focus: string;
  pattern: PhotoPattern;
  prior?: "none" | "same" | PhotoPattern;
  ocr?: string;
  text_contains?: string;
  expect: PhotoExpect;
};

export type PhotoAnalysis = {
  stats: ImageStats;
  gate: GateResult;
  storedText: string;
};

export function analyzeStill(
  scenario: PhotoScenario,
  cols: number,
  rows: number,
  scrub: (text: string) => string,
): PhotoAnalysis {
  const gray = renderPattern(scenario.pattern, cols, rows);
  const stats = measureGray(gray, cols, rows);
  let uniqueDistance = 64;
  const priorName =
    scenario.prior === "same" ? scenario.pattern : scenario.prior && scenario.prior !== "none" ? scenario.prior : null;
  if (priorName) {
    const prior = renderPattern(priorName, cols, rows);
    uniqueDistance = hammingDistance(averageHash(gray, cols, rows), averageHash(prior, cols, rows));
  }
  const captureRequest = scenario.text_contains
    ? {
        id: scenario.id,
        hints: [{ type: "text" as const, contains: scenario.text_contains, minLen: 2 }],
      }
    : null;
  let gate = decideGate({
    feedOn: true,
    brightness: stats.brightness,
    blurScore: stats.blurScore,
    glareScore: stats.glareScore,
    shakeScore: 0,
    frameDiffEnergy: 0,
    uniqueDistance,
    sectorId: 0,
    sectorsFilled: [],
    scenarioActive: false,
    ocrText: scenario.ocr ?? "",
    captureRequest,
  });
  if (gate.decision === "KEEP" && scenario.ocr && scenario.ocr.trim().length > 0) {
    gate = applyOcrLayer(gate, captureRequest, scenario.ocr);
  }
  const storedText = scenario.ocr ? scrub(scenario.ocr) : "";
  return { stats, gate, storedText };
}
