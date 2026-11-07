/**
 * Vercel Blob helper — store is provisioned for future Problem photos / files.
 * No upload UI in v1.
 */
import { put, list, del } from "@vercel/blob";

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function putPrivateFile(
  pathname: string,
  body: Buffer | Blob | ReadableStream | string,
  contentType?: string,
) {
  if (!blobConfigured()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }
  return put(pathname, body, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType,
  });
}

export { list, del };
