/**
 * Process queued asr/vision jobs from tip.jobs (local/dev).
 * Production drain runs on Intake against regional git job files.
 */
import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolveCacheUri, purgeEvidenceFile } from "./mediaCache";
import { loadTipAsync, saveTipAsync, appendTimeline, setIntake, listTipIds } from "./store";
import { convertPii } from "./piiConvert";
import type { TicketTip } from "./types";

async function transcribeLocalOrGroq(path: string): Promise<{ text: string; model: string }> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return {
      text: `[dry-run] processed ${path.split("/").pop()}`,
      model: "dry-run",
    };
  }
  const buf = readFileSync(path);
  const form = new FormData();
  form.append("file", new Blob([buf]), "audio.wav");
  form.append("model", process.env.GROQ_WHISPER_MODEL || "whisper-large-v3");
  form.append("language", "en");
  form.append("response_format", "json");
  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Groq ASR ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { text?: string };
  return { text: convertPii(json.text || "").text, model: "whisper-large-v3" };
}

function assessStillStub(path: string): { text: string; model: string } {
  return {
    text: convertPii(
      `[vision-stub] still at ${path.split("/").pop()} — Batch VL not wired; labels TBD`,
    ).text,
    model: "vision-stub",
  };
}

export async function processQueuedJobs(limit = 10): Promise<{
  processed: number;
  results: unknown[];
}> {
  const results: unknown[] = [];
  let n = 0;
  for (const id of listTipIds()) {
    if (n >= limit) break;
    const tip = await loadTipAsync(id);
    if (!tip) continue;
    const queued = tip.jobs.filter(
      (j) => j.state === "queued" && (j.bin === "asr" || j.bin === "vision"),
    );
    for (const job of queued) {
      if (n >= limit) break;
      const ev =
        tip.evidence.find((e) => e.id === (job as { payload?: { evidenceId?: string } }).payload?.evidenceId) ||
        tip.evidence.filter((e) => e.kind === (job.bin === "asr" ? "audio" : "still")).at(-1);
      if (!ev?.uri) {
        job.state = "error";
        results.push({ id: job.id, error: "no_cache_uri" });
        continue;
      }
      const path = resolveCacheUri(ev.uri);
      if (!path || !existsSync(path)) {
        job.state = "error";
        results.push({ id: job.id, error: "cache_missing" });
        continue;
      }
      try {
        setIntake(tip, job.bin === "asr" ? "transcribing" : "investigating", job.bin === "asr" ? "Transcribing…" : "Processing still…");
        job.state = "leased";
        await saveTipAsync(tip);

        let text: string;
        let model: string;
        if (job.bin === "asr") {
          const r = await transcribeLocalOrGroq(path);
          text = r.text;
          model = r.model;
          tip.evidence.push({
            id: randomUUID(),
            kind: "transcript",
            uri: "",
            text,
            version: tip.evidence.filter((e) => e.kind === "transcript").length + 1,
            audioEvidenceId: ev.id,
            model,
            atMs: Date.now(),
          });
          if (!tip.fields.title.locked && text.length > 8) {
            tip.fields.title = {
              value: convertPii(
                text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ").slice(0, 120),
              ).text,
              source: "intake",
              locked: false,
            };
          }
          if (!tip.fields.description.locked) {
            tip.fields.description = {
              value: convertPii(text.slice(0, 800)).text,
              source: "intake",
              locked: false,
            };
          }
          setIntake(tip, "named_and_questions", "Got a transcript — review or add a still.");
          appendTimeline(tip, "server_title", `ASR (${model})`);
        } else {
          const r = assessStillStub(path);
          text = r.text;
          model = r.model;
          tip.evidence.push({
            id: randomUUID(),
            kind: "text",
            uri: "",
            text,
            model,
            atMs: Date.now(),
          });
          appendTimeline(tip, "server_advice", `Vision stub (${model})`);
        }
        purgeEvidenceFile(ev.uri);
        ev.uri = "";
        ev.processed = true;
        ev.purgedAtMs = Date.now();
        job.state = "done";
        await saveTipAsync(tip);
        results.push({ id: job.id, bin: job.bin, ok: true, model, textPreview: text.slice(0, 120) });
        n++;
      } catch (e) {
        const msg = String((e as Error)?.message || e);
        job.state = "error";
        setIntake(tip, "timeout", "Processing failed — tap retry or re-upload from the phone.");
        appendTimeline(tip, "system", `Batch error: ${msg.slice(0, 160)}`);
        await saveTipAsync(tip);
        results.push({ id: job.id, error: msg });
      }
    }
  }
  return { processed: results.filter((r) => (r as { ok?: boolean }).ok).length, results };
}

export async function processTipJobsOffline(tip: TicketTip): Promise<TicketTip> {
  for (const ev of tip.evidence) {
    if (ev.processed || !ev.uri?.startsWith("cache://")) continue;
    const path = resolveCacheUri(ev.uri);
    if (!path) continue;
    if (ev.kind === "audio") {
      const r = await transcribeLocalOrGroq(path);
      tip.evidence.push({
        id: randomUUID(),
        kind: "transcript",
        uri: "",
        text: r.text,
        version: tip.evidence.filter((e) => e.kind === "transcript").length + 1,
        audioEvidenceId: ev.id,
        model: r.model,
        atMs: Date.now(),
      });
    } else if (ev.kind === "still") {
      const r = assessStillStub(path);
      tip.evidence.push({
        id: randomUUID(),
        kind: "text",
        uri: "",
        text: r.text,
        model: r.model,
        atMs: Date.now(),
      });
    }
    purgeEvidenceFile(ev.uri);
    ev.uri = "";
    ev.processed = true;
    ev.purgedAtMs = Date.now();
  }
  return tip;
}
