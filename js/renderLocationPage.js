/* ===== DEEJAY TIM - Location page renderer ===== */
/* Data-driven content injection for /locaties/*.html pages */

function getLang() {
  return (typeof window !== 'undefined' && window.i18n?.currentLang) || 'nl';
}

function t(key) {
  return (typeof window !== 'undefined' && window.i18n?.t) ? window.i18n.t(key) : key;
}

function pickLang(obj, lang) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] ?? obj.nl ?? obj.en ?? '';
}

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
    if (fallback) fallback.innerHTML = `<div class="container"><h1>${escapeHtml(t('pages.locations.location'))}</h1><p>${escapeHtml(t('pages.locations.noData'))}. <a href="/dj-huren.html">${escapeHtml(t('pages.locations.viewDjHire'))}</a> ${escapeHtml(t('pages.locations.or'))} <a href="/contact.html">${escapeHtml(t('pages.locations.getInTouch'))}</a>.</p></div>`;
    return;
  }

  const lang = getLang();
  const city = loc.name || slug.replace(/^dj-/, '').replace(/-/g, ' ');
  const title = lang === 'en'
    ? `DJ in ${city} | Wedding, Birthday & Corporate - Deejay Tim`
    : `DJ in ${city} | Bruiloft, Verjaardag & Bedrijfsfeest - Deejay Tim`;
  const desc = lang === 'en'
    ? `DJ in ${city} – professional music for weddings, birthdays and corporate events. Zwijndrecht and ${loc.province} area. Book now!`
    : `DJ in ${city} – professionele muziek voor bruiloften, verjaardagen en bedrijfsfeesten. Regio Zwijndrecht en ${loc.province}. Boek nu!`;

  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', desc);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', `https://deejaytim.nl/locaties/${slug}.html`);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', desc);

  const h1Text = `DJ in ${city} – ${t('pages.locations.h1Suffix')}`;
  const travelNote = loc.isCore30km
    ? t('pages.locations.travelCostsIncluded')
    : t('pages.locations.travelCostsOutside');

  setContent(document.getElementById('intro'), `
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/">${escapeHtml(t('pages.breadcrumb.home'))}</a> → <a href="/werkgebied.html">${escapeHtml(t('pages.breadcrumb.werkgebied'))}</a> → <a href="/locaties/">${escapeHtml(t('pages.breadcrumb.locaties'))}</a> → DJ in ${escapeHtml(city)}
      </nav>
      <h1 id="page-title">${escapeHtml(h1Text)}</h1>
      <p>${escapeHtml(pickLang(loc.shortIntro, lang) || (lang === 'en' ? `Professional DJ in ${city} for weddings, birthdays and corporate events.` : `Professionele DJ in ${city} voor bruiloften, verjaardagen en bedrijfsfeesten.`))}</p>
      <p>${escapeHtml(travelNote)}</p>
      <p class="cta-row"><a href="/prijzen.html">${escapeHtml(t('pages.locations.viewPrices'))}</a> <span aria-hidden="true">·</span> <a href="/reviews.html">Reviews</a></p>
      <p class="location-cta"><a href="/contact.html" class="cta-button">${escapeHtml(t('pages.locations.checkAvailability'))}</a></p>
    </div>
  `);

  const eventsTitle = lang === 'en' ? `Events in ${city}` : `Evenementen in ${city}`;
  const whyTitle = lang === 'en' ? `Why DJ Tim in ${city}` : `Waarom DJ Tim in ${city}`;
  const whyText = lang === 'en' ? `Experienced DJ with complete set-up. Hands Up! app for song requests. From Zwijndrecht I work throughout ${loc.province} and surroundings.` : `Ervaren DJ met complete set-up. Hands Up! app voor song requests. Vanuit Zwijndrecht werk ik in heel ${escapeHtml(loc.province)} en omstreken.`;
  const dienstenTitle = lang === 'en' ? 'Services' : 'Diensten';
  const prijzenEnPakketten = lang === 'en' ? ' and packages.' : ' en pakketten.';
  const EVENTS_LANG = lang === 'en' ? [
    { title: 'Weddings', slug: 'bruiloft-dj' },
    { title: 'Birthdays', slug: 'verjaardag-dj' },
    { title: 'Corporate events', slug: 'bedrijfsfeest-dj' },
    { title: 'School parties', slug: 'schoolfeest-dj' },
    { title: 'Street parties', slug: 'buurtfeest-dj' },
    { title: 'Graduation parties', slug: 'slagingsfeest-dj' }
  ] : EVENTS;
  const KEY_SERVICES_LANG = lang === 'en' ? [
    { slug: 'bruiloft-dj', title: 'Wedding DJ' },
    { slug: 'verjaardag-dj', title: 'Birthday DJ' },
    { slug: 'bedrijfsfeest-dj', title: 'Corporate event DJ' }
  ] : KEY_SERVICES;

  setContent(document.getElementById('events'), `
    <div class="container">
      <h2>${escapeHtml(eventsTitle)}</h2>
      <ul class="link-list">
        ${EVENTS_LANG.map((e) => `<li><a href="/diensten/${e.slug}.html">${escapeHtml(e.title)}</a></li>`).join('')}
      </ul>
    </div>
  `);

  setContent(document.getElementById('why'), `
    <div class="container">
      <h2>${escapeHtml(whyTitle)}</h2>
      <p>${escapeHtml(whyText)}</p>
    </div>
  `);

  setContent(document.getElementById('services'), `
    <div class="container">
      <h2>${escapeHtml(dienstenTitle)}</h2>
      <p><a href="/prijzen.html">${escapeHtml(lang === 'en' ? 'Prices' : 'Prijzen')}</a>${escapeHtml(prijzenEnPakketten)}</p>
      <ul class="link-list">
        ${KEY_SERVICES_LANG.map((s) => `<li><a href="/diensten/${s.slug}.html">${escapeHtml(s.title)}</a></li>`).join('')}
      </ul>
    </div>
  `);

  try {
    testimonialsData = await loadJSON('/data/testimonials.json');
  } catch (_) {}

  const list = testimonialsData?.testimonials || [];
  const filtered = list.filter((t) => (t.locationSlugs || []).includes(slug));
  const toShow = (filtered.length ? filtered : list).slice().sort(() => Math.random() - 0.5).slice(0, 3);

  const reviewsEl = document.getElementById('reviews');
  if (reviewsEl) {
    const reviewsTitle = lang === 'en' ? 'Reviews' : 'Reviews';
    const allReviews = lang === 'en' ? 'All reviews' : 'Alle reviews';
    const viewAllReviews = lang === 'en' ? 'View all reviews' : 'Bekijk alle reviews';
    const starsAria = lang === 'en' ? 'out of 5 stars' : 'van 5 sterren';
    if (toShow.length) {
      const cardHtml = toShow.map((t) => {
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
      reviewsEl.innerHTML = `
        <div class="container">
          <h2>${escapeHtml(reviewsTitle)}</h2>
          <p><a href="/reviews.html">${escapeHtml(allReviews)}</a></p>
          <div class="testimonials-grid">${cardHtml}</div>
        </div>
      `;
    } else {
      reviewsEl.innerHTML = `<div class="container"><h2>${escapeHtml(reviewsTitle)}</h2><p><a href="/reviews.html">${escapeHtml(viewAllReviews)}</a> ${lang === 'en' ? 'from customers.' : 'van klanten.'}</p></div>`;
    }
  }

  const faq = loc.faq || locationsData?.defaultFaq || [];
  let faqItems = faq.length ? faq : (locationsData?.defaultFaq || []);
  let pricingData = null;
  try {
    const prRes = await fetch('/data/pricing.json');
    if (prRes.ok) pricingData = await prRes.json();
  } catch (_) {}
  const formatPrice = (p) => p != null ? `€${Number(p).toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—';
  faqItems = faqItems.map((item) => {
    const q = pickLang(item.q, lang);
    const a = pickLang(item.a, lang);
    if ((q === 'Hoeveel kost een DJ?' || q === 'How much does a DJ cost?') && pricingData) {
      return { ...item, q, aHtml: (lang === 'en' ? `From ${formatPrice(pricingData.justDj?.from)} (Just DJ) or ${formatPrice(pricingData.allIn?.from)} (All-in). ` : `Vanaf ${formatPrice(pricingData.justDj?.from)} (Just DJ) of ${formatPrice(pricingData.allIn?.from)} (All-in). `) + `<a href="/prijzen.html">${lang === 'en' ? 'Prices' : 'Prijzen'}</a> ${lang === 'en' ? 'for current rates.' : 'voor actuele tarieven.'}` };
    }
    if ((q === 'Hoe ver rijdt u?' || q === 'How far do you travel?') && pricingData?.extraKm != null) {
      const extra = lang === 'en' ? `Travel costs included up to 30 km from Zwijndrecht (3332 SN). Beyond that ${formatPrice(pricingData.extraKm)} per extra km.` : `Reiskosten zijn inbegrepen tot 30 km vanuit Zwijndrecht (3332 SN). Daarbuiten ${formatPrice(pricingData.extraKm)} per extra km.`;
      const suffix = lang === 'en' ? " Tim is willing to travel quite far, but it depends on the times – we'll coordinate." : " Tim is bereid om best ver te rijden, maar dit is wel afhankelijk van de tijden – dat stemmen we gewoon af.";
      return { ...item, q, a: extra + suffix };
    }
    return { ...item, q, a };
  });
  const faqTitle = lang === 'en' ? 'Frequently asked questions' : 'Veelgestelde vragen';
  const faqFallback = lang === 'en' ? '<p><a href="/veelgestelde-vragen.html">View general FAQ</a>.</p>' : '<p><a href="/veelgestelde-vragen.html">Bekijk algemene FAQ</a>.</p>';
  setContent(document.getElementById('faq'), `
    <div class="container">
      <h2>${escapeHtml(faqTitle)}</h2>
      ${faqItems.length ? faqItems.map((item) => `
        <details class="faq-item">
          <summary>${escapeHtml(item.q)}</summary>
          <p>${item.aHtml != null ? item.aHtml : escapeHtml(item.a)}</p>
        </details>
      `).join('') : faqFallback}
    </div>
  `);

  const waText = lang === 'en' ? 'Hi%20Tim!%20I%27m%20looking%20for%20a%20DJ%20for%20' : 'Hoi%20Tim!%20Ik%20zoek%20een%20DJ%20voor%20';
  setContent(document.getElementById('cta'), `
    <div class="container">
      <p><a href="/contact.html" class="pricing-btn">${escapeHtml(t('pages.locations.checkAvailability'))}</a></p>
      <p><a href="https://wa.me/31621888970?text=${waText}${encodeURIComponent(city)}." target="_blank" rel="noopener">WhatsApp</a></p>
    </div>
  `);

  const nearbySlugs = loc.nearbySlugs || OTHER_LOCATIONS.filter((s) => s !== slug).slice(0, 6);
  const nearbyLocs = nearbySlugs
    .map((s) => locationsData?.locations?.find((l) => l.slug === s))
    .filter(Boolean);
  const fallbackNearby = locationsData?.locations?.filter((l) => l.slug !== slug).slice(0, 8) || [];
  const nearbyToShow = nearbyLocs.length ? nearbyLocs.slice(0, 8) : fallbackNearby;

  const nearbyTitle = lang === 'en' ? 'Also active nearby' : 'Ook actief in de buurt';
  const snelleLinksTitle = lang === 'en' ? 'Quick links' : 'Snelle links';
  const snelleLinks = lang === 'en'
    ? [
        { href: '/prijzen.html', label: 'Prices' },
        { href: '/reviews.html', label: 'Reviews' },
        { href: '/contact.html', label: 'Contact' },
        { href: '/diensten/bruiloft-dj.html', label: 'Wedding DJ' },
        { href: '/diensten/verjaardag-dj.html', label: 'Birthday DJ' },
        { href: '/diensten/bedrijfsfeest-dj.html', label: 'Corporate event DJ' },
        { href: '/diensten/schoolfeest-dj.html', label: 'School party DJ' },
        { href: '/diensten/buurtfeest-dj.html', label: 'Street party DJ' },
        { href: '/diensten/slagingsfeest-dj.html', label: 'Graduation party DJ' }
      ]
    : [
        { href: '/prijzen.html', label: 'Prijzen' },
        { href: '/reviews.html', label: 'Reviews' },
        { href: '/contact.html', label: 'Contact' },
        { href: '/diensten/bruiloft-dj.html', label: 'Bruiloft DJ' },
        { href: '/diensten/verjaardag-dj.html', label: 'Verjaardag DJ' },
        { href: '/diensten/bedrijfsfeest-dj.html', label: 'Bedrijfsfeest DJ' },
        { href: '/diensten/schoolfeest-dj.html', label: 'Schoolfeest DJ' },
        { href: '/diensten/buurtfeest-dj.html', label: 'Buurtfeest DJ' },
        { href: '/diensten/slagingsfeest-dj.html', label: 'Slagingsfeest DJ' }
      ];
  setContent(document.getElementById('nearby'), `
    <div class="container">
      <h2>${escapeHtml(nearbyTitle)}</h2>
      <ul class="link-list">
        ${nearbyToShow.map((l) => `<li><a href="/locaties/${l.slug}.html">DJ in ${escapeHtml(l.name)}</a></li>`).join('')}
      </ul>
      <div class="snelle-links">
        <h3>${escapeHtml(snelleLinksTitle)}</h3>
        <p>
          ${snelleLinks.map((link) => `<a href="${link.href}">${escapeHtml(link.label)}</a>`).join(' · ')}
        </p>
      </div>
    </div>
  `);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('pages.breadcrumb.home'), item: 'https://deejaytim.nl/' },
      { '@type': 'ListItem', position: 2, name: t('pages.breadcrumb.werkgebied'), item: 'https://deejaytim.nl/werkgebied.html' },
      { '@type': 'ListItem', position: 3, name: t('pages.breadcrumb.locaties'), item: 'https://deejaytim.nl/locaties/' },
      { '@type': 'ListItem', position: 4, name: `DJ in ${city}`, item: `https://deejaytim.nl/locaties/${slug}.html` }
    ]
  };
  const breadcrumbScript = document.createElement('script');
  breadcrumbScript.type = 'application/ld+json';
  breadcrumbScript.textContent = JSON.stringify(breadcrumbLd);
  document.head.appendChild(breadcrumbScript);
}

if (typeof window !== 'undefined') {
  window.addEventListener('langchange', renderLocationPage);
  document.addEventListener('partialsloaded', renderLocationPage);
}
