import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SubmitTicketForm } from "@/components/SubmitTicketForm";
import { OG_IMAGE, SITE_URL, TICKET_TRAINING_NOTICE } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Submit a problem",
  description:
    "Create an anonymous MyProblem ticket from the web — photos optional, public slug opt-in.",
  alternates: { canonical: `${SITE_URL}/submit` },
  openGraph: {
    title: "Submit a problem · MyProblem",
    description:
      "Create an anonymous ticket. Optional public share link for advice.",
    url: `${SITE_URL}/submit`,
    images: [OG_IMAGE],
  },
};

export default function SubmitPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader variant="demo" />
      <main id="main" className="site ticket-page">
        <header className="submit-header">
          <p className="eyebrow">Try it now</p>
          <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)" }}>
            Submit a problem
          </h1>
          <p className="section-lead">
            Simple web intake for now — title, details, photos. Same ticket
            model as the app. Public sharing is opt-in.{" "}
            <Link href="/dev">See what&apos;s next on Dev</Link>.
          </p>
        </header>
        <SubmitTicketForm />
        <p className="ticket-footer-note">
          {TICKET_TRAINING_NOTICE}{" "}
          <Link href="/privacy">Privacy</Link>
          {" · "}
          <Link href="/terms">Terms</Link>
        </p>
      </main>
    </>
  );
}
