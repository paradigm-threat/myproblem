#!/usr/bin/env node
/**
 * Seed #mp-general with the lamp-fix demo arc:
 *   1) human asks + photo
 *   2) peer tip within minutes (2 sentences, same advice as SI)
 *   3) SI batch deep dive (full text in room; IRC teaser ≤400 via host)
 *
 * Usage:
 *   node scripts/seed-mp-general.mjs
 *   CHAT_API_BASE=https://api.clevertree.chat node scripts/seed-mp-general.mjs
 *   SEED_RESET=1 …  # archive+clear mp-general irc log on host first (manual SSH) then seed
 *
 * Posts via Intake /api/chat (action=submit). No tip UUIDs minted.
 */
import { randomUUID } from "node:crypto";

const BASE = (
  process.env.CHAT_API_BASE ||
  process.env.NEXT_PUBLIC_CHAT_API_BASE ||
  "https://api.clevertree.chat"
).replace(/\/$/, "");

const TOPIC = "mp-general";
const SUBMIT_TIMEOUT_MS = Number(process.env.SEED_SUBMIT_TIMEOUT_MS || 90_000);
const RETRIES = Number(process.env.SEED_RETRIES || 3);
const GAP_MS = Number(process.env.SEED_GAP_MS || 2500);

const DEMO_IMAGE =
  process.env.SEED_DEMO_IMAGE_URL ||
  "https://myproblem.app/chat-room/demo/outdoor-lantern.jpg";

const SI_BATCH = `SI batch: outdoor coach lantern — replace the bulb

Safety: Turn the light off at the wall switch (and the breaker if unsure). Let the bulb cool. Use a stable ladder; work dry.

Open the fixture: This brick-mounted coach lantern usually opens via the top finial (unscrew and lift the peaked roof) or a hinged/clipped glass panel with small latches. Support the glass; don’t force brittle panes. Note how pieces come apart for reassembly.

Replace the bulb: Unscrew the old bulb counterclockwise (glove/cloth for grip). Check the socket for corrosion; clean gently with a cotton swab + white vinegar or contact cleaner, then dry. Screw in a new outdoor/damp-rated LED (match base — often E26 — and brightness in lumens). Snug, not overtight.

Finish: Wipe haze inside the glass, reseat any gasket/seal, restore power, and test.

Tips: Stuck/broken base → power off, pliers or a bulb remover. No socket (integrated LED) → fixture may need replacing. Closer photos of the top/sides/fasteners help pin the exact latch.`;

const POSTS = [
  {
    name: "morgan",
    body: `How can I replace the lamp, light bulb? [[mp:media kind=image url=${DEMO_IMAGE} channel=#mp-general]]`,
  },
  {
    name: "devon",
    body: "Kill power at the switch, then open that coach lantern from the top finial or a side glass latch and swap in an outdoor-rated LED. Don’t overtighten the bulb and wipe the glass while it’s open.",
  },
  {
    name: "clevertree-si",
    body: SI_BATCH,
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
    `timeout=${SUBMIT_TIMEOUT_MS}ms retries=${RETRIES} gap=${GAP_MS}ms image=${DEMO_IMAGE}`,
  );
  if (process.env.SEED_RESET === "1") {
    console.log(
      "SEED_RESET=1: clear pub1 irc-logs/mp-general (current.jsonl + segs) before this seed, then re-run.",
    );
  }

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
