"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "photos", label: "Photos" },
  { id: "routes", label: "Routes" },
  { id: "advice", label: "Advice / Chat" },
  { id: "approaches", label: "Approaches" },
  { id: "safety", label: "Safety" },
] as const;

export function FixitChipNav() {
  const [active, setActive] = useState<string>("overview");

  useEffect(() => {
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  function jump(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  }

  return (
    <nav className="fixit-chip-nav" aria-label="Section navigation">
      <div className="fixit-chips">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`fixit-chip${active === s.id ? " active" : ""}`}
            onClick={() => jump(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
