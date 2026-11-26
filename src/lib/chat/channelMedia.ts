/**
 * Public-room media captions for IRC / Clevertree.
 * Batch SI (not the live post path) may mint tips when traffic needs tracking.
 * ASR / VL pick up URLs via IRC log drain + these markers — never mint a tip here.
 */

export type ChannelMediaKind = "audio" | "video" | "file";

export type ChannelMediaItem = {
  kind: ChannelMediaKind;
  url: string;
  channel: string;
  raw: string;
  source: "marker" | "url";
};

const MARKER_RE = /\[\[mp:media\s+([^\]]+)\]\]/gi;
const ATTR_RE = /(\w+)=([^\s\]]+)/g;
const URL_RE = /https?:\/\/[^\s<>"']+/gi;
const BUNNY_HINT = /b-cdn\.net|bunnycdn|chat-public\//i;
const AUDIO_EXT = [".wav", ".mp3", ".m4a", ".ogg", ".opus", ".flac", ".aac"];
const VIDEO_EXT = [".mp4", ".mov", ".mkv", ".webm"];

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

function guessKind(url: string, explicit = ""): ChannelMediaKind {
  const kind = explicit.trim().toLowerCase();
  if (kind === "audio" || kind === "video" || kind === "file") return kind;
  const path = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  })();
  for (const ext of AUDIO_EXT) {
    if (path.endsWith(ext)) return "audio";
  }
  // Speak notes are webm; video markers set kind=video explicitly.
  if (path.endsWith(".webm")) return "audio";
  for (const ext of VIDEO_EXT) {
    if (path.endsWith(ext)) return "video";
  }
  return "file";
}

function parseAttrs(blob: string): Record<string, string> {
  const out: Record<string, string> = {};
  ATTR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR_RE.exec(blob))) {
    out[m[1].toLowerCase()] = m[2].trim();
  }
  return out;
}

/** Parse `[[mp:media …]]` markers (deduped by url). */
export function parseChannelMediaMarkers(body: string): ChannelMediaItem[] {
  const text = body || "";
  const out: ChannelMediaItem[] = [];
  const seen = new Set<string>();
  MARKER_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MARKER_RE.exec(text))) {
    const attrs = parseAttrs(match[1] || "");
    const url = (attrs.url || "").trim().replace(/[.,);]+$/, "");
    if (!url.startsWith("http") || seen.has(url)) continue;
    seen.add(url);
    out.push({
      kind: guessKind(url, attrs.kind || ""),
      url,
      channel: (attrs.channel || "").trim(),
      raw: match[0],
      source: "marker",
    });
  }
  return out;
}

/** Detect Bunny / public media URLs already in channel text (composer paste). */
export function extractMediaUrls(body: string): string[] {
  const urls = body.match(URL_RE) || [];
  return [...new Set(urls.map((u) => u.replace(/[.,);]+$/, "")))].filter((u) =>
    BUNNY_HINT.test(u),
  );
}

/** Markers first; then bare Bunny chat-public URLs not already covered. */
export function extractChannelMedia(body: string): ChannelMediaItem[] {
  const items = parseChannelMediaMarkers(body);
  const seen = new Set(items.map((i) => i.url));
  for (const url of extractMediaUrls(body)) {
    if (seen.has(url)) continue;
    seen.add(url);
    items.push({
      kind: guessKind(url),
      url,
      channel: "",
      raw: url,
      source: "url",
    });
  }
  return items;
}

/** Audio + video notes are ASR candidates; plain files are not. */
export function asrEligible(item: ChannelMediaItem): boolean {
  return item.kind === "audio" || item.kind === "video";
}
