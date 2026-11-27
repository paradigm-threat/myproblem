// Inline in the document head before paint, with a CSP-compatible nonce/hash.
(function () {
  const root = document.documentElement;
  let preference = 'system';
  try {
    const saved = localStorage.getItem('myproblem.theme');
    if (['light','dark','system'].includes(saved)) preference = saved;
  } catch {}
  const resolved = preference === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preference;
  root.dataset.theme = preference;
  root.dataset.resolvedTheme = resolved;
  root.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#101E29' : '#F4F7F6');
})();
