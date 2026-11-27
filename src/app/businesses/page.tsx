import type { Metadata } from "next";
import Link from "next/link";
import { OpenChatButton } from "@/components/chat/OpenChatButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  BUSINESS_PDF_PATH,
  CONTACT_EMAIL,
  OG_IMAGE,
  SITE_URL,
} from "@/lib/contact";

const TITLE = "For businesses";
const DESCRIPTION =
  "Answer local questions on MyProblem. Public participation is free. Private tickets can compensate time. No purchased leads.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/businesses` },
  openGraph: {
    title: `${TITLE} · MyProblem`,
    description: DESCRIPTION,
    url: `${SITE_URL}/businesses`,
    images: [OG_IMAGE],
  },
};

export default function BusinessesPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader variant="home" />
      <main id="main" className="site legal-page">
        <p className="eyebrow">Local shops · public free · private optional</p>
        <h1 className="legal-title">Be helpful. Be local.</h1>
        <p className="section-lead">
          Answer questions, share expertise, and connect with people who need
          your services. Public participation is free.
        </p>
        <div className="cta-row">
          <OpenChatButton>Visit the public room</OpenChatButton>
          <a
            className="btn-secondary"
            href={BUSINESS_PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
          >
            Business one-pager (PDF)
          </a>
        </div>

        <section aria-labelledby="conversation-heading">
          <h2 id="conversation-heading">A conversation, not a purchased lead</h2>
          <p>
            Someone asks why their car makes an unfamiliar sound. A mechanic
            offers useful guidance in the public room. The person may thank them,
            leave an optional tip when available, or bring the car in for paid
            work. No purchased lead and no hiring obligation.
          </p>
          <p>
            Public questions are free to ignore. Private tickets (when shipped)
            can compensate provider time. Relay mediates official tickets.
            Businesses use the network; they do not operate mesh hardware. See{" "}
            <Link href="/investors">funding / node operation</Link> if that is
            the role you want.
          </p>
          <figure className="section-graphic">
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet="/businesses-portrait.jpg"
                width={576}
                height={1024}
              />
              <img
                src="/businesses.jpg"
                alt="Local auto shop answering community questions, then optional paid service"
                width={1024}
                height={512}
                className="section-graphic-img"
                decoding="async"
              />
            </picture>
          </figure>
        </section>

        <section aria-labelledby="start-heading">
          <h2 id="start-heading">Start by being useful</h2>
          <p>
            See what people are asking in the public room. Answer when you have
            something helpful to contribute.
          </p>
          <div className="cta-row">
            <OpenChatButton>Enter the public room</OpenChatButton>
            <a
              className="btn-secondary"
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Business interest — MyProblem")}`}
            >
              Contact {CONTACT_EMAIL}
            </a>
          </div>
        </section>

        <p className="disclaimer">
          Examples are illustrations, not prices or forecasts. Public help stays
          free. See <Link href="/disclaimers">disclaimers</Link>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
