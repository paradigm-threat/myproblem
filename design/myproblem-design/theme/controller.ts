export type ThemePreference = 'light' | 'dark' | 'system';
export const SITE_THEME_KEY = 'myproblem.theme';
export const ROOM_THEME_KEY = 'clevertree.room.theme';
export const OS_THEME_QUERY = '(prefers-color-scheme: dark)';
export function readPreference(key: string): ThemePreference {
  try { const v = localStorage.getItem(key); if (v === 'light' || v === 'dark') return v; } catch {}
  return 'system';
}
export function resolveTheme(p: ThemePreference): 'light' | 'dark' {
  return p === 'system' ? (matchMedia(OS_THEME_QUERY).matches ? 'dark' : 'light') : p;
}
export function applyTheme(element: HTMLElement, preference: ThemePreference, scope: 'site' | 'room', persist = true) {
  const resolved = resolveTheme(preference);
  element.dataset.theme = preference;
  element.dataset.resolvedTheme = resolved;
  element.style.colorScheme = resolved;
  if (persist) { try { localStorage.setItem(scope === 'site' ? SITE_THEME_KEY : ROOM_THEME_KEY, preference); } catch {} }
  if (scope === 'site') document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#101E29' : '#F4F7F6');
}
export function bindTheme(element: HTMLElement, scope: 'site' | 'room', onChange?: (p: ThemePreference) => void) {
  const key = scope === 'site' ? SITE_THEME_KEY : ROOM_THEME_KEY;
  const media = matchMedia(OS_THEME_QUERY);
  let preference = readPreference(key);
  const update = () => { applyTheme(element, preference, scope, false); onChange?.(preference); };
  const onStorage = (e: StorageEvent) => { if (e.key === key || e.key === null) { preference = readPreference(key); update(); } };
  const onSystemChange = () => { if (preference === 'system') update(); };
  update();
  media.addEventListener('change', onSystemChange);
  window.addEventListener('storage', onStorage);
  return { getPreference: () => preference, setPreference(next: ThemePreference) { preference = next; applyTheme(element, preference, scope); onChange?.(preference); }, dispose() { media.removeEventListener('change', onSystemChange); window.removeEventListener('storage', onStorage); } };
}
