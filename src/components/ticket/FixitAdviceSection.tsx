"use client";

import { useEffect, useState } from "react";
import { ClevertreeChatMount } from "./ClevertreeChatMount";

type Props = {
  topic: string;
  title: string;
  focusRoute: string | null;
  onExpandedChange?: (expanded: boolean) => void;
};

export function FixitAdviceSection({
  topic,
  title,
  focusRoute,
  onExpandedChange,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (focusRoute) {
      setExpanded(true);
      onExpandedChange?.(true);
    }
  }, [focusRoute, onExpandedChange]);

  function expand() {
    setExpanded(true);
    onExpandedChange?.(true);
  }

  function collapse() {
    setExpanded(false);
    onExpandedChange?.(false);
  }

  return (
    <section className="fixit-section" id="advice" aria-label="Discuss this problem">
      <h2>Talk it through</h2>
      <div className="fixit-card fixit-advice-compact">
        <p>
          Anonymous chat geared toward finding solutions. Use one
          solution-route key per path. The SI organizes after batch curation — it
          does not pick a winner.
        </p>
        {focusRoute ? (
          <p className="fixit-route-focus">Focused route: {focusRoute}</p>
        ) : null}
        {!expanded ? (
          <>
            <p className="fixit-lead" style={{ marginBottom: 0 }}>
              Compact view. Expand for the full board on this page (same URL).
            </p>
            <button
              type="button"
              className="fixit-btn fixit-expand-btn"
              onClick={expand}
            >
              Expand chat
            </button>
          </>
        ) : (
          <button
            type="button"
            className="fixit-btn ghost fixit-expand-btn"
            onClick={collapse}
          >
            Collapse chat
          </button>
        )}
        {expanded ? (
          <div className="fixit-advice-full">
            <ClevertreeChatMount
              topic={topic}
              title={title}
              focusRoute={focusRoute}
              expanded
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
