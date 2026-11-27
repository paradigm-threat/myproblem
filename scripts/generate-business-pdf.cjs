#!/usr/bin/env node
/**
 * Landscape one-pager for businesses.
 * Public free · private fees for capacity · Simple Max.
 */
const PDFDocument = require("pdfkit");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const outPath = path.join(root, "public", "myproblem-for-businesses.pdf");
const logoPath = path.join(root, "public", "icons", "icon-512.png");
const logoFallbackPath = path.join(root, "public", "icons", "icon-192.png");
const businessesWidePath = path.join(root, "public", "businesses.jpg");

const CONTACT = "ari@asu.edu";
const SITE = "https://myproblem.app";

const headerLogo = fs.existsSync(logoPath) ? logoPath : logoFallbackPath;
for (const [label, p] of [
  ["logo", headerLogo],
  ["businesses art", businessesWidePath],
]) {
  if (!fs.existsSync(p)) {
    console.error(`Missing required asset (${label}): ${p}`);
    process.exit(1);
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });

const doc = new PDFDocument({
  size: "LETTER",
  layout: "landscape",
  margins: { top: 26, bottom: 24, left: 28, right: 28 },
  bufferPages: true,
  info: {
    Title: "MyProblem for Businesses",
    Author: "MyProblem",
    Subject: "Public help free; private tickets compensate time; Simple Max",
  },
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

const ink = "#182C35";
const muted = "#4C6069";
const accent = "#14674F";
const rule = "#BCCACD";
const legal = "#596E75";

const pageW = doc.page.width;
const pageH = doc.page.height;
const m = doc.page.margins;
const left = m.left;
const right = pageW - m.right;
const contentW = right - left;
const bottomLimit = pageH - m.bottom;

function sectionLabel(text, x, y, width) {
  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(accent)
    .text(text.toUpperCase(), x, y, {
      width,
      characterSpacing: 0.6,
      lineBreak: false,
    });
  return doc.y + 4;
}

function para(text, x, y, width, opts = {}) {
  doc
    .font(opts.bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(opts.size || 9.5)
    .fillColor(opts.color || muted)
    .text(text, x, y, {
      width,
      align: opts.align || "left",
      lineGap: opts.lineGap ?? 2,
    });
  return doc.y;
}

let y = m.top;
doc.image(headerLogo, left, y, { width: 28, height: 28 });
doc
  .font("Helvetica-Bold")
  .fontSize(16)
  .fillColor(ink)
  .text("MyProblem", left + 36, y + 2, { lineBreak: false });
doc
  .font("Helvetica")
  .fontSize(9)
  .fillColor(muted)
  .text("Relay · Public free · Private = cost of capacity", left + 130, y + 8, {
    lineBreak: false,
  });
y += 40;
doc
  .moveTo(left, y)
  .lineTo(right, y)
  .strokeColor(rule)
  .lineWidth(1)
  .stroke();
y += 14;

const colGap = 18;
const colW = (contentW - colGap) / 2;
const leftCol = left;
const rightCol = left + colW + colGap;

y = sectionLabel("For local shops", leftCol, y, colW);
y = para(
  "Answer local questions in the public room. Public asks are free to ignore. Private tickets (when shipped) can compensate your time. Occasional conversations become paid bay work—not purchased leads.",
  leftCol,
  y,
  colW,
  { size: 10, color: ink },
);
y += 10;
y = sectionLabel("How it works", leftCol, y, colW);
const beats = [
  "Public or private ask appears (PII stripped on private).",
  "Review the dossier; answer, ask, or ignore.",
  "Optional tip when available; no obligation on public.",
  "Some customers bring the job in for paid service.",
];
for (const b of beats) {
  y = para("•  " + b, leftCol, y, colW, { size: 9.5 });
  y += 4;
}
y += 8;
y = sectionLabel("Who pays", leftCol, y, colW);
y = para(
  "Public path: $0. Private ≈ metered model cost + optional infra fee. Tips (Stripe, later) never required for public help. Examples are not prices.",
  leftCol,
  y,
  colW,
  { size: 9.5 },
);

const artTop = m.top + 54;
const artH = Math.min(280, bottomLimit - artTop - 48);
doc.image(businessesWidePath, rightCol, artTop, {
  fit: [colW, artH],
  align: "center",
  valign: "center",
});

const footY = bottomLimit - 28;
doc
  .moveTo(left, footY)
  .lineTo(right, footY)
  .strokeColor(rule)
  .lineWidth(1)
  .stroke();
para(
  `${SITE}/businesses  ·  ${CONTACT}  ·  Simple Max: minimal UI, ungated public capability  ·  Illustration, not a forecast.`,
  left,
  footY + 8,
  contentW,
  { size: 8, color: legal },
);

doc.end();
stream.on("finish", () => {
  console.log("Wrote", outPath);
});
