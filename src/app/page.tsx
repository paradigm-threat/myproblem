import Link from "next/link";
import { OpenChatButton } from "@/components/chat/OpenChatButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeArt } from "@/components/ThemeArt";
import { VisionStrip } from "@/components/VisionStrip";
import {
  BUSINESS_PDF_PATH,
  CONTACT_EMAIL,
  SI_FULL,
} from "@/lib/contact";

const PRINCIPLES = [
  {
    title: "Simple Max",
    body: "Minimal UI by default; advanced tools available but out of the way. Full public-path capability—no premium unlocks, ads, or artificial feature gates.",
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
    title: "Posted rules only",
    body: "Regional restrictions must be published. No hidden shadow censorship.",
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
                Public utility · Georgia &amp; Israel pilots ·{" "}
                <Link href="/dev">Dev</Link>
              </p>
              <h1 id="hero-heading" className="hero-title">
                Help belongs to everyone.
              </h1>
              <p className="hero-lead">
                Public help and intelligence. Free, without an account. Open{" "}
                <strong className="emph">Chat</strong> in the header (extension
                side panel when installed).
              </p>
              <div className="cta-row">
                <OpenChatButton>Enter the public room</OpenChatButton>
                <OpenChatButton className="btn-secondary" submit>
                  Type / speak / video
                </OpenChatButton>
                <Link className="btn-secondary" href="/#simple-max">
                  Simple Max
                </Link>
              </div>
            </div>
          </div>
        </section>

        <VisionStrip />

        <div className="site">
          <section id="businesses" aria-labelledby="businesses-heading">
            <h2 id="businesses-heading">Good businesses are good neighbors.</h2>
            <p className="section-lead">
              Answer questions in your community. Share what you know. Sometimes
              a helpful conversation becomes paid work.
            </p>
            <figure className="section-graphic">
              <ThemeArt
                base="/businesses"
                alt="Local business answering community questions, then optional paid service"
                width={1024}
                height={512}
              />
            </figure>
            <div className="cta-row">
              <Link className="btn-primary" href="/businesses">
                Are you a business?
              </Link>
              <a
                className="btn-secondary"
                href={BUSINESS_PDF_PATH}
                target="_blank"
                rel="noopener noreferrer"
              >
                Business PDF
              </a>
            </div>
          </section>

          <section id="simple-max" aria-labelledby="simple-max-heading">
            <h2 id="simple-max-heading">Simple Max</h2>
            <p className="section-lead">
              Relay enforces a product principle called{" "}
              <strong className="emph">Simple Max</strong> across CleverTree
              products—not a marketing campaign, a default.
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
          </section>

          <section className="relay-promo" aria-labelledby="networker-heading">
            <h2 id="networker-heading">
              Connect people where they already are.
            </h2>
            <p>
              People should not have to join another app to get help. Relay helps
              Networkers bring useful questions into the public network and carry
              answers back—shallow, session-bound gather in a real logged-in
              browser. Not a sales funnel for private premium.
            </p>
            <figure className="section-graphic">
              <ThemeArt
                base="/networkers-unify"
                ext="jpg"
                portraitBase="/networkers-portrait"
                alt="Networkers connect existing social groups into collection rooms"
                width={1024}
                height={682}
              />
            </figure>
            <div className="cta-row">
              <Link className="btn-primary" href="/extension">
                Get to know Relay
              </Link>
              <Link className="btn-secondary" href="/networkers">
                Networker role
              </Link>
            </div>
          </section>

          <section id="investors" aria-labelledby="investors-heading">
            <h2 id="investors-heading">Help build the network.</h2>
            <p className="section-lead">
              Free public intelligence needs real infrastructure. Fund capacity
              or operate a compatible Relay node under publicly posted rules.
            </p>
            <figure className="section-graphic">
              <ThemeArt
                base="/investors"
                alt="Regional infrastructure on a Relay-compatible mesh with posted public rules"
                width={1024}
                height={576}
              />
            </figure>
            <div className="cta-row">
              <Link className="btn-primary" href="/investors">
                Explore funding and node operation
              </Link>
              <Link className="btn-secondary" href="/rules">
                Posted rules
              </Link>
            </div>
          </section>

          <section id="lanes" aria-labelledby="lanes-heading">
            <h2 id="lanes-heading">The same help. A different privacy boundary.</h2>
            <figure className="section-graphic">
              <ThemeArt
                base="/people"
                alt="Neighbors getting public help in a shared room—no account required"
                width={1024}
                height={576}
              />
            </figure>
            <ul>
              <li>
                <strong>Public</strong> — free, no account, public conversations,
                people and SI, optional support only.
              </li>
              <li>
                <strong>Private</strong> — mediated ticket, same help quality,
                metered model usage, infrastructure and provider costs. Payment
                covers private service, not superior intelligence.
              </li>
            </ul>
          </section>

          <section id="nothing-hidden" aria-labelledby="nothing-hidden-heading">
            <h2 id="nothing-hidden-heading">Nothing hidden.</h2>
            <p className="section-lead">
              Every participating Relay network must publish its rules. Local
              legal restrictions must be visible. No hidden shadow censorship.
            </p>
            <p>
              <Link href="/how-we-run">How we run</Link>
              {" · "}
              <Link href="/rules">Posted rules</Link>
              {" · "}
              <Link href="/privacy">Privacy</Link>
              {" · "}
              <Link href="/disclaimers">Disclaimers</Link>
            </p>
          </section>

          <section id="si-different" aria-labelledby="si-heading">
            <h2 id="si-heading">Why this {SI_FULL} is different</h2>
            <p className="section-lead">
              Batch SI on metered providers, driven by posted rules and knowledge.
              Scratch dies with the job; standing memory is only what rules
              write. Public help never requires a card.
            </p>
            <p>
              <Link href="/how-we-run#daily-ops">Daily ops</Link>
            </p>
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

          <section id="regions" aria-labelledby="regions-heading">
            <h2 id="regions-heading">Pilot regions</h2>
            <p className="section-lead">
              Product, merchants, and knowledge base are scoped to these places.
              Expand by request as new region partitions.
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
            <p>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Region interest — MyProblem")}`}
              >
                Email region interest
              </a>
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
