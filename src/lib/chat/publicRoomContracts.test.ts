import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "../../..");

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

describe("public room intake contracts", () => {
  it("homepage opens fullscreen chat via OpenChatButton (no inline room)", () => {
    const page = read("src/app/page.tsx");
    expect(page).toMatch(/OpenChatButton/);
    expect(page).toMatch(/VisionStrip|Simple Max/);
    expect(page).not.toMatch(/PublicChatShell/);
    expect(page).not.toMatch(/SubmitTicketForm/);
  });

  it("/submit redirects to /#room and never mounts ticket form", () => {
    const submit = read("src/app/submit/page.tsx");
    expect(submit).toMatch(/\/#room/);
    expect(submit).not.toMatch(/SubmitTicketForm/);
    expect(submit).not.toMatch(/enqueueSubmission/);
    expect(submit).not.toMatch(/\/api\/tickets/);
  });

  it("SubmitTicketForm stub never enqueues tip outbox", () => {
    const form = read("src/components/SubmitTicketForm.tsx");
    expect(form).toMatch(/\/#room/);
    expect(form).not.toMatch(/enqueueSubmission/);
    expect(form).not.toMatch(/\/api\/tickets/);
    expect(form).not.toMatch(/OutboxQueue/);
  });

  it("channel allowlist is mp-general + savannah rescue", () => {
    const channels = read("src/lib/chat/channels.ts");
    expect(channels).toMatch(/"mp-general"/);
    expect(channels).toMatch(/"ga-savannah-cat-rescue"/);
    expect(channels).toMatch(/DEFAULT_CHANNEL_SLUG = "mp-general"/);
  });

  it("overlay posts to /api/chat/post and Bunny media path", () => {
    const overlay = read("src/components/chat/SubmitProblemOverlay.tsx");
    expect(overlay).toMatch(/\/api\/chat\/post/);
    expect(overlay).toMatch(/\/api\/chat-media\/upload/);
    expect(overlay).toMatch(/formatChannelMediaPost/);
    expect(overlay).not.toMatch(/\/api\/tickets/);
  });

  it("chat post route does not mint tickets", () => {
    const route = read("src/app/api/chat/post/route.ts");
    expect(route).toMatch(/Does \*\*not\*\* mint tip/);
    expect(route).not.toMatch(/\/api\/tickets/);
    expect(route).not.toMatch(/createTicket/);
  });

  it("SiteHeader always exposes Chat launcher (not /submit form)", () => {
    const header = read("src/components/SiteHeader.tsx");
    expect(header).toMatch(/SITE_CHAT_BTN_ID|site-chat-btn|ChatLauncherBoot/);
    expect(header).not.toMatch(/href: "\/submit"/);
  });
});

