import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  naiveTitleFromScript,
  scoreIntakeKeywords,
  scriptContainsGoldens,
  type IntakeFixtureExpect,
} from "./intakeFixtureScore";

const CATALOG_PATH = join(__dirname, "../../fixtures/intakes/catalog.json");

type Scenario = {
  id: string;
  difficulty: string;
  status: string;
  script: string;
  expect: IntakeFixtureExpect;
};

const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8")) as { scenarios: Scenario[] };

describe("intakeFixtureScore", () => {
  it("scores title must-include and description any-of", () => {
    const expectBlock: IntakeFixtureExpect = {
      title_must_include: ["flat", "tire"],
      description_must_include_any: ["spare", "roadside"],
      intake_targets: ["advice_ready"],
      eval_surface: "apk_or_server",
    };
    const ok = scoreIntakeKeywords(
      "Flat tire on the roadside",
      "Have a spare but need jack help",
      expectBlock,
    );
    expect(ok.ok).toBe(true);
    expect(ok.titleMisses).toEqual([]);
    expect(ok.descriptionHit).toBe("spare");

    const bad = scoreIntakeKeywords("Car trouble", "Engine noise", expectBlock);
    expect(bad.ok).toBe(false);
    expect(bad.titleMisses).toEqual(["flat", "tire"]);
  });

  it("every catalog script contains its own golden keywords", () => {
    const failures: string[] = [];
    for (const s of catalog.scenarios) {
      const score = scriptContainsGoldens(s.script, s.expect);
      if (!score.ok) {
        failures.push(
          `${s.id}: titleMiss=${score.titleMisses.join("|")} descMiss=${score.descriptionMisses.join("|")}`,
        );
      }
    }
    expect(failures).toEqual([]);
  });

  it("naive title+script description passes goldens for easy generate scenarios", () => {
    const easy = catalog.scenarios.filter((s) => s.status === "generate" && s.difficulty === "easy");
    expect(easy.length).toBeGreaterThanOrEqual(5);
    const failures: string[] = [];
    for (const s of easy) {
      const title = naiveTitleFromScript(s.script);
      const score = scoreIntakeKeywords(title, s.script, s.expect);
      if (!score.ok) {
        failures.push(`${s.id} title="${title}" missT=${score.titleMisses} missD=${score.descriptionMisses}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("hard generate scenarios may need full script as title stand-in (server path)", () => {
    const hard = catalog.scenarios.filter((s) => s.status === "generate" && s.difficulty === "hard");
    expect(hard.length).toBeGreaterThanOrEqual(2);
    // Full script as both title+desc models a strong server intake summary source
    for (const s of hard) {
      const score = scoreIntakeKeywords(s.script, s.script, s.expect);
      expect(score.ok, s.id).toBe(true);
    }
  });
});
