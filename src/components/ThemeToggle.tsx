"use client";

import { useEffect, useId, useState } from "react";
import {
  applySiteTheme,
  readThemePreference,
  type ThemePreference,
} from "@/lib/theme";

type Props = {
  className?: string;
};

const OPTIONS: { value: ThemePreference; label: string; icon: "sun" | "moon" | "monitor" }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "monitor" },
];

function Icon({ kind }: { kind: "sun" | "moon" | "monitor" }) {
  if (kind === "sun") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M12 2v2.2M12 19.8V22M4.2 12H2M22 12h-2.2M5.05 5.05l1.56 1.56M17.39 17.39l1.56 1.56M5.05 18.95l1.56-1.56M17.39 6.61l1.56-1.56"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === "moon") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
        <path
          d="M20.5 14.2A8.2 8.2 0 0 1 9.8 3.5 7.4 7.4 0 1 0 20.5 14.2Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function ThemeToggle({ className }: Props) {
  const groupId = useId();
  const [pref, setPref] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const apply = () => {
      const next = readThemePreference();
      applySiteTheme(next, false);
      setPref(next);
      setReady(true);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      if (readThemePreference() === "system") apply();
    };
    mq.addEventListener("change", onScheme);
    return () => mq.removeEventListener("change", onScheme);
  }, []);

  return (
    <div
      className={className ? `theme-toggle-group ${className}` : "theme-toggle-group"}
      role="radiogroup"
      aria-label="Color theme"
      data-theme-ready={ready ? "1" : "0"}
    >
      {OPTIONS.map((opt) => {
        const selected = pref === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={opt.label}
            title={opt.label}
            className={selected ? "theme-toggle is-selected" : "theme-toggle"}
            id={`${groupId}-${opt.value}`}
            onClick={() => {
              applySiteTheme(opt.value, true);
              setPref(opt.value);
            }}
          >
            <span className="theme-toggle-icon">
              <Icon kind={opt.icon} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
