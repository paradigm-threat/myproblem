"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readTicketVault, type VaultTicket } from "@/lib/tickets/vault";

export function TicketVaultDrawer() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<VaultTicket[]>([]);

  useEffect(() => {
    setEntries(readTicketVault());
  }, [open]);

  return (
    <div className="ticket-vault">
      <button
        type="button"
        className="ticket-vault-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        On this device
      </button>
      {open ? (
        <div className="ticket-vault-panel" role="dialog" aria-label="Tickets on this device">
          <p className="ticket-vault-warn">
            Pure anonymous: clearing site data or losing this device loses this list. There is no
            public ticket lookup.
          </p>
          {entries.length === 0 ? (
            <p className="ticket-vault-empty">No problems remembered on this device yet.</p>
          ) : (
            <ul className="ticket-vault-list">
              {entries.map((e) => (
                <li key={e.ticket_uuid}>
                  {e.slug ? (
                    <Link href={`/t/${encodeURIComponent(e.slug)}`}>
                      {e.title || e.slug}
                      {e.resolution === "solved" ? " · Solved" : ""}
                    </Link>
                  ) : (
                    <span>
                      {e.title || "Problem"} (link expired)
                      {e.resolution === "solved" ? " · Solved" : ""}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
