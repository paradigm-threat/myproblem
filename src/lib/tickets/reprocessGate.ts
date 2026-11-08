import type { TicketTip } from "./types";

export type ContextDelta = {
  addedNames?: string[];
  addedOcr?: string[];
  titleChanged?: boolean;
  newUserNote?: string;
  descriptionChanged?: boolean;
};

export type ReprocessGateInput = {
  tip: TicketTip;
  target: "asr" | "vision";
  evidenceId?: string;
  requestedBy: "user" | "apk_llm" | "system";
  contextDelta: ContextDelta;
};

export type ReprocessGateResult = {
  reprocess: boolean;
  reason: string;
  hotwords: string[];
  needsReupload: boolean;
};

function latestTranscript(tip: TicketTip): string {
  const txs = tip.evidence.filter((e) => e.kind === "transcript" && e.text);
  if (!txs.length) return "";
  return txs[txs.length - 1].text || "";
}

function deltaTokens(delta: ContextDelta): string[] {
  const out: string[] = [];
  for (const n of delta.addedNames || []) if (n.trim()) out.push(n.trim());
  for (const o of delta.addedOcr || []) if (o.trim()) out.push(o.trim());
  if (delta.newUserNote?.trim()) {
    out.push(
      ...delta.newUserNote
        .split(/\W+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 3),
    );
  }
  return out;
}

/**
 * Allow reprocess only when new context is present and not already reflected
 * in the current transcript / tip text. Prefer skip.
 */
export function evaluateReprocessGate(input: ReprocessGateInput): ReprocessGateResult {
  const { tip, target, contextDelta } = input;
  if (tip.status !== "open") {
    return { reprocess: false, reason: "ticket_closed", hotwords: [], needsReupload: false };
  }

  const tokens = deltaTokens(contextDelta);
  const hasFlag =
    Boolean(contextDelta.titleChanged) ||
    Boolean(contextDelta.descriptionChanged) ||
    tokens.length > 0;

  if (!hasFlag) {
    return {
      reprocess: false,
      reason: "no_new_context",
      hotwords: [],
      needsReupload: false,
    };
  }

  const corpus = [
    latestTranscript(tip),
    tip.fields.title.value,
    tip.fields.description.value,
  ]
    .join("\n")
    .toLowerCase();

  const missing = tokens.filter((t) => !corpus.includes(t.toLowerCase()));
  const structural =
    (contextDelta.titleChanged &&
      !corpus.includes(tip.fields.title.value.toLowerCase().slice(0, 12))) ||
    contextDelta.descriptionChanged;

  if (missing.length === 0 && !structural && !contextDelta.titleChanged) {
    return {
      reprocess: false,
      reason: "context_already_reflected",
      hotwords: [],
      needsReupload: false,
    };
  }

  const hasProcessed =
    target === "asr"
      ? tip.evidence.some((e) => e.kind === "audio" && e.processed)
      : tip.evidence.some((e) => e.kind === "still" && e.processed);

  const cacheLive =
    target === "asr"
      ? tip.evidence.some((e) => e.kind === "audio" && e.uri?.startsWith("cache://"))
      : tip.evidence.some((e) => e.kind === "still" && e.uri?.startsWith("cache://"));

  return {
    reprocess: true,
    reason:
      missing.length > 0
        ? `new_tokens_missing_from_transcript:${missing.slice(0, 5).join(",")}`
        : "structural_context_change",
    hotwords: [...new Set(missing.length ? missing : tokens)].slice(0, 24),
    needsReupload: hasProcessed && !cacheLive,
  };
}
