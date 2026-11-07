#!/usr/bin/env node
/**
 * Publish Test Mode APK into public/demos for myproblem.app/demo.
 *
 * Usage:
 *   cd apps/android-testmode && ./gradlew :app:assembleDebug
 *   npm run publish:demo-apk
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const apkSrc = join(
  root,
  "apps/android-testmode/app/build/outputs/apk/debug/app-debug.apk",
);
if (!existsSync(apkSrc)) {
  console.error("APK not found — run: cd apps/android-testmode && ./gradlew :app:assembleDebug");
  process.exit(1);
}

const buf = readFileSync(apkSrc);
const sha256 = createHash("sha256").update(buf).digest("hex");
const versionName = "0.1.0-testmode";
const fileName = "myproblem-testmode.apk";
const publicPath = `/demos/${fileName}`;

const outDir = join(root, "public/demos");
mkdirSync(outDir, { recursive: true });
const apkDest = join(outDir, fileName);
copyFileSync(apkSrc, apkDest);

const manifest = {
  id: "android-testmode",
  title: "Android Test Mode",
  version: versionName,
  publishedAt: new Date().toISOString(),
  sizeBytes: buf.length,
  sha256,
  downloadUrl: publicPath,
  contentType: "application/vnd.android.package-archive",
  notes:
    "Offline frame gate + OCR capability demo. Sideload on Android; allow unknown sources if prompted.",
};

const manifestPath = join(outDir, "manifest.json");
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  JSON.stringify(
    { ok: true, downloadUrl: publicPath, sha256, sizeBytes: buf.length, manifestPath },
    null,
    2,
  ),
);
