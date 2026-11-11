/**
 * Grayscale still stats. Same formulas as Android ImageStatsMath so fixture
 * photos score the same on the web gate and on the phone.
 */

export type ImageStats = {
  brightness: number;
  contrast: number;
  glareScore: number;
  laplacianVar: number;
  blurScore: number;
  complexity: number;
};

export function meanContrastGlare(gray: Uint8Array): {
  brightness: number;
  contrast: number;
  glareScore: number;
} {
  if (gray.length === 0) return { brightness: 0, contrast: 0, glareScore: 0 };
  let sum = 0;
  let sumSq = 0;
  let glare = 0;
  for (const v of gray) {
    sum += v;
    sumSq += v * v;
    if (v >= 245) glare++;
  }
  const n = gray.length;
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  const contrast = Math.sqrt(Math.max(0, variance));
  return {
    brightness: mean / 255,
    contrast: Math.min(1, Math.max(0, contrast / 128)),
    glareScore: glare / n,
  };
}

export function laplacianVariance(gray: Uint8Array, cols: number, rows: number): number {
  if (cols < 3 || rows < 3) return 0;
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      const i = r * cols + c;
      const lap =
        gray[i - cols]! + gray[i + cols]! + gray[i - 1]! + gray[i + 1]! - 4 * gray[i]!;
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  if (n === 0) return 0;
  const mean = sum / n;
  return Math.max(0, sumSq / n - mean * mean);
}

export function blurAndComplexity(laplacianVar: number): { blurScore: number; complexity: number } {
  const blurScore = Math.min(1, Math.max(0, 1 - laplacianVar / (laplacianVar + 80)));
  const complexity = Math.min(1, Math.max(0, laplacianVar / (laplacianVar + 40)));
  return { blurScore, complexity };
}

export function measureGray(gray: Uint8Array, cols: number, rows: number): ImageStats {
  const { brightness, contrast, glareScore } = meanContrastGlare(gray);
  const lap = laplacianVariance(gray, cols, rows);
  const { blurScore, complexity } = blurAndComplexity(lap);
  return { brightness, contrast, glareScore, laplacianVar: lap, blurScore, complexity };
}
