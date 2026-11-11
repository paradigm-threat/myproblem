import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SiteHeader } from "@/components/SiteHeader";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Try early MyProblem demos — Android Test Mode APK and browser tools. Check back as we ship more.",
  alternates: { canonical: `${SITE_URL}/demo` },
  openGraph: {
    title: "MyProblem demos",
    description:
      "Sideload the Android Test Mode APK and explore early capture-gate demos. More coming soon.",
    url: `${SITE_URL}/demo`,
  },
};

type DemoManifest = {
  id: string;
  title: string;
  version: string;
  publishedAt: string;
  sizeBytes: number;
  sha256: string;
  downloadUrl: string;
  notes?: string;
};

async function loadManifest(): Promise<DemoManifest | null> {
  "use cache";
  try {
    const raw = await readFile(
      join(process.cwd(), "public/demos/manifest.json"),
      "utf8",
    );
    return JSON.parse(raw) as DemoManifest;
  } catch {
    return null;
  }
}

function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DemoPage() {
  const manifest = await loadManifest();
  const published =
    manifest &&
    new Date(manifest.publishedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <SiteHeader variant="demo" />

      <main id="main" className="site demo-page">
        <p className="eyebrow">Early access · building in public</p>
        <h1 className="demo-title">Demos</h1>
        <p className="section-lead demo-lead">
          Hands-on previews of MyProblem while the product grows.{" "}
          <strong>Check back for new demos</strong> as we keep shipping capture,
          OCR, and tools that feed deferred Project investigation.
        </p>

        <section className="demo-card" aria-labelledby="apk-heading">
          <h2 id="apk-heading">Android Test Mode</h2>
          <p>
            While you talk and show the problem, one question stays above the
            camera until the requirements are specific. You answer by talking.
            A spoken conversation with the AI comes later. Clear, new frames
            are kept. No video file is uploaded.
          </p>
          {manifest ? (
            <ul className="demo-meta">
              <li>
                Version <code>{manifest.version}</code>
              </li>
              <li>Published {published}</li>
              <li>{formatBytes(manifest.sizeBytes)}</li>
            </ul>
          ) : (
            <p className="demo-warn">
              APK manifest not found yet — run{" "}
              <code>npm run publish:demo-apk</code> before deploy.
            </p>
          )}
          <div className="cta-row">
            {manifest ? (
              <a
                className="btn-primary"
                href={manifest.downloadUrl}
                download={`myproblem-testmode-${manifest.version}.apk`}
              >
                Download APK
              </a>
            ) : null}
            <a className="btn-secondary" href="/test-mode">
              Open web Test Mode
            </a>
          </div>
          <ol className="demo-steps">
            <li>Enable install from this browser / unknown sources if asked.</li>
            <li>Install the APK, grant camera (While using the app).</li>
            <li>
              Tap <strong>Start feed</strong>, then cycle{" "}
              <strong>Hint</strong> for blue / NE / TEXT·OCR.
            </li>
          </ol>
          {manifest ? (
            <p className="demo-hash">
              SHA-256 <code>{manifest.sha256}</code>
            </p>
          ) : null}
          {manifest?.notes ? <p className="demo-notes">{manifest.notes}</p> : null}
        </section>

        <section className="demo-card demo-card-muted" aria-labelledby="more-heading">
          <h2 id="more-heading">More demos coming</h2>
          <p>
            This page will grow as capabilities land — server capture asks,
            pack updates, and fuller Problem flows. Bookmark{" "}
            <a href="/demo">myproblem.app/demo</a> and check back.
          </p>
          <p>
            Questions or feedback:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </section>
      </main>

      <footer className="site site-footer">
        <p>
          <a href="/">MyProblem</a> · demos are previews, not the full product.
        </p>
      </footer>
    </>
  );
}
