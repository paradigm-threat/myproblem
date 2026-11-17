import type { PublicProblemView } from "./slugResolve";

export type TicketStepState = "done" | "current" | "later";

export type TicketStatusStep = {
  id: "submitted" | "ai" | "people" | "plan" | "solved";
  label: string;
  state: TicketStepState;
};

export type TicketStatusModel = {
  pill: string;
  summary: string;
  steps: TicketStatusStep[];
};

const LABELS = {
  submitted: "Submitted",
  ai: "AI review",
  people: "People",
  plan: "Fix plan",
  solved: "Solved",
} as const;

/**
 * Public status. An unsolved ticket with no advice is submitted and waiting.
 * It does not claim a fix plan. Solved completes every step.
 */
export function ticketStatus(
  problem: Pick<PublicProblemView, "resolution">,
): TicketStatusModel {
  if (problem.resolution === "solved") {
    return {
      pill: "Solved",
      summary: "This problem is marked solved.",
      steps: (Object.keys(LABELS) as (keyof typeof LABELS)[]).map((id) => ({
        id,
        label: LABELS[id],
        state: "done",
      })),
    };
  }
  return {
    pill: "Awaiting review",
    summary: "Submitted. Waiting for the AI pass and for people to advise.",
    steps: [
      { id: "submitted", label: LABELS.submitted, state: "done" },
      { id: "ai", label: LABELS.ai, state: "current" },
      { id: "people", label: LABELS.people, state: "current" },
      { id: "plan", label: LABELS.plan, state: "later" },
      { id: "solved", label: LABELS.solved, state: "later" },
    ],
  };
}
