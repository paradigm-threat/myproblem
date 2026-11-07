/**
 * Web offline frame-gate helpers — mirrors Android ContextBuilder thresholds.
 * Shake/blur/duplicate decisions stay on-device; server never sees dropped frames.
 */

export const GATE = {
  SHAKE_DROP: 0.85,
  MOVING_DIFF: 0.08,
  BLUR_DROP: 0.62,
  GLARE_DROP: 0.18,
  DARK_MAX: 0.12,
  BRIGHT_MIN: 0.92,
  UNIQUE_MIN_HAMMING: 8,
  SECTOR_COUNT: 8,
  COLOR_MIN_FRACTION: 0.04,
} as const;

export type DropReason =
  | "—"
  | "blur"
  | "motion/shake"
  | "duplicate"
  | "wrong angle"
  | "wrong_target"
  | "wrong_text"
  | "same_text"
  | "ocr_pending"
  | "glare"
  | "too dark"
  | "too bright"
  | "feed off";

/** DROP | KEEP (candidate, more capabilities e.g. OCR) | SEND (would upload) */
export type GateDecision = "DROP" | "KEEP" | "SEND";

export type ColorHint = {
  type: "color";
  h: number;
  s: number;
  v: number;
  tolH?: number;
  tolS?: number;
  tolV?: number;
  minFraction?: number;
};

export type AngleHint = {
  type: "angle";
  sector?: string;
  orYawDeg?: number;
  tolDeg?: number;
};

export type TextHint = {
  type: "text";
  contains?: string;
  minLen?: number;
};

export type CaptureHint = ColorHint | AngleHint | TextHint;

export type CaptureRequest = {
  id: string;
  hints: CaptureHint[];
  logic?: "all" | "any";
  coach?: string;
};

export type GateInput = {
  feedOn: boolean;
  brightness: number;
  blurScore: number;
  glareScore: number;
  shakeScore: number;
  frameDiffEnergy: number;
  uniqueDistance: number;
  sectorId: number;
  sectorName?: string;
  yawDeg?: number;
  sectorsFilled: number[];
  scenarioActive: boolean;
  /** Interleaved HSV samples [h,s,v,…] for color hints */
  hsvSamples?: number[];
  ocrText?: string;
  captureRequest?: CaptureRequest | null;
};

export type GateResult = {
  decision: GateDecision;
  dropReason: DropReason;
  isMoving: boolean;
  isShaking: boolean;
  colorMatch: number;
  textMatch: number;
};

export const SECTOR_NAMES = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

export function sectorFromYaw(yawDeg: number): number {
  const az = ((yawDeg % 360) + 360) % 360;
  return Math.floor((az + 22.5) / 45) % GATE.SECTOR_COUNT;
}

