import { describe, expect, it } from "vitest";
import { loadSeedPublicTicket, seedToPublicProblemView } from "./seedPublicTicket";
import { ticketStatus } from "./ticketStatus";

describe("public ticket status", () => {
  it("shows the garage ticket as submitted and waiting", () => {
    const seed = loadSeedPublicTicket("garage-ring-power");
    expect(seed).not.toBeNull();
    const status = ticketStatus(seedToPublicProblemView(seed!));
    expect(status.pill).toBe("Awaiting review");
    expect(status.summary).toMatch(/Waiting for the AI pass/);
    expect(status.summary).toMatch(/people/);
    expect(status.steps.map((s) => [s.id, s.state])).toEqual([
      ["submitted", "done"],
      ["ai", "current"],
      ["people", "current"],
      ["plan", "later"],
      ["solved", "later"],
    ]);
    expect(status.steps.filter((s) => s.state === "current").map((s) => s.id)).toEqual([
      "ai",
      "people",
    ]);
    expect(status.summary).not.toMatch(/fix plan/i);
  });

  it("completes the list when the problem is solved", () => {
    const seed = loadSeedPublicTicket("garage-ring-power");
    const view = seedToPublicProblemView(seed!);
    const status = ticketStatus({ ...view, resolution: "solved" });
    expect(status.pill).toBe("Solved");
    expect(status.steps.every((s) => s.state === "done")).toBe(true);
    expect(status.steps.at(-1)?.id).toBe("solved");
  });
});
