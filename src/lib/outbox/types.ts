export type OutboxStatus = "queued" | "syncing" | "synced" | "failed";

export type OutboxMediaKind = "audio" | "video" | "still";

export type OutboxMedia = {
  localId: string;
  kind: OutboxMediaKind;
  filename: string;
  mime: string;
  blob: Blob;
  uploaded: boolean;
};

export type OutboxSubmission = {
  clientSubmissionId: string;
  createdAt: number;
  status: OutboxStatus;
  lastError?: string;
  visitorId: string;
  region: "georgia" | "israel";
  title: string;
  description: string;
  wantPublic: boolean;
  publicSlug: string;
  serverTicketUuid?: string;
  claim?: string;
  slug?: string | null;
  media: OutboxMedia[];
};

export type OutboxSummary = {
  clientSubmissionId: string;
  createdAt: number;
  status: OutboxStatus;
  lastError?: string;
  title: string;
  mediaCount: number;
  uploadedCount: number;
  mediaBytes: number;
  mediaKinds: string[];
  serverTicketUuid?: string;
  slug?: string | null;
};

export function toSummary(s: OutboxSubmission): OutboxSummary {
  return {
    clientSubmissionId: s.clientSubmissionId,
    createdAt: s.createdAt,
    status: s.status,
    lastError: s.lastError,
    title: s.title,
    mediaCount: s.media.length,
    uploadedCount: s.media.filter((m) => m.uploaded).length,
    mediaBytes: s.media.reduce((n, m) => n + (m.blob?.size || 0), 0),
    mediaKinds: [...new Set(s.media.map((m) => m.kind))],
    serverTicketUuid: s.serverTicketUuid,
    slug: s.slug,
  };
}

export function mediaKindForFile(file: { type: string }): OutboxMediaKind {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "still";
}
