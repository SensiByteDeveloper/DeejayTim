/* ===== DEEJAY TIM - Data-driven content layer ===== */
/* Vanilla JS, no dependencies. Use with <script type="module"> */

const _cache = Object.create(null);

/**
 * Load JSON from path. Caches result by path.
 * @param {string} path - Path relative to site root (e.g. 'data/services.json')
 * @returns {Promise<object>} Parsed JSON
 */
export async function loadJSON(path) {
  if (_cache[path]) return _cache[path];
  const base = typeof location !== 'undefined' ? new URL('.', location.href).href : '';
  const url = path.startsWith('/') ? path : (base + path.replace(/^\//, ''));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  const data = await res.json();
  _cache[path] = data;
  return data;
}

/**
 * Get location by slug from cached locations data.
 * Call loadJSON('data/locations.json') first.
 * @param {string} slug - Location slug (e.g. 'dordrecht')
 * @returns {object|undefined} Location object or undefined
 */
export function getLocation(slug) {
  const data = _cache['data/locations.json'];
  if (!data?.locations) return undefined;
  return data.locations.find((loc) => loc.slug === slug);
}

/**
 * Filter testimonials by locationSlugs and/or eventType.
 * Call loadJSON('data/testimonials.json') first.
 * @param {{ locationSlug?: string, eventType?: string }} filters - Optional filters
 * @returns {Array} Filtered testimonials
 */
export function filterTestimonials(filters = {}) {
  const data = _cache['data/testimonials.json'];
  const list = data?.testimonials ?? [];
  if (!filters.locationSlug && !filters.eventType) return list;
  return list.filter((t) => {
    if (filters.locationSlug) {
      const slugs = t.locationSlugs || (t.location ? ['dj-' + t.location] : []);
      if (!slugs.includes(filters.locationSlug)) return false;
    }
    if (filters.eventType) {
      const types = Array.isArray(t.eventType) ? t.eventType : (t.eventType ? [t.eventType] : []);
      if (!types.includes(filters.eventType)) return false;
    }
    return true;
  });
}

/**
 * Render star rating as HTML string.
 * @param {number} rating - 1–5
 * @returns {string} HTML string (e.g. spans with aria)
 */
export function renderStars(rating) {
  const n = Math.min(5, Math.max(0, Math.round(rating)));
  const full = '★'.repeat(n);
  const empty = '☆'.repeat(5 - n);
  return `<span class="testimonial-stars" aria-label="${n} van 5 sterren" role="img">${full}${empty}</span>`;
}

function getLang() {
  return (typeof window !== 'undefined' && window.i18n?.currentLang) || 'nl';
}

function pickLang(obj, lang) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] ?? obj.nl ?? obj.en ?? '';
}

/**
 * Render a single review card. Format: ★★★★★, text, — Name, City (Google)
 */
function renderReviewCard(t, lang) {
  const l = lang ?? getLang();
  const city = t.city || '';
  const source = t.source || 'Google';
  const text = escapeHtml(pickLang(t.text, l));
  const starsAria = l === 'en' ? `${t.rating} out of 5 stars` : `${t.rating} van 5 sterren`;
  const footer = city ? `— ${escapeHtml(t.name)}, ${escapeHtml(city)} (${escapeHtml(source)})` : `— ${escapeHtml(t.name)} (${escapeHtml(source)})`;
  return `<article class="testimonial-card">
    <div class="testimonial-meta">
      <span class="testimonial-stars" aria-label="${starsAria}" role="img">${renderStars(t.rating)}</span>
    </div>
    <p class="testimonial-text">${text}</p>
    <footer class="testimonial-footer">${footer}</footer>
  </article>`;
}

/**
 * Render testimonials list as HTML string.
 * @param {Array} list - Array of testimonial objects
 * @param {number} [limit] - Max number to render
 * @param {{ shuffle?: boolean }} [opts] - shuffle: pick random items
 * @returns {string} HTML string
 */
export function renderTestimonials(list, limit, opts = {}) {
  const lang = getLang();
  let items = list;
  if (opts.shuffle && items.length > 1) {
    items = [...items].sort(() => Math.random() - 0.5);
  }
  items = limit ? items.slice(0, limit) : items;
  return items.map((t) => renderReviewCard(t, lang)).join('');
}

/**
 * Init homepage testimonials: load and render 3 random reviews into #homepage-testimonials.
 */
export async function initHomepageTestimonials() {
  const el = document.getElementById('homepage-testimonials');
  if (!el) return;
  const lang = getLang();
  const emptyMsg = lang === 'en' ? 'No reviews yet.' : 'Nog geen reviews.';
  const errorMsg = lang === 'en' ? 'Reviews could not be loaded.' : 'Reviews konden niet worden geladen.';
  try {
    const data = await loadJSON('data/testimonials.json');
    const list = data?.testimonials ?? [];
    el.setAttribute('aria-busy', 'false');
    el.innerHTML = list.length
      ? renderTestimonials(list, 3, { shuffle: true })
      : `<p class="testimonials-empty">${emptyMsg}</p>`;
  } catch (err) {
    el.setAttribute('aria-busy', 'false');
    el.innerHTML = `<p class="testimonials-error">${errorMsg}</p>`;
  }
}

export { renderReviewCard };

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepageTestimonials);
  } else {
    initHomepageTestimonials();
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('langchange', initHomepageTestimonials);
  document.addEventListener('partialsloaded', initHomepageTestimonials);
}

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function formatDate(iso) {
  try {
    const d = new Date(iso + 'T12:00:00');
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString('nl-NL', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}
