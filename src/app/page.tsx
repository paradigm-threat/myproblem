import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { OpenChatButton } from "@/components/chat/OpenChatButton";
import {
  BUSINESS_PDF_PATH,
  CONTACT_EMAIL,
  RELAY_URL,
  SITE_URL,
  SI_FULL,
  SI_FOOTER_GLOSS,
} from "@/lib/contact";

const PRINCIPLES = [
  {
    title: "Simple Max",
    body: "Minimal UI by default; advanced tools stay available but out of the way. Full capability on the public path—no premium unlocks, ads, or artificial feature gates.",
  },
  {
    title: "Thorough over instant",
    body: "Investigations wait for capacity rather than cutting corners for speed.",
  },
  {
    title: "Silence is allowed",
    body: "Businesses may ignore a public request. No response timer, score, or penalty.",
  },
  {
    title: "No paid ranking",
    body: "Lessons and businesses are not sold ranking positions.",
  },
  {
    title: "No card for public help",
    body: "Public chat and AI do not require payment. Private chat is a separate paid lane when it ships.",
  },
  {
    title: "Anonymous by default",
    body: "Public help does not require an account. Ask in the public room so visibility is clear.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <SiteHeader variant="home" />

      <main id="main">
        <section className="hero" aria-labelledby="hero-heading" id="room">
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
                Ask in the <strong className="emph">public room</strong>. Posts
                are visible. People and SI help in-channel. Public chat and AI
                stay <strong className="emph">free</strong>. Open{" "}
                <strong className="emph">Chat</strong> in the header (extension
                side panel when installed).
              </p>
              <div className="cta-row">
                <OpenChatButton submit>
                  Type / speak / video
                </OpenChatButton>
                <OpenChatButton className="btn-secondary">
                  Open the room
                </OpenChatButton>
                <a className="btn-secondary" href="/extension">
                  Be a Networker
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="site">
          <section id="simple-max" aria-labelledby="simple-max-heading">
            <h2 id="simple-max-heading">Simple Max</h2>
            <p className="section-lead">
              Relay follows a product principle called{" "}
              <strong className="emph">Simple Max</strong>.
            </p>
            <ul className="steps" style={{ listStyle: "none", padding: 0 }}>
              <li>
                <strong>Simple</strong>
                <p>
                  The default interface stays minimal. Advanced features remain
                  available, but stay out of the way until needed.
                </p>
              </li>
              <li>
                <strong>Max</strong>
                <p>
                  Capability is not locked behind premium tiers, upsells, or
                  advertising. Limits exist only for capacity and safety—not as
                  a funnel.
                </p>
              </li>
            </ul>
            <p style={{ color: "var(--muted)", lineHeight: 1.55 }}>
              Same idea for Networkers: help shows up where people already are;
              they should not need a new app for basic participation. Details:{" "}
              <a href="/networkers">Networkers</a> ·{" "}
              <a href="/how-we-run">How we run</a>.
            </p>
          </section>

          <section className="relay-promo" aria-labelledby="networker-heading">
            <h2 id="networker-heading">Networkers</h2>
            <p>
              A Networker already belongs to the communities they help and can
              sign into those sites as part of normal use. No separate audience
              to build; no mandatory schedule.
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
              Public help is free for shops and for the people they serve. No
              application fee. No subscription on the public path. Respond when
              a request fits; ignore when it does not. No SLA, no penalty, no
              per-lead charge for public channels.
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
              <h3 id="businesses-money-heading">Public free · private fees for capacity</h3>
              <ul aria-labelledby="businesses-money-heading">
                <li>
                  <strong>Public path stays free</strong> — public channels and
                  AI do not require a card.
                </li>
                <li>
                  <strong>Private fees cover capacity</strong> — when private
                  chat ships, fees fund infrastructure, metered AI, and paid
                  provider time.
                </li>
                <li>
                  <strong>Not lead sales</strong> — no ranking fees and no charge
                  for ignored public requests. Payment is for private service
                  when that lane ships.
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
              Ask in the public room so the request is openly visible. Public
              channel help is free. Deeper investigation runs as a Project when
              capacity allows. Public help does not require a card.
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
                  <strong>Public chat and AI stay free</strong> — no login
                  required for basic use; no card on that path.
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
              Intake uses a capable but economical model, a public IRC bus for
              live problems, and batch workers that investigate via Groq,
              Bedrock, and peer providers. Stronger models escalate when the
              cheaper path cannot finish the job.
            </p>
          </section>

          <section id="plan" aria-labelledby="plan-heading">
            <h2 id="plan-heading">Roadmap</h2>
            <p className="section-lead">
              Relay-native investigation. Live traffic runs on public IRC (
              <code>#mp-general</code>
              ). Clevertree Chat opens from the header. Public chat and AI stay
              free; private chat is the paid lane that funds capacity. SI design:{" "}
              <a href="#si-different">Why this SI is different</a>.
            </p>

            <h3 id="plan-now-heading" style={{ marginTop: "1.5rem" }}>
              Live / in pilot
            </h3>
            <div className="plan-grid">
              <article>
                <h3>Public room first</h3>
                <p>
                  Header Chat opens <code>#mp-general</code> fullscreen (or the
                  extension side panel). Type, speak, or video. Unknown{" "}
                  <code>/c/…</code> slugs fall back to general.
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
            <h2 id="virtues-heading">Operating principles</h2>
            <div className="plan-grid">
              {PRINCIPLES.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="investors" aria-labelledby="investors-heading">
            <h2 id="investors-heading">
              Funding the public utility
            </h2>
            <p className="section-lead">
              Public chat and AI stay free. The paid lane is{" "}
              <strong className="emph">private chat</strong>: fees fund
              infrastructure and paid provider time. We also seek tax-deductible
              donations under an educational public-utility framing (pursuing
              501(c)(3)-compatible structure; this page is intent, not a claim
              that status already exists). See{" "}
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
                Regional hardware must stay{" "}
                <strong className="emph">compatible with the wider network</strong>{" "}
                so problems remain findable under shared conditions. Isolated
                forks that abandon Relay interoperability are out of scope.
              </p>
              <ul aria-labelledby="investors-compat-heading">
                <li>
                  <strong>Public path free</strong> — rooms like{" "}
                  <code>#mp-general</code> and channel AI stay free
                </li>
                <li>
                  <strong>Private chat funds capacity</strong> — paid lane; no
                  tip-push on the homepage
                </li>
                <li>
                  <strong>Simple Max</strong> — minimal UI defaults; no premium
                  feature gates on the public path
                </li>
                <li>
                  <strong>Donations</strong> — seeking tax-deductible support;
                  status claims only after the entity exists
                </li>
                <li>
                  <strong>Clevertree LLC (Georgia)</strong> — capital for
                  infrastructure and growth; zero-payroll posture
                </li>
                <li>
                  <strong>Intent is not agreement</strong> — nothing here binds
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
                Contact{" "}
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
          <OpenChatButton className="footer-chat-link">Public room</OpenChatButton>
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
