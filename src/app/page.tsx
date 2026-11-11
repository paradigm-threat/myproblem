import Image from "next/image";
import { SignupForm } from "@/components/SignupForm";
import { SiteHeader } from "@/components/SiteHeader";
import {
  BUSINESS_PDF_PATH,
  CONTACT_EMAIL,
  RELAY_URL,
  SITE_URL,
} from "@/lib/contact";

const FEATURES = [
  {
    title: "One question while you show it",
    body: "While you talk and move the camera, one question stays on screen until the requirements are specific. You answer by talking. A spoken conversation with the AI comes later.",
  },
  {
    title: "Problems, not chats",
    body: "The record is the Problem: photos, facts, stops, and status. The model gets a compiled brief, not a rolling transcript.",
  },
  {
    id: "projects",
    title: "A queue, then a thorough Project",
    body: "Capture the ticket, then investigate when capacity is free. Local knowledge comes first, then Hugging Face or Spot if a photo needs a deeper look, and Bedrock only for a rare miss. Not a live chat.",
  },
  {
    id: "knowledge",
    title: "Knowledge without paid ranking",
    body: "Lessons from real tickets, for Georgia and Israel. Speculative, from users and the investigation only. No boosting, and not a copy of the public web.",
  },
  {
    title: "Free forever",
    body: "No card to post, to answer, or to keep using it. No subscription. A tip is optional, and only if the help was good.",
  },
  {
    title: "Legal stops stay on screen",
    body: "Emergencies and licensed care are redirected. MyProblem is not a doctor, a vet, or a lawyer.",
  },
  {
    title: "Batched coding and digital work",
    body: "Not live yet. Leave instructions for a batch worker to finish code, documents, or a site, then send a notice. Not a realtime IDE chat.",
  },
] as const;

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
            <h2 id="businesses-heading">For businesses</h2>
            <p className="section-lead">
              Free forever, with no card to join or to answer. No duty to
              answer. Open a request when it fits. Ignore it when it does not.
              When you do engage, the dossier is already there. If the help
              was good, a tip is welcome. It is never required.
            </p>
          </section>

          <section id="people" aria-labelledby="people-heading">
            <h2 id="people-heading">For people</h2>
            <p className="section-lead">
              Capture a Problem with photos and a short account. A Project
              investigates it in the queue. You can ask a local shop to look at
              any time, or never. The help stays free if you cannot tip. If it
              was good, you can tip the person, the AI, or both.
            </p>
          </section>

          <section id="features" aria-labelledby="features-heading">
            <h2 id="features-heading">Features</h2>
            <div className="plan-grid">
              {FEATURES.map((feature) => (
                <article key={feature.title} id={"id" in feature ? feature.id : undefined}>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              ))}
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

          <section id="investors" aria-labelledby="belief-heading">
            <h2 id="belief-heading">We do not run this on salaries</h2>
            <p className="section-lead">
              A tip is the old way of paying for good work. It follows a
              success. It is not a paycheck for showing up, and it is not a
              bill. You should never expect to enter a card.{" "}
              <a href="/how-we-run">Read how we run</a>, including the short
              note for people who want to help build the network.
            </p>
          </section>

          <section id="regions" aria-labelledby="regions-heading">
            <h2 id="regions-heading">Pilot regions</h2>
            <p className="section-lead">
              Georgia and Israel only, for now. The knowledge base stays in
              those places. Tell us if you want a region later, from the form
              below.
            </p>
          </section>

          <section id="signup" aria-labelledby="signup-heading">
            <h2 id="signup-heading">Get on the list</h2>
            <p className="section-lead" id="signup-lead">
              Businesses, people with Problems, and region interest. The form
              opens your mail app with a prefilled message, or write{" "}
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
