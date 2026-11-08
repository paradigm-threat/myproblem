import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { CONTACT_EMAIL, RELAY_URL, SITE_URL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Terms of Service & Disclaimers",
  description:
    "Terms of Service and product disclaimers for MyProblem by Clevertree LLC (Georgia). Ticket-based investigation help — not a substitute for licensed professional advice.",
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: "MyProblem — Terms & Disclaimers",
    description:
      "Clevertree LLC terms for MyProblem.app: everyday problem investigation, softer professional limits, and pilot service rules.",
    url: `${SITE_URL}/terms`,
  },
};

const EFFECTIVE =
  "November 8, 2026 (knowledge-base disclaimer: speculative, no boosting)";

export default function TermsPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <SiteHeader variant="demo" />

      <main id="main" className="site legal-page">
        <p className="eyebrow">Clevertree LLC · Georgia</p>
        <h1 className="legal-title">Terms of Service &amp; Disclaimers</h1>
        <p className="section-lead legal-banner">
          This page is informational and is{" "}
          <strong className="emph">not legal advice</strong> to you about your
          rights. Effective {EFFECTIVE}.
        </p>

        <section className="legal-section" aria-labelledby="who-heading">
          <h2 id="who-heading">1. Who we are</h2>
          <p>
            These terms cover use of <strong>MyProblem</strong> at{" "}
            <a href={SITE_URL}>{SITE_URL.replace("https://", "")}</a>, operated
            by <strong>Clevertree LLC</strong> (Georgia), which is being formed
            or restarted in Georgia. MyProblem is the product brand; Clevertree
            LLC is the contracting party.
          </p>
          <p>
            Contact:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="what-heading">
          <h2 id="what-heading">2. What MyProblem is</h2>
          <p>
            MyProblem is a <strong>ticket-first investigation service</strong>.
            People capture a Problem with audio and stills (no server video
            upload), we queue investigation as deferred{" "}
            <strong>Projects</strong>, and when useful we may help connect you
            with local businesses in our pilot regions. Deep research runs when
            capacity allows — we prioritize thoroughness over instant answers.
          </p>
          <p>
            Pilots are scoped to <strong>Georgia (USA)</strong> and{" "}
            <strong>Israel</strong>. The product is powered by{" "}
            <a href={RELAY_URL} rel="noopener noreferrer" target="_blank">
              Relay
            </a>{" "}
            for networking and Problem dossiers.
          </p>
          <p>
            <strong>We do not answer business phone lines today.</strong> Shops
            may link their websites (or QR codes) to MyProblem ticket creation
            so customers can record audio and add photos in a process similar to
            “calling first,” without us picking up a PSTN/VoIP line. Automated
            inbound VoIP into the same ticket pipeline is a possible future
            feature, not a current promise.
          </p>
          <p>
            The service is early / coming soon. Features, availability, and
            regions may change.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="focus-heading">
          <h2 id="focus-heading">3. What we focus on</h2>
          <p>
            We aim to help with <strong>everyday practical problems</strong> —
            things like a sink that will not drain, a backyard gate that will
            not close, a lost kitten flyer workflow, appliance troubleshooting,
            and other local how-tos — by investigating and organizing what is
            going on.
          </p>
          <p>
            We try to be <strong>helpful investigators</strong>, not an
            authority on legal, political, or highly controversial matters.
            Product guardrails prefer staying in the everyday-problem lane and
            avoiding political advocacy or contested policy judgments.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="advice-heading">
          <h2 id="advice-heading">4. Advice and professional limits</h2>
          <p>
            Suggestions, dossiers, transcripts, and knowledge-base articles are{" "}
            <strong>general information and investigation assistance</strong>.
            They may draw on what you capture, public material, and feedback or
            sources we treat as reasonably reliable. They are{" "}
            <strong>
              not a substitute for licensed legal, medical, veterinary, tax, or
              financial advice
            </strong>
            , and they are not a professional diagnosis or guarantee.
          </p>
          <p>
            We will <strong>try</strong> to stop, soften, or redirect when we
            believe a situation needs a licensed professional or emergency
            services. Until that point — and when we are unsure — we may still
            offer general DIY or investigative help so you can understand the
            problem better. That help is optional guidance, not orders.
          </p>
          <p>
            <strong>You decide</strong> what to do with any output. Clevertree
            LLC and MyProblem are not responsible for outcomes from following,
            ignoring, or misinterpreting suggestions.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="kb-heading">
          <h2 id="kb-heading">4a. Shared knowledge base</h2>
          <p>
            MyProblem may maintain a shared knowledge base to help{" "}
            <strong>solve problems</strong> — especially using{" "}
            <strong>local resources</strong> — and, when useful, general DIY
            guidance that does not depend on where you live. That knowledge is
            meant for the product’s investigation loop, not as a mirror of
            search-engine results or business directories.
          </p>
          <p>
            <strong>Disclaimer:</strong> knowledge-base content is{" "}
            <strong>speculative and provisional</strong>. It is based on{" "}
            <strong>user contributions</strong> and{" "}
            <strong>AI investigations</strong> only. It is{" "}
            <strong>not</strong> ranked by advertising, paid placement, or
            engagement boosting. <strong>Boosting is not allowed.</strong>
          </p>
          <p>
            We do <strong>not</strong> intend to freeze-frame or cache the
            greater internet (hours, phones, menus, encyclopedia pages, and
            similar searchable facts). Those stay on the live web; we cite them
            when needed. We aim to store useful, investigation-earned advice,
            re-test it over time, refine or retire it when it stops helping,
            and keep history so lessons are not silently forgotten.
          </p>
          <p>
            Assessments of particular businesses appear only when a Project
            thoroughly investigated that business for a real ticket — not as a
            speculative crawl of every local company.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="emergency-heading">
          <h2 id="emergency-heading">5. Emergencies</h2>
          <p>
            If someone is in danger, or you need immediate emergency help,{" "}
            <strong>call your local emergency number</strong>. Do not rely on
            MyProblem for crisis response, dispatch, or life-critical timing.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="tickets-heading">
          <h2 id="tickets-heading">6. Accounts and tickets</h2>
          <p>
            Tickets may be anonymous by default (server UUID with local device
            backup). Optional free recover email or registration helps you keep
            access if you change devices. Losing a phone without backup or
            recover email can mean losing those tickets — we warn about that
            because absolute “never lose” access is impossible.
          </p>
          <p>
            You are responsible for content you submit (audio, photos, text).
            Do not upload material you have no right to share. Investigation
            depth and speed depend on capacity (including batch / Spot
            resources); we do not guarantee completeness, accuracy, or a fixed
            turnaround.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="pii-heading">
          <h2 id="pii-heading">7. Personal information (PII) policy</h2>
          <p>
            <strong>Intent:</strong> protect the ticket creator. Personal
            identifiers (exact street addresses, phone numbers, and similar PII
            not required for shared ticket context) are meant to stay on{" "}
            <strong>your client devices</strong> — phones, browsers, and local
            backups — <strong>not</strong> on Clevertree / MyProblem servers or
            the shared Relay ticket network as durable, cacheable dossier
            fields.
          </p>
          <p>
            When the AI packages a ticket for the network, it should perform{" "}
            <strong>automatic PII conversion</strong>: e.g. turn a spoken street
            address into a city or coarse safe location band so investigation
            can proceed without putting your precise personal location on the
            mesh. If a detail is personal, not needed for ticket context, and
            not requested by a service provider, it should stay{" "}
            <strong>out of the network entirely</strong> — not stored or cached
            as PII on shared infrastructure.
          </p>
          <p>
            When a provider has a legitimate need and you choose to share,
            personal detail should move through a{" "}
            <strong>two-way secure direct messaging</strong> channel between you
            and that party — not by publishing it onto the shared ticket
            timeline or knowledge base. “Only available on request” means you
            (or an explicit request/release flow) control release; we do not
            treat the public dossier as the place for raw PII.
          </p>
          <p>
            This is our product policy and design target. No system is perfect:
            do not put secrets in tickets you would not want mishandled, and
            contact us if you believe PII was retained incorrectly. See also the{" "}
            <a href="/#people">For people</a> privacy bullets on the home page.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="biz-heading">
          <h2 id="biz-heading">8. Businesses and service providers</h2>
          <p>
            Preferred stance: local businesses join at{" "}
            <strong>$0</strong> with <strong>zero obligation</strong> to
            respond. Incoming requests work like a social feed — shops may
            engage or ignore entirely, with no SLA and no penalty for silence.
          </p>
          <p>
            We do not guarantee leads, bookings, or revenue. MyProblem does not
            practice medicine or veterinary medicine, and it is not a licensed
            care marketplace. Emergencies and licensed care should go through
            appropriate channels.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="use-heading">
          <h2 id="use-heading">9. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use MyProblem to facilitate illegal activity</li>
            <li>Abuse, harass, spam, or overload the service</li>
            <li>Attempt to bypass safety stops or redirect prompts</li>
            <li>
              Scrape, attack, or reverse-engineer the service in ways that harm
              other users or our infrastructure
            </li>
            <li>
              Misrepresent MyProblem output as licensed professional advice
            </li>
          </ul>
          <p>
            We may suspend or limit access if we reasonably believe these terms
            are being violated.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="warranty-heading">
          <h2 id="warranty-heading">10. No warranties; limitation of liability</h2>
          <p>
            The service is provided <strong>“as is”</strong> and{" "}
            <strong>“as available”</strong>, especially while we are in pilot /
            coming-soon status. We do not warrant uninterrupted access,
            error-free investigation, or that any suggestion will fix your
            Problem.
          </p>
          <p>
            To the fullest extent allowed by law, Clevertree LLC and its
            operators are not liable for indirect, incidental, special, or
            consequential damages arising from use of MyProblem. Where liability
            cannot be excluded, it is limited to the greater of (a) amounts you
            paid us for the service in the prior three months, or (b) USD $50 —
            noting that preferred business pricing is free and much consumer use
            is free.
          </p>
          <p>
            Some jurisdictions do not allow certain limitations; in those
            places, limits apply only as far as permitted.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="network-heading">
          <h2 id="network-heading">
            11. World network intent (investors and hardware)
          </h2>
          <p>
            MyProblem is built to participate in a{" "}
            <strong>compatible world network</strong> (Relay-aligned tips and
            tickets), not a pile of unrelated private clones. Our{" "}
            <strong>stated intent</strong> — which is{" "}
            <strong>not an offer, license grant, or signed agreement</strong> —
            is:
          </p>
          <ul>
            <li>
              Regional or hardware investors / operators who join should keep
              gear and software{" "}
              <strong>interoperable with the shared ticket system</strong> so
              Problems can be found and shared under substantially the same
              conditions across the network.
            </li>
            <li>
              <strong>Splintering</strong> the network into incompatible
              forks, walled ticket islands, or IP fragments that block
              discovery defeats the product purpose. That is not the investor
              profile we are seeking.
            </li>
            <li>
              <strong>Fees are intended mostly to flow to local hardware
              handlers</strong> who run compatible capacity — not to fund a
              traditional salary stack at the center.
            </li>
            <li>
              We may later require{" "}
              <strong>contracts with early adopters</strong> (hardware, region,
              or capital). Nothing on this site, including this section, creates
              those obligations until a separate written agreement says so.
            </li>
          </ul>
          <p>
            Product membership in Clevertree LLC / MyProblem does{" "}
            <strong>not</strong> automatically convey ownership of the Relay
            gateway fleet or unrelated mesh projects unless a written deal says
            otherwise. See the{" "}
            <a href="/#investors">Investors</a> section on the home page for
            the public pitch in plain language.
          </p>
        </section>

        <section className="legal-section" aria-labelledby="changes-heading">
          <h2 id="changes-heading">12. Changes and contact</h2>
          <p>
            We may update these terms as the product evolves. The effective date
            above will change when we do. Continued use after an update means
            you accept the revised terms.
          </p>
          <p>
            Questions:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>

        <p className="legal-footer-note">
          By using MyProblem, you acknowledge that you have read this page —
          including the softer professional limits and the non-binding world-
          network investor intent above.
        </p>
      </main>
    </>
  );
}
