import { NextResponse } from "next/server";
import {
  loadLatestMeta,
  putAssetIfNew,
  saveBatchMeta,
  sha256Hex,
} from "@/lib/socialCapture/queue";

/**
 * Networker capture batch upload.
 * Dedup key: networker_id + group_key; exact content_hash → already_synced.
 * Newer non-identical → latest-wins (overwrite meta). Assets content-addressed.
 * Extension never receives BUNNY_STORAGE_API_KEY.
 */
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "expected_multipart" }, { status: 400 });
  }

  const form = await req.formData();
  const batchRaw = form.get("batch");
  if (typeof batchRaw !== "string" || !batchRaw.trim()) {
    return NextResponse.json({ error: "missing_batch" }, { status: 400 });
  }

  let batch: Record<string, unknown>;
  try {
    batch = JSON.parse(batchRaw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "batch_json_invalid" }, { status: 400 });
  }

  const networkerId = String(
    form.get("networker_id") ||
      req.headers.get("x-networker-id") ||
      "anon",
  ).trim();
  const source = (batch.source || {}) as Record<string, unknown>;
  const groupKey = String(
    form.get("group_key") ||
      source.group_url ||
      source.group_secure_id ||
      source.url ||
      "unknown",
  );
  const contentHash = String(batch.content_hash || sha256Hex(batchRaw));

  const prev = await loadLatestMeta(networkerId, groupKey);
  if (prev && prev.content_hash === contentHash) {
    return NextResponse.json({
      ok: true,
      status: "already_synced",
      content_hash: contentHash,
      message: "Exact duplicate — nothing new to queue",
    });
  }

  const assets: Array<{ name: string; sha256: string; path: string; stored: boolean; uri?: string }> =
    [];
  for (const [key, value] of form.entries()) {
    if (key === "batch" || key === "networker_id" || key === "group_key") continue;
    if (!(value instanceof File)) continue;
    const buf = Buffer.from(await value.arrayBuffer());
    const ext = (value.name.split(".").pop() || "bin").toLowerCase();
    try {
      const up = await putAssetIfNew(buf, ext, value.type || "application/octet-stream");
      assets.push({
        name: value.name || key,
        sha256: up.sha256,
        path: up.path,
        stored: up.stored,
        uri: up.uri,
      });
    } catch (e) {
      return NextResponse.json(
        {
          error: "asset_upload_failed",
          detail: e instanceof Error ? e.message : String(e),
        },
        { status: 502 },
      );
    }
  }

  try {
    const meta = await saveBatchMeta({
      networker_id: networkerId,
      group_key: groupKey,
      content_hash: contentHash,
      uploaded_at: new Date().toISOString(),
      batch_json: batchRaw,
    });
    return NextResponse.json({
      ok: true,
      status: prev ? "replaced_latest" : "queued",
      content_hash: contentHash,
      previous_hash: prev?.content_hash || null,
      meta_path: meta.pathname,
      assets,
      message:
        "Queued for batch. Never posts to origin social networks from this path.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "blob_not_configured") {
      // Still accept when Bunny assets worked — return soft queue ack without meta persist
      if (assets.length) {
        return NextResponse.json({
          ok: true,
          status: "assets_only",
          content_hash: contentHash,
          assets,
          warning: "BLOB_READ_WRITE_TOKEN missing — batch meta not persisted",
        });
      }
      return NextResponse.json(
        {
          error: "store_not_configured",
          message:
            "Set BLOB_READ_WRITE_TOKEN (and optionally BUNNY_STORAGE_API_KEY) on the server.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "queue_failed", detail: msg },
      { status: 500 },
    );
  }
}
