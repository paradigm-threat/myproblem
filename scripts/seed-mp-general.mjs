#!/usr/bin/env node
/**
 * Seed #mp-general with a few human-sounding public asks + one media-style post.
 *
 * Usage:
 *   node scripts/seed-mp-general.mjs
 *   CHAT_API_BASE=https://intake.myproblem.app node scripts/seed-mp-general.mjs
 *
 * Posts via Intake /api/chat (action=submit). No tip UUIDs minted.
 * Skips bodies already present in chat_history (safe re-run). Continues after
 * individual submit failures so the rest of the seed can still land.
 */
import { randomUUID } from "node:crypto";

const BASE = (
  process.env.CHAT_API_BASE ||
  process.env.NEXT_PUBLIC_CHAT_API_BASE ||
  "https://intake.myproblem.app"
).replace(/\/$/, "");

const TOPIC = "mp-general";
const SUBMIT_TIMEOUT_MS = Number(process.env.SEED_SUBMIT_TIMEOUT_MS || 90_000);
const RETRIES = Number(process.env.SEED_RETRIES || 3);
const GAP_MS = Number(process.env.SEED_GAP_MS || 2500);

/** Public sample audio (MDN) — CDN-stable for media marker demos. */
const SAMPLE_AUDIO =
  process.env.SEED_MEDIA_URL ||
  "https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3";

const POSTS = [
  {
    name: "jordan",
    body: "Anyone else dealing with a landlord who won't fix a leaking ceiling in Midtown? Looking for who to call before it gets worse.",
  },
  {
    name: "sam",
    body: "Garage door opener clicks but won't lift — battery and sensors seem fine. Has the room seen this brand of glitch before?",
  },
  {
    name: "riley",
    body: "Need a plain-English path for a neighbor's outdoor cat that looks injured (not aggressive). Savannah Cat Rescue channel exists; is #mp-general the right place to start?",
  },
  {
    name: "alex",
    body: "Ring cam lost power overnight again. Is this usually the transformer, wiring, or just a bad unit?",
  },
  {
    name: "casey",
    body: `Public voice note: ${SAMPLE_AUDIO} [[mp:media kind=audio url=${SAMPLE_AUDIO} channel=#mp-general]]`,
  },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeBody(body) {
  return String(body || "")
    .trim()
    .replace(/\s+/g, " ");
}

async function history() {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "chat_history",
      topic: TOPIC,
      limit: 80,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`chat_history ${res.status}`);
  }
  return res.json();
}

async function submitOnce(post) {
  const visitor = randomUUID();
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "submit",
      topic: TOPIC,
      visitor,
      name: post.name,
      body: post.body,
    }),
    signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `submit ${res.status}: ${typeof data === "object" ? JSON.stringify(data) : data}`,
    );
  }
  return { visitor, data };
}

async function submitWithRetry(post) {
  let lastErr;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      return await submitOnce(post);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`  retry ${attempt}/${RETRIES} for ${post.name}: ${msg}`);
      if (attempt < RETRIES) {
        await sleep(GAP_MS * attempt);
      }
    }
  }
  throw lastErr;
}

async function main() {
  console.log(`Seeding #${TOPIC} via ${BASE}`);
  console.log(
    `timeout=${SUBMIT_TIMEOUT_MS}ms retries=${RETRIES} gap=${GAP_MS}ms`,
  );

  let existing = new Set();
  try {
    const hist = await history();
    for (const row of hist.chat_history || []) {
      existing.add(normalizeBody(row.body));
    }
    console.log(`Existing history: ${(hist.chat_history || []).length} line(s)`);
  } catch (e) {
    console.warn(
      `Could not load history (continuing): ${e instanceof Error ? e.message : e}`,
    );
  }

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const post of POSTS) {
    const key = normalizeBody(post.body);
    if (existing.has(key)) {
      console.log(`  skip ${post.name} (already in history)`);
      skipped++;
      continue;
    }
    try {
      const { visitor } = await submitWithRetry(post);
      existing.add(key);
      ok++;
      console.log(`  ok  ${post.name}  visitor=${visitor.slice(0, 8)}…`);
    } catch (err) {
      failed++;
      console.error(
        `  FAIL ${post.name}: ${err instanceof Error ? err.message : err}`,
      );
    }
    await sleep(GAP_MS);
  }

  // Nudge ASR drain if host supports it (no-op / pending without GROQ key).
  try {
    const drain = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "drain_channel_asr", limit: 5 }),
      signal: AbortSignal.timeout(90_000),
    });
    const drainBody = await drain.json().catch(() => ({}));
    console.log(
      `ASR drain: ${drain.status}`,
      JSON.stringify(drainBody).slice(0, 240),
    );
  } catch (e) {
    console.log(`ASR drain skipped: ${e instanceof Error ? e.message : e}`);
  }

  const hist = await history().catch(() => ({ chat_history: [] }));
  const lines = hist.chat_history || [];
  console.log(
    `Done: ok=${ok} skipped=${skipped} failed=${failed}; history=${lines.length}`,
  );
  console.log("Latest:");
  for (const row of lines.slice(-8)) {
    console.log(`  [${row.nick || "?"}] ${(row.body || "").slice(0, 110)}`);
  }

  if (failed > 0 && ok === 0 && skipped < POSTS.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
