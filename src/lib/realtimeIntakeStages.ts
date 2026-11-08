/**
 * Mirrors apps/android-testmode RealtimeIntakeStages — coach + chip lockstep
 * for live audio intake. Keep in sync with Kotlin.
 */

export type RealtimeStage =
  | "LISTENING_PROMPT"
  | "LISTENING_PARTIAL"
  | "LISTENING_REFINE"
  | "QUEUED"
  | "TRANSCRIBING"
  | "FIGURING_OUT"
  | "CLARIFY"
  | "NAMED_AND_QUESTIONS"
  | "ADVICE_READY"
  | "QUEUE_PROJECT"
  | "INVESTIGATING";

export const CoachLines = {
  STATE_PROBLEM: "Please state your problem.",
  REFINE: "Got it — keep talking to refine…",
  CLARIFY: "Please clarify in more detail, or wait for server analysis.",
  STOP_HINT: "Say “stop recording” when you’re done.",
  QUEUED: "Queued for transcription — waiting for Batch…",
  TRANSCRIBING: "Transcribing…",
  FIGURING: "Figuring out…",
  TIMEOUT: "Timed out waiting for Batch — sync or re-upload.",
} as const;

export function coachLine(stage: RealtimeStage): string {
  switch (stage) {
    case "LISTENING_PROMPT":
      return CoachLines.STATE_PROBLEM;
    case "LISTENING_PARTIAL":
      return CoachLines.REFINE;
    case "LISTENING_REFINE":
      return `${CoachLines.REFINE} ${CoachLines.STOP_HINT}`;
    case "QUEUED":
      return CoachLines.QUEUED;
    case "TRANSCRIBING":
      return CoachLines.TRANSCRIBING;
    case "FIGURING_OUT":
    case "NAMED_AND_QUESTIONS":
      return CoachLines.FIGURING;
    case "CLARIFY":
      return CoachLines.CLARIFY;
    case "ADVICE_READY":
      return "Advice ready.";
    case "QUEUE_PROJECT":
    case "INVESTIGATING":
      return "Queued for a deeper look when capacity frees.";
  }
}

export function intakeChip(stage: RealtimeStage): string {
  switch (stage) {
    case "LISTENING_PROMPT":
    case "LISTENING_PARTIAL":
    case "LISTENING_REFINE":
      return "Listening";
    case "QUEUED":
      return "Queued";
    case "TRANSCRIBING":
      return "Transcribing";
    case "FIGURING_OUT":
      return "Figuring out…";
    case "CLARIFY":
      return "Needs details";
    case "NAMED_AND_QUESTIONS":
      return "Questions";
    case "ADVICE_READY":
      return "Advice ready";
    case "QUEUE_PROJECT":
      return "Queued";
    case "INVESTIGATING":
      return "Investigating";
  }
}

export function whileRecording(chunkIndex: number): RealtimeStage {
  if (chunkIndex <= 0) return "LISTENING_PROMPT";
  if (chunkIndex <= 2) return "LISTENING_PARTIAL";
  return "LISTENING_REFINE";
}

/** Honest post-stop default: waiting for Batch (not yet ASR). */
export function immediatelyAfterStop(chunkCount: number, hasUsableTitle: boolean): RealtimeStage {
  if (chunkCount < 2 && !hasUsableTitle) return "CLARIFY";
  return "QUEUED";
}

export function validateTimely(history: RealtimeStage[]): string[] {
  if (history.length === 0) return ["empty history"];
  const issues: string[] = [];
  if (history[0] !== "LISTENING_PROMPT") {
    issues.push(`must start with LISTENING_PROMPT, got ${history[0]}`);
  }
  const firstQueued = history.indexOf("QUEUED");
  const firstTranscribe = history.indexOf("TRANSCRIBING");
  const firstFiguring = history.indexOf("FIGURING_OUT");
  const firstWait = [firstQueued, firstTranscribe].filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? -1;
  if (firstFiguring >= 0 && (firstWait < 0 || firstWait > firstFiguring)) {
    issues.push("FIGURING_OUT must follow QUEUED or TRANSCRIBING");
  }
  const stopIdx = history.findIndex(
    (s) => s === "QUEUED" || s === "TRANSCRIBING" || s === "CLARIFY",
  );
  if (stopIdx >= 0) {
    const after = history.slice(stopIdx + 1);
    if (after.some((s) => s.startsWith("LISTENING_"))) {
      issues.push("must not return to listening after stop");
    }
  }
  return issues;
}

export function simulateStageHistory(chunks: number): RealtimeStage[] {
  const hist: RealtimeStage[] = ["LISTENING_PROMPT"];
  for (let i = 1; i <= chunks; i++) hist.push(whileRecording(i));
  const after = immediatelyAfterStop(chunks, chunks >= 1);
  hist.push(after);
  if (after === "QUEUED" || after === "TRANSCRIBING") {
    if (after === "QUEUED") hist.push("TRANSCRIBING");
    hist.push("FIGURING_OUT");
    hist.push("ADVICE_READY");
  }
  return hist;
}

/** Timeline kinds that belong in the ticket log (major mutations only). */
export const MAJOR_TIMELINE_KINDS = new Set([
  "SYSTEM",
  "USER_TEXT",
  "USER_AUDIO",
  "USER_STILL",
  "SERVER_TITLE",
  "SERVER_QUESTION",
  "SERVER_ADVICE",
]);
