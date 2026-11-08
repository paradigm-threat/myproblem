#!/usr/bin/env node
/**
 * Build-time business one-pager for myproblem.app
 * Uses landscape businesses.jpg (1024×512) — portrait is too tall for 1 page.
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
  ["businesses landscape graphic", businessesWidePath],
]) {
  if (!fs.existsSync(p)) {
    console.error(`Missing required asset (${label}): ${p}`);
    process.exit(1);
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 28, bottom: 28, left: 42, right: 42 },
  bufferPages: true,
  info: {
    Title: "MyProblem.app for Local Businesses",
    Author: "MyProblem",
    Subject: "Free forever, zero obligation AI front door for local shops",
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
  doc.moveDown(0.22);
  doc
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .fillColor(accent)
    .text(text.toUpperCase(), { characterSpacing: 0.55 });
  doc.moveDown(0.12);
}

function body(text) {
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(muted)
    .text(text, { lineGap: 1.35 });
  doc.moveDown(0.16);
}

function bullet(text) {
  doc.font("Helvetica").fontSize(9).fillColor(muted).text(`•  ${text}`, {
    indent: 4,
    lineGap: 1.2,
  });
}

// —— Header ——
const logoSize = 40;
doc.image(headerLogo, left, doc.page.margins.top, {
  width: logoSize,
  height: logoSize,
});
doc
  .font("Helvetica-Bold")
  .fontSize(17)
  .fillColor(ink)
  .text("MyProblem.app", left + logoSize + 10, doc.page.margins.top + 2);
doc
  .font("Helvetica")
  .fontSize(9)
  .fillColor(accent)
  .text(
    "Free forever · Zero obligation · Powered by Relay",
    left + logoSize + 10,
    doc.page.margins.top + 22,
  );
doc.y = doc.page.margins.top + logoSize + 6;

doc
  .font("Helvetica-Bold")
  .fontSize(12.5)
  .fillColor(ink)
  .text("Free forever front door — ignore anytime");
doc.moveDown(0.1);
body(
  "We do not answer your shop’s phone (yet). Link your website to MyProblem ticket creation — people record audio + stills; deferred Projects investigate thoroughly. Incoming work is a social-style feed: open a fit, or ignore entirely. Georgia & Israel pilots. Future VoIP can automate the same flow.",
);

// —— Landscape workflow graphic (ignore-entirely art) ——
const imgH = contentWidth * (512 / 1024);
doc.image(businessesWidePath, left, doc.y, {
  width: contentWidth,
  height: imgH,
});
doc.y += imgH + 3;
doc
  .font("Helvetica")
  .fontSize(7)
  .fillColor("#6a7a72")
  .text(
    "Receive → review AI dossier → accept, ask, or ignore entirely (no obligation) → manage only what you accept.",
    { align: "left" },
  );
doc.moveDown(0.18);

h2("What you get");
bullet("$0 to join — no application fee, monthly bill, or per-lead invoice.");
bullet(
  "Zero obligation — ignore any request like a social post. Silence is fine.",
);
bullet(
  "Website → ticket, not phone — send unsure visitors to MyProblem audio/stills capture (no ringing the desk).",
);
bullet("Warmer handoffs — dossier on the tip when you do engage.");
bullet("Legal stops baked in — emergencies / licensed care redirect.");

h2("How it works");
[
  "Sign up at $0 — still no duty to answer anyone.",
  "Point your site at ticket creation — audio recording + stills; Project when capacity allows (we do not take phone calls yet).",
  "When real, open the tip with photos + investigation notes already done.",
  "Accept, bid, ask — or ignore entirely. After handshake, the deal is yours.",
].forEach((s, i) => {
  const rowY = doc.y;
  doc.image(logoSmallPath, left, rowY, { width: 12, height: 12 });
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(ink)
    .text(`${i + 1}. `, left + 18, rowY, { continued: true });
  doc
    .font("Helvetica")
    .fillColor(muted)
    .text(s, { lineGap: 1.05, width: contentWidth - 18 });
  doc.moveDown(0.12);
});

h2("Who pays (not you)");
body(
  "Shops stay free forever with zero response obligation. Infra is funded by consumer free uses, then optional consumer priority fees. We do not invoice shops or punish silence.",
);

h2("Pilots");
body(
  "Georgia (USA) and Israel. Want your region? Email us.",
);

const cy = doc.y;
doc.image(logoSmallPath, left, cy, { width: 16, height: 16 });
doc.font("Helvetica-Bold").fontSize(9.5).fillColor(ink).text("Contact", left + 22, cy);
doc
  .font("Helvetica")
  .fontSize(9)
  .fillColor(accent)
  .text(CONTACT, left + 22, cy + 11);
doc.fillColor(muted).text(SITE, left + 22, cy + 22);
doc.y = cy + 34;

doc
  .font("Helvetica")
  .fontSize(7)
  .fillColor("#6a7a72")
  .text(
    "Coming soon. Not medical, veterinary, or legal advice. Preferred business pricing: free forever.",
    { lineGap: 1.1 },
  );

const pages = doc.bufferedPageRange().count;
if (pages > 1) {
  console.error(
    `ERROR: PDF spilled to ${pages} pages — must stay 1 page. Tighten copy/spacing.`,
  );
  doc.end();
  stream.on("finish", () => process.exit(1));
  return;
}

doc.end();

stream.on("finish", () => {
  console.log(`Wrote ${outPath} (${pages} page)`);
  console.log(
    `Assets: ${path.basename(headerLogo)}, ${path.basename(logoSmallPath)}, ${path.basename(businessesWidePath)}`,
  );
});
stream.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
