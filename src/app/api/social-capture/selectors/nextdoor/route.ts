import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

function sign(body: string) {
  const secret =
    process.env.SELECTOR_PACK_HMAC_SECRET?.trim() ||
    process.env.TICKETS_API_SECRET?.trim() ||
    "";
  if (!secret) return null;
  return createHmac("sha256", secret).update(body).digest("hex");
}

/**
 * Signed Nextdoor selector pack for the capture extension.
 * Devices verify HMAC; unsigned/mismatched packs must be rejected client-side.
 */
export async function GET() {
  const path = join(
    process.cwd(),
    "extensions/capture/data/selectors-nextdoor.v1.json",
  );
  let pack: unknown;
  try {
    pack = JSON.parse(await readFile(path, "utf8"));
  } catch {
    return NextResponse.json({ error: "pack_missing" }, { status: 404 });
  }
  const body = JSON.stringify(pack);
  const signature = sign(body);
  return NextResponse.json({
    ok: true,
    pack,
    signature,
    alg: signature ? "hmac-sha256" : null,
    signed: Boolean(signature),
    message: signature
      ? "Verify HMAC with the shared SELECTOR_PACK_HMAC_SECRET / TICKETS_API_SECRET."
      : "Server has no signing secret — treat as unsigned; extension should keep bundled pack.",
  });
}

/** Optional verify helper for ops — body { pack, signature }. */
export async function POST(req: Request) {
  const secret =
    process.env.SELECTOR_PACK_HMAC_SECRET?.trim() ||
    process.env.TICKETS_API_SECRET?.trim() ||
    "";
  if (!secret) {
    return NextResponse.json({ ok: false, error: "no_secret" }, { status: 503 });
  }
  const json = (await req.json().catch(() => null)) as {
    pack?: unknown;
    signature?: string;
  } | null;
  if (!json?.pack || !json.signature) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }
  const body = JSON.stringify(json.pack);
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(json.signature), "utf8");
  const match = a.length === b.length && timingSafeEqual(a, b);
  return NextResponse.json({ ok: match, valid: match });
}
