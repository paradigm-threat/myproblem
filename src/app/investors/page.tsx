import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeArt } from "@/components/ThemeArt";
import { CONTACT_EMAIL, OG_IMAGE, SITE_URL } from "@/lib/contact";

const TITLE = "Funding and node operation";
const DESCRIPTION =
  "Fund capacity or operate Relay-compatible hardware. Posted rules only. No hidden censorship. No promised return.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/investors` },
  openGraph: {
    title: `${TITLE} · MyProblem`,
    description: DESCRIPTION,
    url: `${SITE_URL}/investors`,
    images: [OG_IMAGE],
  },
};

export default function InvestorsPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader variant="home" />
      <main id="main" className="site legal-page">
        <p className="eyebrow">Infrastructure · Relay-compatible · posted rules</p>
        <h1 className="legal-title">
          Build the infrastructure for free intelligence
        </h1>
        <p className="section-lead">
          Fund capacity or operate Relay-compatible hardware. Keep public
          intelligence accessible under rules everyone can see.
        </p>
        <div className="cta-row">
          <a
            className="btn-primary"
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Infrastructure participation — MyProblem")}`}
          >
            Discuss infrastructure participation
          </a>
          <Link className="btn-secondary" href="/how-we-run">
            Read the commitments
          </Link>
        </div>

        <section aria-labelledby="what-heading">
          <h2 id="what-heading">What operators do</h2>
          <p>
            Free intelligence requires real infrastructure: servers, networking,
            storage, electricity, and model capacity. Fund capacity without
            operating it yourself, or host hardware and connect to the wider
            network. This is not the same role as a shop answering tickets—see{" "}
            <Link href="/businesses">for businesses</Link>.
          </p>
          <figure className="section-graphic">
            <ThemeArt
              base="/investors"
              alt="Regional infrastructure connected on a Relay-compatible mesh with posted public rules"
              width={1024}
              height={576}
            />
          </figure>
        </section>

        <section aria-labelledby="compat-heading">
          <h2 id="compat-heading">Local infrastructure. Shared compatibility.</h2>
          <p>
            Operators may host their own infrastructure, adapt source code, and
            configure services for their region. They must maintain
            cross-network compatibility based on the Relay Vision. Incompatible
            isolation is not acceptable.
          </p>
        </section>

        <section aria-labelledby="rules-heading">
          <h2 id="rules-heading">
            No more hidden shadow censorship at all ever
          </h2>
          <p>
            Participating networks must publicly disclose censorship rules,
            including restrictions required by local law (including religious
            restrictions where applicable). Everyone must be able to see the
            rules. This does not require identical rules everywhere.
          </p>
          <p>
            Directory stub: <Link href="/rules">posted rules</Link>.
          </p>
        </section>

        <section aria-labelledby="fees-heading">
          <h2 id="fees-heading">
            Cover the cost of service. Keep the commons free.
          </h2>
          <p>
            Private service may cover metered model usage, an infrastructure
            fee, and compensated provider time. Example only: $0.65 of model
            use, plus applicable fees. Illustration—not a price or return
            forecast. Operators may set fees within accepted network limits;
            exact caps remain to be published.
          </p>
          <ul>
            <li>Free public SI and public help</li>
            <li>Required Relay interfaces and cross-network connection</li>
            <li>Regional adaptation within compatibility</li>
            <li>Published restrictions; no hidden censorship</li>
            <li>Accepted fee limits; visible operator identity and rules record</li>
          </ul>
        </section>

        <p className="disclaimer disclaimer--warning">
          No promised return. Examples are not prices. Intent is not agreement
          until separate paperwork exists. See{" "}
          <Link href="/disclaimers">disclaimers</Link>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
