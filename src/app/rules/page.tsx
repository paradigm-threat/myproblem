import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CONTACT_EMAIL, OG_IMAGE, SITE_URL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Posted rules",
  description:
    "Participating Relay networks must publish censorship and operating rules. Nothing hidden.",
  alternates: { canonical: `${SITE_URL}/rules` },
  openGraph: {
    title: "Posted rules · MyProblem",
    description:
      "Public rules directory for Relay-compatible networks. No hidden shadow censorship.",
    url: `${SITE_URL}/rules`,
    images: [OG_IMAGE],
  },
};

export default function RulesPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader variant="home" />
      <main id="main" className="site legal-page">
        <p className="eyebrow">Accountability · Relay Vision</p>
        <h1 className="legal-title">Posted rules</h1>
        <p className="section-lead">
          Every participating Relay network must publish its rules. Local legal
          restrictions must be visible. Missing rules must be identified—not
          treated as unrestricted. No hidden shadow censorship.
        </p>

        <section aria-labelledby="directory-heading">
          <h2 id="directory-heading">Directory (stub)</h2>
          <p>
            Operator listings will record: region, jurisdiction, restrictions,
            legal or policy basis, enforcement and notification process,
            effective date, change history, and contact/review process.
          </p>
          <ul>
            <li>
              <strong>MyProblem / Clevertree default</strong> — Georgia and
              Israel pilots; public rooms; see{" "}
              <Link href="/how-we-run">how we run</Link> and{" "}
              <Link href="/terms">terms</Link>. Full operator rows ship when
              additional nodes join.
            </li>
          </ul>
        </section>

        <p>
          Contact{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to register
          an operator rules record. Related:{" "}
          <Link href="/investors">funding / node operation</Link>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
