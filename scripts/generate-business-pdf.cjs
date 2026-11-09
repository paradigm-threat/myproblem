#!/usr/bin/env node
/**
 * Build-time landscape one-pager for businesses & service providers.
 * Brand mark appears once (header). Workflow art: public/businesses.jpg.
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
  ["ticket icon", headerLogo],
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
  layout: "landscape",
  margins: { top: 26, bottom: 24, left: 28, right: 28 },
  bufferPages: true,
  info: {
    Title: "MyProblem.app for Businesses & Service Providers",
    Author: "MyProblem",
    Subject:
      "Free forever for businesses and service providers — zero obligation AI tickets",
  },
});

const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

const ink = "#0b1a2e";
const muted = "#3d4a5c";
const accent = "#0f6b4c";
const rule = "#c5d0c9";
const legal = "#6a7a72";

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
      lineGap: opts.lineGap ?? 1.4,
      align: opts.align || "left",
    });
  return doc.y;
}

function bullets(items, x, y, width) {
  let cy = y;
  for (const item of items) {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(muted)
      .text(`•  ${item}`, x, cy, { width, lineGap: 1.15 });
    cy = doc.y + 3;
  }
  return cy;
}

// —— Header (logo once) ——
const logoSize = 36;
const headerY = m.top;
doc.image(headerLogo, left, headerY, { width: logoSize, height: logoSize });

doc
  .font("Helvetica-Bold")
  .fontSize(16)
  .fillColor(ink)
  .text("MyProblem.app", left + logoSize + 10, headerY + 1, {
    lineBreak: false,
  });
doc
  .font("Helvetica")
  .fontSize(9)
  .fillColor(accent)
  .text(
    "Free forever for businesses & service providers · Zero obligation · Powered by Relay",
    left + logoSize + 10,
    headerY + 20,
    { width: contentW - logoSize - 10, lineBreak: false },
  );

const ruleY = headerY + logoSize + 8;
doc
  .moveTo(left, ruleY)
  .lineTo(right, ruleY)
  .strokeColor(rule)
  .lineWidth(0.75)
  .stroke();

// —— Headline ——
let y = ruleY + 12;
doc
  .font("Helvetica-Bold")
  .fontSize(15)
  .fillColor(ink)
  .text("Free forever for businesses & service providers", left, y, {
    width: contentW,
  });
y = doc.y + 2;
y = para(
  "Zero obligation. Ignore anytime. Website → AI tickets (we do not answer your phone yet).",
  left,
  y,
  contentW,
  { size: 10, color: ink, bold: false },
);
y += 10;

// —— Body band: left copy + right art ——
const gutter = 18;
const leftColW = 280;
const rightColX = left + leftColW + gutter;
const rightColW = contentW - leftColW - gutter;
const bodyTop = y;

const lead =
  "MyProblem gives providers a free intake path: visitors capture audio and stills; Projects investigate; you open a dossier only when you choose to look. No application fee, monthly bill, or per-lead invoice — businesses and service providers stay $0. Customer PII stays on their device; network tickets use safe locality (city / coarse band). Georgia & Israel pilots.";

let leftY = para(lead, left, bodyTop, leftColW, { size: 9.5, lineGap: 1.5 });
leftY += 10;
leftY = sectionLabel("What you get", left, leftY, leftColW);
leftY = bullets(
  [
    "$0 forever — no application fee, monthly bill, or per-lead invoice.",
    "Zero obligation — ignore any request. Silence is fine.",
    "Website → ticket, not phone — unsure visitors capture audio + stills (desk stays quiet).",
    "PII-safe dossiers — street/phone stay off the network; request details via secure DM only when needed.",
    "Warmer handoffs — investigation notes on the tip when you engage.",
    "Legal stops — emergencies and licensed care redirect.",
  ],
  left,
  leftY,
  leftColW,
);

const imgW = Math.min(448, rightColW);
const imgH = imgW * (512 / 1024);
const imgX = rightColX + Math.max(0, (rightColW - imgW) / 2);
doc.image(businessesWidePath, imgX, bodyTop, { width: imgW, height: imgH });
let rightY = bodyTop + imgH + 5;
rightY = para(
  "Receive → review AI dossier → accept, ask, or ignore entirely → manage only what you accept.",
  rightColX,
  rightY,
  rightColW,
  { size: 8, color: legal, lineGap: 1.1 },
);

y = Math.max(leftY, rightY) + 10;

// —— Lower band: three columns (parked above pinned footer) ——
const cols = 3;
const colGap = 16;
const colW = (contentW - colGap * (cols - 1)) / cols;
const colXs = [left, left + colW + colGap, left + 2 * (colW + colGap)];
const footerBlockH = 22;
const lowerBandH = 118;
const footerRuleY = bottomLimit - footerBlockH;
const lowerTop = Math.max(y + 8, footerRuleY - lowerBandH);

doc
  .moveTo(left, lowerTop - 8)
  .lineTo(right, lowerTop - 8)
  .strokeColor(rule)
  .lineWidth(0.6)
  .stroke();

// How it works
let c0 = sectionLabel("How it works", colXs[0], lowerTop, colW);
const steps = [
  "Sign up at $0 — still no duty to answer anyone.",
  "Point your site at tickets — audio + stills when capacity allows.",
  "Open the tip — photos + notes, PII already converted to safe context.",
  "Accept, bid, or ask — or ignore entirely.",
];
for (let i = 0; i < steps.length; i++) {
  doc
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .fillColor(ink)
    .text(`${i + 1}. `, colXs[0], c0, { continued: true, width: colW });
  doc
    .font("Helvetica")
    .fillColor(muted)
    .text(steps[i], { width: colW - 14, lineGap: 1.1 });
  c0 = doc.y + 4;
}

// Who pays
let c1 = sectionLabel("Who pays (not you)", colXs[1], lowerTop, colW);
c1 = para(
  "Businesses and service providers never pay. Infrastructure is funded by consumer free uses and optional consumer priority fees. We do not invoice providers or punish silence.",
  colXs[1],
  c1,
  colW,
  { size: 9.5, lineGap: 1.4 },
);

// Pilots + contact in third column
let c2 = sectionLabel("Pilots", colXs[2], lowerTop, colW);
c2 = para(
  "Georgia (USA) and Israel. Want your region? Email us.",
  colXs[2],
  c2,
  colW,
  { size: 9.5, lineGap: 1.4 },
);
c2 += 8;
c2 = sectionLabel("Contact", colXs[2], c2, colW);
doc.font("Helvetica").fontSize(9.5).fillColor(accent).text(CONTACT, colXs[2], c2, {
  width: colW,
});
c2 = doc.y + 2;
doc.font("Helvetica").fontSize(9.5).fillColor(muted).text(SITE, colXs[2], c2, {
  width: colW,
});
c2 = doc.y;

// —— Footer pinned to page bottom ——
doc
  .moveTo(left, footerRuleY)
  .lineTo(right, footerRuleY)
  .strokeColor(rule)
  .lineWidth(0.6)
  .stroke();
doc
  .font("Helvetica")
  .fontSize(7.5)
  .fillColor(legal)
  .text(
    "Coming soon. Clevertree LLC · myproblem.app/privacy · /terms. Not medical, veterinary, or legal advice. Free forever for businesses & service providers. PII client-held + auto-convert.",
    left,
    footerRuleY + 6,
    { width: contentW, lineGap: 1.05 },
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
  console.log(`Wrote ${outPath} (${pages} page, landscape)`);
  console.log(
    `Assets: ${path.basename(headerLogo)}, ${path.basename(businessesWidePath)}`,
  );
});
stream.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
