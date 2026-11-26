/**
 * Light ticket intake LLM — Groq free tier first, Bedrock on rate-limit failover.
 * No local GPU. Falls back to naive heuristics without any provider key.
 * ASR/Whisper is separate and Groq-only (no Bedrock drop-in).
 */

import { completeText } from "../ai/textProvider";

export type LightIntakeResult = {
  title: string;
  description: string;
  coachLine: string;
  intake: "named_and_questions" | "advice_ready" | "needs_user_text" | "figuring_out";
  source: "groq" | "bedrock" | "heuristic";
  failover?: boolean;
};

export function heuristicIntake(transcriptOrText: string): LightIntakeResult {
  const text = transcriptOrText.replace(/\s+/g, " ").trim();
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const title = (sentences.slice(0, 2).join(" ") || text).slice(0, 120);
  const description = text.slice(0, 800);
  const enough = text.length >= 40;
  return {
    title: title || "Spoken problem",
    description,
    coachLine: enough ? "Got it — keep talking to refine…" : "Please state your problem.",
    intake: enough ? "named_and_questions" : "needs_user_text",
    source: "heuristic",
  };
}

export async function lightIntakeFromText(transcriptOrText: string): Promise<LightIntakeResult> {
  const hasGroq = Boolean(process.env.GROQ_API_KEY?.trim());
  const hasBedrock = Boolean(
    process.env.AWS_ACCESS_KEY_ID?.trim() && process.env.AWS_SECRET_ACCESS_KEY?.trim(),
  );
  if (!hasGroq && !hasBedrock) return heuristicIntake(transcriptOrText);

  try {
    const completion = await completeText(
      [
        {
          role: "system",
          content:
            "You name MyProblem tickets. Reply JSON only: {\"title\",\"description\",\"coachLine\",\"intake\"} where intake is named_and_questions|advice_ready|needs_user_text|figuring_out.",
        },
        { role: "user", content: transcriptOrText.slice(0, 4000) },
      ],
      { temperature: 0.2, responseJson: true },
    );
    try {
      const parsed = JSON.parse(completion.text || "{}") as LightIntakeResult;
      return {
        title: String(parsed.title || "Spoken problem").slice(0, 120),
        description: String(parsed.description || transcriptOrText).slice(0, 2000),
        coachLine: String(parsed.coachLine || "Figuring out…"),
        intake: parsed.intake || "figuring_out",
        source: completion.provider,
        failover: completion.failover || undefined,
      };
    } catch {
      return heuristicIntake(transcriptOrText);
    }
  } catch {
    return heuristicIntake(transcriptOrText);
  }
}
