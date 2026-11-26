import { createHash } from "node:crypto";
import { put, list, del } from "@vercel/blob";

const PREFIX = "social-capture";

export type CaptureBatchMeta = {
  networker_id: string;
  group_key: string;
  content_hash: string;
  blob_url: string;
  uploaded_at: string;
  pathname: string;
};

function metaPath(networkerId: string, groupKey: string) {
  const safeN = networkerId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "anon";
  const safeG = createHash("sha256").update(groupKey).digest("hex").slice(0, 24);
  return `${PREFIX}/meta/${safeN}/${safeG}.json`;
}

function assetPath(sha256: string, ext: string) {
  const safe = sha256.replace(/[^a-f0-9]/gi, "").toLowerCase();
  const e = (ext || "bin").replace(/^\./, "").replace(/[^a-z0-9]+/gi, "") || "bin";
  return `${PREFIX}/assets/${safe}.${e}`;
}

export function sha256Hex(buf: Buffer | Uint8Array | string) {
  return createHash("sha256").update(buf).digest("hex");
}

export async function loadLatestMeta(
  networkerId: string,
  groupKey: string,
): Promise<CaptureBatchMeta | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;
  const pathname = metaPath(networkerId, groupKey);
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1, token });
    const hit = blobs.find((b) => b.pathname === pathname) || blobs[0];
    if (!hit?.url) return null;
    const res = await fetch(hit.url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as CaptureBatchMeta;
  } catch {
    return null;
  }
}

export async function saveBatchMeta(
  meta: Omit<CaptureBatchMeta, "pathname" | "blob_url"> & { batch_json: string },
): Promise<CaptureBatchMeta> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("blob_not_configured");
  }
  const pathname = metaPath(meta.networker_id, meta.group_key);
  const body = JSON.stringify({
    networker_id: meta.networker_id,
    group_key: meta.group_key,
    content_hash: meta.content_hash,
    uploaded_at: meta.uploaded_at,
    batch: JSON.parse(meta.batch_json),
  });
  const blob = await put(pathname, body, {
    access: "private",
    contentType: "application/json",
    token,
    allowOverwrite: true,
  });
  return {
    networker_id: meta.networker_id,
    group_key: meta.group_key,
    content_hash: meta.content_hash,
    uploaded_at: meta.uploaded_at,
    blob_url: blob.url,
    pathname,
  };
}

export async function deleteOlderBatchMeta(pathname: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !pathname) return;
  try {
    await del(pathname, { token });
  } catch {
    /* latest-wins overwrite already replaces */
  }
}

/** Content-addressed asset: skip PUT if hash already present. */
export async function putAssetIfNew(
  bytes: Buffer,
  ext: string,
  contentType: string,
): Promise<{ sha256: string; path: string; stored: boolean; uri?: string }> {
  const sha256 = sha256Hex(bytes);
  const path = assetPath(sha256, ext);
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const bunnyKey = process.env.BUNNY_STORAGE_API_KEY?.trim();
  const zone = process.env.BUNNY_STORAGE_ZONE?.trim() || "myproblem-stills";
  const host = process.env.BUNNY_STORAGE_HOST?.trim() || "storage.bunnycdn.com";

  if (bunnyKey) {
    const bunnyPath = `social-inbox/${sha256}.${(ext || "bin").replace(/^\./, "")}`;
    const head = await fetch(`https://${host}/${zone}/${bunnyPath}`, {
      method: "HEAD",
      headers: { AccessKey: bunnyKey },
    });
    if (head.ok) {
      return {
        sha256,
        path: bunnyPath,
        stored: false,
        uri: `https://${host}/${zone}/${bunnyPath}`,
      };
    }
    const putRes = await fetch(`https://${host}/${zone}/${bunnyPath}`, {
      method: "PUT",
      headers: {
        AccessKey: bunnyKey,
        "Content-Type": contentType || "application/octet-stream",
      },
      body: new Uint8Array(bytes),
    });
    if (!putRes.ok) {
      throw new Error(`bunny_upload_${putRes.status}`);
    }
    return {
      sha256,
      path: bunnyPath,
      stored: true,
      uri: `https://${host}/${zone}/${bunnyPath}`,
    };
  }

  if (!token) {
    return { sha256, path, stored: false };
  }
  const { blobs } = await list({ prefix: path, limit: 1, token });
  if (blobs.some((b) => b.pathname === path)) {
    return { sha256, path, stored: false, uri: blobs[0]?.url };
  }
  const blob = await put(path, bytes, {
    access: "private",
    contentType: contentType || "application/octet-stream",
    token,
    allowOverwrite: false,
  });
  return { sha256, path, stored: true, uri: blob.url };
}
