import { describe, expect, it } from "vitest";
import { deriveHonestIntake } from "./intakeStatus";
import type { TicketTip } from "./types";

function tip(partial: Partial<TicketTip>): TicketTip {
  return {
    schema: "myproblem.ticket.tip.v1",
    ticket_uuid: "t1",
    claim: "c",
    createdAtMs: 1_000,
    updatedAtMs: 1_000,
    status: "open",
    fields: {
      title: { value: "x", source: "intake", locked: false },
      description: { value: "", source: "intake", locked: false },
    },
    coachLine: "",
    intake: "transcribing",
    questions: [],
    evidence: [],
    jobs: [],
    timeline: [],
    ...partial,
  };
}

describe("deriveHonestIntake", () => {
  it("maps legacy stuck transcribing + queued job to queued", () => {
    const t = tip({
      intake: "transcribing",
      evidence: [
        { id: "a", kind: "audio", uri: "cache://t/a.bin", atMs: 1, processed: false },
      ],
      jobs: [{ id: "j", bin: "asr", state: "queued" }],
    });
    expect(deriveHonestIntake(t, 2_000)).toBe("queued");
  });

  it("shows transcribing only while leased", () => {
    const t = tip({
      intake: "queued",
      updatedAtMs: Date.now(),
      evidence: [
        { id: "a", kind: "audio", uri: "cache://t/a.bin", atMs: 1, processed: false },
      ],
      jobs: [{ id: "j", bin: "asr", state: "leased" }],
    });
    expect(deriveHonestIntake(t)).toBe("transcribing");
  });

  it("times out long-queued tips", () => {
    const t = tip({
      intake: "queued",
      updatedAtMs: 1,
      evidence: [
        { id: "a", kind: "audio", uri: "cache://t/a.bin", atMs: 1, processed: false },
      ],
      jobs: [{ id: "j", bin: "asr", state: "queued" }],
    });
    expect(deriveHonestIntake(t, 1 + 31 * 60 * 1000)).toBe("timeout");
  });

  it("advances when transcript exists", () => {
    const t = tip({
      intake: "transcribing",
      evidence: [
        { id: "a", kind: "audio", uri: "", processed: true, atMs: 1 },
        { id: "tx", kind: "transcript", uri: "", text: "flat tire", atMs: 2 },
      ],
      jobs: [{ id: "j", bin: "asr", state: "done" }],
    });
    expect(deriveHonestIntake(t)).toBe("named_and_questions");
  });
});
