"use client";

import { useEffect } from "react";
import { getOrCreateVisitorId, rememberTicket } from "@/lib/tickets/vault";
import type { PublicProblemView } from "@/lib/tickets/slugResolve";

/** Side-effect: mint visitor + vault this problem on the device. */
export function RememberTicket({ problem }: { problem: PublicProblemView }) {
  useEffect(() => {
    getOrCreateVisitorId();
    rememberTicket({
      ticket_uuid: problem.ticket_uuid,
      slug: problem.slug,
      title: problem.title,
      resolution: problem.resolution,
    });
  }, [problem.ticket_uuid, problem.slug, problem.title, problem.resolution]);
  return null;
}
