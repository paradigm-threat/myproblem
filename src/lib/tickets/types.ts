export type FieldSource = "intake" | "user";

export type TicketField = {
  value: string;
  source: FieldSource;
  locked: boolean;
};

export type IntakeState =
  | "draft"
  | "listening"
  /** Audio/still accepted; waiting for Batch (honest default — not “transcribing”). */
  | "queued"
  /** Batch is actively running ASR on this ticket (short-lived). */
  | "transcribing"
  | "figuring_out"
  | "named_and_questions"
  | "advice_ready"
  | "queue_project"
  | "needs_user_text"
  | "investigating"
  /** Queued/processing too long without a result. */
  | "timeout";

export type JobBin = "asr" | "vision" | "intake" | "project";

export type EvidenceKind = "audio" | "still" | "transcript" | "text";

export type TicketEvidence = {
  id: string;
  kind: EvidenceKind;
  /** Temp cache URI while queued; cleared after Batch purge. */
  uri: string;
  sha256?: string;
  chunkIndex?: number | null;
  isFinal?: boolean | null;
  atMs: number;
  /** True after Batch wrote transcript/OCR and deleted bytes. */
  processed?: boolean;
  purgedAtMs?: number | null;
  /** Transcript / OCR text (kind transcript|text). */
  text?: string;
  version?: number;
  audioEvidenceId?: string;
  model?: string;
};

export type TimelineEntry = {
  id: string;
  kind:
    | "system"
    | "user_text"
    | "user_audio"
    | "user_still"
    | "server_title"
    | "server_question"
    | "server_advice";
  body: string;
  atMs: number;
};

export type TicketRegion = "georgia" | "israel";

export type TicketTip = {
  schema: "myproblem.ticket.tip.v1";
  ticket_uuid: string;
  /** Regional Relay git repo — georgia | israel */
  region?: TicketRegion;
  claim: string | null;
  /** Close keeps tip only when true (creator-authorized). */
  preserve?: boolean;
  createdAtMs: number;
  updatedAtMs: number;
  status: "open" | "closed";
  fields: {
    title: TicketField;
    description: TicketField;
  };
  coachLine: string;
  intake: IntakeState;
  questions: string[];
  evidence: TicketEvidence[];
  jobs: { id: string; bin: JobBin; state: string; payload?: Record<string, unknown> }[];
  timeline: TimelineEntry[];
};
