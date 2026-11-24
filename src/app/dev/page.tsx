import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { CONTACT_EMAIL, OG_IMAGE, SITE_URL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Dev — work in progress",
  description:
    "MyProblem status, stack, phases, and how to help with Cursor, PRs, and QA.",
  alternates: { canonical: `${SITE_URL}/dev` },
  openGraph: {
    title: "Dev · MyProblem",
    description: "Work in progress — building as we go. Looking for help.",
    url: `${SITE_URL}/dev`,
    images: [OG_IMAGE],
  },
};

const REPOS = [
  {
    name: "myproblem",
    href: "https://gitlab.com/clevertree/myproblem",
    role: "Site (Vercel) — marketing, /submit, /t/",
  },
  {
    name: "myproblem-tickets",
    href: "https://gitlab.com/clevertree/myproblem-tickets",
    role: "Intake + batch workers, tip git",
  },
  {
    name: "myproblem-kb",
    href: "https://gitlab.com/clevertree/myproblem-kb",
    role: "Git Markdown knowledge base",
  },
] as const;

export default function DevPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader variant="demo" />
      <main id="main" className="site dev-page">
        <header>
          <p className="eyebrow">Dev</p>
          <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}>
            Work in progress — building as we go
          </h1>
          <p className="section-lead">
            Looking for help where appropriate. Full living status lives in the
            repo at <code>docs/dev.md</code> — update it when phases move. This
            page is the public summary.
          </p>
          <div className="cta-row">
            <Link className="btn-primary" href="/submit">
              Try it now
            </Link>
            <Link className="btn-secondary" href="/extension">
              Relay for Networkers
            </Link>
            <Link className="btn-secondary" href="/how-we-run">
              How we run
            </Link>
            <a
              className="btn-secondary"
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("MyProblem — want to help")}`}
            >
              Email to help
            </a>
          </div>
        </header>

        <section className="dev-card" aria-labelledby="where-heading">
          <h2 id="where-heading">Where we are</h2>
          <p>
            Free SI (Super Intelligence, i.e. AI) front door for local problems.
            People file tickets; investigation is batched (Projects + KB), not a
            realtime frontier chatbot. Public help pages:{" "}
            <Link href="/t/garage-ring-power">/t/garage-ring-power</Link>. Web
            submit is live at <Link href="/submit">/submit</Link>.
          </p>
          <p>
            Ops cadence: daily anonymous tip/batch review, then next-day
            patches—A-team + LLM at corp speed. Goal: detailed user reports
            drive automated triage without a developer in the middle. Public
            narrative:{" "}
            <Link href="/how-we-run#daily-ops">how we run · daily ops</Link>.
          </p>
        </section>

        <section className="dev-card" aria-labelledby="stack-heading">
          <h2 id="stack-heading">Current stack</h2>
          <ul>
            <li>
              <strong>myproblem.app</strong> — Next.js on Vercel (site, submit,
              public tickets)
            </li>
            <li>
              <strong>intake.myproblem.app</strong> — cache + enqueue (media,
              jobs, slugs); tip/KB commits only from batch
            </li>
            <li>
              <strong>Clevertree Chat</strong> — discussion on tip UUID rooms;
              SI organizes after batch
            </li>
            <li>
              <strong>KB + Bunny/cache</strong> — cite-don’t-cache KB; per-repo
              Bunny; Phase 1 Cursor-as-batch on shared queue
            </li>
          </ul>
        </section>

        <section className="dev-card" aria-labelledby="repos-heading">
          <h2 id="repos-heading">Repos</h2>
          <p>
            Public GitLab URLs (invite may be required to clone). Need access?{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
          <ul>
            {REPOS.map((r) => (
              <li key={r.href}>
                <a href={r.href} rel="noopener noreferrer" target="_blank">
                  {r.name}
                </a>
                {" — "}
                {r.role}
              </li>
            ))}
          </ul>
        </section>

        <section className="dev-card" aria-labelledby="phases-heading">
          <h2 id="phases-heading">Phases</h2>
          <p style={{ marginBottom: "0.75rem" }}>
            Product SoT:{" "}
            <a
              href="https://gitlab.com/clevertree/myproblem/-/blob/main/docs/batch-phases.md"
              rel="noopener noreferrer"
              target="_blank"
            >
              batch-phases.md
            </a>
            . Home <Link href="/#plan">Now / Next</Link> matches this list.
          </p>
          <ul className="dev-phases">
            <li>
              <span className="phase">Done</span>
              <div>
                Public `/t/` + FixIt theme; SI rename; garage pilot; web `/submit`
                with opt-in public slug; unpublish-slug; this Dev page.
              </div>
            </li>
            <li>
              <span className="phase is-wip">Now</span>
              <div>
                Tickets + Clevertree on the same tip UUID;{" "}
                <Link href="/extension">Relay for Networkers</Link> + local ZIP;
                confidence
                gauges; KB cite-don’t-cache + private tip remotes; Phase 1
                Cursor-as-batch / Intake cache+enqueue; ephemeral Spot thesis (
                <Link href="/#si-different">SI different</Link>).
              </div>
            </li>
            <li>
              <span className="phase is-next">Next</span>
              <div>
                Phase 2 Spot automation; deferred video → choice stills + Bunny;
                batched coding/docs/networking Projects; shared QuizGate +
                Clevertree queue drain; recover email / register; FixIt remote
                when minted; broader regions.
              </div>
            </li>
          </ul>
        </section>

        <section className="dev-card" aria-labelledby="help-heading">
          <h2 id="help-heading">How to help</h2>
          <ul>
            <li>
              Open a repo in <strong>Cursor</strong> (or similar) and ship a
              small PR.
            </li>
            <li>
              QA on web (<Link href="/">home</Link>,{" "}
              <Link href="/submit">submit</Link>,{" "}
              <Link href="/t/garage-ring-power">pilot ticket</Link>) and on
              phones.
            </li>
            <li>Fix bugs, polish copy/UI, improve docs — especially docs/dev.md.</li>
            <li>Raise PRs on the GitLab remotes above.</li>
          </ul>
          <p>Helping is welcome :)</p>
        </section>
      </main>
    </>
  );
}
