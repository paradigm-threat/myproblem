import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import {
  CONTACT_EMAIL,
  OG_IMAGE,
  SITE_URL,
  SI_FULL,
  TICKET_TRAINING_NOTICE,
} from "@/lib/contact";

const DESCRIPTION =
  "How MyProblem handles personal information: PII stays on your devices by default; shared tickets use automatic safe conversion.";

export const metadata: Metadata = {
  title: "Privacy",
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: "MyProblem — Privacy",
    description:
      "Client-held PII, automatic conversion on network tickets, and private share-on-request for providers.",
    url: `${SITE_URL}/privacy`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyProblem — Privacy",
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

const EFFECTIVE = "November 17, 2026";

export default function PrivacyPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <SiteHeader variant="demo" />

      <main id="main" className="site legal-page">
        <p className="eyebrow">Clevertree LLC · Georgia</p>
        <h1 className="legal-title">Privacy</h1>
        <p className="section-lead legal-banner">
          Product privacy defaults for MyProblem. This page is informational and
          is <strong className="emph">not legal advice</strong>. Effective{" "}
          {EFFECTIVE}. Full service rules live in the{" "}
          <a href="/terms">Terms</a>.
        </p>

        <section className="legal-section" aria-labelledby="rule-heading">
          <h2 id="rule-heading">1. One-sentence rule</h2>
          <p>
            <strong>
              No names, street addresses, phones, or emails on the shared
              network ticket.
            </strong>{" "}
            Coarse location (city / safe radius) only when location matters.
            Full personal identifiers stay on your devices and move only when
            you choose to share them.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="where-heading">
          <h2 id="where-heading">2. Where personal information lives</h2>
          <ul>
            <li>
              <strong>Your phone or browser (client vault)</strong> — primary
              home for contact details and precise location tied to a ticket.
            </li>
            <li>
              <strong>Shared ticket / Relay network</strong> — safe problem
              description only (city-level when needed). Not an identity file.
            </li>
            <li>
              <strong>Contact email</strong> — if you email us, we see what you
              send in that message. Region interest and contributor outreach use
              mailto; ticket submit uses Intake (see{" "}
              <a href="/submit">/submit</a>).
            </li>
          </ul>
        </section>

        <section className="legal-section" aria-labelledby="convert-heading">
          <h2 id="convert-heading">3. Automatic PII conversion</h2>
          <p>
            When {SI_FULL} or intake packages a ticket for the network, personal
            identifiers that are not needed for shared context should be{" "}
            <strong>converted or withheld</strong> — for example a spoken street
            address becomes a city or coarse safe band. Client-side redaction is
            preferred; server-side conversion is the safety net so accidental
            uploads do not leave raw PII on durable shared tips.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="share-heading">
          <h2 id="share-heading">4. Sharing on request</h2>
          <p>
            A provider may ask for an address, name, or phone when they need it
            to help. You approve; the detail should go through a{" "}
            <strong>private secure channel</strong> between you and that party —
            not by publishing it onto the shared ticket timeline or knowledge
            base. Public posting of precise personal fields is opt-in and off by
            default.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="train-heading">
          <h2 id="train-heading">5. Anonymized tickets and SI training</h2>
          <p>{TICKET_TRAINING_NOTICE}</p>
          <p>
            Shared tips are meant to be scrubbed of names, street addresses,
            phones, and emails before they feed investigation learning or model
            improvement. Waitlist contact email is separate from ticket training
            data.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="android-heading">
          <h2 id="android-heading">6. Android app</h2>
          <p>
            The MyProblem app on Google Play asks for the camera and the
            microphone only after you start a ticket that needs them. Stills
            and audio describe the problem. When online sync is on, the text
            you enter, the audio you record, and the stills you keep are sent
            to Intake at intake.myproblem.app so the service can understand the
            problem. Copies stay on your phone. Turning sync off keeps the
            ticket on the device.
          </p>
          <p>
            The app does not use the advertising ID and does not sell this
            information. Ticket access secrets stay on the device and are not
            included in Android backup. MyProblem is not a medical, legal, or
            emergency service. Those limits are in the <a href="/terms">Terms</a>.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="limits-heading">
          <h2 id="limits-heading">7. Limits</h2>
          <p>
            No system is perfect. Do not put secrets in tickets you would not
            want mishandled. Logs, backups, and ephemeral media processing may
            briefly touch bytes; our design target is that durable shared tips
            stay free of raw PII. Contact{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> if you
            believe personal information was retained incorrectly.
          </p>
        </section>

        <p className="legal-footer-note">
          Operated by Clevertree LLC ·{" "}
          <a href="/terms">Terms &amp; Disclaimers</a> ·{" "}
          <a href="/">{SITE_URL.replace("https://", "")}</a>
        </p>
      </main>
    </>
  );
}
