import { describe, expect, it } from "vitest";
import { heuristicIntake } from "./lightIntake";

describe("heuristicIntake", () => {
  it("names a flat tire script", () => {
    const r = heuristicIntake(
      "Hi. I have a flat tire on the roadside. The front passenger tire is completely flat.",
    );
    expect(r.title.toLowerCase()).toContain("flat");
    expect(r.source).toBe("heuristic");
    expect(r.intake).toBe("named_and_questions");
  });
});
