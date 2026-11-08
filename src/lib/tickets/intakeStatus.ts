import type { IntakeState, TicketTip } from "./types";

/** How long a ticket may sit queued before we surface timeout on the tip. */
export const QUEUED_TIMEOUT_MS = 30 * 60 * 1000;
/** How long “transcribing” may last without a transcript. */
export const TRANSCRIBING_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Derive an honest intake chip from tip evidence + jobs.
 * Prefer server tip.intake when already terminal; never leave “transcribing”
 * when work is only queued or already finished.
 */
export function deriveHonestIntake(tip: TicketTip, nowMs = Date.now()): IntakeState {
  const hasTranscript = tip.evidence.some((e) => e.kind === "transcript" && e.text);
  const asrJobs = tip.jobs.filter((j) => j.bin === "asr");
  const asrQueued = asrJobs.some((j) => j.state === "queued");
  const asrLeased = asrJobs.some((j) => j.state === "leased");
  const asrError = asrJobs.some((j) => j.state === "error");
  const audioPending = tip.evidence.some(
    (e) => e.kind === "audio" && !e.processed && Boolean(e.uri),
  );

  const terminal: IntakeState[] = [
    "named_and_questions",
    "advice_ready",
    "queue_project",
    "needs_user_text",
    "investigating",
  ];
  if (hasTranscript && terminal.includes(tip.intake)) return tip.intake;
  if (hasTranscript) return tip.intake === "figuring_out" ? tip.intake : "named_and_questions";

  if (asrError && !hasTranscript) return "timeout";
  // Transcribing only while Batch has leased the ASR job — never while merely queued.
  if (asrLeased) {
    const started = tip.updatedAtMs || tip.createdAtMs;
    if (nowMs - started > TRANSCRIBING_TIMEOUT_MS) return "timeout";
    return "transcribing";
  }
  if (asrQueued || audioPending || tip.intake === "queued" || tip.intake === "transcribing") {
    // Legacy tips stuck on “transcribing” with only queued jobs → show queued.
    const started = tip.updatedAtMs || tip.createdAtMs;
    if (nowMs - started > QUEUED_TIMEOUT_MS) return "timeout";
    return "queued";
  }
  return tip.intake;
}
