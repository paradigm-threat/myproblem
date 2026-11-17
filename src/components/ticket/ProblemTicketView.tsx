"use client";

import type { PublicProblemView } from "@/lib/tickets/slugResolve";
import { ApproachesPanel } from "./ApproachesPanel";
import { ClevertreeChatMount } from "./ClevertreeChatMount";
import { RememberTicket } from "./RememberTicket";
import { ShareSlugButton } from "./ShareSlugButton";
import { TicketVaultDrawer } from "./TicketVaultDrawer";

export function ProblemTicketView({ problem }: { problem: PublicProblemView }) {
  const solved = problem.resolution === "solved";
  const routes = problem.solutionRoutes?.length
    ? problem.solutionRoutes
    : ["hire-electrician", "diy-with-caution", "more-evidence-needed", "other"];

  return (
    <article className="ticket-problem">
      <RememberTicket problem={problem} />
      <div className="ticket-problem-top">
        <TicketVaultDrawer />
        <ShareSlugButton slug={problem.slug} />
      </div>

      <header className="ticket-problem-header">
        <p className="ticket-eyebrow">Here&apos;s my problem</p>
        <p
          className={`ticket-resolution ${solved ? "is-solved" : "is-unsolved"}`}
          aria-label={solved ? "Solved" : "Unsolved"}
        >
          {solved ? "Solved" : "Unsolved"}
        </p>
        {problem.hazard ? (
          <p className="ticket-hazard" role="status">
            Hazard: {problem.hazard}. Soft stop — humans advise; SI organizes
            solution routes, it does not authorize live panel work.
          </p>
        ) : null}
        <h1 className="ticket-title">{problem.title}</h1>
        {problem.description ? (
          <p className="ticket-description">{problem.description}</p>
        ) : (
          <p className="ticket-description is-muted">
            Details are still coming together for this problem.
          </p>
        )}
        {problem.coachLine ? <p className="ticket-coach">{problem.coachLine}</p> : null}
        {problem.note ? <p className="ticket-note">{problem.note}</p> : null}
      </header>

      <section className="ticket-routes" aria-label="Suggested solution routes">
        <h2 className="ticket-section-title">Solution routes</h2>
        <p className="ticket-section-lead">
          One Clevertree key per path. Post under the route that matches your
          advice — SI will organize after batch curation.
        </p>
        <ul className="ticket-routes-list">
          {routes.map((r) => (
            <li key={r}>
              <code>{r}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className="ticket-stills" aria-label="Photos">
        <h2 className="ticket-section-title">Photos</h2>
        {problem.stills.length === 0 ? (
          <p className="ticket-stills-empty">No photos attached yet.</p>
        ) : (
          <ul className="ticket-stills-grid">
            {problem.stills.map((s) => (
              <li key={s.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.uri} alt="" loading="lazy" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ClevertreeChatMount topic={problem.chatTopic} title={problem.title} />
      <ApproachesPanel topic={problem.chatTopic} suggestedRoutes={routes} />
    </article>
  );
}
