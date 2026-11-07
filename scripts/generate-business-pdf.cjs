#!/usr/bin/env node
/**
 * Build-time business one-pager for myproblem.app
 * Uses ticket icon + landscape businesses graphic.
 */
const PDFDocument = require("pdfkit");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const outPath = path.join(root, "public", "myproblem-for-businesses.pdf");
const logoPath = path.join(root, "public", "icons", "icon-192.png");
const logoSmallPath = path.join(root, "public", "icons", "icon-64.png");
const businessesWidePath = path.join(root, "public", "businesses.jpg");

const CONTACT = "ari@asu.edu";
const SITE = "https://myproblem.app";

fs.mkdirSync(path.dirname(outPath), { recursive: true });

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 48, bottom: 48, left: 50, right: 50 },
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

function h1(text) {
  doc.font("Helvetica-Bold").fontSize(20).fillColor(ink).text(text, { align: "left" });
  doc.moveDown(0.3);
}

function h2(text) {
  doc.moveDown(0.35);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(accent)
    .text(text.toUpperCase(), { characterSpacing: 0.5 });
  doc.moveDown(0.2);
}

function body(text) {
  doc.font("Helvetica").fontSize(10).fillColor(muted).text(text, { lineGap: 2.2 });
  doc.moveDown(0.3);
}

function bullet(text) {
  doc.font("Helvetica").fontSize(10).fillColor(muted).text(`•  ${text}`, {
    indent: 6,
    lineGap: 1.8,
  });
}

function ensureSpace(needed) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + needed > bottom) {
    doc.addPage();
  }
}

// —— Header: icon + wordmark ——
const logoSize = 48;
if (fs.existsSync(logoPath)) {
  doc.image(logoPath, left, doc.page.margins.top, {
    width: logoSize,
    height: logoSize,
  });
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(ink)
    .text("MyProblem", left + logoSize + 12, doc.page.margins.top + 6, {
      continued: false,
    });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(accent)
    .text("myproblem.app  ·  Free forever for local businesses", left + logoSize + 12, doc.page.margins.top + 28);
  doc.y = doc.page.margins.top + logoSize + 14;
} else {
  doc.font("Helvetica-Bold").fontSize(11).fillColor(accent).text("MYPROBLEM.APP");
  doc.moveDown(0.3);
}

h1("Free forever front door for local businesses");
body(
  "MyProblem is an AI investigation service that absorbs “should I call?” questions before they hit your phone. People who are unsure get structured help. When they are ready, you get a Problem dossier—not a cold call.",
);

// —— Wide businesses graphic ——
if (fs.existsSync(businessesWidePath)) {
  ensureSpace(220);
  const imgH = contentWidth * (512 / 1024);
  doc.image(businessesWidePath, left, doc.y, {
    width: contentWidth,
    height: imgH,
  });
  doc.y += imgH + 10;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#6a7a72")
    .text(
      "How MyProblem works for shops: receive requests → review AI dossier → choose a response → manage work.",
      { align: "left" },
    );
  doc.moveDown(0.5);
}

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
  ensureSpace(28);
  const rowY = doc.y;
  // Small ticket icon beside each step when available
  if (fs.existsSync(logoSmallPath)) {
    doc.image(logoSmallPath, left, rowY, { width: 16, height: 16 });
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(ink)
      .text(`${i + 1}. `, left + 22, rowY + 1, { continued: true });
    doc.font("Helvetica").fillColor(muted).text(s, { lineGap: 1.5, width: contentWidth - 22 });
  } else {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(ink).text(`${i + 1}. `, { continued: true });
    doc.font("Helvetica").fillColor(muted).text(s, { lineGap: 1.5 });
  }
  doc.moveDown(0.25);
});

h2("Who pays (hint: not you)");
body(
  "Preferred stance: businesses stay free forever. Infra is funded by consumer free uses on elastic compute, then optional consumer priority / payee fees after free depth—and optionally a small payment-rail fee if checkout is hosted. We do not want to invoice shops.",
);

h2("Pilots");
body("Live pilots: Georgia (USA) and Israel. Want MyProblem in your region? Email us.");

ensureSpace(70);
doc.moveDown(0.4);
if (fs.existsSync(logoSmallPath)) {
  const cy = doc.y;
  doc.image(logoSmallPath, left, cy, { width: 22, height: 22 });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(ink).text("Contact", left + 30, cy);
  doc.font("Helvetica").fontSize(10).fillColor(accent).text(CONTACT, left + 30, cy + 14);
  doc.fillColor(muted).text(SITE, left + 30, cy + 28);
  doc.y = cy + 48;
} else {
  doc.font("Helvetica-Bold").fontSize(11).fillColor(ink).text("Contact");
  doc.font("Helvetica").fontSize(10).fillColor(accent).text(CONTACT);
  doc.fillColor(muted).text(SITE);
}

doc.moveDown(0.6);
doc
  .font("Helvetica")
  .fontSize(8)
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
