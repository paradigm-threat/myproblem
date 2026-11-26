/**
 * Public-room media captions for IRC / Clevertree.
 * Batch SI (not the live post path) may mint tips when traffic needs tracking.
 * ASR / VL pick up URLs via IRC log drain + these markers — never mint a tip here.
 */

export type ChannelMediaKind = "audio" | "video" | "file";

export function formatChannelMediaPost(opts: {
  kind: ChannelMediaKind | string;
  url: string;
  channelIrc: string;
}): string {
  const kind =
    opts.kind === "video" || opts.kind === "audio" || opts.kind === "file"
      ? opts.kind
      : "file";
  const label =
    kind === "video"
      ? "Public video note"
      : kind === "audio"
        ? "Public voice note"
        : "Public file note";
  const channel = opts.channelIrc.startsWith("#")
    ? opts.channelIrc
    : `#${opts.channelIrc}`;
  // One physical line for IRC; batch scrapes url= / [[mp:media …]] for ASR/VL.
  return `${label}: ${opts.url} [[mp:media kind=${kind} url=${opts.url} channel=${channel}]]`;
}

/** Detect Bunny / public media URLs already in channel text (composer paste). */
export function extractMediaUrls(body: string): string[] {
  const re = /https?:\/\/[^\s<>"']+/gi;
  const urls = body.match(re) || [];
  return [...new Set(urls)].filter((u) =>
    /b-cdn\.net|bunnycdn|chat-public\//i.test(u),
  );
}
