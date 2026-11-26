import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { PublicChatShell } from "@/components/chat/PublicChatShell";
import { resolveChannel } from "@/lib/chat/channels";
import {
  BUSINESS_PDF_PATH,
  CONTACT_EMAIL,
  RELAY_URL,
  SITE_URL,
  SI_FULL,
  SI_FOOTER_GLOSS,
} from "@/lib/contact";

const VIRTUES = [
  {
    title: "Max and simple",
    body: "Full help behind few modes. Public chat and AI are free forever — anonymous first, no paywall.",
  },
  {
    title: "Thorough over instant",
    body: "A free investigation waits for capacity instead of a shorter answer.",
  },
  {
    title: "Silence is allowed",
    body: "A shop can ignore a request. No timer, no score, no duty to answer.",
  },
  {
    title: "No boosting",
    body: "Nobody pays to rank a lesson or a business above another.",
  },
  {
    title: "No card expected",
    body: "Using public help never becomes a bill. Private chat is the paid lane later — not this room.",
  },
  {
    title: "Anonymous by default",
    body: "Core help does not require an account. Ask in the public room so publicity is obvious.",
  },
] as const;

export default function HomePage() {
  const general = resolveChannel("mp-general");

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <SiteHeader variant="home" />

      <main id="main">
        <section className="hero hero-chat" aria-labelledby="hero-heading">
          <div className="hero-bar">
            <div className="site hero-bar-inner">
              <p className="eyebrow">
                Public utility · Georgia &amp; Israel pilots · Work in progress →{" "}
                <a href="/dev">Dev</a>
              </p>
              <h1 id="hero-heading" className="hero-title">
                MyProblem
              </h1>
              <p className="hero-lead">
                Ask in the <strong className="emph">public room</strong>. History
                is visible; AI and people help in-channel. Public chat + AI stay{" "}
                <strong className="emph">free forever</strong>. Powered by{" "}
                <a href={RELAY_URL} rel="noopener noreferrer" target="_blank">
                  Relay
                </a>
                . <a href="/how-we-run">How we run</a>.
              </p>
              <div className="cta-row">
                <a className="btn-primary" href="#room">
                  Ask in the public room
                </a>
                <a className="btn-secondary" href="/extension">
                  Be a Networker
                </a>
                <a
                  className="btn-secondary"
                  href={BUSINESS_PDF_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open business one-pager PDF in a new tab"
                >
                  Business one-pager (PDF)
                </a>
              </div>
            </div>
          </div>
          <div className="hero-chat-room site" id="room">
            <PublicChatShell channel={general} />
          </div>
        </section>

        <div className="site">
          <section className="relay-promo" aria-labelledby="networker-heading">
            <h2 id="networker-heading">Be a Networker</h2>
            <p>
              A Networker is anyone who already belongs to the communities they
              want to help — and is willing to sign into a few familiar pages a
              day. That&apos;s it. No new app to learn, no audience to build, no
              schedule to keep.
            </p>
            <p>
              Using the{" "}
              <a href="/extension">Relay browser extension</a>, a Networker
              does{" "}
              <strong className="emph">shallow, session-bound gathering</strong>
              : reading what&apos;s already visible in their logged-in feeds on
              Nextdoor, Facebook, X, Instagram, Reddit, and similar platforms,
              and turning relevant posts into structured tickets. One Networker
              can cover an entire collection of related groups — say, every
              Savannah cat rescue page across five networks — or even several
              collections, as long as the scope stays human-sized.
            </p>
            <p>
              What makes it safe: captures arrive at the AI server in{" "}
              <strong className="emph">batches</strong>, not a live firehose.
              The server scrubs PII, sanitizes photos, reduces video to choice
              stills, and prepares incidents for human or AI review before
              anything posts back as a trim status update on the origin
              networks. Detail overflows into the repo; social feeds only ever
              see the clean version.
            </p>
            <p>
              The people being helped never touch MyProblem. They keep
              scrolling the groups they already scroll. The meta-layer — the
              syncing, the deduping, the cross-network linking — happens
              underneath, in semi-real-time, at whatever cadence the Networkers
              choose.{" "}
              <a href="/networkers">More on the Networker role</a>.
            </p>
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
            <div className="cta-row">
              <a className="btn-primary" href="/extension">
                Get Relay for Networkers
              </a>
            </div>
          </section>

          <section id="businesses" aria-labelledby="businesses-heading">
            <h2 id="businesses-heading">How it works for businesses</h2>
            <p className="section-lead">
              Public help is <strong className="emph">free forever</strong> —
              for shops and for the people you serve. $0 application. $0
              subscription on the public path.{" "}
              <strong className="emph">Max and simple</strong>,{" "}
              <strong className="emph">zero obligation</strong>: open what looks
              like a fit, or ignore entirely. No SLA, no “must respond,” no
              penalty, no per-lead bill for public channels.
            </p>
            <figure className="section-graphic">
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet="/businesses-portrait.jpg"
                  width={576}
                  height={1024}
                />
                <img
                  src="/businesses.jpg"
                  alt="MyProblem for local businesses: free forever on public help, zero obligation — private chat fees later fund infrastructure and pay providers for their time"
                  width={1024}
                  height={512}
                  className="section-graphic-img"
                  decoding="async"
                />
              </picture>
              <figcaption className="sr-only">
                Infographic: free forever public path for local businesses;
                private chat funds infra and provider time.
              </figcaption>
            </figure>
            <ol className="steps">
              <li>
                <strong>Public channels stay free</strong>
                <p>
                  Receive asks from public rooms (or anonymous public posts).
                  Review the dossier when you want. Silence is fine — no
                  invoice for ignoring a request.
                </p>
              </li>
              <li>
                <strong>Unsure customers ask without ringing the desk</strong>
                <p>
                  Link your site (or share a QR) so people can ask in the public
                  room or capture evidence for a thorough deferred Project —
                  without calling the front desk.
                </p>
              </li>
              <li>
                <strong>Private chat is the paid lane (planned)</strong>
                <p>
                  When someone pays for private chat, those fees fund{" "}
                  <strong className="emph">infrastructure</strong> and{" "}
                  <strong className="emph">
                    pay service providers for their time and effort
                  </strong>{" "}
                  — so the unpaid labor of helping people online can become
                  compensated work, not only an offline cash transaction later.
                  Public rooms and public AI stay free. The product stays
                  nonprofit / public-utility framed.
                </p>
              </li>
              <li>
                <strong>Legal stops stay on screen</strong>
                <p>
                  Emergencies and licensed care get redirected. MyProblem is not
                  a replacement for medical or veterinary practice.
                </p>
              </li>
            </ol>
            <div className="people-promise" style={{ marginTop: "1.5rem" }}>
              <h3 id="businesses-money-heading">Free forever · private fees with a purpose</h3>
              <ul aria-labelledby="businesses-money-heading">
                <li>
                  <strong>Public = free forever</strong> — using public channels
                  and AI never requires a card.
                </li>
                <li>
                  <strong>Private fees → infra + providers</strong> — revenue
                  from private chat covers servers and metered AI, and
                  compensates shops and helpers for real time spent solving
                  problems.
                </li>
                <li>
                  <strong>Not lead invoices</strong> — we do not sell ranking or
                  charge per ignored request. Payment is for private
                  conversation value, when that lane ships.
                </li>
              </ul>
            </div>
            <p style={{ marginTop: "1.75rem" }}>
              <a
                className="btn-secondary"
                href={BUSINESS_PDF_PATH}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open business one-pager PDF in a new tab"
              >
                Business one-pager (PDF)
              </a>
            </p>
          </section>

          <section id="people" aria-labelledby="people-heading">
            <h2 id="people-heading">How it works for people</h2>
            <p className="section-lead">
              Ask in the public room first — so publicity is obvious. Core SI
              help in public channels is{" "}
              <strong className="emph">free forever</strong>. Deep investigation
              runs as a Project when capacity allows — thorough, not rushed. You
              should never expect to enter a card for public help.
            </p>
            <figure className="section-graphic">
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet="/people-portrait.jpg"
                  width={768}
                  height={1024}
                />
                <img
                  src="/people.jpg"
                  alt="MyProblem for people: ask in the public room, investigate with SI, connect with local help — free core public help"
                  width={1024}
                  height={512}
                  className="section-graphic-img"
                  decoding="async"
                />
              </picture>
              <figcaption className="sr-only">
                Infographic: public room ask, investigation, local help — free
                forever for public chat and AI.
              </figcaption>
            </figure>
            <ol className="steps">
              <li>
                <strong>Submit in the public room</strong>
                <p>
                  Type, speak, or record video. Media uploads via Bunny; the URL
                  lands in the active IRC channel (default{" "}
                  <code>#mp-general</code>). People and AI see it there.
                </p>
              </li>
              <li>
                <strong>Start a Project when needed</strong>
                <p>
                  When there is no ready solution yet, workers investigate ASAP
                  and completely — local knowledge base first, then Groq /
                  Bedrock / peer APIs. Useful lessons go back into the KB.
                </p>
              </li>
              <li>
                <strong>Local merchants in pilot areas</strong>
                <p>
                  Merchant handoff stays an option in test regions — shops can
                  review a dossier and respond with zero obligation.
                </p>
              </li>
            </ol>
            <div className="people-promise">
              <h3 id="people-promise-heading">What to expect on cost &amp; privacy</h3>
              <ul aria-labelledby="people-promise-heading">
                <li>
                  <strong>Public room is public</strong> — anything you post in{" "}
                  <code>#mp-general</code> (or another public channel) may be
                  seen or saved by anyone. There is no private mode on this path.
                </li>
                <li>
                  <strong>PII stays careful</strong> — prefer city-level context
                  over street addresses in public posts. Secure DM is for later
                  private lanes.
                </li>
                <li>
                  <strong>Free forever for public chat + AI</strong> — no login
                  required for the basics. No card expected.
                </li>
                <li>
                  <strong>Thorough over instant</strong> — deferred Projects
                  wait for capacity so investigations stay complete.
                </li>
                <li>
                  <strong>Donations welcome</strong> — we seek tax-deductible
                  donations to support this as an educational public utility
                  (501(c)(3) framing we are pursuing). See{" "}
                  <a href="/how-we-run">how we run</a>.
                </li>
              </ul>
            </div>
          </section>

          <section id="projects" aria-labelledby="projects-heading">
            <h2 id="projects-heading">
              Projects — capture, queue, batch (not on-demand LLM)
            </h2>
            <p className="section-lead">
              We don’t need live frontier chatbots as the product. We need a{" "}
              <strong className="emph">smart-enough</strong> intake model, a
              public IRC bus for live problems, and batch workers that
              investigate{" "}
              <strong className="emph">ASAP and completely</strong> via{" "}
              <strong className="emph">Groq, Bedrock, and peer providers</strong>
              . Stronger models escalate when the cheap path truly cannot.
            </p>
          </section>

          <section id="plan" aria-labelledby="plan-heading">
            <h2 id="plan-heading">The plan</h2>
            <p className="section-lead">
              Relay-native investigation service. Problems first — not a frontier
              chatbot. The live bus is{" "}
              <strong className="emph">public IRC</strong> (
              <code>#mp-general</code>
              ). Clevertree Chat mounts that room on the homepage. Free forever
              for public chat + AI. Private chat is the paid lane that funds the
              public utility. Why the SI stays ephemeral →{" "}
              <a href="#si-different">Why is this SI different?</a>
            </p>

            <h3 id="plan-now-heading" style={{ marginTop: "1.5rem" }}>
              Now — live / in pilot
            </h3>
            <div className="plan-grid">
              <article>
                <h3>Public room first</h3>
                <p>
                  Homepage embeds <code>#mp-general</code>. Ask in the room
                  (type / speak / video). Unknown <code>/c/…</code> slugs fall
                  back to general — always a room.
                </p>
              </article>
              <article>
                <h3>Clevertree on IRC</h3>
                <p>
                  People talk through{" "}
                  <a href="https://clevertree.chat">Clevertree Chat</a> on the
                  channel — AI processes in-room. SI organizes; it does not vote.
                </p>
              </article>
              <article>
                <h3>Relay for Networkers</h3>
                <p>
                  Primary Networker path: the{" "}
                  <a href="/extension">Relay extension</a> gathers read-only
                  updates from social groups you already visit. Humans still send
                  origin replies.
                </p>
              </article>
              <article>
                <h3>Collection channels</h3>
                <p>
                  Pilot: Savannah Cat Rescue →{" "}
                  <a href="/c/ga-savannah-cat-rescue">
                    #ga-savannah-cat-rescue
                  </a>
                  . Hidden room menu for demo allowlist only.
                </p>
              </article>
              <article>
                <h3>KB + batch SI</h3>
                <p>
                  Public knowledge base cites the live web. Batch SI writes
                  standing lessons — not tip-repo intake as the homepage SoT.
                </p>
              </article>
              <article>
                <h3>Phase 1 batch (Cursor)</h3>
                <p>
                  Intake caches and enqueues. Cursor drains a shared multi-site
                  queue until Phase 2 automation.
                </p>
              </article>
            </div>

            <h3 id="plan-next-heading" style={{ marginTop: "1.75rem" }}>
              Next — planned
            </h3>
            <div className="plan-grid">
              <article>
                <h3>Private chat (paid lane)</h3>
                <p>
                  Metered private rooms fund the public utility. Not shipping
                  billing this pass — document only.
                </p>
              </article>
              <article>
                <h3>Phase 2 provider automation</h3>
                <p>
                  Same queue contract on CPU + Groq / Bedrock / peers. Publicize
                  AI $/request.
                </p>
              </article>
              <article>
                <h3>Relay operator earnings</h3>
                <p>
                  Compliant node operators may later earn on private usage —
                  future, not a live product this pass.
                </p>
              </article>
              <article>
                <h3>Shared queue for all Relay sites</h3>
                <p>
                  Production drain for QuizGate and Clevertree on the same
                  Phase 1→2 path as MyProblem.
                </p>
              </article>
            </div>
          </section>

          <section id="si-different" aria-labelledby="si-different-heading">
            <h2 id="si-different-heading">
              Why is this SI different from other SIs?
            </h2>
            <p className="section-lead">
              MyProblem runs on the same Relay pattern as QuizGate and Clevertree
              Chat: batch {SI_FULL} driven by posted rules and knowledge — on
              metered providers (Groq / Bedrock / peers), not a permanent cloud
              brain you only audit through a retention policy. Public AI stays
              free; donations and (later) private-chat revenue cover servers and
              per-request AI. We aim to show what successful requests cost.
            </p>
            <div className="plan-grid">
              <article>
                <h3>Providers, not our GPU farm</h3>
                <p>
                  Text, audio, stills, and video go through Groq, Bedrock, and
                  other APIs. Intake stays on cheap CPU. Thorough batch work
                  stays affordable because we pay per request — and we want that
                  cost visible.
                </p>
              </article>
              <article>
                <h3>Reconstructed SI, rules as memory</h3>
                <p>
                  Each batch rebuilds the SI from programmed instructions: repo
                  rule sets, KB context, and sometimes per-ticket rules. It has
                  no durable private memory of prior runs beyond those
                  instructions and what the standing store already publishes.
                </p>
              </article>
              <article>
                <h3>Retain only by decision</h3>
                <p>
                  Nothing submitted for a batch becomes permanent until the SI —
                  under those rules — decides it should, and writes the allowed
                  result into the standing store. Scratch dies with the job.
                </p>
              </article>
            </div>
            <div className="people-promise" style={{ marginTop: "1.5rem" }}>
              <h3 id="si-hack-heading">
                Why this is harder to hack than a policy-bound cloud SI
              </h3>
              <p
                style={{
                  margin: "0 0 0.75rem",
                  color: "var(--muted)",
                  lineHeight: 1.55,
                }}
              >
                An always-on cloud stack can publish any retention policy and
                still leave caches, temp disks, logs, and replicas that outlive
                the promise. Here raw batch inputs live on short-lived Intake
                cache and provider calls; standing memory is only what rules
                write. We do not run a long-lived GPU “AI server” holding last
                week’s uploads.
              </p>
              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.55 }}>
                On MyProblem the live bus is public IRC; batch investigation
                only keeps what the rules allow. Public help never requires a
                card.
              </p>
              <p
                style={{
                  margin: "1rem 0 0",
                  color: "var(--muted)",
                  lineHeight: 1.55,
                }}
              >
                Daily anonymous review → next-day product patches:{" "}
                <a href="/how-we-run#daily-ops">how we run · daily ops</a>. Same
                Clevertree loop as{" "}
                <a href="https://quizgate.app/#daily-loop">QuizGate</a>.
              </p>
            </div>
          </section>

          <section id="virtues" aria-labelledby="virtues-heading">
            <h2 id="virtues-heading">How we behave</h2>
            <div className="plan-grid">
              {VIRTUES.map((virtue) => (
                <article key={virtue.title}>
                  <h3>{virtue.title}</h3>
                  <p>{virtue.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="investors" aria-labelledby="investors-heading">
            <h2 id="investors-heading">
              Funding the public utility
            </h2>
            <p className="section-lead">
              <strong className="emph">Public chat + AI are free forever.</strong>{" "}
              The paid lane is <strong className="emph">private chat</strong> —
              fees fund infrastructure and pay service providers for time spent
              helping, so an offline handoff is not the only way helpers get
              paid. We also seek{" "}
              <strong className="emph">tax-deductible donations</strong> under an
              educational public-utility framing (pursuing 501(c)(3)-compatible
              structure; this page is intent, not a legal claim that status
              already exists). Nonprofit posture; public path stays free. See{" "}
              <a href="/how-we-run">How we run</a>,{" "}
              <a href="/privacy">Privacy</a>, and <a href="/terms">Terms</a>.
            </p>
            <figure className="section-graphic">
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet="/investors-portrait.jpg"
                  width={768}
                  height={1024}
                />
                <img
                  src="/investors.jpg"
                  alt="Fund a compatible public utility network: free public chat, private chat as paid lane, donations for educational public utility"
                  width={1024}
                  height={576}
                  className="section-graphic-img"
                  decoding="async"
                />
              </picture>
              <figcaption className="sr-only">
                Infographic: public free forever; private paid; donations for
                public utility.
              </figcaption>
            </figure>
            <div className="investor">
              <h3
                id="investors-compat-heading"
                style={{ margin: "0 0 0.65rem", fontSize: "1.15rem" }}
              >
                Compatibility is the product
              </h3>
              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.55 }}>
                If you stand up hardware or a region, it must remain{" "}
                <strong className="emph">
                  compatible with the world network
                </strong>{" "}
                so problems stay findable under the same conditions. Splintering
                defeats the Relay / MyProblem vision. We are{" "}
                <strong className="emph">not</strong> looking for partners whose
                plan is to clone and go their own way.
              </p>
              <ul aria-labelledby="investors-compat-heading">
                <li>
                  <strong>Public free forever</strong> — rooms like{" "}
                  <code>#mp-general</code> and channel AI stay free
                </li>
                <li>
                  <strong>Private chat funds the mesh</strong> — paid lane, not
                  tip-push on the homepage
                </li>
                <li>
                  <strong>Donations for public utility</strong> — seeking
                  tax-deductible support; careful nonprofit language until
                  entity status is clear
                </li>
                <li>
                  <strong>Zero-payroll LLC posture</strong> — Clevertree LLC
                  (Georgia) / MyProblem product; capital for infra and growth
                </li>
                <li>
                  <strong>Intent ≠ agreement</strong> — nothing here binds
                  either side until separate paperwork exists
                </li>
              </ul>
              <p
                style={{
                  margin: "1.25rem 0 0",
                  color: "var(--muted)",
                  lineHeight: 1.5,
                }}
              >
                Free forever for public help.{" "}
                <strong className="emph">Max and simple</strong> — anonymous
                first, no paywall. Partners who fit: builders of the shared
                network. Contact{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
            </div>
          </section>

          <section id="regions" aria-labelledby="regions-heading">
            <h2 id="regions-heading">Pilot regions</h2>
            <p className="section-lead">
              We are starting where we can operate tightly — product, merchants,{" "}
              <em>and</em> the problem-solving knowledge base are scoped to
              these places only. Expand by request, as new region partitions —
              not one global brain.
            </p>
            <ul className="regions">
              <li className="chip">
                <span className="chip-dot" aria-hidden="true" />
                Georgia, USA
              </li>
              <li className="chip">
                <span className="chip-dot" aria-hidden="true" />
                Israel
              </li>
            </ul>
            <p style={{ marginTop: "1.25rem" }}>
              <a className="btn-primary" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("MyProblem region interest")}`}>
                Email region interest
              </a>
              {" "}
              <a className="btn-secondary" href="/dev">
                Help build it
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="site footer" role="contentinfo">
        <div className="footer-brand">
          <Image
            src="/icons/icon-64.png"
            alt=""
            width={40}
            height={40}
            className="brand-mark"
          />
          <strong>MyProblem</strong>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <span aria-hidden="true"> · </span>
          <a href="/#room">Public room</a>
          <span aria-hidden="true"> · </span>
          <a href="/extension">Relay for Networkers</a>
          <span aria-hidden="true"> · </span>
          <a href="/how-we-run">How we run</a>
          <span aria-hidden="true"> · </span>
          <a href="/dev">Dev</a>
          <span aria-hidden="true"> · </span>
          <a
            href={BUSINESS_PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open business one-pager PDF in a new tab"
          >
            Business PDF
          </a>
          <span aria-hidden="true"> · </span>
          <a href={RELAY_URL} rel="noopener noreferrer" target="_blank">
            Powered by Relay
          </a>
          <span aria-hidden="true"> · </span>
          <a href={SITE_URL}>{SITE_URL.replace("https://", "")}</a>
          <span aria-hidden="true"> · </span>
          <a href="/terms">Terms</a>
          <span aria-hidden="true"> · </span>
          <a href="/privacy">Privacy</a>
          <span aria-hidden="true"> · </span>
          <a href="/sitemap.xml">Sitemap</a>
        </nav>
        <p>
          <a href="/#si-different">{SI_FOOTER_GLOSS}</a> Operated by Clevertree
          LLC (Georgia). Pilots in Georgia and Israel. Public chat + AI free
          forever. Built on{" "}
          <a href={RELAY_URL} rel="noopener noreferrer" target="_blank">
            Relay
          </a>
          .
        </p>
      </footer>
    </>
  );
}