export function sectorName(id: number): string {
  return SECTOR_NAMES[id] ?? "?";
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

export function colorFraction(
  hsvSamples: number[] | undefined,
  target: ColorHint,
): number {
  if (!hsvSamples || hsvSamples.length < 3) return 0;
  const n = Math.floor(hsvSamples.length / 3);
  const tolH = target.tolH ?? 25;
  const tolS = target.tolS ?? 0.35;
  const tolV = target.tolV ?? 0.45;
  let hits = 0;
  for (let i = 0; i < n; i++) {
    const h = hsvSamples[i * 3]!;
    const s = hsvSamples[i * 3 + 1]!;
    const v = hsvSamples[i * 3 + 2]!;
    if (
      hueDistance(h, target.h) <= tolH &&
      Math.abs(s - target.s) <= tolS &&
      Math.abs(v - target.v) <= tolV
    ) {
      hits++;
    }
  }
  return hits / n;
}

function yawDistance(a: number, b: number): number {
  return Math.abs((((a - b) % 360) + 540) % 360 - 180);
}

export function hintsPass(
  req: CaptureRequest | null | undefined,
  input: GateInput,
): { passed: boolean; colorMatch: number; textMatch: number } {
  if (!req || req.hints.length === 0) {
    return { passed: true, colorMatch: 1, textMatch: 1 };
  }
  const logic = req.logic ?? "all";
  const results: boolean[] = [];
  let colorMatch = 1;
  let textMatch = 1;
  const sector =
    input.sectorName ?? sectorName(input.sectorId);
  const yaw = input.yawDeg ?? 0;
  const ocr = (input.ocrText ?? "").trim();

  for (const hint of req.hints) {
    if (hint.type === "color") {
      const minFrac = Math.max(
        hint.minFraction ?? GATE.COLOR_MIN_FRACTION,
        GATE.COLOR_MIN_FRACTION,
      );
      const frac = colorFraction(input.hsvSamples, hint);
      colorMatch = Math.min(colorMatch, frac / Math.max(minFrac, 1e-4));
      results.push(frac >= minFrac);
    } else if (hint.type === "angle") {
      if (hint.sector) {
        results.push(hint.sector.toUpperCase() === sector.toUpperCase());
      } else if (hint.orYawDeg != null) {
        results.push(yawDistance(yaw, hint.orYawDeg) <= (hint.tolDeg ?? 20));
      } else {
        results.push(true);
      }
    } else if (hint.type === "text") {
      const minLen = hint.minLen ?? 2;
      let ok = ocr.length >= minLen;
      if (ok && hint.contains) {
        ok = ocr.toLowerCase().includes(hint.contains.toLowerCase());
      }
      textMatch = ok ? 1 : 0;
      results.push(ok);
    }
  }

  const passed =
    logic === "any" ? results.some(Boolean) : results.every(Boolean);
  return { passed, colorMatch, textMatch };
}

export function decideGate(input: GateInput): GateResult {
  const isShaking = input.shakeScore >= GATE.SHAKE_DROP;
  const isMoving = isShaking || input.frameDiffEnergy >= GATE.MOVING_DIFF;
  const base = {
    isMoving,
    isShaking,
    colorMatch: 1,
    textMatch: 1,
  };

  if (!input.feedOn) {
    return { decision: "DROP", dropReason: "feed off", ...base };
  }
  if (isShaking) {
    return { decision: "DROP", dropReason: "motion/shake", ...base };
  }
  if (input.blurScore >= GATE.BLUR_DROP) {
    return { decision: "DROP", dropReason: "blur", ...base };
  }
  if (input.glareScore >= GATE.GLARE_DROP) {
    return { decision: "DROP", dropReason: "glare", ...base };
  }
  if (input.brightness <= GATE.DARK_MAX) {
    return { decision: "DROP", dropReason: "too dark", ...base };
  }
  if (input.brightness >= GATE.BRIGHT_MIN) {
    return { decision: "DROP", dropReason: "too bright", ...base };
  }
  if (input.uniqueDistance < GATE.UNIQUE_MIN_HAMMING) {
    return { decision: "DROP", dropReason: "duplicate", ...base };
  }
  if (input.scenarioActive && input.sectorsFilled.includes(input.sectorId)) {
    return { decision: "DROP", dropReason: "wrong angle", ...base };
  }

  // Color/angle/shape now. Text is a separate capability — see applyOcrLayer.
  const visualReq = input.captureRequest
    ? {
        ...input.captureRequest,
        hints: input.captureRequest.hints.filter((h) => h.type !== "text"),
      }
    : null;
  const hints = hintsPass(visualReq, input);
  if (!hints.passed) {
    return {
      decision: "DROP",
      dropReason: "wrong_target",
      isMoving,
      isShaking,
      colorMatch: hints.colorMatch,
      textMatch: 1,
    };
  }

  const textHints =
    input.captureRequest?.hints.filter((h) => h.type === "text") ?? [];
  if (textHints.length > 0) {
    return {
      decision: "KEEP",
      dropReason: "ocr_pending",
      isMoving,
      isShaking,
      colorMatch: hints.colorMatch,
      textMatch: 0,
    };
  }

  return {
    decision: "SEND",
    dropReason: "—",
    isMoving,
    isShaking,
    colorMatch: hints.colorMatch,
    textMatch: 1,
  };
}

/** OCR capability on a kept candidate — match ask or keep scanning. */
export function applyOcrLayer(
  kept: GateResult,
  captureRequest: CaptureRequest | null | undefined,
  ocrText: string,
  rejectedNormalized: Set<string> = new Set(),
): GateResult {
  const textHints =
    captureRequest?.hints.filter((h): h is TextHint => h.type === "text") ?? [];
  if (textHints.length === 0) {
    return { ...kept, decision: "SEND", dropReason: "—", textMatch: 1 };
  }
  const raw = ocrText.trim();
  const norm = raw.toLowerCase().replace(/\s+/g, " ").trim();
  const minLen = Math.min(...textHints.map((h) => h.minLen ?? 2));
  if (raw.length < minLen) {
    return {
      ...kept,
      decision: "DROP",
      dropReason: "wrong_text",
      textMatch: 0,
    };
  }
  if (rejectedNormalized.has(norm)) {
    return {
      ...kept,
      decision: "DROP",
      dropReason: "same_text",
      textMatch: 0,
    };
  }
  const ok = textHints.every((h) => {
    if (!h.contains) return true;
    return raw.toLowerCase().includes(h.contains.toLowerCase());
  });
  if (ok) {
    return { ...kept, decision: "SEND", dropReason: "—", textMatch: 1 };
  }
  return {
    ...kept,
    decision: "DROP",
    dropReason: "wrong_text",
    textMatch: 0,
  };
}

/** 8x8 average hash over a grayscale Float32Array length = cols*rows */
export function averageHash(
  gray: Float32Array | Uint8Array,
  cols: number,
  rows: number,
): bigint {
  const cellW = Math.max(1, Math.floor(cols / 8));
  const cellH = Math.max(1, Math.floor(rows / 8));
  const means = new Array<number>(64).fill(0);
  for (let by = 0; by < 8; by++) {
    for (let bx = 0; bx < 8; bx++) {
      let s = 0;
      let cnt = 0;
      const y0 = by * cellH;
      const x0 = bx * cellW;
      for (let y = y0; y < Math.min(rows, y0 + cellH); y++) {
        for (let x = x0; x < Math.min(cols, x0 + cellW); x++) {
          s += Number(gray[y * cols + x]);
          cnt++;
        }
      }
      means[by * 8 + bx] = cnt > 0 ? s / cnt : 0;
    }
  }
  const avg = means.reduce((a, b) => a + b, 0) / 64;
  let hash = BigInt(0);
  for (let i = 0; i < 64; i++) {
    if (means[i]! >= avg) hash |= BigInt(1) << BigInt(i);
  }
  return hash;
}

export function hammingDistance(a: bigint, b: bigint): number {
  let x = a ^ b;
  let n = 0;
  while (x > BigInt(0)) {
    n += Number(x & BigInt(1));
    x >>= BigInt(1);
  }
  return n;
}
