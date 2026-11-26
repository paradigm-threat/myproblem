"use client";

import { useEffect, useState } from "react";
import {
  applySiteTheme,
  persistThemePreference,
  readThemePreference,
  resolveTheme,
  type ThemeMode,
} from "@/lib/theme";

type Props = {
  className?: string;
};

export function ThemeToggle({ className }: Props) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const apply = () => {
      const next = resolveTheme(readThemePreference());
      applySiteTheme(next);
      setMode(next);
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

  const toggle = () => {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    persistThemePreference(next);
    applySiteTheme(next);
    setMode(next);
  };

  const label =
    mode === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className={className ? `theme-toggle ${className}` : "theme-toggle"}
      onClick={toggle}
      aria-label={label}
      title={label}
      data-theme-ready={ready ? "1" : "0"}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {mode === "dark" ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
            <path
              d="M12 2v2.2M12 19.8V22M4.2 12H2M22 12h-2.2M5.05 5.05l1.56 1.56M17.39 17.39l1.56 1.56M5.05 18.95l1.56-1.56M17.39 6.61l1.56-1.56"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <path
              d="M20.5 14.2A8.2 8.2 0 0 1 9.8 3.5 7.4 7.4 0 1 0 20.5 14.2Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
