/* ===== DEEJAY TIM - Partial include loader ===== */
/* Finds elements with data-include="/path/to/partial.html" and fetches/replaces innerHTML */

const SELECTOR = '[data-include]';

async function loadPartial(el) {
  const path = el.getAttribute('data-include');
  if (!path || !path.startsWith('/')) return;
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const html = await res.text();
    el.innerHTML = html;
  } catch (err) {
    console.warn(`[includePartials] Failed to load ${path}:`, err);
  }
}

const els = document.querySelectorAll(SELECTOR);
if (els.length) {
  Promise.all(Array.from(els).map((el) => loadPartial(el))).then(() => {
    document.dispatchEvent(new CustomEvent('partialsloaded'));
  });
}
