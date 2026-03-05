/* ===== DEEJAY TIM - Location page renderer ===== */
/* Data-driven content injection for /locaties/*.html pages */

const KEY_SERVICES = [
  { slug: 'bruiloft-dj', title: 'Bruiloft DJ' },
  { slug: 'verjaardag-dj', title: 'Verjaardag DJ' },
  { slug: 'bedrijfsfeest-dj', title: 'Bedrijfsfeest DJ' }
];

const ALL_SERVICES = [
  ...KEY_SERVICES,
  { slug: 'schoolfeest-dj', title: 'Schoolfeest DJ' },
  { slug: 'buurtfeest-dj', title: 'Buurtfeest DJ' },
  { slug: 'slagingsfeest-dj', title: 'Slagingsfeest DJ' }
];

const EVENTS = [
  { title: 'Bruiloften', slug: 'bruiloft-dj' },
  { title: 'Verjaardagen', slug: 'verjaardag-dj' },
  { title: 'Bedrijfsfeesten', slug: 'bedrijfsfeest-dj' },
  { title: 'Schoolfeesten', slug: 'schoolfeest-dj' },
  { title: 'Buurtfeesten', slug: 'buurtfeest-dj' },
  { title: 'Slagingsfeesten', slug: 'slagingsfeest-dj' }
];

const OTHER_LOCATIONS = [
  'dj-zwijndrecht',
  'dj-dordrecht',
  'dj-rotterdam',
  'dj-barendrecht',
  'dj-papendrecht',
  'dj-ridderkerk',
  'dj-capelle-aan-den-ijssel',
  'dj-breda'
];

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
  const url = path.startsWith('/') ? path : path;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function setContent(el, html) {
  if (el) el.innerHTML = html;
}

/** Slug dj-dordrecht → locationKey dordrecht for testimonial matching */
function slugToLocationKey(slug) {
  return (slug || '').replace(/^dj-/, '');
}

