import { NextResponse } from "next/server";
import { proxyToIntake, intakeBaseUrl } from "@/lib/tickets/proxy";

const INTAKE_PUBLIC = "https://intake.myproblem.app";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Multipart from APK: forward as JSON+base64 to Intake commit worker
 * (Vercel does not own tip/job SoT).
 */
export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const base = intakeBaseUrl();
  if (!base) {
    return NextResponse.json(
      {
        error: "tickets_moved",
        message: "Set INTAKE_URL or call Intake directly.",
        intake: INTAKE_PUBLIC,
      },
      { status: 410 },
    );
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    const proxied = await proxyToIntake(req, `/api/tickets/${id}/evidence`);
    if (proxied) return proxied;
    return NextResponse.json({ error: "expected_multipart" }, { status: 400 });
  }

  const form = await req.formData();
  const kind = String(form.get("kind") || "");
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (kind === "video" || file.type.startsWith("video/")) {
    return NextResponse.json({ error: "video_rejected" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const chunkIndex = form.get("chunkIndex") != null ? Number(form.get("chunkIndex")) : null;
  const isFinal = String(form.get("isFinal") || "") === "true";
  const hotwordsRaw = form.get("hotwords");
  const hotwords =
    typeof hotwordsRaw === "string" && hotwordsRaw
      ? hotwordsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

  const headers = new Headers();
  const secret = req.headers.get("x-tickets-secret");
  const auth = req.headers.get("authorization");
  const claim = req.headers.get("x-ticket-claim");
  if (secret) headers.set("x-tickets-secret", secret);
  if (auth) headers.set("authorization", auth);
  if (claim) headers.set("x-ticket-claim", claim);
  headers.set("content-type", "application/json");

  const forwarded = await fetch(`${base}/api/tickets/${id}/evidence`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      kind: kind === "still" || file.type.startsWith("image/") ? "still" : "audio",
      base64: buf.toString("base64"),
      chunkIndex,
      isFinal,
      hotwords,
      filename: file.name,
    }),
  });
  const text = await forwarded.text();
  return new NextResponse(text, {
    status: forwarded.status,
    headers: { "content-type": forwarded.headers.get("content-type") || "application/json" },
  });
}
