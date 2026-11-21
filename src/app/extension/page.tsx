import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { CONTACT_EMAIL, OG_IMAGE, SITE_URL, SI_FOOTER_GLOSS } from "@/lib/contact";

const TITLE = "MyProblem X";
const DESCRIPTION =
  "A second layer on social media: capture what matters while you browse, keep mutual aid from drowning in the feed, and grow shared knowledge instead of losing it in the flood. Human sends. Not a bot scraper.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/extension` },
  openGraph: {
    title: "MyProblem X — a second layer on social media",
    description: DESCRIPTION,
    url: `${SITE_URL}/extension`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyProblem X — next internet, not more feed chaos",
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
        <p className="eyebrow">Browser extension · MVP · next internet</p>
        <h1 className="legal-title">MyProblem X</h1>
        <p className="section-lead">
          Social feeds were supposed to help neighbors solve real problems.
          Instead they bury the useful post, amplify noise, and punish people
          who try to organize help.{" "}
          <strong>
            MyProblem X is a second layer on top of the session you already
            have
          </strong>
          — so thoughts can consolidate and grow instead of vanishing in the
          flood. You browse. We capture what qualifies. Humans still edit and
          send. Not a bot scraper.
        </p>

        <div className="cta-row">
          <Link className="btn-primary" href="/submit">
            Try a ticket
          </Link>
          <Link className="btn-secondary" href="/dev">
            Dev status
          </Link>
          <a
            className="btn-secondary"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("MyProblem X — want to help")}`}
          >
            Email to help
          </a>
        </div>

        <section aria-labelledby="dysfunction-heading">
          <h2 id="dysfunction-heading">The internet we have is broken on purpose</h2>
          <p>
            Today’s feeds behave like the rest of our broken institutions: a
            Congress that cannot finish a sentence, and corporations that treat
            attention as a mine to extract—not a commons to steward. Posts that
            could save a kitten, find a lost cat, or coordinate TNR disappear
            under promo, argument, and algorithmic indifference. Groups ban
            helpers. Threads rot. Knowledge that should compound is thrown away
            every scroll.
          </p>
          <p>
            That is not a glitch. It is the product of a{" "}
            <strong>dysfunctional internet</strong> optimized for engagement,
            not for solving anything. Real solutions are needed desperately—for
            stray animals, for neighbors in crisis, for local problems that never
            belong in a venture pitch deck.
          </p>
        </section>

        <section aria-labelledby="next-heading">
          <h2 id="next-heading">How the next internet is meant to work</h2>
          <p>
            The next internet does not replace your neighborhood group. It{" "}
            <strong>stands beside it</strong>: a durable layer where each real
            need can become a ticket, each useful thread can leave a lesson, and
            communities keep helping even when one platform turns hostile.
          </p>
          <ul>
            <li>
              <strong>One post → one ticket candidate</strong> — not “the whole
              group” as a blob. Qualifying asks (lost-found, rehome, TNR, colony
              care) become durable work. Off-topic promo stays as stats, not tip
              spam.
            </li>
            <li>
              <strong>Capture in a real session</strong> — platforms lock posts
              behind login and hunt scrapers. So a neighbor browses; MyProblem X
              makes that browsing useful instead of ephemeral.
            </li>
            <li>
              <strong>Batch intelligence, human send</strong> — research and
              reply drafts arrive when capacity allows. You paste, edit, and
              click Send. Never auto-spam.
            </li>
            <li>
              <strong>Media that survives the flood</strong> — photos and video
              already on the feed can travel with the batch. Batch AI picks the
              useful stills for public tips; raw chaos does not become the
              permanent record.
            </li>
            <li>
              <strong>Knowledge that grows</strong> — redacted lessons land in
              place knowledge bases and channels (Georgia pilot: Savannah stray
              cats) so the next person does not start from zero.
            </li>
          </ul>
          <p>
            Less chaos. Less obscurity. More consolidation. That is the product
            pitch—and the moral one.
          </p>
        </section>

        <section aria-labelledby="why-heading">
          <h2 id="why-heading">Why an extension</h2>
          <ul>
            <li>
              Social networks keep post data behind a{" "}
              <strong>logged-in session</strong>. Outside that session it is
              effectively unavailable.
            </li>
            <li>
              Platforms hunt <strong>bots and bot-like behavior</strong> and shut
              scrapers down. Unattended harvest is not viable—and not our path.
            </li>
            <li>
              Capture must be a <strong>real person browsing</strong>, made{" "}
              <strong>as automatic as possible</strong> while they do—deep
              capture, ready packages, media download, human-gated upload.
            </li>
          </ul>
        </section>

        <section aria-labelledby="backup-heading">
          <h2 id="backup-heading">A backup network for mutual aid</h2>
          <p>
            Important posts get buried in the maze, starve for attention, and
            people get banned from groups. Platforms often feel designed to
            prevent neighbors from helping each other.
          </p>
          <p>
            <strong>MyProblem is a backup network.</strong> As long as one
            person in a community stays connected, refined, useful, non-spam
            knowledge can continue—always human-controlled. Real-world problems
            that exist (and are not private-property secrets) are fair to
            surface publicly. That includes{" "}
            <strong>stray cats and colony problems</strong>. Clevertree Chat can
            keep debate and solutions attached to a ticket so the argument does
            not evaporate when the feed moves on.
          </p>
        </section>

        <section aria-labelledby="what-heading">
          <h2 id="what-heading">What it does today</h2>
          <ol>
            <li>
              <strong>Capture / Deep capture</strong> — harvest viewable posts
              (and open threads) while you scroll. Local session; PII scrub
              before export. Nextdoor groups first.
            </li>
            <li>
              <strong>Per-post tickets</strong> — each post is a candidate.
              Topics for qualifiers; outliers (promo, off-topic) counted, not
              minted as tips.
            </li>
            <li>
              <strong>Mark ready · validate · upload (gated)</strong> — package
              a batch locally; re-validate by walking again; upload only when
              there is new outbound work (Intake wiring in progress).
            </li>
            <li>
              <strong>Media with the batch</strong> — download images/video
              already on the page for ticket candidates. Batch later chooses
              public stills; no auto-publish of raw video.
            </li>
            <li>
              <strong>Reply-assist</strong> — batch AI drafts templates from
              research. The extension pastes. <strong>You</strong> edit and
              click Send. Never auto-posts.
            </li>
          </ol>
        </section>

        <section aria-labelledby="install-heading">
          <h2 id="install-heading">Install (MVP)</h2>
          <p>
            Chrome Web Store listing comes later. For now, load unpacked from
            the repo:
          </p>
          <ol>
            <li>
              Clone{" "}
              <a
                href="https://gitlab.com/clevertree/myproblem"
                rel="noopener noreferrer"
                target="_blank"
              >
                myproblem
              </a>{" "}
              (invite may be required).
            </li>
            <li>
              Open <code>chrome://extensions</code> → Developer mode →{" "}
              <strong>Load unpacked</strong>.
            </li>
            <li>
              Select <code>extensions/capture</code>.
            </li>
            <li>
              Open a logged-in group feed → the toolbar icon appears only on
              social hosts → click it → <strong>Fix connection</strong> if
              needed → <strong>Capture</strong> or <strong>Deep capture</strong>.
            </li>
          </ol>
          <p>
            Details:{" "}
            <a
              href="https://gitlab.com/clevertree/myproblem/-/blob/main/extensions/capture/README.md"
              rel="noopener noreferrer"
              target="_blank"
            >
              extensions/capture/README.md
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="roadmap-heading">
          <h2 id="roadmap-heading">Where this is going</h2>
          <ul>
            <li>
              Intake sync of ready batches + media inbox → Batch frame-select and
              tip mint (today: export / Cursor-as-batch).
            </li>
            <li>
              Channel feeds where subscribers see qualifying tickets without
              living inside one platform’s maze.
            </li>
            <li>
              Clevertree Chat on tickets so debate consolidates instead of
              scattering across buried comments.
            </li>
            <li>More networks beyond the Nextdoor pilot.</li>
            <li>
              The same posture everywhere: capture smart, investigate thoroughly
              in batch, publish only what is safe and useful—build the next
              internet in public, one real problem at a time.
            </li>
          </ul>
        </section>

        <section aria-labelledby="limits-heading">
          <h2 id="limits-heading">Honest Limits</h2>
          <ul>
            <li>No bot farms or headless login scrape.</li>
            <li>No auto-posting replies without your click.</li>
            <li>No automatic server upload without your gated action.</li>
            <li>
              Scrub phones, payment handles, and street-like lines before share;
              Batch handles public stills for deferred media.
            </li>
            <li>Pilot starts with Nextdoor groups (e.g. Savannah stray cats).</li>
          </ul>
        </section>

        <p className="legal-footer-note">
          <a href="/#si-different">{SI_FOOTER_GLOSS}</a> Related:{" "}
          <Link href="/submit">Try it now</Link> · <Link href="/dev">Dev</Link> ·{" "}
          <Link href="/t/garage-ring-power">Pilot ticket</Link> ·{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </main>
    </>
  );
}
