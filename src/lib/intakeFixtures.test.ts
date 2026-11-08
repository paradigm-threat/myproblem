import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");
const CATALOG_PATH = join(ROOT, "fixtures/intakes/catalog.json");
const SMOKE_DIR = join(ROOT, "fixtures/intakes/smoke");
const NOISE_DIR = join(ROOT, "fixtures/intakes/noise");

type ExpectBlock = {
  title_must_include: string[];
  description_must_include_any: string[];
  intake_targets: string[];
  eval_surface: "apk_or_server" | "server_only";
};

type Scenario = {
  id: string;
  difficulty: string;
  style: string;
  status: "generate" | "script_only";
  script: string;
  noise: string;
  snr_db: number;
  expect: ExpectBlock;
};

type Catalog = {
  version: number;
  format: string;
  scenarios: Scenario[];
};

const DIFFICULTIES = new Set(["easy", "medium", "hard", "extreme"]);
const STYLES = new Set(["clear", "rambly", "disorganized", "panic", "noisy"]);
const INTAKE = new Set([
  "named_and_questions",
  "advice_ready",
  "queue_project",
  "needs_user_text",
  "listening",
  "figuring_out",
]);

describe("intake fixtures catalog", () => {
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8")) as Catalog;

  it("has expected format and enough scenarios", () => {
    expect(catalog.format).toBe("myproblem.intake_fixtures");
    expect(catalog.version).toBe(1);
    expect(catalog.scenarios.length).toBeGreaterThanOrEqual(24);
    expect(catalog.scenarios.length).toBeLessThanOrEqual(40);
  });

  it("has unique ids and required fields", () => {
    const ids = catalog.scenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const s of catalog.scenarios) {
      expect(s.id).toMatch(/^[a-z0-9_]+$/);
      expect(DIFFICULTIES.has(s.difficulty)).toBe(true);
      expect(STYLES.has(s.style)).toBe(true);
      expect(["generate", "script_only"]).toContain(s.status);
      expect(s.script.trim().length).toBeGreaterThan(20);
      expect(s.noise.trim().length).toBeGreaterThan(0);
      expect(typeof s.snr_db).toBe("number");
      expect(s.expect.title_must_include.length).toBeGreaterThan(0);
      expect(s.expect.description_must_include_any.length).toBeGreaterThan(0);
      expect(s.expect.intake_targets.length).toBeGreaterThan(0);
      expect(["apk_or_server", "server_only"]).toContain(s.expect.eval_surface);
      for (const t of s.expect.intake_targets) {
        expect(INTAKE.has(t)).toBe(true);
      }
    }
  });

  it("marks a generate set for easy/medium/hard and script_only extremes", () => {
    const generate = catalog.scenarios.filter((s) => s.status === "generate");
    const scriptOnly = catalog.scenarios.filter((s) => s.status === "script_only");
    expect(generate.length).toBeGreaterThanOrEqual(12);
    expect(scriptOnly.length).toBeGreaterThanOrEqual(5);
    expect(generate.every((s) => s.difficulty !== "extreme")).toBe(true);
    expect(catalog.scenarios.filter((s) => s.difficulty === "extreme").every((s) => s.status === "script_only")).toBe(
      true,
    );
  });

  it("has smoke wav samples for CI", () => {
    expect(existsSync(SMOKE_DIR)).toBe(true);
    const smokes = readdirSync(SMOKE_DIR).filter((f) => f.endsWith(".wav"));
    expect(smokes.length).toBeGreaterThanOrEqual(2);
    for (const f of smokes) {
      const st = statSync(join(SMOKE_DIR, f));
      expect(st.size).toBeGreaterThan(500);
      // Keep committed smokes small
      expect(st.size).toBeLessThan(200_000);
    }
  });

  it("has procedural noise beds referenced by generate scenarios", () => {
    const needed = new Set(
      catalog.scenarios.filter((s) => s.status === "generate").map((s) => s.noise),
    );
    for (const name of needed) {
      const path = join(NOISE_DIR, `${name}.wav`);
      expect(existsSync(path), `missing noise bed ${name}`).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(1000);
    }
  });
});
