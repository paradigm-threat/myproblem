import type { Metadata } from "next";
import Link from "next/link";
import { OpenChatButton } from "@/components/chat/OpenChatButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeArt } from "@/components/ThemeArt";
import { OG_IMAGE, SITE_URL } from "@/lib/contact";

const TITLE = "Networkers";
const DESCRIPTION =
  "Simple Max for Networkers: shallow session-bound gather across the networks you already use. Batch scrub, trim post-back. Install Relay to start.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/networkers` },
  openGraph: {
    title: "Networkers · MyProblem",
    description: DESCRIPTION,
    url: `${SITE_URL}/networkers`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Networkers · MyProblem",
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function NetworkersPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader variant="home" />
      <main id="main" className="site legal-page">
        <p className="eyebrow">Relay · Simple Max · Networkers</p>
        <h1 className="legal-title">Networkers work where people already are</h1>
        <p className="section-lead">
          Relay&apos;s <strong>Simple Max</strong> principle: keep the default
          experience minimal, and keep capability available without premium
          unlocks. For Networkers that also means adoption where people already
          are—Nextdoor, Facebook, X, Instagram, Reddit, and similar—without
          forcing a new app for basic participation.
        </p>

        <div className="cta-row">
          <Link className="btn-primary" href="/extension">
            Get Relay for Networkers
          </Link>
          <OpenChatButton className="btn-secondary">
            Just asking for help? Open the public room
          </OpenChatButton>
        </div>

        <section aria-labelledby="simple-max-heading">
          <h2 id="simple-max-heading">How gather stays Simple Max</h2>
          <p>
            Adoption first: value has to appear on networks people already use.
            Safety next: no deep scrapers, no headless logins, no bot behavior
            platforms treat as abuse. Relay uses a real logged-in browser
            session—shallow, session-bound gather only.
          </p>
          <p>
            Each gathered post becomes one ticket candidate with an external
            ref. The AI path receives <strong>batches</strong>, not a live
            firehose. It strips PII, scrubs photos, reduces video to stills, and
            prepares incidents for review before any trim status update returns
            to the origin network. Full detail stays in standing stores.
          </p>
        </section>

        <section aria-labelledby="diagram-heading">
          <h2 id="diagram-heading">One Networker, a few collections</h2>
          <figure className="section-graphic">
            <ThemeArt
              base="/networkers-unify"
              ext="jpg"
              portraitBase="/networkers-portrait"
              alt="Networkers unify related community groups across social networks into focused collections"
              width={1024}
              height={682}
            />
          </figure>
          <p>
            Scalable but focused. One Networker manages a few collections — not
            unlimited. A collection might be every Savannah cat rescue page
            across five networks, or a handful of neighborhood threads that
            already share the same problems.
          </p>
        </section>

        <section aria-labelledby="role-heading">
          <h2 id="role-heading">The Networker role, step by step</h2>
          <ol className="steps">
            <li>
              <strong>Belong first</strong>
              <p>
                You already visit the communities you want to help. Sign into a
                few familiar pages. No new audience to build.
              </p>
            </li>
            <li>
              <strong>Gather with Relay</strong>
              <p>
                Open the Chrome side panel on a group page. Refresh / Gather
                reads what is already visible in your session and turns
                relevant posts into structured ticket candidates.
              </p>
            </li>
            <li>
              <strong>Batch to the server</strong>
              <p>
                Captures land in a private queue. The server scrubs, sanitizes,
                and files topics. You are not dumping raw feed dumps onto a
                public channel.
              </p>
            </li>
            <li>
              <strong>Trim post-back when ready</strong>
              <p>
                After human or AI review, clean status updates can return to the
                origin networks. People being helped just reply where they
                already scroll.
              </p>
            </li>
          </ol>
        </section>

        <section aria-labelledby="safety-heading">
          <h2 id="safety-heading">Safety pipeline</h2>
          <ul>
            <li>Batch intake — not a live firehose</li>
            <li>Scrub PII (names, phones, streets, payment handles)</li>
            <li>Sanitize photos; reduce video to choice stills</li>
            <li>Human or AI review before trim post-back</li>
            <li>Never auto-post to the origin social network</li>
            <li>Extension never holds the Bunny storage key</li>
          </ul>
        </section>

        <p>
          <Link href="/extension">Install Relay</Link>
          {" · "}
          <Link href="/">Home</Link>
          {" · "}
          <Link href="/dev">Dev</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
