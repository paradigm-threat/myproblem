"use client";

import { useCallback, useEffect, useState } from "react";
import {
  armOutboxWake,
  discardOutboxSubmission,
  flushOutbox,
  listOutboxSummaries,
  retryOutboxSubmission,
  subscribeOutbox,
  type OutboxSummary,
} from "@/lib/outbox";

function formatBytes(n: number): string {
  if (n <= 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function statusLabel(item: OutboxSummary): string {
  if (item.status === "syncing") return "Uploading…";
  if (item.status === "failed") {
    return `Needs attention · ${item.lastError || "Upload rejected"}`;
  }
  if (item.status === "queued") {
    if (item.serverTicketUuid) {
      return `Saved on this device · ${item.uploadedCount}/${item.mediaCount} media sent`;
    }
    return "Saved on this device";
  }
  return item.status;
}

export function OutboxQueue() {
  const [items, setItems] = useState<OutboxSummary[]>([]);
  const [flushing, setFlushing] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setItems(await listOutboxSummaries());
    } catch {
      /* IDB unavailable */
    }
  }, []);

  useEffect(() => {
    armOutboxWake();
    void refresh();
    return subscribeOutbox(() => {
      void refresh();
    });
  }, [refresh]);

  if (items.length === 0 && !lastSubmitted) return null;

  const waiting = items.filter(
    (i) => i.status === "queued" || i.status === "syncing",
  );
  const failed = items.filter((i) => i.status === "failed");

  return (
    <div className="outbox-queue" role="status" aria-live="polite">
      <div className="outbox-queue-head">
        <strong>
          {waiting.length > 0
            ? `${waiting.length} batch${waiting.length === 1 ? "" : "es"} saved on this device`
            : failed.length > 0
              ? "Sync queue · needs attention"
              : "Sync queue"}
        </strong>
        <button
          type="button"
          className="btn-secondary"
          disabled={flushing || items.length === 0}
          onClick={async () => {
            setFlushing(true);
            try {
              const before = items.length;
              const result = await flushOutbox();
              await refresh();
              if (result.synced > 0) {
                setLastSubmitted(
                  result.synced === 1
                    ? "Submitted · 1 batch reached the server"
                    : `Submitted · ${result.synced} batches reached the server`,
                );
                window.setTimeout(() => setLastSubmitted(null), 6000);
              } else if (before > 0 && result.deferred) {
                setLastSubmitted(null);
              }
            } finally {
              setFlushing(false);
            }
          }}
        >
          {flushing ? "Uploading…" : "Sync now"}
        </button>
      </div>
      <p className="muted outbox-queue-note">
        Media stays on this device until upload succeeds. Clearing site data
        drops the queue. Server size limits apply only when syncing.
      </p>
      {lastSubmitted ? (
        <p className="outbox-queue-submitted">{lastSubmitted}</p>
      ) : null}
      <ul className="outbox-queue-list">
        {items.map((item) => (
          <li key={item.clientSubmissionId}>
            <div className="outbox-queue-item-main">
              <span className="outbox-queue-title">{item.title}</span>
              <span
                className={`outbox-queue-status outbox-queue-status--${item.status}`}
              >
                {statusLabel(item)}
              </span>
              {item.mediaCount > 0 ? (
                <span className="muted outbox-queue-meta">
                  {item.mediaKinds.join(", ")}
                  {item.mediaBytes > 0 ? ` · ${formatBytes(item.mediaBytes)}` : ""}
                </span>
              ) : null}
            </div>
            <div className="outbox-queue-actions">
              {item.status === "failed" ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    void retryOutboxSubmission(item.clientSubmissionId)
                  }
                >
                  Retry
                </button>
              ) : null}
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  void discardOutboxSubmission(item.clientSubmissionId)
                }
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      {failed.length > 0 ? (
        <p className="muted">
          Needs attention stays until you retry or remove — other batches keep
          syncing.
        </p>
      ) : null}
    </div>
  );
}
