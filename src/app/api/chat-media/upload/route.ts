import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { resolveChannel, normalizeChannelSlug } from "@/lib/chat/channels";

const MAX_BYTES = 40 * 1024 * 1024; // 40 MB

function sha256Hex(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

/**
 * Server-side Bunny upload for public-room speak/video.
 * Returns a public CDN URL to paste into IRC. Key never leaves the server.
 */
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "expected_multipart" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }

  const channelSlug = normalizeChannelSlug(String(form.get("channel") || ""));
  const ch = resolveChannel(channelSlug);
  const kind = String(form.get("kind") || "file").slice(0, 32);

  const buf = Buffer.from(await file.arrayBuffer());
  const sha = sha256Hex(buf);
  const ext =
    (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "bin";

  const bunnyKey = process.env.BUNNY_STORAGE_API_KEY?.trim();
  const zone = process.env.BUNNY_STORAGE_ZONE?.trim() || "myproblem-stills";
  const host = process.env.BUNNY_STORAGE_HOST?.trim() || "storage.bunnycdn.com";
  const cdnBase =
    process.env.BUNNY_CDN_BASE?.trim().replace(/\/$/, "") ||
    "https://myproblem-stills.b-cdn.net";

  if (!bunnyKey) {
    return NextResponse.json(
      {
        error: "bunny_not_configured",
        message:
          "Set BUNNY_STORAGE_API_KEY on the server to upload speak/video notes.",
      },
      { status: 503 },
    );
  }

  const bunnyPath = `chat-public/${ch.slug}/${sha}.${ext}`;
  const putRes = await fetch(`https://${host}/${zone}/${bunnyPath}`, {
    method: "PUT",
    headers: {
      AccessKey: bunnyKey,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: new Uint8Array(buf),
  });
  if (!putRes.ok && putRes.status !== 201) {
    return NextResponse.json(
      { error: `bunny_upload_${putRes.status}` },
      { status: 502 },
    );
  }

  const url = `${cdnBase}/${bunnyPath}`;
  return NextResponse.json({
    ok: true,
    url,
    path: bunnyPath,
    sha256: sha,
    kind,
    channel: ch.ircChannel,
  });
}
