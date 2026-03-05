/* ===== DEEJAY TIM - Service page renderer ===== */
/* Data-driven content injection for /diensten/*.html pages */

const BASE = typeof location !== 'undefined' ? new URL('.', location.href).href : '';

/** Map service slug → testimonial eventType */
const SLUG_TO_EVENT = {
  'bruiloft-dj': 'bruiloft',
  'verjaardag-dj': 'verjaardag',
  'bedrijfsfeest-dj': 'bedrijfsfeest',
  'schoolfeest-dj': 'feest',
  'buurtfeest-dj': 'feest',
  'slagingsfeest-dj': 'feest',
  'dj-18-jaar': 'verjaardag',
  'dj-20-jaar': 'verjaardag',
  'dj-30-jaar': 'verjaardag',
  'dj-40-jaar': 'verjaardag',
  'dj-50-jaar': 'verjaardag',
  'sweet-16-dj': 'verjaardag'
};

const CORE_SERVICES = [
  { slug: 'bruiloft-dj', title: 'Bruiloft DJ' },
  { slug: 'verjaardag-dj', title: 'Verjaardag DJ' },
  { slug: 'bedrijfsfeest-dj', title: 'Bedrijfsfeest DJ' }
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
  const url = path.startsWith('/') ? path : (BASE + path.replace(/^\//, ''));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function setContent(el, html) {
  if (el) el.innerHTML = html;
}

export async function renderServicePage() {
  const main = document.querySelector('main[data-service]');
  const body = document.body;
  const slug = main?.getAttribute('data-service') || body?.getAttribute('data-service');
  if (!slug) return;

  let service = null;
  let testimonials = [];

  try {
    const data = await loadJSON('/data/services.json');
    service = data.servicePages?.find((s) => s.slug === slug);
  } catch (err) {
    console.warn('[renderServicePage] Failed to load services:', err);
  }

  if (!service) {
    const fallback = document.getElementById('intro');
    if (fallback) fallback.innerHTML = '<div class="container"><h1>Dienst</h1><p>Geen gegevens beschikbaar voor deze dienst. <a href="/dj-huren.html">Bekijk DJ huren</a> of <a href="/contact.html">neem contact op</a>.</p></div>';
    return;
  }

  const title = service.metaTitle || `${service.title} | Deejay Tim`;
  const desc = service.metaDescription || `DJ voor ${service.title}. Professionele muziek. Regio Zwijndrecht en Rotterdam.`;

  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', desc);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', `https://deejaytim.nl/diensten/${slug}.html`);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', desc);

  setContent(document.getElementById('intro'), `
    <div class="container">
      <h1>${escapeHtml(service.title)}</h1>
      <p>${escapeHtml(service.intro)}</p>
      <p>Bekijk <a href="/dj-huren.html">DJ huren</a> voor prijzen of lees <a href="/reviews.html">reviews</a> van andere klanten.</p>
    </div>
  `);

  const watJeKrijgt = service.watJeKrijgt || [];
  setContent(document.getElementById('wat-je-krijgt'), `
    <div class="container">
      <h2>Wat je krijgt</h2>
      ${watJeKrijgt.length ? `<ul>${watJeKrijgt.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : '<p>In overleg bepalen we wat je nodig hebt.</p>'}
    </div>
  `);

  const muziek = service.muziek || [];
  setContent(document.getElementById('muziek'), `
    <div class="container">
      <h2>Muziek</h2>
      ${muziek.length ? `<ul>${muziek.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : '<p>Breed repertoire, aanpasbaar aan jouw wensen.</p>'}
    </div>
  `);

  const apparatuur = service.apparatuur || [];
  setContent(document.getElementById('apparatuur'), `
    <div class="container">
      <h2>Apparatuur</h2>
      ${apparatuur.length ? `<ul>${apparatuur.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : '<p>Professionele DJ-set. Zie <a href="/dj-set-up.html">DJ set-up</a> voor details.</p>'}
    </div>
  `);

  const werkwijze = service.werkwijzeSteps || [];
  setContent(document.getElementById('werkwijze'), `
    <div class="container">
      <h2>Werkwijze</h2>
      ${werkwijze.length ? `<ol>${werkwijze.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ol>` : '<p>1. Contact – 2. Afspraken – 3. Feest!</p>'}
    </div>
  `);

  const faq = service.faq || [];
  setContent(document.getElementById('faq'), `
    <div class="container">
      <h2>Veelgestelde vragen</h2>
      ${faq.length ? faq.map((item) => `
        <details class="faq-item">
          <summary>${escapeHtml(item.q)}</summary>
          <p>${escapeHtml(item.a)}</p>
        </details>
      `).join('') : '<p>Geen veelgestelde vragen voor deze dienst. <a href="/veelgestelde-vragen.html">Bekijk algemene FAQ</a>.</p>'}
    </div>
  `);

  try {
    const data = await loadJSON('/data/testimonials.json');
    const list = data.testimonials || [];
    const eventType = SLUG_TO_EVENT[slug] || service.eventType;
    const filtered = eventType
      ? list.filter((t) => t.eventType === eventType)
      : list;
    const toShow = filtered.slice(0, 6);
    const reviewsEl = document.getElementById('reviews');
    if (reviewsEl) {
      if (toShow.length) {
        reviewsEl.innerHTML = `
          <div class="container">
            <h2>Reviews</h2>
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
        reviewsEl.innerHTML = '<div class="container"><h2>Reviews</h2><p>Nog geen reviews voor deze dienst. <a href="/reviews.html">Bekijk alle reviews</a>.</p></div>';
      }
    }
  } catch (err) {
    const reviewsEl = document.getElementById('reviews');
    if (reviewsEl) reviewsEl.innerHTML = '<div class="container"><h2>Reviews</h2><p><a href="/reviews.html">Bekijk reviews</a>.</p></div>';
  }

  const ctaText = service.ctaText || 'Boek nu';
  const ctaEl = document.getElementById('cta');
  if (ctaEl) {
    ctaEl.innerHTML = `
      <div class="container">
        <p><a href="/contact.html" class="pricing-btn">${escapeHtml(ctaText)}</a></p>
        <p><a href="https://wa.me/31621888970?text=Hoi%20Tim!%20Ik%20wil%20graag%20een%20${encodeURIComponent(service.title)}%20boeken." target="_blank" rel="noopener">WhatsApp</a></p>
      </div>
    `;
  }

  const andereEl = document.getElementById('andere-diensten');
  if (andereEl) {
    let html = `
      <div class="container">
        <h3>Andere diensten</h3>
        <ul class="link-list">
          ${CORE_SERVICES.filter((s) => s.slug !== slug).map((s) =>
      `<li><a href="/diensten/${s.slug}.html">${escapeHtml(s.title)}</a></li>`
    ).join('')}
        </ul>
    `;
    const POPULAIRE_PLAATSEN = [
      { slug: 'dj-zwijndrecht', name: 'Zwijndrecht' },
      { slug: 'dj-dordrecht', name: 'Dordrecht' },
      { slug: 'dj-barendrecht', name: 'Barendrecht' },
      { slug: 'dj-ridderkerk', name: 'Ridderkerk' },
      { slug: 'dj-rotterdam', name: 'Rotterdam' }
    ];
    if (['bruiloft-dj', 'verjaardag-dj', 'bedrijfsfeest-dj'].includes(slug)) {
      html += `
        <h2 style="margin-top: 2rem;">Populaire plaatsen in de regio</h2>
        <ul class="link-list">
          ${POPULAIRE_PLAATSEN.map((l) => `<li><a href="/locaties/${l.slug}.html">DJ in ${escapeHtml(l.name)}</a></li>`).join('')}
        </ul>
        <p><a href="/werkgebied.html">Bekijk mijn volledige werkgebied</a></p>
      `;
    }
    html += '</div>';
    andereEl.innerHTML = html;
  }
}
