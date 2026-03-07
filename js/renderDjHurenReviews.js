/* ===== DEEJAY TIM - DJ huren page reviews ===== */
/* Shows 3 random reviews + link to /reviews.html */

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

async function init() {
  const container = document.getElementById('dj-huren-reviews');
  if (!container) return;
  const lang = getLang();
  const emptyMsg = lang === 'en' ? 'No reviews yet. <a href="/reviews.html">View reviews</a>.' : 'Nog geen reviews. <a href="/reviews.html">Bekijk reviews</a>.';
  const fallbackMsg = lang === 'en' ? '<a href="/reviews.html">View reviews</a>.' : '<a href="/reviews.html">Bekijk reviews</a>.';
  const starsAria = lang === 'en' ? 'out of 5 stars' : 'van 5 sterren';
  try {
    const res = await fetch('/data/testimonials.json');
    const data = await res.json();
    const list = (data?.testimonials ?? []).slice().sort(() => Math.random() - 0.5).slice(0, 3);
    container.setAttribute('aria-busy', 'false');
    if (list.length) {
      const cardHtml = list.map((t) => {
        const city = t.city || '';
        const source = t.source || 'Google';
        const text = escapeHtml(pickLang(t.text, lang));
        const footer = city ? `— ${escapeHtml(t.name)}, ${escapeHtml(city)} (${escapeHtml(source)})` : `— ${escapeHtml(t.name)} (${escapeHtml(source)})`;
        return `<article class="testimonial-card">
          <div class="testimonial-meta"><span class="testimonial-stars" aria-label="${t.rating} ${starsAria}" role="img">${renderStars(t.rating)}</span></div>
          <p class="testimonial-text">${text}</p>
          <footer class="testimonial-footer">${footer}</footer>
        </article>`;
      }).join('');
      container.innerHTML = cardHtml;
    } else {
      container.innerHTML = `<p class="testimonials-empty">${emptyMsg}</p>`;
    }
  } catch (err) {
    container.setAttribute('aria-busy', 'false');
    container.innerHTML = `<p class="testimonials-empty">${fallbackMsg}</p>`;
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
