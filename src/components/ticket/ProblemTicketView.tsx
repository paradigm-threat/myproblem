"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { PublicProblemView } from "@/lib/tickets/slugResolve";
import { TICKET_TRAINING_NOTICE } from "@/lib/contact";
import { ApproachesPanel } from "./ApproachesPanel";
import { FixitAdviceSection } from "./FixitAdviceSection";
import { FixitChipNav } from "./FixitChipNav";
import { FixitHazardSticky } from "./FixitHazardSticky";
import { FixitPhotoGallery } from "./FixitPhotoGallery";
import { FixitShareRow } from "./FixitShareRow";
import { RememberTicket } from "./RememberTicket";

const DEFAULT_ROUTES = [
  "hire-electrician",
  "diy-with-caution",
  "more-evidence-needed",
  "permit-or-ahj",
  "other",
];

export function ProblemTicketView({ problem }: { problem: PublicProblemView }) {
  const solved = problem.resolution === "solved";
  const routes =
    problem.solutionRoutes?.length ? problem.solutionRoutes : DEFAULT_ROUTES;
  const [focusRoute, setFocusRoute] = useState<string | null>(null);
  const [flashRoute, setFlashRoute] = useState<string | null>(null);

  const adviseOnRoute = useCallback((route: string) => {
    setFocusRoute(route);
    setFlashRoute(route);
    window.setTimeout(() => setFlashRoute(null), 1500);
    document.getElementById("advice")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <article className="ticket-problem">
      <RememberTicket problem={problem} />

      {problem.hazard ? <FixitHazardSticky hazard={problem.hazard} /> : null}

      <header className="fixit-hero" id="overview">
        <div className="fixit-hero-inner">
          <div
            className={`fixit-status-chip${solved ? " is-solved" : ""}`}
            aria-label={solved ? "Solved" : "Unsolved"}
          >
            {solved ? "Solved" : "Unsolved"}
          </div>
          {problem.hazard ? (
            <div
              className="fixit-hazard-hero"
              id="fixit-hazard-hero"
              role="status"
            >
              Hazard: {problem.hazard}. Soft stop — humans advise; SI organizes
              solution routes, it does not authorize live panel work.
            </div>
          ) : null}
          <h1 className="fixit-title">{problem.title}</h1>
          {problem.description ? (
            <p className="fixit-subtitle">{problem.description}</p>
          ) : (
            <p className="fixit-subtitle">
              Details are still coming together for this problem.
            </p>
          )}
          <FixitShareRow slug={problem.slug} title={problem.title} />
        </div>
      </header>

      <FixitChipNav />

      <div className="fixit-container">
        <section className="fixit-section" id="overview-story" aria-label="Problem story">
          <div className="fixit-card">
            <h2>Here&apos;s the problem</h2>
            {problem.note ? <p>{problem.note}</p> : null}
            <p className="fixit-notice">{TICKET_TRAINING_NOTICE}</p>
          </div>
        </section>

        <section className="fixit-section" id="photos" aria-label="Photos">
          <h2>Photos</h2>
          <FixitPhotoGallery stills={problem.stills} />
        </section>

        <section
          className="fixit-section"
          id="routes"
          aria-label="Suggested solution routes"
        >
          <h2>Solution routes</h2>
          <p className="fixit-lead">
            One Clevertree key per path. Cards scroll to Advice and focus that
            route&apos;s thread.
          </p>
          <ul className="fixit-routes">
            {routes.map((r) => (
              <li key={r}>
                <button
                  type="button"
                  className={`fixit-route${flashRoute === r ? " active" : ""}`}
                  data-route={r}
                  onClick={() => adviseOnRoute(r)}
                >
                  <strong>{r}</strong>
                  <p>Waiting for posts — use this key when you advise.</p>
                  <div className="advise">Advise / join chat →</div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <FixitAdviceSection
          topic={problem.chatTopic}
          title={problem.title}
          focusRoute={focusRoute}
        />

        <ApproachesPanel
          topic={problem.chatTopic}
          suggestedRoutes={routes}
        />

        <section className="fixit-section" id="safety" aria-label="Safety">
          <div className="fixit-card fixit-safety">
            <h2>Safety</h2>
            {problem.coachLine ? (
              <p>
                <strong>Safety warning:</strong>{" "}
                {problem.coachLine.replace(/^Safety warning:\s*/i, "")}
              </p>
            ) : (
              <p>
                <strong>Safety warning:</strong> Prefer licensed help when
                unsure. This page collects advice for humans — it is not a
                permit or verified work plan.
              </p>
            )}
            <p>
              SI organizes after batch — does not authorize live work / pick a
              winner. No boosting / contractor promo.
            </p>
            <p className="fixit-notice">
              {TICKET_TRAINING_NOTICE} Public link is this short slug while the
              problem is live.{" "}
              <Link href="/privacy">Privacy</Link>
              {" · "}
              <Link href="/terms">Terms</Link>
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
