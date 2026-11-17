import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function TicketNotFound() {
  return (
    <>
      <SiteHeader variant="demo" />
      <main className="ticket-page site">
        <h1 className="ticket-title">Link not found</h1>
        <p className="ticket-description">
          This share link is missing, expired, or was revoked when the problem was closed or
          solved. There is no public ticket directory.
        </p>
        <p>
          <Link href="/">Back to MyProblem</Link>
        </p>
      </main>
    </>
  );
}