export async function renderLocationPage() {
  const main = document.querySelector('main[data-location]');
  const slug = main?.getAttribute('data-location');
  if (!slug) return;

  let loc = null;
  let locationsData = null;
  let testimonialsData = null;

  try {
    locationsData = await loadJSON('/data/locations.json');
    loc = locationsData.locations?.find((l) => l.slug === slug);
  } catch (err) {
    console.warn('[renderLocationPage] Failed to load locations:', err);
  }

  if (!loc) {
    const fallback = document.getElementById('intro');
    if (fallback) fallback.innerHTML = '<div class="container"><h1>Locatie</h1><p>Geen gegevens beschikbaar. <a href="/dj-huren.html">Bekijk DJ huren</a> of <a href="/contact.html">neem contact op</a>.</p></div>';
    return;
  }

  const city = loc.name || slug.replace(/^dj-/, '').replace(/-/g, ' ');
  const title = `DJ in ${city} | Bruiloft, Verjaardag & Bedrijfsfeest - Deejay Tim`;
  const desc = `DJ in ${city} – professionele muziek voor bruiloften, verjaardagen en bedrijfsfeesten. Regio Zwijndrecht en ${loc.province}. Boek nu!`;

  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', desc);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', `https://deejaytim.nl/locaties/${slug}.html`);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', desc);

  const h1Text = `DJ in ${city} – Bruiloften, Verjaardagen & Bedrijfsfeesten`;
  const travelNote = loc.isCore30km
    ? 'Reiskosten tot 30 km vanuit Zwijndrecht (3332 SN) zijn inbegrepen.'
    : 'Deze locatie valt buiten de 30 km. Reiskosten in overleg.';

  setContent(document.getElementById('intro'), `
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a> → <a href="/locaties/">Locaties</a> → DJ in ${escapeHtml(city)}
      </nav>
      <h1 id="page-title">${escapeHtml(h1Text)}</h1>
      <p>${escapeHtml(loc.shortIntro || `Professionele DJ in ${city} voor bruiloften, verjaardagen en bedrijfsfeesten.`)}</p>
      <p>${escapeHtml(travelNote)} <a href="/dj-huren.html">Bekijk prijzen</a> · <a href="/reviews.html">Reviews</a> · <a href="/contact.html">Boek nu</a>.</p>
    </div>
  `);

  setContent(document.getElementById('events'), `
    <div class="container">
      <h2>Evenementen in ${escapeHtml(city)}</h2>
      <ul>
        ${EVENTS.map((e) => `<li><a href="/diensten/${e.slug}.html">${escapeHtml(e.title)}</a></li>`).join('')}
      </ul>
    </div>
  `);

  setContent(document.getElementById('why'), `
    <div class="container">
      <h2>Waarom DJ Tim in ${escapeHtml(city)}</h2>
      <p>Ervaren DJ met complete set-up. Hands Up! app voor song requests. Vanuit Zwijndrecht werk ik in heel ${escapeHtml(loc.province)} en omstreken.</p>
    </div>
  `);

  setContent(document.getElementById('services'), `
    <div class="container">
      <h2>Diensten</h2>
      <p><a href="/dj-huren.html">DJ huren</a> – prijzen en pakketten.</p>
      <ul>
        ${KEY_SERVICES.map((s) => `<li><a href="/diensten/${s.slug}.html">${escapeHtml(s.title)}</a></li>`).join('')}
      </ul>
    </div>
  `);

  try {
    testimonialsData = await loadJSON('/data/testimonials.json');
  } catch (_) {}

  const locationKey = slugToLocationKey(slug);
  const list = testimonialsData?.testimonials || [];
  const filtered = list.filter((t) => t.location === locationKey);
  const fallback = list.slice(0, 6);
  const toShow = filtered.length ? filtered.slice(0, 6) : fallback;

  const reviewsEl = document.getElementById('reviews');
  if (reviewsEl) {
    if (toShow.length) {
      reviewsEl.innerHTML = `
        <div class="container">
          <h2>Reviews</h2>
          <p><a href="/reviews.html">Alle reviews</a></p>
          <div class="testimonials-grid">
            ${toShow.map((t) => `
              <article class="testimonial-card">
                <div class="testimonial-meta">
                  <span class="testimonial-name">${escapeHtml(t.name)}</span>
                  <span class="testimonial-stars" aria-label="${t.rating} van 5 sterren">${renderStars(t.rating)}</span>
                </div>
                <p class="testimonial-text">${escapeHtml(t.text)}</p>
                ${t.date ? `<time datetime="${t.date}">${new Date(t.date + 'T12:00:00').toLocaleDateString('nl-NL', { year: 'numeric', month: 'short' })}</time>` : ''}
              </article>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      reviewsEl.innerHTML = '<div class="container"><h2>Reviews</h2><p><a href="/reviews.html">Bekijk alle reviews</a> van klanten.</p></div>';
    }
  }

  const faq = loc.faq || locationsData?.defaultFaq || [];
  const faqItems = faq.length ? faq : (locationsData?.defaultFaq || []);
  setContent(document.getElementById('faq'), `
    <div class="container">
      <h2>Veelgestelde vragen</h2>
      ${faqItems.length ? faqItems.map((item) => `
        <details class="faq-item">
          <summary>${escapeHtml(item.q)}</summary>
          <p>${escapeHtml(item.a)}</p>
        </details>
      `).join('') : '<p><a href="/veelgestelde-vragen.html">Bekijk algemene FAQ</a>.</p>'}
    </div>
  `);

  setContent(document.getElementById('cta'), `
    <div class="container">
      <p><a href="/contact.html" class="pricing-btn">Boek DJ in ${escapeHtml(city)}</a></p>
      <p><a href="https://wa.me/31621888970?text=Hoi%20Tim!%20Ik%20zoek%20een%20DJ%20voor%20${encodeURIComponent(city)}." target="_blank" rel="noopener">WhatsApp</a></p>
    </div>
  `);

  const nearbySlugs = loc.nearbySlugs || OTHER_LOCATIONS.filter((s) => s !== slug).slice(0, 6);
  const nearbyLocs = nearbySlugs
    .map((s) => locationsData?.locations?.find((l) => l.slug === s))
    .filter(Boolean);

  setContent(document.getElementById('nearby'), `
    <div class="container">
      <h2>Andere locaties</h2>
      <ul>
        ${nearbyLocs.slice(0, 8).map((l) => `<li><a href="/locaties/${l.slug}.html">DJ in ${escapeHtml(l.name)}</a></li>`).join('')}
      </ul>
    </div>
  `);
}
