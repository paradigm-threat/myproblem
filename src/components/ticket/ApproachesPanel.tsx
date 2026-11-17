"use client";

import { useCallback, useEffect, useState } from "react";
import { CHAT_API_BASE } from "@/lib/contact";
import { getOrCreateVisitorId } from "@/lib/tickets/vault";

type Approach = {
  key: string;
  title?: string;
  position?: string;
  count?: number;
};

type Props = {
  topic: string;
  /** Seeded solution-route keys before batch curation fills the board. */
  suggestedRoutes?: string[];
};

type BoardView = {
  keys?: Array<{
    key?: string;
    id?: string;
    title?: string;
    name?: string;
    position?: string;
    summary?: string;
    comments?: unknown[];
  }>;
  categories?: Approach[];
};

function normalizeApproaches(view: BoardView | null): Approach[] {
  if (!view) return [];
  if (Array.isArray(view.categories) && view.categories.length) {
    return view.categories.filter((c) => c.key && c.key !== "uncategorized");
  }
  const keys = view.keys || [];
  return keys
    .map((k) => ({
      key: String(k.key || k.id || ""),
      title: k.title || k.name || String(k.key || k.id || ""),
      position: k.position || k.summary || "",
      count: Array.isArray(k.comments) ? k.comments.length : undefined,
    }))
    .filter((a) => a.key && a.key !== "uncategorized");
}

/**
 * Solution approaches = Clevertree Chat category keys for this ticket topic.
 */
export function ApproachesPanel({ topic, suggestedRoutes = [] }: Props) {
  const [approaches, setApproaches] = useState<Approach[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!topic) return;
    const visitor = getOrCreateVisitorId();
    try {
      const res = await fetch(`${CHAT_API_BASE}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "view", topic, visitor }),
        credentials: "omit",
      });
      if (!res.ok) {
        setApproaches([]);
        return;
      }
      const data = (await res.json()) as { view?: BoardView } & BoardView;
      const view = data.view || data;
      setApproaches(normalizeApproaches(view));
      setError(null);
    } catch {
      setError("Approaches will appear after the first curated posts.");
    }
  }, [topic]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 20_000);
    return () => clearInterval(t);
  }, [load]);

  const waiting = approaches.length === 0 && suggestedRoutes.length > 0;

  return (
    <section className="fixit-section" id="approaches" aria-label="Solution approaches">
      <h2>Approaches</h2>
      <div className="fixit-card">
        {error ? <p className="fixit-lead">{error}</p> : null}
        {waiting ? (
          <ul className="fixit-approaches">
            {suggestedRoutes.map((key) => (
              <li key={key} className="fixit-approach">
                <h3>{key}</h3>
                <p>Waiting for posts — use this key when you advise.</p>
              </li>
            ))}
          </ul>
        ) : null}
        {approaches.length === 0 && !suggestedRoutes.length && !error ? (
          <p className="fixit-lead">
            No approaches yet — start the conversation above. Keys appear once
            posts are curated.
          </p>
        ) : null}
        {approaches.length > 0 ? (
          <ul className="fixit-approaches">
            {approaches.map((a) => (
              <li key={a.key} className="fixit-approach">
                <h3>{a.title || a.key}</h3>
                {a.position ? <p>{a.position}</p> : null}
                {typeof a.count === "number" ? (
                  <p>
                    {a.count} note{a.count === 1 ? "" : "s"}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="fixit-notice">
          Possible paths. SI files posts under these after batch curation.
        </p>
      </div>
    </section>
  );
}
