"use client";

import { useState } from "react";
import { shareUrlForSlug } from "@/lib/tickets/vault";

/** Copy public /t/<slug> only — never the private uuid. */
export function ShareSlugButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

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

  return (
    <button type="button" className="ticket-share" onClick={copy}>
      {copied ? "Link copied" : "Copy share link"}
    </button>
  );
}
