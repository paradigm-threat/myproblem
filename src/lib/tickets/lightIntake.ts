/**
 * Light ticket intake LLM (Groq) — runs on Intake host / edge until proxied.
 * No local GPU. Falls back to naive heuristics without GROQ_API_KEY.
 */

export type LightIntakeResult = {
  title: string;
  description: string;
  coachLine: string;
  intake: "named_and_questions" | "advice_ready" | "needs_user_text" | "figuring_out";
  source: "groq" | "heuristic";
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
  const key = process.env.GROQ_API_KEY;
  if (!key) return heuristicIntake(transcriptOrText);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_INTAKE_MODEL || "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You name MyProblem tickets. Reply JSON only: {\"title\",\"description\",\"coachLine\",\"intake\"} where intake is named_and_questions|advice_ready|needs_user_text|figuring_out.",
        },
        { role: "user", content: transcriptOrText.slice(0, 4000) },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) return heuristicIntake(transcriptOrText);
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  try {
    const parsed = JSON.parse(json.choices?.[0]?.message?.content || "{}") as LightIntakeResult;
    return {
      title: String(parsed.title || "Spoken problem").slice(0, 120),
      description: String(parsed.description || transcriptOrText).slice(0, 2000),
      coachLine: String(parsed.coachLine || "Figuring out…"),
      intake: parsed.intake || "figuring_out",
      source: "groq",
    };
  } catch {
    return heuristicIntake(transcriptOrText);
  }
}
