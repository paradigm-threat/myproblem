import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: { absolute: "Problem ticket not found · MyProblem" },
  description:
    "This MyProblem.app problem ticket link is missing, expired, or was unpublished.",
  robots: { index: false, follow: false },
};

export default function TicketNotFound() {
  return (
    <>
      <SiteHeader variant="demo" />
      <main className="ticket-page site">
        <p className="fixit-kicker" style={{ marginTop: "1.5rem" }}>
          Problem ticket on <Link href="/">MyProblem.app</Link>
        </p>
        <h1 className="ticket-title">Ticket link not found</h1>
        <p className="ticket-description">
          This share link is missing, expired, or was revoked when the problem was
          closed, solved, or unpublished. There is no public ticket directory on
          MyProblem.
        </p>
        <p>
          <Link href="/">Back to MyProblem</Link>
        </p>
      </main>
    </>
  );
}
