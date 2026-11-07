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
} as const;

export type DropReason =
  | "—"
  | "blur"
  | "motion/shake"
  | "duplicate"
  | "wrong angle"
  | "glare"
  | "too dark"
  | "too bright"
  | "feed off";

export type GateDecision = "WORTHY" | "DROP";

export type GateInput = {
  feedOn: boolean;
  brightness: number;
  blurScore: number;
  glareScore: number;
  shakeScore: number;
  frameDiffEnergy: number;
  uniqueDistance: number;
  sectorId: number;
  sectorsFilled: number[];
  scenarioActive: boolean;
};

export type GateResult = {
  decision: GateDecision;
  dropReason: DropReason;
  isMoving: boolean;
  isShaking: boolean;
};

export function sectorFromYaw(yawDeg: number): number {
  const az = ((yawDeg % 360) + 360) % 360;
  return Math.floor((az + 22.5) / 45) % GATE.SECTOR_COUNT;
}

export function decideGate(input: GateInput): GateResult {
  const isShaking = input.shakeScore >= GATE.SHAKE_DROP;
  const isMoving = isShaking || input.frameDiffEnergy >= GATE.MOVING_DIFF;

  if (!input.feedOn) {
    return { decision: "DROP", dropReason: "feed off", isMoving, isShaking };
  }
  if (isShaking) {
    return { decision: "DROP", dropReason: "motion/shake", isMoving, isShaking };
  }
  if (input.blurScore >= GATE.BLUR_DROP) {
    return { decision: "DROP", dropReason: "blur", isMoving, isShaking };
  }
  if (input.glareScore >= GATE.GLARE_DROP) {
    return { decision: "DROP", dropReason: "glare", isMoving, isShaking };
  }
  if (input.brightness <= GATE.DARK_MAX) {
    return { decision: "DROP", dropReason: "too dark", isMoving, isShaking };
  }
  if (input.brightness >= GATE.BRIGHT_MIN) {
    return { decision: "DROP", dropReason: "too bright", isMoving, isShaking };
  }
  if (input.uniqueDistance < GATE.UNIQUE_MIN_HAMMING) {
    return { decision: "DROP", dropReason: "duplicate", isMoving, isShaking };
  }
  if (input.scenarioActive && input.sectorsFilled.includes(input.sectorId)) {
    return { decision: "DROP", dropReason: "wrong angle", isMoving, isShaking };
  }
  return { decision: "WORTHY", dropReason: "—", isMoving, isShaking };
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
