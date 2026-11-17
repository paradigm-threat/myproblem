import type { PublicProblemView } from "@/lib/tickets/slugResolve";
import { ticketStatus } from "@/lib/tickets/ticketStatus";

export function TicketStatusCard({ problem }: { problem: PublicProblemView }) {
  const status = ticketStatus(problem);
  const still = problem.stills[0];
  const solved = problem.resolution === "solved";

  return (
    <section className="ticket-status" aria-label="Ticket status">
      <div className="ticket-status-head">
        {still ? (
          <img
            className="ticket-status-thumb"
            src={still.uri}
            alt="First photo of this problem"
          />
        ) : (
          <div className="ticket-status-thumb is-empty" aria-hidden="true" />
        )}
        <div className="ticket-status-copy">
          <p className="fixit-kicker">
            Problem ticket on{" "}
            <a href="https://myproblem.app">MyProblem.app</a>
          </p>
          <div className={`fixit-status-chip${solved ? " is-solved" : ""}`}>
            {status.pill}
          </div>
          <h1 className="fixit-title">{problem.title}</h1>
          <p className="ticket-status-summary">{status.summary}</p>
        </div>
      </div>
      <ol className="ticket-status-steps">
        {status.steps.map((step) => (
          <li key={step.id} className={`ticket-status-step is-${step.state}`}>
            <span className="ticket-status-mark" aria-hidden="true" />
            <span>{step.label}</span>
            {step.state === "current" ? (
              <span className="sr-only">, current</span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
