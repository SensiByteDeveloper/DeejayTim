/* ===== DEEJAY TIM - Reviews page renderer ===== */
/* Loads testimonials and renders all reviews + Review JSON-LD */

function getLang() {
  return (typeof window !== 'undefined' && window.i18n?.currentLang) || 'nl';
}

function pickLang(obj, lang) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] ?? obj.nl ?? obj.en ?? '';
}

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function renderStars(rating) {
  const n = Math.min(5, Math.max(0, Math.round(rating)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function renderReviewCard(t, lang) {
  const city = t.city || '';
  const source = t.source || 'Google';
  const text = escapeHtml(pickLang(t.text, lang));
  const starsAria = lang === 'en' ? `${t.rating} out of 5 stars` : `${t.rating} van 5 sterren`;
  const footer = city ? `— ${escapeHtml(t.name)}, ${escapeHtml(city)} (${escapeHtml(source)})` : `— ${escapeHtml(t.name)} (${escapeHtml(source)})`;
  return `<article class="testimonial-card">
    <div class="testimonial-meta"><span class="testimonial-stars" aria-label="${starsAria}" role="img">${renderStars(t.rating)}</span></div>
    <p class="testimonial-text">${text}</p>
    <footer class="testimonial-footer">${footer}</footer>
  </article>`;
}

async function init() {
  const container = document.getElementById('reviews-container');
  if (!container) return;
  const lang = getLang();
  const emptyMsg = lang === 'en' ? 'No reviews yet.' : 'Nog geen reviews.';
  const errorMsg = lang === 'en' ? 'Reviews could not be loaded.' : 'Reviews konden niet worden geladen.';
  try {
    const data = await loadJSON('/data/testimonials.json');
    const list = data?.testimonials ?? [];
    container.setAttribute('aria-busy', 'false');
    if (list.length) {
      container.innerHTML = list.map((t) => renderReviewCard(t, lang)).join('');
    } else {
      container.innerHTML = `<p class="testimonials-empty">${emptyMsg}</p>`;
    }
  } catch (err) {
    container.setAttribute('aria-busy', 'false');
    container.innerHTML = `<p class="testimonials-error">${errorMsg}</p>`;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
document.addEventListener('partialsloaded', init);
if (typeof window !== 'undefined') {
  window.addEventListener('langchange', init);
}
