/* ===== DEEJAY TIM - Reviews page renderer ===== */
/* Loads testimonials and renders all reviews + Review JSON-LD */

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

function renderReviewCard(t) {
  const city = t.city || '';
  const source = t.source || 'Google';
  const footer = city ? `— ${escapeHtml(t.name)}, ${escapeHtml(city)} (${escapeHtml(source)})` : `— ${escapeHtml(t.name)} (${escapeHtml(source)})`;
  return `<article class="testimonial-card">
    <div class="testimonial-meta"><span class="testimonial-stars" aria-label="${t.rating} van 5 sterren" role="img">${renderStars(t.rating)}</span></div>
    <p class="testimonial-text">${escapeHtml(t.text)}</p>
    <footer class="testimonial-footer">${footer}</footer>
  </article>`;
}

async function init() {
  const container = document.getElementById('reviews-container');
  if (!container) return;
  try {
    const data = await loadJSON('/data/testimonials.json');
    const list = data?.testimonials ?? [];
    container.setAttribute('aria-busy', 'false');
    if (list.length) {
      container.innerHTML = list.map(renderReviewCard).join('');
    } else {
      container.innerHTML = '<p class="testimonials-empty">Nog geen reviews.</p>';
    }
  } catch (err) {
    container.setAttribute('aria-busy', 'false');
    container.innerHTML = '<p class="testimonials-error">Reviews konden niet worden geladen.</p>';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
document.addEventListener('partialsloaded', init);
