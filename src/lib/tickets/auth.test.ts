import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { authorizeOps, authorizeTicket, hasTicketsApiSecret } from "./auth";
import type { TicketTip } from "./types";

function tip(claim: string): TicketTip {
  return {
    schema: "myproblem.ticket.tip.v1",
    ticket_uuid: "t1",
    claim,
    createdAtMs: 1,
    updatedAtMs: 1,
    status: "open",
    fields: {
      title: { value: "x", source: "intake", locked: false },
      description: { value: "", source: "intake", locked: false },
    },
    coachLine: "",
    intake: "listening",
    questions: [],
    evidence: [],
    jobs: [],
    timeline: [],
  };
}

describe("ticket auth", () => {
  beforeEach(() => {
    delete process.env.TICKETS_API_SECRET;
    delete process.env.REQUIRE_TICKET_CLAIM;
  });

  afterEach(() => {
    delete process.env.TICKETS_API_SECRET;
    delete process.env.OPS_WAKE_SECRET;
    delete process.env.REQUIRE_TICKET_CLAIM;
  });

  it("accepts matching claim when REQUIRE_TICKET_CLAIM=1", () => {
    process.env.REQUIRE_TICKET_CLAIM = "1";
    const req = new Request("http://x", {
      headers: { authorization: "Bearer claim-abc" },
    });
    expect(authorizeTicket(req, tip("claim-abc")).ok).toBe(true);
    expect(authorizeTicket(new Request("http://x"), tip("claim-abc")).ok).toBe(false);
  });

  it("accepts API secret", () => {
    process.env.TICKETS_API_SECRET = "s3cret";
    process.env.REQUIRE_TICKET_CLAIM = "1";
    const req = new Request("http://x", {
      headers: { "x-tickets-secret": "s3cret" },
    });
    expect(hasTicketsApiSecret(req)).toBe(true);
    expect(authorizeTicket(req, tip("other")).ok).toBe(true);
  });

  it("authorizeOps accepts tickets secret even when OPS_WAKE_SECRET is set", () => {
    process.env.TICKETS_API_SECRET = "s3cret";
    process.env.OPS_WAKE_SECRET = "ops";
    expect(
      authorizeOps(
        new Request("http://x", { headers: { "x-tickets-secret": "s3cret" } }),
      ),
    ).toBe(true);
    expect(
      authorizeOps(new Request("http://x", { headers: { "x-ops-secret": "ops" } })),
    ).toBe(true);
    expect(authorizeOps(new Request("http://x"))).toBe(false);
  });
});
