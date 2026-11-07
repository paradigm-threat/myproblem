#!/usr/bin/env node
/**
 * Build-time business one-pager for myproblem.app
 */
const PDFDocument = require("pdfkit");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const outPath = path.join(root, "public", "myproblem-for-businesses.pdf");
const logoPath = path.join(root, "public", "icons", "icon-192.png");

const CONTACT = "ari@asu.edu";
const SITE = "https://myproblem.app";

fs.mkdirSync(path.dirname(outPath), { recursive: true });

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 54, bottom: 54, left: 58, right: 58 },
  info: {
    Title: "MyProblem for Local Businesses",
    Author: "MyProblem",
    Subject: "Zero-cost AI front door for local shops",
  },
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

const ink = "#0b1a2e";
const muted = "#3d5248";
const accent = "#0f6b4c";

function h1(text) {
  doc.font("Helvetica-Bold").fontSize(22).fillColor(ink).text(text, { align: "left" });
  doc.moveDown(0.35);
}

function h2(text) {
  doc.moveDown(0.4);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(accent)
    .text(text.toUpperCase(), { characterSpacing: 0.6 });
  doc.moveDown(0.25);
}

function body(text) {
  doc.font("Helvetica").fontSize(10.5).fillColor(muted).text(text, { lineGap: 2.5 });
  doc.moveDown(0.35);
}

function bullet(text) {
  doc.font("Helvetica").fontSize(10.5).fillColor(muted).text(`•  ${text}`, {
    indent: 8,
    lineGap: 2,
  });
}

if (fs.existsSync(logoPath)) {
  doc.image(logoPath, doc.page.margins.left, doc.page.margins.top - 6, {
    width: 44,
    height: 44,
  });
  doc.moveDown(3.2);
} else {
  doc.moveDown(0.2);
}

doc.font("Helvetica-Bold").fontSize(11).fillColor(accent).text("MYPROBLEM.APP");
doc.moveDown(0.2);
h1("Free forever front door for local businesses");
body(
  "MyProblem is an AI investigation service that absorbs “should I call?” questions before they hit your phone. People who are unsure get structured help. When they are ready, you get a Problem dossier—not a cold call.",
);

h2("What you get");
bullet("$0 to join. No application fee, no monthly bill, no per-lead invoice.");
bullet("Lighter front desk — routine triage and redirects never reach the secretary.");
bullet("Warmer handoffs — photos, facts, and AI notes already on the Problem tip.");
bullet(
  "Legal stops baked in — we redirect emergencies and licensed care; we do not practice medicine or vet medicine.",
);

h2("How it works for your shop");
[
  "Sign up at $0. You appear as a local option when a Problem needs a real pro.",
  "AI handles the unsure callers first — advice, redirects, or “wait and watch.”",
  "When it is real, you open a Problem tip with the dossier already done.",
  "Accept, decline, or bid. After handshake, the deal is between you and them.",
].forEach((s, i) => {
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(ink).text(`${i + 1}. `, { continued: true });
  doc.font("Helvetica").fillColor(muted).text(s, { lineGap: 2 });
  doc.moveDown(0.2);
});

h2("Who pays (hint: not you)");
body(
  "Preferred stance: businesses stay free forever. Infra is funded by consumer free uses on elastic compute, then optional consumer priority / payee fees after free depth—and optionally a small payment-rail fee if checkout is hosted. We do not want to invoice shops.",
);

h2("Pilots");
body("Live pilots: Georgia (USA) and Israel. Want MyProblem in your region? Email us.");

doc.moveDown(0.5);
doc.font("Helvetica-Bold").fontSize(11).fillColor(ink).text("Contact");
doc.font("Helvetica").fontSize(10.5).fillColor(accent).text(CONTACT);
doc.fillColor(muted).text(SITE);

doc.moveDown(1);
doc
  .font("Helvetica")
  .fontSize(8.5)
  .fillColor("#6a7a72")
  .text(
    "Coming soon. Not medical, veterinary, or legal advice. MyProblem helps people investigate Problems and connect with local businesses when needed.",
    { lineGap: 1.5 },
  );

doc.end();

stream.on("finish", () => {
  console.log(`Wrote ${outPath}`);
});
stream.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
