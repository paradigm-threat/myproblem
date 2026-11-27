import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { OG_IMAGE, SITE_URL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Disclaimers",
  description:
    "Examples are not prices or forecasts. Intent is not agreement. Public help stays free.",
  alternates: { canonical: `${SITE_URL}/disclaimers` },
  openGraph: {
    title: "Disclaimers · MyProblem",
    description:
      "Overflow legal and product disclaimers for MyProblem / Relay.",
    url: `${SITE_URL}/disclaimers`,
    images: [OG_IMAGE],
  },
};

export default function DisclaimersPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader variant="home" />
      <main id="main" className="site legal-page">
        <p className="eyebrow">Overflow · not the first viewport</p>
        <h1 className="legal-title">Disclaimers</h1>
        <ul>
          <li>
            Examples on this site (including token-cost figures) are
            illustrations, not prices, forecasts, or promised returns.
          </li>
          <li>
            Fee caps for node operators remain to be published. Nothing here
            authorizes operation outside accepted limits.
          </li>
          <li>
            Private chat, Stripe tips, and private tickets are planned or
            partial—not all are live product.
          </li>
          <li>
            Educational / public-utility and 501(c)(3) language is intent until
            entity status exists. Do not treat it as a current legal claim.
          </li>
          <li>
            Public rooms are public. Do not post sensitive personal information.
          </li>
          <li>
            MyProblem is not a doctor, veterinarian, or lawyer. Emergency and
            licensed-care redirects stay on screen.
          </li>
        </ul>
        <p>
          <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link>{" "}
          · <Link href="/how-we-run">How we run</Link> ·{" "}
          <Link href="/rules">Posted rules</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
