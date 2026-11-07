import { SignupForm } from "@/components/SignupForm";
import {
  BUSINESS_PDF_PATH,
  CONTACT_EMAIL,
  SITE_URL,
} from "@/lib/contact";

export default function HomePage() {
  return (
    <div className="site">
      <header className="nav">
        <a className="brand" href="/">
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

      <main>
        <section className="hero" aria-label="Hero" style={{ borderTop: "none" }}>
          <div className="hero-inner">
            <p className="eyebrow">Coming soon · Georgia &amp; Israel pilots</p>
            <h1>MyProblem</h1>
            <p className="hero-lead">
              A free forever front door for local businesses — AI that absorbs
              “should I call?” so your front desk stays light, and ready
              customers arrive with a Problem dossier.
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
        </section>

        <section id="businesses">
          <h2>How it works for businesses</h2>
          <p className="section-lead">
            $0 application. $0 subscription. Preferred stance: free for shops
            forever. Your ROI is time saved and warmer bookings — not another
            SaaS invoice.
          </p>
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
            The product is a <em>Problem</em> — a live issue — not a chat
            transcript that forgets. Voice and photos are inputs into the
            Problem record.
          </p>
          <ol className="steps">
            <li>
              <strong>Open a Problem</strong>
              <p>
                Big actions, voice-first, ADA-capable. Describe what is going
                wrong — leak, appliance, glasses frame, “should I call the
                vet?”
              </p>
            </li>
            <li>
              <strong>Investigate with AI</strong>
              <p>
                Clear camera frames, rate-limited analysis, legal stops on
                every update. Many Problems resolve without anyone calling a
                shop.
              </p>
            </li>
            <li>
              <strong>Free uses, then optional payee fee</strong>
              <p>
                Free investigation runs on elastic Spot capacity. After free
                depth, a consumer priority / payee fee unlocks reliable
                compute — you pay, not the business.
              </p>
            </li>
            <li>
              <strong>Hand off with a dossier</strong>
              <p>
                When you need a local pro, they get the brief — not a cold
                call. Split or combine Problems when there are really two
                issues or one root cause.
              </p>
            </li>
          </ol>
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
            Do not pitch a normal SaaS headcount company. Pitch a capped growth
            check into a Georgia LLC with <strong>no payroll line</strong>.
          </p>
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
      </main>

      <footer className="footer">
        <strong>MyProblem</strong>
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
  );
}
