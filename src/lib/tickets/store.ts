import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { writeEvidenceCache } from "./mediaCache";
import { convertPii } from "./piiConvert";
import type { IntakeState, JobBin, TicketTip } from "./types";

export type TicketRegion = "georgia" | "israel";

const DATA_ROOT = join(process.cwd(), ".data", "tickets");

function tipPath(id: string) {
  return join(DATA_ROOT, id, "tip.json");
}

export function emptyTip(id: string, region: TicketRegion = "georgia"): TicketTip {
  const now = Date.now();
  return {
    schema: "myproblem.ticket.tip.v1",
    ticket_uuid: id,
    claim: null,
    createdAtMs: now,
    updatedAtMs: now,
    status: "open",
    fields: {
      title: { value: "Listening…", source: "intake", locked: false },
      description: { value: "", source: "intake", locked: false },
    },
    coachLine: "Please state your problem.",
    intake: "listening",
    questions: [],
    evidence: [],
    jobs: [],
    timeline: [
      {
        id: randomUUID(),
        kind: "system",
        body: "Ticket opened",
        atMs: now,
      },
    ],
    // extended fields carried in JSON even if types lag
    ...( { region, preserve: false } as object),
  } as TicketTip;
}

export function saveTip(tip: TicketTip) {
  const dir = join(DATA_ROOT, tip.ticket_uuid);
  mkdirSync(dir, { recursive: true });
  tip.updatedAtMs = Date.now();
  if (tip.fields?.title?.value) {
    tip.fields.title.value = convertPii(tip.fields.title.value).text;
  }
  if (tip.fields?.description?.value) {
    tip.fields.description.value = convertPii(tip.fields.description.value).text;
  }
  writeFileSync(tipPath(tip.ticket_uuid), JSON.stringify(tip, null, 2) + "\n");
  return tip;
}

export function loadTip(id: string): TicketTip | null {
  const p = tipPath(id);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as TicketTip;
}

/** Ops/tests only — never expose as HTTP list. */
export function listTipIds(): string[] {
  if (!existsSync(DATA_ROOT)) return [];
  return readdirSync(DATA_ROOT).filter((d) => existsSync(tipPath(d)));
}

export function createTicket(region: TicketRegion = "georgia"): TicketTip {
  return saveTip(emptyTip(randomUUID(), region));
}

export async function saveTipAsync(tip: TicketTip): Promise<TicketTip> {
  return saveTip(tip);
}

export async function loadTipAsync(id: string): Promise<TicketTip | null> {
  return loadTip(id);
}

export async function createTicketAsync(region: TicketRegion = "georgia"): Promise<TicketTip> {
  return createTicket(region);
}

export function appendTimeline(
  tip: TicketTip,
  kind: TicketTip["timeline"][0]["kind"],
  body: string,
) {
  tip.timeline.push({
    id: randomUUID(),
    kind,
    body: convertPii(body).text,
    atMs: Date.now(),
  });
}

export function sha256Buffer(buf: Buffer) {
  return createHash("sha256").update(buf).digest("hex");
}

export function mediaDir(ticketId: string) {
  const dir = join(DATA_ROOT, ticketId, "media");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export async function storeEvidenceBytes(
  ticketId: string,
  evidenceId: string,
  buf: Buffer,
  ext: string,
): Promise<{ uri: string; path: string }> {
  return writeEvidenceCache(ticketId, evidenceId, buf, ext);
}

export function setIntake(tip: TicketTip, intake: IntakeState, coachLine?: string) {
  tip.intake = intake;
  if (coachLine) tip.coachLine = coachLine;
}

export function addJobRef(tip: TicketTip, id: string, bin: JobBin) {
  tip.jobs.push({ id, bin, state: "queued" });
}
