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
 * Filter testimonials by location and/or eventType.
 * Call loadJSON('data/testimonials.json') first.
 * @param {{ location?: string, eventType?: string }} filters - Optional filters
 * @returns {Array} Filtered testimonials
 */
export function filterTestimonials(filters = {}) {
  const data = _cache['data/testimonials.json'];
  const list = data?.testimonials ?? [];
  if (!filters.location && !filters.eventType) return list;
  return list.filter((t) => {
    if (filters.location && t.location !== filters.location) return false;
    if (filters.eventType && t.eventType !== filters.eventType) return false;
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

/** Location slug (from testimonials) to display name */
const LOCATION_NAMES = {
  dordrecht: 'Dordrecht',
  rotterdam: 'Rotterdam',
  zwijndrecht: 'Zwijndrecht',
  'den-haag': 'Den Haag',
  barendrecht: 'Barendrecht',
};

/**
 * Render testimonials list as HTML string.
 * @param {Array} list - Array of testimonial objects
 * @param {number} [limit] - Max number to render
 * @param {{ showCity?: boolean }} [opts] - Options: showCity to display city instead of eventType
 * @returns {string} HTML string
 */
export function renderTestimonials(list, limit, opts = {}) {
  const items = limit ? list.slice(0, limit) : list;
  const showCity = !!opts.showCity;
  return items
    .map(
      (t) => {
        const city = showCity && t.location ? (LOCATION_NAMES[t.location] || t.location) : '';
        const footerContent = showCity && city
          ? `<span class="testimonial-location">${escapeHtml(city)}</span>`
          : `<span class="testimonial-event">${escapeHtml(t.eventType)}</span>${t.date ? ` <time datetime="${t.date}">${formatDate(t.date)}</time>` : ''}`;
        return `<article class="testimonial-card">
          <div class="testimonial-meta">
            <span class="testimonial-name">${escapeHtml(t.name)}</span>
            <span class="testimonial-rating">${renderStars(t.rating)}</span>
          </div>
          <p class="testimonial-text">${escapeHtml(t.text)}</p>
          <footer class="testimonial-footer">${footerContent}</footer>
        </article>`;
      }
    )
    .join('');
}

/**
 * Init homepage testimonials: load and render into #homepage-testimonials if present.
 */
export async function initHomepageTestimonials() {
  const el = document.getElementById('homepage-testimonials');
  if (!el) return;
  try {
    const data = await loadJSON('data/testimonials.json');
    const list = data?.testimonials ?? [];
    el.setAttribute('aria-busy', 'false');
    el.innerHTML = list.length
      ? renderTestimonials(list, 5, { showCity: true })
      : '<p class="testimonials-empty">Nog geen reviews.</p>';
  } catch (err) {
    el.setAttribute('aria-busy', 'false');
    el.innerHTML = '<p class="testimonials-error">Reviews konden niet worden geladen.</p>';
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepageTestimonials);
  } else {
    initHomepageTestimonials();
  }
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
