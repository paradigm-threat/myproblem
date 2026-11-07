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
      <div className="site">
        <header className="nav">
          <a className="brand" href="/">
            <Image
              src="/icons/icon-64.png"
              alt=""
              width={36}
              height={36}
              className="brand-mark"
              priority
            />
            MyProblem
          </a>
          <nav className="nav-links" aria-label="Sections">
            <a href="#businesses">For businesses</a>
            <a href="#people">For people</a>
            <a href="#investors">Investors</a>
            <a href="#regions">Regions</a>
            <a href="#signup">Signup</a>
            <a href="/test-mode">Test Mode</a>
          </nav>
        </header>
      </div>

      <main>
        <section className="hero" aria-label="Hero">
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
              <h1 className="sr-only">
                Turn any problem into a solution
              </h1>
              <p className="eyebrow">Coming soon · Georgia &amp; Israel pilots</p>
              <p className="hero-lead">
                Free forever for local businesses — AI that absorbs “should I
                call?” so ready customers arrive with a Problem dossier.
              </p>
              <div className="cta-row">
                <a className="btn-primary" href="#signup">
                  Join the business waitlist
                </a>
                <a
                  className="btn-secondary"
                  href={BUSINESS_PDF_PATH}
                  download
                >
                  Download business one-pager (PDF)
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="site">
        <section id="businesses">
          <h2>How it works for businesses</h2>
          <p className="section-lead">
            $0 application. $0 subscription. Preferred stance: free for shops
            forever. Your ROI is time saved and warmer bookings — not another
            SaaS invoice.
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
                Routine “is this urgent?”, “what until Monday?”, and redirect
                loops never reach the secretary. Those people get structured
                advice without clogging your phone.
              </p>
            </li>
            <li>
              <strong>Open a Problem tip when it is real</strong>
              <p>
                Photos, facts, and AI notes are already on the dossier. Accept,
                decline, or bid — then the deal is between you and them.
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
            <a className="btn-secondary" href={BUSINESS_PDF_PATH} download>
              Printable PDF for your partners
            </a>
          </p>
        </section>

        <section id="people">
          <h2>How it works for people</h2>
          <p className="section-lead">
            Get real help — anonymously or with an account. Core AI help is{" "}
            <strong style={{ color: "var(--ink)" }}>free, private, and
            forever</strong>. An account is only required for high-load
            features like a live video feed.
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
          </figure>
          <ol className="steps">
            <li>
              <strong>Investigate a new Problem (ticket)</strong>
              <p>
                Open a ticket and get real-time AI help — including photo
                analysis — as you figure out what is going wrong.
              </p>
            </li>
            <li>
              <strong>Solve it, or get a recommendation</strong>
              <p>
                Many Problems close with AI alone. If not, the AI can recommend
                calling a local business or other resource — with the dossier
                ready.
              </p>
            </li>
            <li>
              <strong>Submit to local merchants (test areas)</strong>
              <p>
                In our pilot regions, send the ticket into the local resource
                database so nearby merchants can review and respond.
              </p>
            </li>
          </ol>
          <div className="people-promise">
            <h3>What to expect on cost &amp; privacy</h3>
            <ul>
              <li>
                <strong>Free forever</strong> for core private / anonymous AI
                help — no login required for the basics.
              </li>
              <li>
                <strong>Account only when you need it</strong> — high-load
                features like real-time video feed.
              </li>
              <li>
                <strong>First few ticket requests free</strong> (exact count
                TBD).
              </li>
              <li>
                <strong>After that, a small usage fee</strong> — only to keep
                hardware and software running. We will not take salaries from
                those fees.
              </li>
            </ul>
          </div>
        </section>

        <section id="plan">
          <h2>The plan</h2>
          <p className="section-lead">
            Relay-native investigation service. Problems not chats. Local
            businesses as free distribution. Consumer economics after free
            uses.
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
                Free tier uses elastic Spot GPUs. Priority consumers get a
                reliable pool. When Spot is busy: honest “high demand,” not a
                surprise bill to the shop.
              </p>
            </article>
            <article>
              <h3>Narrow pilots first</h3>
              <p>
                Home repair and simple glasses; careful clinic/vet-style
                triage with redirect as product. No doctor marketplace on day
                one.
              </p>
            </article>
          </div>
        </section>

        <section id="investors">
          <h2>Investor ROI — zero-salary Relay vision</h2>
          <p className="section-lead">
            Invest in MyProblem for your region — a low-overhead, AI-powered
            platform you can bring to a local market. Not a SaaS headcount
            company: a capped growth check into a Georgia LLC with{" "}
            <strong>no payroll line</strong>.
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
          </figure>
          <div className="investor">
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.55 }}>
              Capital burns on free investigation and match infra. Residual
              margin comes from <strong style={{ color: "var(--ink)" }}>consumer</strong>{" "}
              priority / payee fees (and optional payment-rail %), not from
              invoicing plumbers and vets. Founders are paid like any other
              operator cut on settled / priority volume — not salaries.
              Investors take preferred return, then profit share as
              distributions.
            </p>
            <ul>
              <li>
                Unit cost of a free real-time scan (backbone + storage +
                bandwidth)
              </li>
              <li>Free consumer uses before priority / payee fee</li>
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

        <section id="regions">
          <h2>Pilot regions</h2>
          <p className="section-lead">
            We are starting where we can operate tightly — then expand by
            request.
          </p>
          <div className="regions">
            <div className="chip">
              <span aria-hidden /> Georgia, USA
            </div>
            <div className="chip">
              <span aria-hidden /> Israel
            </div>
          </div>
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

        <section id="signup">
          <h2>Get on the list</h2>
          <p className="section-lead">
            Businesses, people with Problems, investors, and region interest —
            one form. Or email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
          <SignupForm defaultRole="business" id="waitlist" />
        </section>

      <footer className="footer">
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
        <div>
          Contact{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          {" · "}
          <a href={BUSINESS_PDF_PATH} download>
            Business PDF
          </a>
          {" · "}
          <a href={SITE_URL}>{SITE_URL.replace("https://", "")}</a>
        </div>
        <p style={{ margin: 0, maxWidth: "40rem", lineHeight: 1.5 }}>
          Coming soon. Not medical, veterinary, or legal advice. MyProblem
          helps people investigate Problems and connect with local businesses
          when needed. Preferred business pricing: free forever.
        </p>
      </footer>
        </div>
      </main>
    </>
  );
}
