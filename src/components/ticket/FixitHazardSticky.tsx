"use client";

import { useEffect, useState } from "react";

type Props = {
  hazard: string;
};

/** Thin sticky soft-stop bar after the hero hazard callout scrolls away. */
export function FixitHazardSticky({ hazard }: Props) {
  const [visible, setVisible] = useState(false);
  const label = hazard.trim();
  const title = label
    ? `${label.charAt(0).toUpperCase()}${label.slice(1)} — soft stop · humans advise; SI organizes, does not authorize live work`
    : "Soft stop · humans advise; SI organizes, does not authorize live work";

  useEffect(() => {
    const hero = document.getElementById("fixit-hazard-hero");
    if (!hero) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixit-hazard-sticky${visible ? " visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      {title}
    </div>
  );
}
