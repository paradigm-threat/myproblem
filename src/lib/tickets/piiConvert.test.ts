import { describe, expect, it } from "vitest";
import { convertPii } from "./piiConvert";

describe("convertPii", () => {
  it("coarsens street addresses", () => {
    const { text, changed } = convertPii("I live at 123 Main Street please help");
    expect(changed).toBe(true);
    expect(text).not.toMatch(/123 Main/);
    expect(text.toLowerCase()).toContain("address");
  });

  it("withholds email and phone", () => {
    const { text } = convertPii("call me at 404-555-1212 or a@b.com");
    expect(text).toContain("[phone withheld]");
    expect(text).toContain("[email withheld]");
  });
});
