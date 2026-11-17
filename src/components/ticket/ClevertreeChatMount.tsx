"use client";

import { useEffect, useRef } from "react";
import { CHAT_API_BASE } from "@/lib/contact";
import { getOrCreateVisitorId } from "@/lib/tickets/vault";

type Props = {
  /** Clevertree topic key (= private ticket_uuid). Not shown in the page URL. */
  topic: string;
  title?: string;
};

/**
 * Mount official Clevertree Chat board snippet.
 * Visitor UUID is created on first interaction path (mount primes localStorage).
 */
export function ClevertreeChatMount({ topic, title }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getOrCreateVisitorId();
    const host = hostRef.current;
    if (!host || !topic) return;

    host.innerHTML = "";
    const board = document.createElement("div");
    board.setAttribute("data-clevertree-board", "");
    board.setAttribute("data-api", "chat");
    board.setAttribute("data-api-base", CHAT_API_BASE);
    board.setAttribute("data-topic", topic);
    if (title) board.setAttribute("data-title", title);
    host.appendChild(board);

    const cssId = "clevertree-board-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = `${CHAT_API_BASE}/fronts/snippet/clevertree-board.css`;
      document.head.appendChild(link);
    }

    const prev = document.querySelector<HTMLScriptElement>("script[data-clevertree-board-js]");
    if (prev) prev.remove();
    const script = document.createElement("script");
    script.src = `${CHAT_API_BASE}/fronts/snippet/clevertree-board.js`;
    script.async = true;
    script.dataset.clevertreeBoardJs = "1";
    document.body.appendChild(script);

    return () => {
      host.innerHTML = "";
    };
  }, [topic, title]);

  return (
    <section className="ticket-chat" aria-label="Discuss this problem">
      <h2 className="ticket-section-title">Talk it through</h2>
      <p className="ticket-section-lead">
        Anonymous chat geared toward finding solutions. Use one solution-route
        key per path (hire-electrician, diy-with-caution, …). The SI organizes
        after batch curation — it does not pick a winner.
      </p>
      <div ref={hostRef} className="ticket-chat-host" />
    </section>
  );
}
