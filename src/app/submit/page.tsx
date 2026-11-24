import type { Metadata } from "next";
import Link from "next/link";
import { InstallAppHint } from "@/components/InstallAppHint";
import { SiteHeader } from "@/components/SiteHeader";
import { SubmitTicketForm } from "@/components/SubmitTicketForm";
import { OG_IMAGE, SITE_URL, TICKET_TRAINING_NOTICE } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Submit a problem",
  description:
    "Try it now — write or record offline. Batches queue on device and sync when Wi‑Fi returns. Anonymous by default.",
  alternates: { canonical: `${SITE_URL}/submit` },
  openGraph: {
    title: "Submit a problem · MyProblem",
    description:
      "Chat or Record offline. Queued batches sync when you reconnect. Intake → temporary media; batch SI processes then deletes.",
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
          <p className="section-lead">
            Max and simple — describe the problem in text, or Record one clip
            (camera and mic are requested only when you Record). Works offline:
            batches are <strong>saved on this device</strong> until upload
            succeeds — clearing site data drops the queue. Optional upload of
            up to five audio or video files per batch. Want to keep others&apos;
            tips moving across social groups? That&apos;s a{" "}
            <strong>Networker</strong> job — start with the{" "}
            <Link href="/extension">Relay extension</Link> (primary Networker
            path).
          </p>
        </header>
        <InstallAppHint />
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
