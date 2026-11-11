import Image from "next/image";
import { SignupForm } from "@/components/SignupForm";
import { SiteHeader } from "@/components/SiteHeader";
import {
  BUSINESS_PDF_PATH,
  CONTACT_EMAIL,
  RELAY_URL,
  SITE_URL,
} from "@/lib/contact";

const VIRTUES = [
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
    body: "A busy queue is an honest wait. Using the service never becomes a bill.",
  },
  {
    title: "Anonymous by default",
    body: "Core help does not require an account. Private ticket data stays private.",
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
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-bar">
            <div className="site hero-bar-inner">
              <p className="eyebrow">
                Pilots in Georgia and Israel. The product is not finished.
              </p>
              <h1 id="hero-heading" className="hero-title">
                Free for local businesses. Thorough help for people.
              </h1>
              <p className="hero-lead">
                A shop sends unsure people into a ticket instead of a phone
                loop. While they talk and show the problem, one question stays
                on screen until the requirements are specific. The person gets a
                real investigation before anyone has to meet. You should never
                expect to enter a card. If the help was good, tip the person,
                the AI, or both.
              </p>
              <p className="powered-by">
                Powered by{" "}
                <a href={RELAY_URL} rel="noopener noreferrer" target="_blank">
                  Relay
                </a>
                . No salaries, and no card required.{" "}
                <a href="/how-we-run">How we run</a>.
              </p>
              <div className="cta-row">
                <a className="btn-primary" href="#signup">
                  Join the business waitlist
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
          <div className="hero-media">
            <div className="hero-wings" aria-hidden="true" />
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet="/hero-portrait.jpg"
                width={576}
                height={1024}
              />
              <img
                src="/hero.jpg"
                alt="Night illustration of a phone showing a backyard-gate problem in progress, linked by glowing lines to a house, a local shop, and a laptop."
                width={1024}
                height={576}
                className="hero-photo"
                decoding="async"
              />
            </picture>
          </div>
        </section>

        <div className="site">
          <section id="businesses" aria-labelledby="businesses-heading">
            <h2 id="businesses-heading">How it works for businesses</h2>
            <p className="section-lead">
              $0 application. $0 subscription. Free forever — and{" "}
              <strong className="emph">zero obligation</strong>. Incoming
              requests work like a social feed: open what looks like a fit, or{" "}
              <strong className="emph">ignore entirely</strong> when you have
              no time or it is not for you. No SLA, no “must respond,” no
              penalty, no per-lead bill. You should never expect to enter a
              card. If the help was good, a tip is welcome — never required.
              Unsure people get a thorough deferred Project first so when you{" "}
              <em>do</em> engage, the dossier is real.
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
                  alt="MyProblem for local businesses: free forever, no obligation — receive requests, review the AI dossier, accept or ignore entirely like a social feed"
                  width={1024}
                  height={512}
                  className="section-graphic-img"
                  decoding="async"
                />
              </picture>
              <figcaption className="sr-only">
                Infographic: free forever, no-obligation workflow for local
                businesses and service providers.
              </figcaption>
            </figure>
            <ol className="steps">
              <li>
                <strong>Sign up at zero</strong>
                <p>
                  No application fee, no monthly bill, no per-lead invoice. You
                  show up as a local option when a Problem needs a real pro —
                  still with no duty to answer anyone.
                </p>
              </li>
              <li>
                <strong>Unsure customers create tickets — not phone calls</strong>
                <p>
                  MyProblem does <strong className="emph">not</strong> answer
                  your shop’s phone (yet). Link your site (or share a QR) to
                  ticket creation: people record audio, add stills, and get a
                  thorough deferred Project. Same outcome as “call first” —
                  without ringing the front desk. VoIP automation is a planned
                  later investment.
                </p>
              </li>
              <li>
                <strong>Engage only if you want to</strong>
                <p>
                  Photos, facts, and Project notes sit on the dossier. Accept,
                  bid, ask a question — or ignore the request entirely. Same
                  freedom as skipping a post in a social network. No score
                  hit, no timeout threat, no invoice for silence.
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
              Get thorough help — anonymously or with an account. Core AI help
              is <strong className="emph">free, private, and forever</strong>.
              Personal identifiers stay on{" "}
              <strong className="emph">your device</strong> by default; the
              network ticket is auto-scrubbed to safe context. Deep
              investigation runs as a Project when capacity allows — thorough,
              not rushed. You should never expect to enter a card. If the help
              was good, tip the person, the AI, or both.
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
                  alt="MyProblem for people: investigate a problem with AI, solve it yourself or get a recommendation, then connect with local help — free core help, anonymous mode, optional tip"
                  width={1024}
                  height={512}
                  className="section-graphic-img"
                  decoding="async"
                />
              </picture>
              <figcaption className="sr-only">
                Infographic: anonymous or account mode, three steps from ticket
                to local help, free forever with optional tip.
              </figcaption>
            </figure>
            <ol className="steps">
              <li>
                <strong>Capture a new Problem (ticket)</strong>
                <p>
                  Real-time AI helps only while you gather evidence — camera
                  coaching and clarifying questions — so the ticket is complete.
                  Deep answers are not expected in that live session.
                </p>
              </li>
              <li>
                <strong>Start a Project — queued batch investigation</strong>
                <p>
                  When there is no ready solution yet, the ticket joins a
                  status queue. Workers investigate ASAP and completely —
                  local knowledge base first (problem-solving lessons, not a
                  copy of Google), then tools; Bedrock only if truly stuck.
                  Useful lessons go back into the KB so we don’t forget.
                  Timeline updates land in the app (and email if you want).
                </p>
              </li>
              <li>
                <strong>Submit to local merchants anytime (test areas)</strong>
                <p>
                  Merchant handoff is always an option — before, during, or after
                  a Project. In pilot regions, send the ticket so nearby shops
                  can review the dossier and respond on the same timeline.
                </p>
              </li>
            </ol>
            <div className="people-promise">
              <h3 id="people-promise-heading">What to expect on cost &amp; privacy</h3>
              <ul aria-labelledby="people-promise-heading">
                <li>
                  <strong>PII stays on your device</strong> — phones, browsers,
                  and local backups. Exact addresses, phone numbers, and other
                  personal identifiers are{" "}
                  <strong className="emph">not</strong> stored or cached on our
                  servers or the shared ticket network unless a service provider
                  has a real need and you release them.
                </li>
                <li>
                  <strong>Automatic PII conversion</strong> — when the AI packs
                  a ticket, spoken or typed personal detail becomes safe
                  context (e.g. city or a coarse location band) so helpers can
                  work without your street address living on the mesh.
                </li>
                <li>
                  <strong>Only on request, via secure DM</strong> — if a pro
                  needs something personal, it moves in a two-way secure direct
                  channel — not into the public ticket dossier or network cache.
                </li>
                <li>
                  <strong>Free forever</strong> for core private / anonymous AI
                  help — no login required for the basics. No card expected.
                </li>
                <li>
                  <strong>Thorough over instant</strong> — deferred Projects
                  wait for capacity so investigations stay complete.
                </li>
                <li>
                  <strong>Optional tip</strong> — if the help was good, tip the
                  person, the AI, or both. Never required. See{" "}
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
              We don’t need live frontier chatbots or on-demand premium vision.
              We need a <strong className="emph">smart-enough</strong> intake
              model, a <strong className="emph">JIRA-style ticket queue</strong>,
              and batch workers that investigate{" "}
              <strong className="emph">ASAP and completely</strong> — including
              advanced photo analysis and generation at minimal cost (Hugging
              Face / Spot first). Bedrock is a{" "}
              <strong className="emph">rare backbone escalate</strong> when the
              cheap path truly cannot.
            </p>
            <div className="project-flow" role="list">
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">1 · Live</p>
                <h3>Capture requirements</h3>
                <p>
                  Camera coaching and clarifying questions gather photos,
                  constraints, and what’s been tried. Smart enough to fill the
                  ticket — not to burn Sonnet on every frame.
                </p>
              </article>
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">2 · Queue</p>
                <h3>Ticket by status</h3>
                <p>
                  Packaged Problems join a status queue like JIRA —
                  uninvestigated, in progress, blocked, done. Merchant submit
                  stays available anytime beside the Project.
                </p>
              </article>
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">3 · Batch</p>
                <h3>Investigate ASAP + completely</h3>
                <p>
                  Workers drain the queue when Spot frees: local KB and cache
                  first (how to solve it here — not a freeze-frame of the
                  internet), then Hugging Face / open VL, optional diagrams,
                  and mid LLMs. Dig until DIY, need-more-evidence,
                  merchant-ready, or closed — no redundant repeats.
                </p>
              </article>
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">4 · Escalate</p>
                <h3>Bedrock only when stuck</h3>
                <p>
                  Advanced math, rare language, or photo understanding/gen that
                  open models can’t handle → one frontier call, then write the
                  useful residue into the KB and cache. Priority shortens the
                  queue; it does not invent live on-demand LLM or image APIs.
                </p>
              </article>
            </div>
            <div className="people-promise" style={{ marginTop: "1.75rem" }}>
              <h3 id="projects-why-heading">Why this beats on-demand deep LLM</h3>
              <ul aria-labelledby="projects-why-heading">
                <li>
                  <strong>Lower cost</strong> — batching + Spot + cache beats
                  reserved GPUs and per-turn Sonnet.
                </li>
                <li>
                  <strong>No corner-cutting</strong> — free tier waits for
                  capacity instead of a silently weaker instant model.
                </li>
                <li>
                  <strong>Non-redundant</strong> — same normalized question
                  hits cache / local KB; frontier is for unique misses.
                </li>
                <li>
                  <strong>Honest timing</strong> — ETA + timeline updates, not
                  a fake instant answer.
                </li>
              </ul>
            </div>
          </section>

          <section id="knowledge" aria-labelledby="knowledge-heading">
            <h2 id="knowledge-heading">
              Knowledge for solving problems — not for search ads
            </h2>
            <p className="section-lead">
              A core job of MyProblem is knowing the{" "}
              <strong className="emph">
                best way to solve a problem with local resources
              </strong>{" "}
              — the layer competitive search rankings and ads fight over. Our
              shared knowledge base (Georgia &amp; Israel) stores that kind of
              lesson, plus DIY advice when location does not matter. It is{" "}
              <strong className="emph">speculative</strong>: built from{" "}
              <strong className="emph">user contributions</strong> and{" "}
              <strong className="emph">AI investigations</strong> only.{" "}
              <strong className="emph">No boosting</strong>, no paid ranking,
              no freeze-frame of the greater internet.
            </p>
            <div className="project-flow" role="list">
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">Purpose</p>
                <h3>Problem-solving only</h3>
                <p>
                  We write what helps the app solve tickets: local resource
                  paths, ticket-driven assessments, and general advice when
                  place does not matter — including how to stand up a modern
                  website nearly for free. We do not copy hours, phones, or
                  pages you can already find online — those keep changing; we
                  cite them live instead.
                </p>
              </article>
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">Honesty</p>
                <h3>Speculative · no boost</h3>
                <p>
                  Everything in the KB is provisional investigation assistance
                  from users and AI — never algorithmically boosted for money
                  or engagement. Business pages appear only when a Project
                  thoroughly investigated that shop for a real ticket.
                </p>
              </article>
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">Learn</p>
                <h3>Re-test · refine · don’t forget</h3>
                <p>
                  Useful advice is proven over time on new tickets. When it
                  stops helping, we refine or ditch it — and keep history so we
                  never throw away what we learned.
                </p>
              </article>
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">Channels</p>
                <h3>Anything with a unique id</h3>
                <p>
                  Associate tickets with a public channel id — house, street,
                  town, Wi-Fi, Bluetooth beacon — so subscribers see place
                  grain without passwords. PII stays client-side unless you
                  release it by secure DM.
                </p>
              </article>
            </div>
            <div className="people-promise" style={{ marginTop: "1.75rem" }}>
              <h3 id="knowledge-why-heading">Why this beats directory scrapes</h3>
              <ul aria-labelledby="knowledge-why-heading">
                <li>
                  <strong>Anti-ad ranking</strong> — we refuse boosting; search
                  wars stay outside the product.
                </li>
                <li>
                  <strong>No internet cache</strong> — searchable facts stay on
                  the live web; the KB holds problem-solving residue.
                </li>
                <li>
                  <strong>Continuous learning</strong> — re-test advice; refine
                  or retire; keep the trail.
                </li>
                <li>
                  <strong>Pilots stay dense</strong> — Georgia and Israel only
                  for now; depth over world sprawl.
                </li>
              </ul>
            </div>
          </section>

          <section id="plan" aria-labelledby="plan-heading">
            <h2 id="plan-heading">The plan</h2>
            <p className="section-lead">
              Relay-native investigation service. Problems not chats. Projects
              for thorough deferred research. A shared knowledge base for
              problem-solving — including how to put a modern site online nearly
              for free.{" "}
              <strong className="emph">Major coming soon:</strong> batched
              automated coding, networking, documents, and heavy digital jobs —
              thorough finish when capacity allows, not a realtime Cursor-style
              chat. Local businesses free forever. Tips optional — never a
              required card.
            </p>
            <div className="plan-grid">
              <article>
                <h3>Problems, not chats</h3>
                <p>
                  Context is the Problem record — photos, facts, stops,
                  attempts, status. The model gets a compiled brief, not a
                  rolling token dump.
                </p>
              </article>
              <article>
                <h3>Queue + batch, not on-demand LLM</h3>
                <p>
                  Smart capture → status queue → batch investigate ASAP
                  (HF/Spot photo analysis + gen). Bedrock only for rare unique
                  misses; priority shortens wait, not live Sonnet or image APIs.
                </p>
              </article>
              <article>
                <h3>Knowledge for problem-solving</h3>
                <p>
                  Ticket-earned lessons for Georgia and Israel — local resource
                  wisdom and DIY when place does not matter (including a
                  nearly-free website path via free-tier hosting). Speculative
                  (users + AI only); no boosting; never a cache of the public
                  web. Re-test, refine, or ditch — don’t forget.
                </p>
              </article>
              <article>
                <h3>Batched coding &amp; digital work — coming soon</h3>
                <p>
                  Not a realtime Cursor/Codex clone. Leave proper instructions;
                  a batch worker pulls the repo or files, completes the ask,
                  hardens and tests, deploys when needed, and notifies you —
                  including websites on a free host like Vercel (domain as the
                  main yearly cost), docs, spreadsheets, networking setup, and
                  heavy render-style pipelines that purge scratch afterward.{" "}
                  <strong className="emph">Check back soon.</strong>
                </p>
              </article>
              <article>
                <h3>Businesses free forever</h3>
                <p>
                  Default promise: no shop invoice and no obligation to answer.
                  Ignore any request like a social feed. Charging businesses
                  later is Plan B only — dangerous to the pitch if tips already
                  keep the mesh alive.
                </p>
              </article>
              <article>
                <h3>Spot free / thorough wait</h3>
                <p>
                  Free Projects drain elastic Spot GPUs (cheap heavy hardware
                  only when needed — same idea we teach for your own stacks via
                  Spot + modern agents/MCP). A busy Spot is an honest queue —
                  never a surprise bill to the shop, and never a required card
                  for the person.
                </p>
              </article>
              <article>
                <h3>Narrow pilots first</h3>
                <p>
                  Home repair and simple glasses; careful clinic/vet-style
                  triage with redirect as product. No doctor marketplace on day
                  one. KB locked to the same two regions.
                </p>
              </article>
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
              Investors — one world network, not splinter IP
            </h2>
            <p className="section-lead">
              We want partners who help{" "}
              <strong className="emph">grow a compatible world network</strong>{" "}
              — local hardware and ops that stay interoperable with the shared
              ticket system — not clones that fragment the mesh into private
              islands. This page states{" "}
              <strong className="emph">intent only</strong>; it is not an offer
              or a signed deal. Early adopters may later need a separate
              contract. See also{" "}
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
                  alt="For investors: fund compatible local hardware in the world network; economics favor local handlers; tickets shared under one interoperable system — not a splintered clone"
                  width={1024}
                  height={576}
                  className="section-graphic-img"
                  decoding="async"
                />
              </picture>
              <figcaption className="sr-only">
                Infographic: regional investment that stays compatible with the
                shared ticket network; economics favor local hardware handlers.
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
                  compatible with the world network and the existing ticket
                  system
                </strong>{" "}
                so Problems can be found and shared under the same conditions
                everywhere. Splintering — forking a private incompatible stack,
                walling tickets, or treating the mesh as disposable IP to
                rebrand alone — defeats the Relay / MyProblem vision. We are{" "}
                <strong className="emph">not</strong> looking for investors
                whose plan is to clone and go their own way.
              </p>
              <ul aria-labelledby="investors-compat-heading">
                <li>
                  <strong>One ticket fabric</strong> — same Problem / tip
                  conditions; discoverable across compatible nodes
                </li>
                <li>
                  <strong>Economics favor local hardware handlers</strong> —
                  people running compatible gear in place, not a salary machine
                  at the center
                </li>
                <li>
                  <strong>Zero-payroll LLC posture</strong> — Clevertree LLC
                  (Georgia) / MyProblem product; capital for infra and growth,
                  not headcount theater. Tips replace salaries — see{" "}
                  <a href="/how-we-run">how we run</a>
                </li>
                <li>
                  <strong>Intent ≠ agreement</strong> — we may require contracts
                  with early hardware / region adopters; nothing here binds
                  either side until that paperwork exists
                </li>
              </ul>
              <p
                style={{
                  margin: "1.25rem 0 0",
                  color: "var(--muted)",
                  lineHeight: 1.5,
                }}
              >
                Shops stay free forever. People should never expect to enter a
                card. Optional tips after good help keep the mesh alive —
                residual margin is not from invoicing businesses. Investors who
                fit: builders of the shared network. Contact{" "}
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
              not one global brain. Both markets already use ChatGPT/Gemini; we
              win on thorough deferred Projects and local resource wisdom search
              ads bury — not another chatbot or hire-first lead app.
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
            <div className="people-promise" style={{ marginTop: "1.5rem" }}>
              <h3 id="regions-why-heading">Why these two first</h3>
              <ul aria-labelledby="regions-why-heading">
                <li>
                  <strong>Georgia</strong> — LLC home, English product, US
                  rails; DIY baseline is ChatGPT then Thumbtack-class
                  marketplaces.
                </li>
                <li>
                  <strong>Israel</strong> — on-ground ops, Hebrew/bilingual UX;
                  denser AI→local-pro apps plus the same global LLMs — we still
                  differentiate on tickets, batch investigation, and a local KB.
                </li>
              </ul>
            </div>
            <p
              style={{
                color: "var(--muted)",
                maxWidth: "36rem",
                lineHeight: 1.55,
                marginTop: "1.25rem",
              }}
            >
              Want MyProblem in your city or country? Tell us — we track region
              interest and prioritize where businesses and people both show up.
            </p>
            <p style={{ marginTop: "1.25rem" }}>
              <a className="btn-primary" href="#signup">
                Request your region
              </a>
            </p>
          </section>

          <section id="signup" aria-labelledby="signup-heading">
            <h2 id="signup-heading">Get on the list</h2>
            <p className="section-lead" id="signup-lead">
              Businesses, people with Problems, investors, and region interest —
              fill the form to open your mail app with a prefilled message, or
              write us anytime at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
            <SignupForm defaultRole="business" id="waitlist" />
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
          <a href="/how-we-run">How we run</a>
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
          Operated by Clevertree LLC (Georgia). Pilots in Georgia and Israel.
          The product is not finished. You should never expect to enter a
          card. Built on{" "}
          <a href={RELAY_URL} rel="noopener noreferrer" target="_blank">
            Relay
          </a>
          . See <a href="/privacy">Privacy</a> and <a href="/terms">Terms</a>.
        </p>
      </footer>
    </>
  );
}
