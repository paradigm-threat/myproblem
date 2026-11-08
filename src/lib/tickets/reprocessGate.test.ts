import { describe, expect, it } from "vitest";
import { evaluateReprocessGate } from "./reprocessGate";
import type { TicketTip } from "./types";

function tip(partial: Partial<TicketTip> = {}): TicketTip {
  return {
    schema: "myproblem.ticket.tip.v1",
    ticket_uuid: "t1",
    claim: "c1",
    createdAtMs: 1,
    updatedAtMs: 1,
    status: "open",
    fields: {
      title: { value: "Flat tire", source: "intake", locked: false },
      description: { value: "spare in trunk", source: "intake", locked: false },
    },
    coachLine: "",
    intake: "named_and_questions",
    questions: [],
    evidence: [
      {
        id: "a1",
        kind: "audio",
        uri: "",
        processed: true,
        purgedAtMs: 2,
        atMs: 1,
      },
      {
        id: "tx1",
        kind: "transcript",
        uri: "",
        text: "I have a flat tire. Spare is in the trunk.",
        version: 1,
        atMs: 2,
      },
    ],
    jobs: [],
    timeline: [],
    ...partial,
  };
}

describe("reprocessGate", () => {
  it("skips when no new context", () => {
    const r = evaluateReprocessGate({
      tip: tip(),
      target: "asr",
      requestedBy: "user",
      contextDelta: {},
    });
    expect(r.reprocess).toBe(false);
    expect(r.reason).toBe("no_new_context");
  });

  it("skips when tokens already in transcript", () => {
    const r = evaluateReprocessGate({
      tip: tip(),
      target: "asr",
      requestedBy: "apk_llm",
      contextDelta: { addedNames: ["tire"], newUserNote: "spare trunk" },
    });
    expect(r.reprocess).toBe(false);
  });

  it("approves when new proper name missing from transcript", () => {
    const r = evaluateReprocessGate({
      tip: tip(),
      target: "asr",
      requestedBy: "user",
      contextDelta: { addedNames: ["Bosch"], addedOcr: ["XJ-2"] },
    });
    expect(r.reprocess).toBe(true);
    expect(r.needsReupload).toBe(true);
    expect(r.hotwords).toContain("Bosch");
  });
});
