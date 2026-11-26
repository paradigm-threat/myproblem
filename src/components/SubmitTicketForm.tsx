"use client";

import { useEffect } from "react";

/**
 * Retired public path. Homepage SoT is the Clevertree room (`/#room`).
 * This stub never mints tip UUIDs / outbox tickets. Keep the export name so
 * any stale import cannot revive tip-form intake.
 */
export function SubmitTicketForm() {
  useEffect(() => {
    window.location.replace("/#room");
  }, []);

  return (
    <main className="site" style={{ padding: "2rem 1rem" }}>
      <p>
        Ticket-form submit is retired. Ask in the{" "}
        <a href="/#room">public room</a> — type, speak, or video posts into the
        channel. Tips are created only when batch SI decides tracking is needed.
      </p>
    </main>
  );
}
