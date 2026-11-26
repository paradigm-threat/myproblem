import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
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
        <p className="eyebrow">Simple Max · Relay · human-paced sync</p>
        <h1 className="legal-title">Networkers unify the groups you already visit</h1>
        <p className="section-lead">
          <strong>Simple</strong> means the people being helped never install
          anything new — they keep using Nextdoor, Facebook, X, Instagram,
          Reddit, and the rest. <strong>Max</strong> means maximum reach across
          those walled gardens without building a separate front door for each.
          Networkers are the humans who make that possible.
        </p>

        <div className="cta-row">
          <Link className="btn-primary" href="/extension">
            Get Relay for Networkers
          </Link>
          <Link className="btn-secondary" href="/#room">
            Just asking for help? Open the public room
          </Link>
        </div>

        <section aria-labelledby="simple-max-heading">
          <h2 id="simple-max-heading">Simple Max in one pass</h2>
          <p>
            Adoption first: value has to show up where people already are.
            Safety second: no deep scrapers, no headless logins, no bot behavior
            platforms hunt and kill. Relay rides a real logged-in session —
            shallow, session-bound gather only.
          </p>
          <p>
            Each gathered post becomes one ticket candidate with an external
            ref. The AI server receives <strong>batches</strong>, not a live
            firehose. It strips PII, scrubs photos, reduces video to choice
            stills, and prepares incidents for review before anything posts
            back as a trim status update. Full detail overflows to standing
            stores; social feeds only ever see the clean version.
          </p>
        </section>

        <section aria-labelledby="diagram-heading">
          <h2 id="diagram-heading">One Networker, a few collections</h2>
          <figure className="section-graphic">
            <img
              src="/networkers-unify.png"
              alt="Networkers unify related community groups across social networks. Social network icons on the left feed into a central Networker, who links related groups into one Collection hub on the right. Bottom callout: scalable but focused — one Networker manages a few collections, not unlimited."
              width={1024}
              height={682}
              className="section-graphic-img"
              decoding="async"
            />
            <figcaption className="sr-only">
              Infographic: Networkers unify related community groups across
              social networks into focused collections.
            </figcaption>
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
    </>
  );
}
