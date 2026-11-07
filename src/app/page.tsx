import Image from "next/image";
import { SignupForm } from "@/components/SignupForm";
import {
  BUSINESS_PDF_PATH,
  CONTACT_EMAIL,
  SITE_URL,
} from "@/lib/contact";

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <header className="site">
        <div className="nav">
          <a className="brand" href="/" aria-label="MyProblem home">
            <Image
              src="/icons/icon-64.png"
              alt=""
              width={36}
              height={36}
              className="brand-mark"
              priority
            />
            <span>MyProblem</span>
          </a>
          <nav className="nav-links" aria-label="Page sections">
            <a href="#businesses">For businesses</a>
            <a href="#people">For people</a>
            <a href="#projects">Projects</a>
            <a href="#knowledge">Knowledge</a>
            <a href="#investors">Investors</a>
            <a href="#regions">Regions</a>
            <a href="#signup">Signup</a>
            <a href="/demo">Demos</a>
            <a href="/test-mode">Test Mode</a>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-media">
            <Image
              src="/hero.jpg"
              alt="MyProblem — turn any problem into a solution with AI support and local experts"
              width={1024}
              height={341}
              className="hero-photo"
              priority
              sizes="(max-width: 1600px) 100vw, 1600px"
            />
          </div>
          <div className="hero-bar">
            <div className="site hero-bar-inner">
              <h1 id="hero-heading" className="sr-only">
                Turn any problem into a solution
              </h1>
              <p className="eyebrow">Coming soon · Georgia &amp; Israel pilots</p>
              <p className="hero-lead">
                Free forever for local businesses. Capture the ticket, queue it
                like JIRA, batch-investigate thoroughly — Bedrock only when we
                truly need it. Local knowledge for Georgia and Israel.
              </p>
              <div className="cta-row">
                <a className="btn-primary" href="#signup">
                  Join the business waitlist
                </a>
                <a
                  className="btn-secondary"
                  href={BUSINESS_PDF_PATH}
                  download
                  aria-label="Download business one-pager PDF"
                >
                  Download business one-pager (PDF)
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="site">
          <section id="businesses" aria-labelledby="businesses-heading">
            <h2 id="businesses-heading">How it works for businesses</h2>
            <p className="section-lead">
              $0 application. $0 subscription. Preferred stance: free for shops
              forever. Unsure people get a thorough deferred Project first —
              not a rushed chatbot — so when they reach you, the dossier is
              real. Your ROI is time saved and warmer bookings.
            </p>
            <figure className="section-graphic">
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet="/businesses-portrait.jpg"
                  width={768}
                  height={1024}
                />
                <img
                  src="/businesses.jpg"
                  alt="MyProblem for local businesses: receive requests, review the AI investigation dossier, choose accept call or redirect, and manage work — free forever"
                  width={1024}
                  height={512}
                  className="section-graphic-img"
                  decoding="async"
                />
              </picture>
              <figcaption className="sr-only">
                Infographic: free forever workflow for local businesses and
                service providers.
              </figcaption>
            </figure>
            <ol className="steps">
              <li>
                <strong>Sign up at zero</strong>
                <p>
                  No application fee, no monthly bill, no per-lead invoice. You
                  show up as a local option when a Problem needs a real pro.
                </p>
              </li>
              <li>
                <strong>AI takes the unsure callers first</strong>
                <p>
                  People capture tickets in realtime; deep research runs as
                  deferred Projects when capacity is free. Routine “is this
                  urgent?” and redirect loops never reach the secretary.
                </p>
              </li>
              <li>
                <strong>Open a Problem tip when it is real</strong>
                <p>
                  Photos, facts, and Project investigation notes are already on
                  the dossier timeline. Accept, decline, or bid — then the deal
                  is between you and them.
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
                download
                aria-label="Download printable PDF for your partners"
              >
                Printable PDF for your partners
              </a>
            </p>
          </section>

          <section id="people" aria-labelledby="people-heading">
            <h2 id="people-heading">How it works for people</h2>
            <p className="section-lead">
              Get thorough help — anonymously or with an account. Core AI help
              is <strong className="emph">free, private, and forever</strong>.
              Live sessions only capture your ticket; deep investigation runs as
              a Project when capacity allows — so the AI never has to cut
              corners for speed.
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
                  alt="MyProblem for people: investigate a problem with AI, solve it yourself or get a recommendation, then connect with local help in test areas — free core help, anonymous mode, fees only for infrastructure"
                  width={1024}
                  height={512}
                  className="section-graphic-img"
                  decoding="async"
                />
              </picture>
              <figcaption className="sr-only">
                Infographic: anonymous or account mode, three steps from ticket
                to local help, infrastructure-only fees.
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
                  cache and local KB first, Bedrock only if truly stuck.
                  Timeline updates land in the app (and email if you want).
                  Many Problems close with AI alone.
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
                  <strong>Free forever</strong> for core private / anonymous AI
                  help — no login required for the basics.
                </li>
                <li>
                  <strong>Thorough over instant</strong> — deferred Projects
                  wait for capacity so investigations stay complete, not
                  truncated for a spinner.
                </li>
                <li>
                  <strong>Account only when you need it</strong> — high-load
                  features like real-time video feed.
                </li>
                <li>
                  <strong>First few ticket / Project uses free</strong> (exact
                  count TBD).
                </li>
                <li>
                  <strong>After that, a small usage fee</strong> — only to keep
                  hardware and software running. We will not take salaries from
                  those fees. Priority shortens the queue; it does not buy a
                  weaker free-tier answer.
                </li>
              </ul>
            </div>
          </section>

          <section id="projects" aria-labelledby="projects-heading">
            <h2 id="projects-heading">Projects — capture, queue, batch (not on-demand LLM)</h2>
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
                  first, then Hugging Face / open VL on Spot for deep photo
                  reads, optional diagram generation, and mid LLMs. Dig until
                  DIY, need-more-evidence, merchant-ready, or closed — no
                  redundant repeats.
                </p>
              </article>
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">4 · Escalate</p>
                <h3>Bedrock only when stuck</h3>
                <p>
                  Advanced math, rare language, or photo understanding/gen that
                  open models can’t handle → one frontier call, then cache the
                  gold for the next identical ask. Priority shortens the queue;
                  it does not invent live on-demand LLM or image APIs.
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
            <h2 id="knowledge-heading">Shared local knowledge — Georgia &amp; Israel</h2>
            <p className="section-lead">
              Global AIs and national directories guess at “near me.” MyProblem
              builds a <strong className="emph">place-tied knowledge base</strong>{" "}
              from every investigation in our pilots — public lessons shared,
              private details protected — so we outcompete on local, realtime,
              Relay-connected truth instead of world-scale trivia.
            </p>
            <div className="project-flow" role="list">
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">Grow</p>
                <h3>Docs from investigations</h3>
                <p>
                  As Projects finish, the AI creates and maintains public
                  documents: common advice, local facts, even rumors — only when
                  they come from reliable or identified sources — continuously
                  updated as more tickets teach the same place.
                </p>
              </article>
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">Scope</p>
                <h3>Must map to a local point</h3>
                <p>
                  The KB is defined for Georgia and Israel only. An article can
                  cover almost any topic, but it has to relate to a geographic
                  point in-region. That keeps growth deep and local — not a
                  second ChatGPT.
                </p>
              </article>
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">Privacy</p>
                <h3>Anonymous unless you project</h3>
                <p>
                  Default is private. You may opt in to publish coarse location
                  or any channel id — Wi-Fi locality, Bluetooth dongle, house
                  alias — never passwords or pairing secrets — without your
                  phone number or full address.
                </p>
              </article>
              <article className="project-flow-card" role="listitem">
                <p className="project-flow-label">Channels</p>
                <h3>Anything with a unique id</h3>
                <p>
                  A channel is just a unique id. Associate tickets with it —
                  house, street, town, Wi-Fi, Bluetooth beacon, or other local
                  tag — and anyone subscribed to that id sees them. Helpers get
                  place grain, not anonymous internet. More signal → more trust.
                </p>
              </article>
            </div>
            <div className="people-promise" style={{ marginTop: "1.75rem" }}>
              <h3 id="knowledge-why-heading">Why local beats global here</h3>
              <ul aria-labelledby="knowledge-why-heading">
                <li>
                  <strong>Realtime local loop</strong> — knowledge updates from
                  live Projects, not a yearly crawl of the open web.
                </li>
                <li>
                  <strong>No fake “everywhere”</strong> — we refuse out-of-region
                  KB sprawl so Georgia and Israel stay dense and useful.
                </li>
                <li>
                  <strong>Trust without doxxing</strong> — subscribe by public
                  channel id (house, Wi-Fi, Bluetooth dongle, …), never secrets.
                </li>
                <li>
                  <strong>Relay-native</strong> — tips and place channels, not
                  another global feed.
                </li>
              </ul>
            </div>
          </section>

          <section id="plan" aria-labelledby="plan-heading">
            <h2 id="plan-heading">The plan</h2>
            <p className="section-lead">
              Relay-native investigation service. Problems not chats. Projects
              for thorough deferred research. A shared local knowledge base for
              pilot regions. Local businesses as free distribution. Consumer
              economics after free uses.
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
                <h3>Local knowledge base</h3>
                <p>
                  Every investigation can enrich public, place-tied docs for
                  Georgia and Israel — redacting private data — plus channels
                  by unique id (place, Wi-Fi, Bluetooth, …) so subscribers see
                  associated tickets locally.
                </p>
              </article>
              <article>
                <h3>Businesses free forever</h3>
                <p>
                  Default promise: no shop invoice. Charging businesses later is
                  Plan B only — dangerous to the pitch and not necessary if
                  consumer fees cover infra.
                </p>
              </article>
              <article>
                <h3>Spot free / reliable paid</h3>
                <p>
                  Free Projects drain elastic Spot GPUs. Priority shortens wait;
                  it does not invent a rushed free answer. Busy Spot = honest
                  queue — never a surprise bill to the shop.
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

          <section id="investors" aria-labelledby="investors-heading">
            <h2 id="investors-heading">Investor ROI — zero-salary Relay vision</h2>
            <p className="section-lead">
              Invest in MyProblem for your region — a low-overhead, AI-powered
              platform you can bring to a local market. Not a SaaS headcount
              company: a capped growth check into a Georgia LLC with{" "}
              <strong className="emph">no payroll line</strong>.
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
                  alt="For investors: fund a region, we launch and operate, local service grows, you earn the majority of usage fees — no salaries, costs limited to infrastructure and advertising"
                  width={1024}
                  height={576}
                  className="section-graphic-img"
                  decoding="async"
                />
              </picture>
              <figcaption className="sr-only">
                Infographic: regional investment, operations, growth, and fee
                share with no salary overhead.
              </figcaption>
            </figure>
            <div className="investor">
              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.55 }}>
                Capital burns on free investigation and match infra. Residual
                margin comes from{" "}
                <strong className="emph">consumer</strong> priority / payee fees
                (and optional payment-rail %), not from invoicing plumbers and
                vets. Founders are paid like any other operator cut on settled /
                priority volume — not salaries. Investors take preferred return,
                then profit share as distributions.
              </p>
              <ul>
                <li>
                  Unit cost of a free Project investigation (batch Spot +
                  storage + bandwidth) vs fake realtime
                </li>
                <li>Free consumer uses / Project SLA before priority queue</li>
                <li>
                  Share of Problems that resolve without a business vs hand off
                  with dossier
                </li>
                <li>
                  Consumer priority fee (and optional checkout %) — not a shop
                  invoice
                </li>
                <li>
                  Months to return the check at zero salary — and the same math
                  if founders later take a draw
                </li>
              </ul>
              <p
                style={{
                  margin: "1.25rem 0 0",
                  color: "var(--muted)",
                  lineHeight: 1.5,
                }}
              >
                This is the Relay company vision: mesh + Problem tips without
                salary machinery. Investors own membership in the product LLC —
                not automatically the Relay gateway fleet. Contact{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
            </div>
          </section>

          <section id="regions" aria-labelledby="regions-heading">
            <h2 id="regions-heading">Pilot regions</h2>
            <p className="section-lead">
              We are starting where we can operate tightly — product, merchants,{" "}
              <em>and</em> the shared knowledge base are scoped to these places
              only. Expand by request, as new region partitions — not one global
              brain.
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
            <p style={{ color: "var(--muted)", maxWidth: "36rem", lineHeight: 1.55 }}>
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
              one form. Or email{" "}
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
          <a
            href={BUSINESS_PDF_PATH}
            download
            aria-label="Download business one-pager PDF"
          >
            Business PDF
          </a>
          <span aria-hidden="true"> · </span>
          <a href={SITE_URL}>{SITE_URL.replace("https://", "")}</a>
          <span aria-hidden="true"> · </span>
          <a href="/sitemap.xml">Sitemap</a>
        </nav>
        <p style={{ margin: 0, maxWidth: "40rem", lineHeight: 1.5 }}>
          Coming soon. Not medical, veterinary, or legal advice. MyProblem
          helps people investigate Problems and connect with local businesses
          when needed. Preferred business pricing: free forever.
        </p>
      </footer>
    </>
  );
}
