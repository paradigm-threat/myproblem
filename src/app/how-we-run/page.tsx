import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  CONTACT_EMAIL,
  OG_IMAGE,
  SITE_URL,
  SI_FULL,
  SI_FOOTER_GLOSS,
} from "@/lib/contact";

const TITLE = "How we run";
const DESCRIPTION =
  "Public chat and AI stay free. Private chat is the paid lane. Seeking tax-deductible donations for an educational public utility. Intent, not a contract.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/how-we-run` },
  openGraph: {
    title: "How we run MyProblem",
    description: DESCRIPTION,
    url: `${SITE_URL}/how-we-run`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "How we run MyProblem",
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

const FAQ = [
  {
    question: "Does anyone pay for public help?",
    answer:
      "No. Public chat rooms and channel AI stay free. Nobody pays to join, to ask in #mp-general, or to get help there. There is no membership, no lead invoice, and no subscription for the public path.",
  },
  {
    question: "What is paid?",
    answer:
      "Private chat is the paid lane. Fees are meant to fund infrastructure and to pay service providers for time and effort helping people — so compensation is not only an offline transaction. Public rooms stay free. Metered billing is not shipping on this pass; this page states intent only.",
  },
  {
    question: "How do donations work?",
    answer: `We seek tax-deductible donations to support MyProblem as an educational public utility (pursuing 501(c)(3)-compatible structure). We do not claim that nonprofit status already exists unless and until the entity is established. Donations help cover servers and metered ${SI_FULL} (Groq / Bedrock / peers).`,
  },
  {
    question: "What about people who cannot donate?",
    answer:
      "They get the same public help. A donation is never a ticket to use the service.",
  },
  {
    question: "Is this a job?",
    answer:
      "No. This page is not a job listing, not an offer of employment, and not a contract.",
  },
] as const;

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function HowWeRunPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader variant="home" />
      <main id="main" className="site legal-page">
        <p className="eyebrow">Clevertree LLC · Georgia</p>
        <h1 className="legal-title">How we run</h1>
        <p className="section-lead">
          Public chat and AI stay free. Private chat is the paid lane that funds
          capacity. We seek tax-deductible donations under an educational
          public-utility framing. Public help does not require a card. This page
          is intent—not a contract and not an offer.
        </p>

        <section aria-labelledby="principles-heading">
          <h2 id="principles-heading">Principles</h2>
          <ul>
            <li>No salaries, and no subscription for public help.</li>
            <li>
              Public chat and AI stay free.{" "}
              <strong>Simple Max</strong>: minimal UI by default; no premium
              unlocks or ads on the public path. No card required for public
              help.
            </li>
            <li>
              Private chat (when shipped) is the paid lane: fees fund
              infrastructure and pay service providers for time spent helping —
              so compensation is not only an offline transaction. Public rooms
              stay free. Nonprofit / public-utility framing.
            </li>
            <li>
              Donations welcome for the public utility. People who cannot donate
              get the same public help.
            </li>
          </ul>
        </section>

        <section aria-labelledby="words-heading">
          <h2 id="words-heading">Words we use</h2>
          <dl className="glossary">
            <dt>Simple Max</dt>
            <dd>
              Relay product principle. Simple: default UI stays minimal;
              advanced features stay available but out of the way. Max: full
              capability without premium unlocks, advertising, or artificial
              feature gates. Limits exist for capacity and safety only.
            </dd>
            <dt>Public room</dt>
            <dd>
              IRC channels such as #mp-general. Posts are visible; there is no
              private mode on the foundation product submit path.
            </dd>
            <dt>Private chat</dt>
            <dd>
              The paid lane (planned). Fees cover infrastructure and compensate
              service providers for their time; public chat and AI stay free.
            </dd>
            <dt>Donation</dt>
            <dd>
              Voluntary support for the educational public utility. We are
              pursuing tax-deductible / 501(c)(3)-compatible structure; do not
              read this as a claim that status already exists.
            </dd>
            <dt>Subscription</dt>
            <dd>A bill that arrives whether or not the help was any good — not how public help works.</dd>
          </dl>
        </section>

        <section aria-labelledby="virtues-heading">
          <h2 id="virtues-heading">Operating principles</h2>
          <ul>
            <li>
              <strong>Simple Max</strong> — minimal defaults; full public-path
              capability without feature gates.
            </li>
            <li>Thorough over instant.</li>
            <li>Businesses may stay silent on public requests.</li>
            <li>No paid ranking of lessons or businesses.</li>
            <li>Anonymous by default on the public path.</li>
            <li>
              Legal redirects stay visible. We are not a doctor, veterinarian, or
              lawyer.
            </li>
          </ul>
        </section>

        <section id="daily-ops" aria-labelledby="daily-ops-heading">
          <h2 id="daily-ops-heading">Daily ops</h2>
          <p>
            Thorough does not mean slow to notice. Each day we review anonymous
            batch signals, assess what the product needs, and ship updates—often
            the next day. Same loop as{" "}
            <a href="https://quizgate.app/#daily-loop">QuizGate</a>,{" "}
            <a href="https://clevertree.chat/">Clevertree Chat</a>, and{" "}
            <a href="https://clevertree.net/">Clevertree</a>.
          </p>
          <p>
            North star: much of this becomes automated so a detailed user report
            can drive triage and a patch without a developer in the middle. We
            are not claiming that automation is finished—only that it is the
            goal.
          </p>
        </section>

        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading">Questions</h2>
          <div className="faq-list">
            {FAQ.map((item) => (
              <article key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="investors" aria-labelledby="investors-heading">
          <h2 id="investors-heading">If you want to help build the network</h2>
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet="/investors-portrait.jpg?v=2"
              width={768}
              height={1024}
            />
            <img
              className="investor-poster"
              src="/investors.jpg?v=2"
              width={1024}
              height={576}
              alt="MyProblem funding: public chat free forever; private chat as paid lane; donations for educational public utility. No promised return."
            />
          </picture>
          <p>
            We want a compatible world network: the same public rooms and
            problems, findable across places. Money for the public path comes
            from donations and, later, private-chat revenue — not from blocking
            people who cannot pay. There is no promised return. This is intent,
            not an offer. Nothing here binds anyone until a separate written
            agreement says so.
          </p>
          <h3 id="illustration-heading">An illustration, not a forecast</h3>
          <p>
            A Relay node can start small. The SI bill cannot. One region of
            vision is on the order of a few hundred dollars a month, and a
            two-region pilot is about $700 to $2,000. Private chat metering and
            donations are meant to cover that — not tip-push on every screen.
          </p>
          <p>
            Write{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. The same
            intent is in the <a href="/terms">terms</a>.
          </p>
        </section>

        <p className="legal-footer-note">
          <a href="/#si-different">{SI_FOOTER_GLOSS}</a> Operated by Clevertree
          LLC (Georgia), public brand MyProblem. Contact{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. No
          percentages and no promised return.{" "}
          <a href="/">Back to the product</a>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
