import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/contact";

const TITLE = "How we run";
const DESCRIPTION =
  "MyProblem does not pay salaries or ask for a subscription. You should never expect to enter a card. If the help was good, tip the person, the AI, or both. Intent, not a contract.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/how-we-run` },
  openGraph: {
    title: "How we run MyProblem",
    description: DESCRIPTION,
    url: `${SITE_URL}/how-we-run`,
  },
};

const FAQ = [
  {
    question: "Do shops pay?",
    answer:
      "No. A business never pays to join, to see a request, or to answer. There is no membership, no lead invoice, and no subscription. A shop can leave a tip after a good experience. It is never required.",
  },
  {
    question: "When does anyone pay?",
    answer:
      "Only when they want to. You should never expect to enter a card. If the help was good, tip the person who helped, the AI that helped, or both. A gift to the AI keeps the machines running. $1, $5, and $10 are examples, not prices.",
  },
  {
    question: "What about people who cannot tip?",
    answer:
      "They get the same help. A tip measures a good experience. It is not a ticket to use the service.",
  },
  {
    question: "What replaces a salary?",
    answer:
      "A tip after the work actually helped. It is the old way of paying for good work. It is not a paycheck for showing up, and it is not a subscription.",
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
          Relay already left salaries behind. The next break is the tip, the
          old way of paying for good work. You should never expect to enter a
          card. If the help was good, tip the person, the AI, or both. This
          page is intent. It is not a contract and not an offer.
        </p>

        <section aria-labelledby="principles-heading">
          <h2 id="principles-heading">Principles</h2>
          <ul>
            <li>No salaries, and no subscription.</li>
            <li>
              The service is free forever. You should never expect to enter a
              card.
            </li>
            <li>
              If the help was good, tip the person who helped, the AI that
              helped, or both. A gift to the AI keeps the machines running.
              Part of a tip to a person, or a second tip, can do the same.
            </li>
            <li>
              People who cannot tip get the same help. A tip follows a success.
              It is not a bill.
            </li>
          </ul>
        </section>

        <section aria-labelledby="words-heading">
          <h2 id="words-heading">Words we use</h2>
          <dl className="glossary">
            <dt>Salary</dt>
            <dd>A paycheck for showing up, whether or not work settled.</dd>
            <dt>Subscription</dt>
            <dd>A bill that arrives whether or not the help was any good.</dd>
            <dt>Tip</dt>
            <dd>
              A voluntary thank-you after a good experience, for a person, for
              the AI and its hosting, or both. Any time, any amount. $1, $5,
              and $10 are examples.
            </dd>
          </dl>
        </section>

        <section aria-labelledby="virtues-heading">
          <h2 id="virtues-heading">Virtues</h2>
          <ul>
            <li>Thorough over instant.</li>
            <li>A shop may stay silent. Silence is a valid outcome.</li>
            <li>No paid ranking of lessons or businesses.</li>
            <li>Anonymous by default.</li>
            <li>
              Legal stops stay on screen. We are not a doctor, a vet, or a
              lawyer.
            </li>
          </ul>
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
              alt="MyProblem for investors. No promised return. Using the service never requires a payment. A tip can go to the person, the AI, or both. A five or ten dollar tip from a delighted person beats one dollar. Most people will not tip."
            />
          </picture>
          <p>
            This is the Relay compensation we want. It helps the most people,
            because a missing card never blocks the help. Money shows up only
            when the AI or another person actually came through. A happy person
            might leave $1, $5, or $10, for the person who helped, the AI that
            helped, or both. That feeling is the signal a subscription cannot
            make. We still want a compatible world network: the same tickets,
            findable across places, with gifts able to reach the people running
            local hardware. There is no promised return. This is intent, not an
            offer. Nothing here binds anyone until a separate written agreement
            says so.
          </p>
          <h3 id="illustration-heading">An illustration, not a forecast</h3>
          <p>
            A Relay node can start small. The AI bill cannot. One region of
            vision is on the order of a few hundred dollars a month, and a
            two-region pilot is about $700 to $2,000. A modest computer does
            not pay that bill.
          </p>
          <p>
            Imagine a $1 subscription collected from every person who uses the
            product at least once a month. That raises $1 per person.
            Infrastructure tips raise the share who tip the machines, times the
            average gift to the machines. Those match when that product is $1.
          </p>
          <ul>
            <li>
              If 20% tip $5 to the machines, or 10% tip $10, that is about $1.
              A tie with charging everyone $1.
            </li>
            <li>If 10% tip $5, that is about $0.50. The subscription raises more.</li>
            <li>If 30% tip $5, that is about $1.50. Tips raise more.</li>
          </ul>
          <p>
            A delighted $5 or $10 beats a $1 subscription from that one person.
            The average does not, unless many people do it. Tipping a person is
            an old habit. Tipping the machines that ran the AI is the hard
            part, and it is the gift that keeps the project running. We have no
            users yet, so these rates are arithmetic, not a measurement. Gifts
            might later cover a busy region. They do not guarantee that a
            hardware check comes back.
          </p>
          <p>
            Write{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. The same
            intent is in the <a href="/terms">terms</a>.
          </p>
        </section>

        <p className="legal-footer-note">
          Operated by Clevertree LLC (Georgia), public brand MyProblem. Contact{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. No
          percentages and no promised return.{" "}
          <a href="/">Back to the product</a>.
        </p>
      </main>
      <footer className="site footer">
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
          <a href="/">Home</a>
          <span aria-hidden="true"> · </span>
          <a href="/terms">Terms</a>
          <span aria-hidden="true"> · </span>
          <a href="/privacy">Privacy</a>
          <span aria-hidden="true"> · </span>
          <a href={SITE_URL}>{SITE_URL.replace("https://", "")}</a>
        </nav>
      </footer>
    </>
  );
}
