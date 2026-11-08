import { describe, expect, it } from "vitest";
import {
  CoachLines,
  coachLine,
  immediatelyAfterStop,
  intakeChip,
  MAJOR_TIMELINE_KINDS,
  simulateStageHistory,
  validateTimely,
  whileRecording,
} from "./realtimeIntakeStages";

describe("realtimeIntakeStages", () => {
  it("locks coach to chip while listening", () => {
    expect(whileRecording(0)).toBe("LISTENING_PROMPT");
    expect(coachLine("LISTENING_PROMPT")).toBe(CoachLines.STATE_PROBLEM);
    expect(intakeChip("LISTENING_PROMPT")).toBe("Listening");

    expect(coachLine(whileRecording(1))).toBe(CoachLines.REFINE);
    expect(intakeChip(whileRecording(1))).toBe("Listening");

    expect(coachLine(whileRecording(4))).toContain(CoachLines.STOP_HINT);
  });

  it("after stop is Queued (not Transcribing) until Batch leases", () => {
    expect(immediatelyAfterStop(3, true)).toBe("QUEUED");
    expect(coachLine("QUEUED")).toBe(CoachLines.QUEUED);
    expect(intakeChip("QUEUED")).toBe("Queued");
    expect(coachLine("TRANSCRIBING")).toBe(CoachLines.TRANSCRIBING);
    expect(coachLine("FIGURING_OUT")).toBe(CoachLines.FIGURING);
  });

  it("simulated history is timely", () => {
    const hist = simulateStageHistory(3);
    expect(validateTimely(hist)).toEqual([]);
    expect(hist).toContain("QUEUED");
    const q = hist.indexOf("QUEUED");
    const t = hist.indexOf("TRANSCRIBING");
    const f = hist.indexOf("FIGURING_OUT");
    expect(q).toBeGreaterThanOrEqual(0);
    expect(q).toBeLessThan(t);
    expect(t).toBeLessThan(f);
  });

  it("rejects skipping wait stages before figuring", () => {
    expect(
      validateTimely(["LISTENING_PROMPT", "FIGURING_OUT", "ADVICE_READY"]),
    ).not.toEqual([]);
  });

  it("early stop clarifies without figuring", () => {
    expect(immediatelyAfterStop(0, false)).toBe("CLARIFY");
    expect(intakeChip("CLARIFY")).toBe("Needs details");
  });

  it("STATUS is not a major timeline kind", () => {
    expect(MAJOR_TIMELINE_KINDS.has("STATUS")).toBe(false);
    expect(MAJOR_TIMELINE_KINDS.has("USER_AUDIO")).toBe(true);
    expect(MAJOR_TIMELINE_KINDS.has("SERVER_TITLE")).toBe(true);
  });
});
