export type ThemeMode = "light" | "dark";
export type ThemePreference = ThemeMode | "system";

export const MP_THEME_KEY = "myproblem.theme";
export const ROOM_THEME_KEY = "clevertree.room.theme";
export const OS_THEME_QUERY = "(prefers-color-scheme: dark)";

export function readThemePreference(
  key: string = MP_THEME_KEY,
): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    /* private mode */
  }
  return "system";
}

export function systemTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia(OS_THEME_QUERY).matches ? "dark" : "light";
}

export function resolveTheme(
  pref: ThemePreference = readThemePreference(),
): ThemeMode {
  return pref === "system" ? systemTheme() : pref;
}

export function applySiteTheme(
  preference: ThemePreference,
  persist = true,
) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.setAttribute("data-theme", preference);
  root.setAttribute("data-resolved-theme", resolved);
  root.style.colorScheme = resolved;
  if (persist) {
    try {
      window.localStorage.setItem(MP_THEME_KEY, preference);
    } catch {
      /* ignore */
    }
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", resolved === "dark" ? "#101E29" : "#F4F7F6");
}

export function persistThemePreference(pref: ThemePreference) {
  applySiteTheme(pref, true);
}

/** FOUC-prevention — preference on data-theme; resolved on data-resolved-theme. */
export const SITE_THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(MP_THEME_KEY)};var p=localStorage.getItem(k);if(p!=="light"&&p!=="dark"&&p!=="system")p="system";var r=p==="system"?(matchMedia(${JSON.stringify(OS_THEME_QUERY)}).matches?"dark":"light"):p;var d=document.documentElement;d.setAttribute("data-theme",p);d.setAttribute("data-resolved-theme",r);d.style.colorScheme=r;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",r==="dark"?"#101E29":"#F4F7F6");}catch(e){}})();`;
