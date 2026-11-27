import type { Metadata } from "next";
import Link from "next/link";
import { OpenChatButton } from "@/components/chat/OpenChatButton";
import { SiteHeader } from "@/components/SiteHeader";
import { CONTACT_EMAIL, OG_IMAGE, SITE_URL } from "@/lib/contact";

const TITLE = "Relay for Networkers";
const DESCRIPTION =
  "The primary way to be a Networker: the Relay Chrome extension. Gather read-only updates from groups you already visit. SI organizes topics; humans still send. No automatic posting.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/extension` },
  openGraph: {
    title: "Relay for Networkers · MyProblem",
    description: DESCRIPTION,
    url: `${SITE_URL}/extension`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Relay for Networkers · MyProblem",
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function ExtensionPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader variant="home" />
      <main id="main" className="site legal-page">
        <p className="eyebrow">For Networkers · Chrome side panel · primary path</p>
        <h1 className="legal-title">Relay — the Networker extension</h1>
        <p className="section-lead">
          Want to keep help moving across your community?{" "}
          <strong>This extension is the primary way to be a Networker.</strong>{" "}
          Install Relay, open the groups you already visit, and gather updates
          so SI can file topics. Read-only. No automatic posting. Desktop Chrome
          side panel.
        </p>

        <div className="cta-row">
          <a className="btn-primary" href="#install">
            Get Relay for Networkers
          </a>
          <OpenChatButton className="btn-secondary">
            Just asking for help? Open the public room
          </OpenChatButton>
          <a
            className="btn-secondary"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Relay for Networkers — want to help")}`}
          >
            Email to help
          </a>
        </div>

        <section aria-labelledby="who-heading">
          <h2 id="who-heading">What a Networker does</h2>
          <p>
            A Networker keeps the process moving — add a photo to someone
            else&apos;s tip, note an action you took, or gather garden-wall
            social posts so SI can file topics. You can also solve problems; the
            highlight is continuity, not being the hero.
          </p>
          <p>
            <strong>Start here with Relay.</strong> The Android app can
            optionally enable a Networker home for evidence and action notes on
            tips you already have, but it cannot scrape Nextdoor or Facebook —
            apps cannot read each other&apos;s feeds. Social gather lives in this
            extension.
          </p>
        </section>

        <section id="install" aria-labelledby="install-heading">
          <h2 id="install-heading">Install (load unpacked)</h2>
          <ol>
            <li>
              Chrome → <code>chrome://extensions</code> → Developer mode →{" "}
              <strong>Load unpacked</strong>
            </li>
            <li>
              Select the <code>extensions/capture</code> folder from the{" "}
              <a href="https://github.com/paradigm-threat/myproblem">
                MyProblem repo
              </a>{" "}
              (or a release zip when published)
            </li>
            <li>
              Open a logged-in group page → open the side panel →{" "}
              <strong>Refresh / Gather</strong> when the collection is stale
            </li>
          </ol>
          <p className="muted">
            Default lookback is time since the last tip-repo commit for that
            group. You can extend lookback up to about 30 days for the next
            gather only. A full-page please-wait overlay covers the host site
            while gathering — leave the tab open.
          </p>
        </section>

        <section aria-labelledby="rules-heading">
          <h2 id="rules-heading">Rules</h2>
          <ul>
            <li>Never auto-posts or auto-sends on the social network</li>
            <li>Humans still paste and send origin replies when needed</li>
            <li>Recording lives on the website / APK — not in the extension</li>
            <li>Outcomes and topics first; raw debug stays in Lab</li>
          </ul>
        </section>

        <section aria-labelledby="design-heading">
          <h2 id="design-heading">Design reference</h2>
          <p>
            Visual contract:{" "}
            <a href="/design/ui-kit/screen-board.html">UI kit screen board</a>{" "}
            (screens 13–20).
          </p>
        </section>

        <p>
          <Link href="/dev">Dev status</Link>
          {" · "}
          <Link href="/">Home</Link>
        </p>
      </main>
    </>
  );
}
