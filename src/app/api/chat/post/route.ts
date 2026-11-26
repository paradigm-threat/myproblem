import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { resolveChannel, normalizeChannelSlug } from "@/lib/chat/channels";
import { CHAT_API_BASE } from "@/lib/contact";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Proxy a public problem post into Clevertree chat host (→ IRC bridge).
 * Demo channels resolve via allowlist; unknown → #mp-general.
 */
export async function POST(req: Request) {
  let body: {
    channel?: string;
    topic?: string;
    body?: string;
    name?: string;
    visitor?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const text = String(body.body || "").trim();
  if (!text || text.length > 8000) {
    return NextResponse.json({ error: "body_required" }, { status: 400 });
  }

  const slug = normalizeChannelSlug(
    body.topic || body.channel?.replace(/^#/, "") || "",
  );
  const ch = resolveChannel(slug);

  const topic = ch.ircChannel.replace(/^#/, "");
  const rawVisitor = String(body.visitor || "").trim();
  const visitor = UUID_RE.test(rawVisitor) ? rawVisitor : randomUUID();

  try {
    const res = await fetch(`${CHAT_API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "submit",
        topic,
        visitor,
        body: text,
        name: String(body.name || "myproblem").slice(0, 40),
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return NextResponse.json(
        {
          error: (data.error as string) || `chat_${res.status}`,
          detail: data,
        },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 },
      );
    }
    return NextResponse.json({
      ok: true,
      channel: ch.ircChannel,
      topic,
      result: data,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "chat_unreachable",
        detail: e instanceof Error ? e.message : String(e),
        hint: "Type directly in the room below — WebSocket mirrors may still work.",
      },
      { status: 502 },
    );
  }
}
