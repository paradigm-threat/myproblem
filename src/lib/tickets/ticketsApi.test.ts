import { describe, expect, it } from "vitest";
import { emptyTip, saveTip, loadTip } from "./store";
import { randomUUID } from "node:crypto";

describe("ticket tip store", () => {
  it("creates and reloads a tip", () => {
    const id = randomUUID();
    const tip = emptyTip(id);
    tip.fields.title.value = "Flat tire";
    saveTip(tip);
    const loaded = loadTip(id);
    expect(loaded?.ticket_uuid).toBe(id);
    expect(loaded?.fields.title.value).toBe("Flat tire");
    expect(loaded?.schema).toBe("myproblem.ticket.tip.v1");
    expect(loaded?.timeline[0]?.kind).toBe("system");
  });
});
