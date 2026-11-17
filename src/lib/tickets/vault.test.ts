import { describe, expect, it, beforeEach } from "vitest";

describe("ticket vault helpers", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    // @ts-expect-error test shim
    globalThis.localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    };
    // @ts-expect-error test shim
    globalThis.window = globalThis;
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: { randomUUID: () => "11111111-1111-1111-1111-111111111111" },
    });
  });

  it("mints visitor and remembers tickets with slug", async () => {
    const { getOrCreateVisitorId, rememberTicket, readTicketVault, shareUrlForSlug } =
      await import("./vault");
    const v = getOrCreateVisitorId();
    expect(v).toMatch(/^[0-9a-f-]{36}$/i);
    rememberTicket({
      ticket_uuid: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      slug: "abc12xyz",
      title: "Flat tire",
      resolution: "unsolved",
    });
    const list = readTicketVault();
    expect(list[0]?.slug).toBe("abc12xyz");
    expect(list[0]?.ticket_uuid).toContain("aaaa");
    expect(shareUrlForSlug("abc12xyz", "https://myproblem.app")).toBe(
      "https://myproblem.app/t/abc12xyz",
    );
  });
});
