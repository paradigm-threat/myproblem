/**
 * Keyword goldens for intake fixtures until an LLM judge / Whisper CI exists.
 * See docs/intake-fixtures.md and fixtures/intakes/catalog.json.
 */

export type IntakeFixtureExpect = {
  title_must_include: string[];
  description_must_include_any: string[];
  intake_targets: string[];
  eval_surface: "apk_or_server" | "server_only";
};

export type KeywordScore = {
  titleHits: string[];
  titleMisses: string[];
  descriptionHit: string | null;
  descriptionMisses: string[];
  titleOk: boolean;
  descriptionOk: boolean;
  ok: boolean;
};

function norm(s: string): string {
  return s.toLowerCase();
}

/** Case-insensitive substring match for each required title token. */
export function scoreTitle(title: string, mustInclude: string[]): { hits: string[]; misses: string[] } {
  const t = norm(title);
  const hits: string[] = [];
  const misses: string[] = [];
  for (const token of mustInclude) {
    if (t.includes(norm(token))) hits.push(token);
    else misses.push(token);
  }
  return { hits, misses };
}

/** At least one description token must appear. */
export function scoreDescription(
  description: string,
  mustIncludeAny: string[],
): { hit: string | null; misses: string[] } {
  const d = norm(description);
  for (const token of mustIncludeAny) {
    if (d.includes(norm(token))) return { hit: token, misses: [] };
  }
  return { hit: null, misses: [...mustIncludeAny] };
}

export function scoreIntakeKeywords(
  title: string,
  description: string,
  expect: IntakeFixtureExpect,
): KeywordScore {
  const titleScore = scoreTitle(title, expect.title_must_include);
  const descScore = scoreDescription(description, expect.description_must_include_any);
  const titleOk = titleScore.misses.length === 0;
  const descriptionOk = descScore.hit != null;
  return {
    titleHits: titleScore.hits,
    titleMisses: titleScore.misses,
    descriptionHit: descScore.hit,
    descriptionMisses: descScore.misses,
    titleOk,
    descriptionOk,
    ok: titleOk && descriptionOk,
  };
}

/**
 * Naive stand-in for "perfect ASR + light intake": early sentences → title,
 * full script → description. Proves catalog goldens are reachable without Whisper.
 */
export function naiveTitleFromScript(script: string): string {
  let cleaned = script.replace(/\s+/g, " ").trim();
  cleaned = cleaned
    .replace(/^(hi\.?\s*|okay\.?\s*|ok\.?\s*|um\.?\s*|eh\s+)/i, "")
    .replace(/^(so um[,.]?\s+|so\s+)/i, "")
    .trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  // First two sentences capture "How do I fix X? Detail…" style openings.
  const pick = sentences.slice(0, 2).join(" ") || cleaned;
  return pick.slice(0, 140);
}

/** Scripts should contain the golden tokens (otherwise the expect block is broken). */
export function scriptContainsGoldens(script: string, expect: IntakeFixtureExpect): KeywordScore {
  return scoreIntakeKeywords(script, script, expect);
}
