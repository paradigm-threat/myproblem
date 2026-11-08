#!/usr/bin/env node
/**
 * Build-time business one-pager for myproblem.app
 * Requires ticket icons + landscape businesses graphic.
 */
const PDFDocument = require("pdfkit");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const outPath = path.join(root, "public", "myproblem-for-businesses.pdf");
const logoPath = path.join(root, "public", "icons", "icon-512.png");
const logoFallbackPath = path.join(root, "public", "icons", "icon-192.png");
const logoSmallPath = path.join(root, "public", "icons", "icon-64.png");
const businessesWidePath = path.join(root, "public", "businesses.jpg");

const CONTACT = "ari@asu.edu";
const SITE = "https://myproblem.app";

const headerLogo = fs.existsSync(logoPath) ? logoPath : logoFallbackPath;
for (const [label, p] of [
  ["ticket icon", headerLogo],
  ["small ticket icon", logoSmallPath],
  ["businesses wide graphic", businessesWidePath],
]) {
  if (!fs.existsSync(p)) {
    console.error(`Missing required asset (${label}): ${p}`);
    process.exit(1);
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 32, bottom: 32, left: 44, right: 44 },
  info: {
    Title: "MyProblem for Local Businesses",
    Author: "MyProblem",
    Subject: "Zero-cost AI front door for local shops",
  },
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

const ink = "#0b1a2e";
const muted = "#3d4a5c";
const accent = "#0f6b4c";
const contentWidth =
  doc.page.width - doc.page.margins.left - doc.page.margins.right;
const left = doc.page.margins.left;

function h2(text) {
  doc.moveDown(0.28);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(accent)
    .text(text.toUpperCase(), { characterSpacing: 0.6 });
  doc.moveDown(0.15);
}

function body(text) {
  doc.font("Helvetica").fontSize(9.5).fillColor(muted).text(text, { lineGap: 1.6 });
  doc.moveDown(0.22);
}

function bullet(text) {
  doc.font("Helvetica").fontSize(9.5).fillColor(muted).text(`•  ${text}`, {
    indent: 4,
    lineGap: 1.4,
  });
}

// —— Header: ticket icon + wordmark ——
const logoSize = 44;
doc.image(headerLogo, left, doc.page.margins.top, {
  width: logoSize,
  height: logoSize,
});
doc
  .font("Helvetica-Bold")
  .fontSize(18)
  .fillColor(ink)
  .text("MyProblem", left + logoSize + 12, doc.page.margins.top + 2);
doc
  .font("Helvetica")
  .fontSize(9.5)
  .fillColor(accent)
  .text(
    "myproblem.app  ·  Free forever for local businesses",
    left + logoSize + 12,
    doc.page.margins.top + 24,
  );
doc.y = doc.page.margins.top + logoSize + 8;

doc
  .font("Helvetica-Bold")
  .fontSize(14)
  .fillColor(ink)
  .text("Free forever front door for local businesses");
doc.moveDown(0.15);
body(
  "MyProblem absorbs “should I call?” before it hits your phone. Smart capture fills the ticket; a JIRA-like queue batch-investigates ASAP and thoroughly — Bedrock only for rare hard cases. Public lessons feed a Georgia- and Israel-only knowledge base. Ready customers arrive with a real dossier—not a cold call.",
);

// —— Landscape businesses graphic (required) ——
const imgH = contentWidth * (512 / 1024) * 0.92;
doc.image(businessesWidePath, left, doc.y, {
  width: contentWidth,
  height: imgH,
});
doc.y += imgH + 4;
doc
  .font("Helvetica")
  .fontSize(7.5)
  .fillColor("#6a7a72")
  .text(
    "Business workflow: receive requests → review AI dossier → accept, ask, or ignore entirely (no obligation) → manage work you choose. Ticket icon = MyProblem brand.",
    { align: "left" },
  );
  doc.moveDown(0.25);

h2("What you get");
bullet("$0 to join. No application fee, no monthly bill, no per-lead invoice.");
bullet(
  "Zero obligation — ignore any request entirely (like a social feed). No SLA, no must-respond, no penalty for silence.",
);
bullet("Lighter front desk — routine triage and redirects never reach the secretary.");
bullet("Warmer handoffs — Project notes on the tip; local KB stays place-tied.");
bullet(
  "Legal stops baked in — emergencies and licensed care redirect; we do not practice medicine or vet medicine.",
);

h2("How it works for your shop");
[
  "Sign up at $0. You appear as a local option — still with no duty to answer anyone.",
  "AI handles unsure callers first — capture now, Project research when capacity allows.",
  "When it is real, you open a Problem tip with the dossier already done.",
  "Accept, bid, ask — or ignore entirely. Silence costs nothing. After handshake, the deal is between you and them.",
].forEach((s, i) => {
  const rowY = doc.y;
  doc.image(logoSmallPath, left, rowY, { width: 14, height: 14 });
  doc
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .fillColor(ink)
    .text(`${i + 1}. `, left + 20, rowY, { continued: true });
  doc
    .font("Helvetica")
    .fillColor(muted)
    .text(s, { lineGap: 1.2, width: contentWidth - 20 });
  doc.moveDown(0.18);
});

h2("Who pays (hint: not you)");
body(
  "Businesses stay free forever with zero response obligation. Infra is funded by consumer free uses on elastic compute, then optional consumer priority fees—and optionally a small payment-rail fee if checkout is hosted. We do not invoice shops or punish silence.",
);

h2("Pilots");
body("Georgia (USA) and Israel — product and knowledge base scoped there. Want your region? Email us.");

doc.moveDown(0.1);
const cy = doc.y;
doc.image(logoSmallPath, left, cy, { width: 18, height: 18 });
doc.font("Helvetica-Bold").fontSize(10).fillColor(ink).text("Contact", left + 26, cy);
doc.font("Helvetica").fontSize(9.5).fillColor(accent).text(CONTACT, left + 26, cy + 11);
doc.fillColor(muted).text(SITE, left + 26, cy + 22);
doc.y = cy + 36;

doc
  .font("Helvetica")
  .fontSize(7.5)
  .fillColor("#6a7a72")
  .text(
    "Coming soon. Not medical, veterinary, or legal advice. MyProblem helps people investigate Problems and connect with local businesses when needed.",
    { lineGap: 1.2 },
  );

if (doc.bufferedPageRange().count > 1) {
  console.warn(
    `Warning: PDF spilled to ${doc.bufferedPageRange().count} pages; tighten copy/spacing.`,
  );
}

doc.end();

stream.on("finish", () => {
  console.log(`Wrote ${outPath}`);
  console.log(`Assets: ${path.basename(headerLogo)}, ${path.basename(logoSmallPath)}, ${path.basename(businessesWidePath)}`);
});
stream.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
