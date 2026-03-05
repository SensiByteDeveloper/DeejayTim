/* ===== DEEJAY TIM - DJ huren page reviews ===== */
/* Shows 3 random reviews + link to /reviews.html */

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

async function init() {
  const container = document.getElementById('dj-huren-reviews');
  if (!container) return;
  try {
    const res = await fetch('/data/testimonials.json');
    const data = await res.json();
    const list = (data?.testimonials ?? []).slice().sort(() => Math.random() - 0.5).slice(0, 3);
    container.setAttribute('aria-busy', 'false');
    if (list.length) {
      const cardHtml = list.map((t) => {
        const city = t.city || '';
        const source = t.source || 'Google';
        const footer = city ? `— ${escapeHtml(t.name)}, ${escapeHtml(city)} (${escapeHtml(source)})` : `— ${escapeHtml(t.name)} (${escapeHtml(source)})`;
        return `<article class="testimonial-card">
          <div class="testimonial-meta"><span class="testimonial-stars" aria-label="${t.rating} van 5 sterren" role="img">${renderStars(t.rating)}</span></div>
          <p class="testimonial-text">${escapeHtml(t.text)}</p>
          <footer class="testimonial-footer">${footer}</footer>
        </article>`;
      }).join('');
      container.innerHTML = cardHtml;
    } else {
      container.innerHTML = '<p class="testimonials-empty">Nog geen reviews. <a href="/reviews.html">Bekijk reviews</a>.</p>';
    }
  } catch (err) {
    container.setAttribute('aria-busy', 'false');
    container.innerHTML = '<p class="testimonials-empty"><a href="/reviews.html">Bekijk reviews</a>.</p>';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
document.addEventListener('partialsloaded', init);
