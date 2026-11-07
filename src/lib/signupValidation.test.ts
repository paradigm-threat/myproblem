import { describe, expect, it } from "vitest";
import {
  allowRequest,
  isEmail,
  isHoneypotTriggered,
  validateSignupBody,
} from "./signupValidation";

describe("isEmail", () => {
  it("accepts simple emails", () => {
    expect(isEmail("ari@asu.edu")).toBe(true);
  });
  it("rejects garbage", () => {
    expect(isEmail("nope")).toBe(false);
    expect(isEmail("a@b")).toBe(false);
  });
});

describe("validateSignupBody", () => {
  it("requires business name for business role", () => {
    const r = validateSignupBody({
      role: "business",
      name: "Ari",
      email: "ari@asu.edu",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Business name/);
  });

  it("accepts user signup", () => {
    const r = validateSignupBody({
      role: "user",
      name: "Ari",
      email: "ari@asu.edu",
    });
    expect(r.ok).toBe(true);
  });

  it("rejects invalid role", () => {
    const r = validateSignupBody({
      role: "hacker",
      name: "x",
      email: "a@b.co",
    });
    expect(r.ok).toBe(false);
  });
});

describe("honeypot + rate limit", () => {
  it("detects honeypot", () => {
    expect(isHoneypotTriggered({ company_website: "http://spam" })).toBe(true);
    expect(isHoneypotTriggered({})).toBe(false);
  });

  it("blocks after limit", () => {
    const store = new Map<string, { count: number; reset: number }>();
    const now = 1_000_000;
    for (let i = 0; i < 8; i++) {
      expect(allowRequest(store, "ip", 8, 60_000, now)).toBe(true);
    }
    expect(allowRequest(store, "ip", 8, 60_000, now)).toBe(false);
    expect(allowRequest(store, "ip", 8, 60_000, now + 61_000)).toBe(true);
  });
});
