export const MP_THEME_KEY = "myproblem.theme";

export type ThemeMode = "light" | "dark";
export type ThemePreference = ThemeMode | "system";

export function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(MP_THEME_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    /* private mode */
  }
  return "system";
}

export function systemTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(pref: ThemePreference = readThemePreference()): ThemeMode {
  return pref === "system" ? systemTheme() : pref;
}

export function applySiteTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", mode);
  root.style.colorScheme = mode;
}

export function persistThemePreference(pref: ThemePreference) {
  try {
    if (pref === "system") window.localStorage.removeItem(MP_THEME_KEY);
    else window.localStorage.setItem(MP_THEME_KEY, pref);
  } catch {
    /* ignore */
  }
}

/** FOUC-prevention snippet for <html> — keep in sync with helpers above. */
export const SITE_THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(MP_THEME_KEY)};var p=localStorage.getItem(k);var t=(p==="light"||p==="dark")?p:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t;}catch(e){}})();`;
