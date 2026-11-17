"use client";

import { useState } from "react";
import { TicketVaultDrawer } from "./TicketVaultDrawer";
import { ticketShareText } from "@/lib/tickets/ticketSeo";
import { shareUrlForSlug } from "@/lib/tickets/vault";

export function FixitShareRow({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const shareTitle = `${title} — Problem ticket · MyProblem`;
  const shareText = ticketShareText(title);

  async function copy() {
    const url = shareUrlForSlug(slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function share() {
    const url = shareUrlForSlug(slug);
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url, text: shareText });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    await copy();
  }

  return (
    <div className="fixit-share-row">
      <button type="button" className="fixit-btn" onClick={copy}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      <button type="button" className="fixit-btn secondary" onClick={share}>
        Share
      </button>
      <TicketVaultDrawer />
    </div>
  );
}
