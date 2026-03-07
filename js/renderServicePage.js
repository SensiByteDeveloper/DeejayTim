/* ===== DEEJAY TIM - Service page renderer ===== */
/* Data-driven content injection for /diensten/*.html pages */

const BASE = typeof location !== 'undefined' ? new URL('.', location.href).href : '';

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

function pickLangArr(arr, lang) {
  if (!arr) return [];
  if (Array.isArray(arr) && typeof arr[0] === 'string') return arr;
  if (Array.isArray(arr) && arr[0] && typeof arr[0] === 'object' && (arr[0].nl != null || arr[0].en != null)) {
    return arr.map((item) => pickLang(item, lang));
  }
  if (typeof arr === 'object' && (arr.nl || arr.en)) return arr[lang] ?? arr.nl ?? arr.en ?? [];
  return Array.isArray(arr) ? arr : [];
}

/** Map service slug → testimonial eventType(s) to match */
const SLUG_TO_EVENT = {
  'bruiloft-dj': 'bruiloft',
  'verjaardag-dj': 'verjaardag',
  'bedrijfsfeest-dj': 'bedrijfsfeest',
  'schoolfeest-dj': 'feest',
  'buurtfeest-dj': 'buurtfeest',
  'slagingsfeest-dj': 'feest',
  'dj-18-jaar': 'verjaardag',
  'dj-20-jaar': 'verjaardag',
  'dj-30-jaar': 'verjaardag',
  'dj-40-jaar': 'verjaardag',
  'dj-50-jaar': 'verjaardag',
  'sweet-16-dj': 'verjaardag'
};

  const FEESTTYPES = [
  { slug: 'bruiloft-dj', title: 'Bruiloft DJ', titleEn: 'Wedding DJ' },
  { slug: 'verjaardag-dj', title: 'Verjaardag DJ', titleEn: 'Birthday DJ' },
  { slug: 'bedrijfsfeest-dj', title: 'Bedrijfsfeest DJ', titleEn: 'Corporate event DJ' },
  { slug: 'schoolfeest-dj', title: 'Schoolfeest DJ', titleEn: 'School party DJ' },
  { slug: 'buurtfeest-dj', title: 'Buurtfeest DJ', titleEn: 'Street party DJ' },
  { slug: 'slagingsfeest-dj', title: 'Slagingsfeest DJ', titleEn: 'Graduation party DJ' }
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

  const lang = getLang();
  const serviceTitle = pickLang(service.title, lang);
  const metaTitle = pickLang(service.metaTitle, lang) || `${serviceTitle} | Deejay Tim`;
  const metaDesc = pickLang(service.metaDescription, lang) || (lang === 'en' ? `DJ for ${serviceTitle}. Professional music. Zwijndrecht and Rotterdam area.` : `DJ voor ${serviceTitle}. Professionele muziek. Regio Zwijndrecht en Rotterdam.`);

  document.title = metaTitle;
  const metaDescEl = document.querySelector('meta[name="description"]');
  if (metaDescEl) metaDescEl.setAttribute('content', metaDesc);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', `https://deejaytim.nl/diensten/${slug}.html`);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', metaTitle);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', metaDesc);

  const VERJAARDAG_SLUGS = ['sweet-16-dj', 'dj-18-jaar', 'dj-20-jaar', 'dj-30-jaar', 'dj-40-jaar', 'dj-50-jaar'];
  let breadcrumbHtml = `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">${escapeHtml(t('pages.breadcrumb.home'))}</a> → <a href="/diensten/">${escapeHtml(t('pages.breadcrumb.diensten'))}</a>`;
  if (VERJAARDAG_SLUGS.includes(slug)) {
    breadcrumbHtml += ` → <a href="/diensten/verjaardag-dj.html">${escapeHtml(t('nav.verjaardagDj'))}</a>`;
  }
  breadcrumbHtml += ` → ${escapeHtml(serviceTitle)}</nav>`;
  /* Add BreadcrumbList structured data */
  const breadcrumbItems = [
    { name: t('pages.breadcrumb.home'), url: 'https://deejaytim.nl/' },
    { name: t('pages.breadcrumb.diensten'), url: 'https://deejaytim.nl/diensten/' }
  ];
  if (VERJAARDAG_SLUGS.includes(slug)) {
    breadcrumbItems.push({ name: t('nav.verjaardagDj'), url: 'https://deejaytim.nl/diensten/verjaardag-dj.html' });
  }
  breadcrumbItems.push({ name: serviceTitle, url: `https://deejaytim.nl/diensten/${slug}.html` });
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url
    }))
  };
  const existingBc = document.querySelector('script[data-service-breadcrumb]');
  if (existingBc) existingBc.remove();
  const bcScript = document.createElement('script');
  bcScript.type = 'application/ld+json';
  bcScript.setAttribute('data-service-breadcrumb', '');
  bcScript.textContent = JSON.stringify(breadcrumbLd);
  document.head.appendChild(bcScript);

  const h1Text = pickLang(service.h1, lang) || serviceTitle;
  const intro = pickLang(service.intro, lang);
  const introLinks = lang === 'en' ? 'View <a href="/prijzen.html">Prices</a> or read <a href="/reviews.html">reviews</a> from other customers.' : 'Bekijk <a href="/prijzen.html">Prijzen</a> of lees <a href="/reviews.html">reviews</a> van andere klanten.';
  setContent(document.getElementById('intro'), `
    <div class="container">
      ${breadcrumbHtml}
      <h1>${escapeHtml(h1Text)}</h1>
      <p>${escapeHtml(intro)}</p>
      <p>${introLinks}</p>
    </div>
  `);

  if (slug === 'verjaardag-dj') {
    const verjaardagTypes = [
      { slug: 'sweet-16-dj', title: 'Sweet 16 DJ' },
      { slug: 'dj-18-jaar', title: lang === 'en' ? 'DJ 18 years' : 'DJ 18 jaar' },
      { slug: 'dj-20-jaar', title: lang === 'en' ? 'DJ 20 years' : 'DJ 20 jaar' },
      { slug: 'dj-30-jaar', title: lang === 'en' ? 'DJ 30 years' : 'DJ 30 jaar' },
      { slug: 'dj-40-jaar', title: lang === 'en' ? 'DJ 40 years' : 'DJ 40 jaar' },
      { slug: 'dj-50-jaar', title: lang === 'en' ? 'DJ 50 years' : 'DJ 50 jaar' }
    ];
    const verjaardagEl = document.getElementById('verjaardag-types');
    if (verjaardagEl) {
      const verjaardagTitle = lang === 'en' ? 'For which birthday are you looking for a DJ?' : 'Voor welke verjaardag zoek je een DJ?';
      const verjaardagSub = lang === 'en' ? 'Specific pages per age with tips and examples:' : 'Specifieke pagina\'s per leeftijd met tips en voorbeelden:';
      verjaardagEl.querySelector('.container').innerHTML = `
        <h2>${escapeHtml(verjaardagTitle)}</h2>
        <p>${escapeHtml(verjaardagSub)}</p>
        <div class="service-cards service-cards-grid">
          ${verjaardagTypes.map((t) => `<a href="/diensten/${t.slug}.html" class="service-card service-card-small">${escapeHtml(t.title)}</a>`).join('')}
        </div>
      `;
    }
  }

  const watJeKrijgt = pickLangArr(service.watJeKrijgt, lang);
  const watJeKrijgtTitle = lang === 'en' ? 'What you get' : 'Wat je krijgt';
  const watJeKrijgtFallback = lang === 'en' ? '<p>We\'ll determine together what you need.</p>' : '<p>In overleg bepalen we wat je nodig hebt.</p>';
  setContent(document.getElementById('wat-je-krijgt'), `
    <div class="container">
      <h2>${escapeHtml(watJeKrijgtTitle)}</h2>
      ${watJeKrijgt.length ? `<ul>${watJeKrijgt.map((x) => `<li>${escapeHtml(typeof x === 'string' ? x : pickLang(x, lang))}</li>`).join('')}</ul>` : watJeKrijgtFallback}
    </div>
  `);

  const muziek = pickLangArr(service.muziek, lang);
  const muziekIntro = pickLang(service.muziekIntro, lang);
  const muziekTitle = lang === 'en' ? 'Music' : 'Muziek';
  const muziekFallback = lang === 'en' ? '<p>Wide repertoire, adaptable to your wishes.</p>' : '<p>Breed repertoire, aanpasbaar aan jouw wensen.</p>';
  const muziekHtml = muziek.length ? `<ul>${muziek.map((x) => `<li>${escapeHtml(typeof x === 'string' ? x : pickLang(x, lang))}</li>`).join('')}</ul>` : muziekFallback;
  const muziekLinks = lang === 'en'
    ? '<p class="section-links">Looking for music inspiration? Check the <a href="/feest-muziek-inspiratie.html">party music inspiration</a> with playlist examples per moment, or use the <a href="/feest-playlist-generator.html">playlist generator</a> for a custom suggestion.</p>'
    : '<p class="section-links">Zoek je muziekinspiratie? Bekijk de <a href="/feest-muziek-inspiratie.html">feest muziek inspiratie</a> met playlist-voorbeelden per moment, of gebruik de <a href="/feest-playlist-generator.html">playlist generator</a> voor een op maat gemaakte suggestie.</p>';
  setContent(document.getElementById('muziek'), `
    <div class="container">
      <h2>${escapeHtml(muziekTitle)}</h2>
      ${muziekIntro ? `<p class="section-intro">${escapeHtml(muziekIntro)}</p>` : ''}
      ${muziekHtml}
      ${muziekLinks}
    </div>
  `);

  const apparatuur = pickLangArr(service.apparatuur, lang);
  const apparatuurTitle = lang === 'en' ? 'Equipment' : 'Apparatuur';
  const apparatuurFallback = lang === 'en' ? '<p>Professional DJ set. See <a href="/dj-set-up.html">DJ set-up</a> for details.</p>' : '<p>Professionele DJ-set. Zie <a href="/dj-set-up.html">DJ set-up</a> voor details.</p>';
  setContent(document.getElementById('apparatuur'), `
    <div class="container">
      <h2>${escapeHtml(apparatuurTitle)}</h2>
      ${apparatuur.length ? `<ul>${apparatuur.map((x) => `<li>${escapeHtml(typeof x === 'string' ? x : pickLang(x, lang))}</li>`).join('')}</ul>` : apparatuurFallback}
    </div>
  `);

  const werkwijze = pickLangArr(service.werkwijzeSteps, lang);
  const werkwijzeTitle = lang === 'en' ? 'How it works' : 'Werkwijze';
  const werkwijzeFallback = lang === 'en' ? '<p>1. Contact – 2. Arrangements – 3. Party!</p>' : '<p>1. Contact – 2. Afspraken – 3. Feest!</p>';
  setContent(document.getElementById('werkwijze'), `
    <div class="container">
      <h2>${escapeHtml(werkwijzeTitle)}</h2>
      ${werkwijze.length ? `<ol>${werkwijze.map((x) => `<li>${escapeHtml(typeof x === 'string' ? x : pickLang(x, lang))}</li>`).join('')}</ol>` : werkwijzeFallback}
    </div>
  `);

  let pricingData = null;
  try {
    const prRes = await fetch('/data/pricing.json');
    if (prRes.ok) pricingData = await prRes.json();
  } catch (_) {}
  const formatPrice = (p) => p != null ? `€${Number(p).toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—';
  const faq = service.faq || [];
  const faqItems = faq.map((item) => {
    const q = pickLang(item.q, lang);
    const a = pickLang(item.a, lang);
    if ((item.aTemplate === 'pricing' || /Hoeveel kost|How much/.test(q)) && pricingData) {
      const aHtml = lang === 'en'
        ? `From ${formatPrice(pricingData.justDj?.from)} (Just DJ) or ${formatPrice(pricingData.allIn?.from)} (All-in). See <a href="/prijzen.html">Prices</a>.`
        : `Vanaf ${formatPrice(pricingData.justDj?.from)} (Just DJ) of ${formatPrice(pricingData.allIn?.from)} (All-in). Zie <a href="/prijzen.html">Prijzen</a>.`;
      return { ...item, q, aHtml };
    }
    return { ...item, q, a };
  });
  const faqTitle = lang === 'en' ? 'Frequently asked questions' : 'Veelgestelde vragen';
  const faqFallback = lang === 'en' ? '<p>No FAQ for this service. <a href="/veelgestelde-vragen.html">View general FAQ</a>.</p>' : '<p>Geen veelgestelde vragen voor deze dienst. <a href="/veelgestelde-vragen.html">Bekijk algemene FAQ</a>.</p>';
  setContent(document.getElementById('faq'), `
    <div class="container">
      <h2>${escapeHtml(faqTitle)}</h2>
      ${faqItems.length ? faqItems.map((item) => `
        <details class="faq-item">
          <summary>${escapeHtml(item.q)}</summary>
          <p>${item.aHtml != null ? item.aHtml : escapeHtml(item.a || '')}</p>
        </details>
      `).join('') : faqFallback}
    </div>
  `);

  try {
    const data = await loadJSON('/data/testimonials.json');
    const list = data.testimonials || [];
    const serviceEventType = SLUG_TO_EVENT[slug] || service.eventType;
    const filtered = serviceEventType
      ? list.filter((t) => {
          const types = Array.isArray(t.eventType) ? t.eventType : (t.eventType ? [t.eventType] : []);
          return types.includes(serviceEventType);
        })
      : list;
    const toShow = (filtered.length ? filtered : list).slice().sort(() => Math.random() - 0.5).slice(0, 3);
    const reviewsEl = document.getElementById('reviews');
    if (reviewsEl) {
      if (toShow.length) {
        const cardHtml = toShow.map((t) => {
          const city = t.city || '';
          const source = t.source || 'Google';
          const text = escapeHtml(pickLang(t.text, lang));
          const footer = city ? `— ${escapeHtml(t.name)}, ${escapeHtml(city)} (${escapeHtml(source)})` : `— ${escapeHtml(t.name)} (${escapeHtml(source)})`;
          return `<article class="testimonial-card">
            <div class="testimonial-meta"><span class="testimonial-stars" aria-label="${t.rating} van 5 sterren" role="img">${renderStars(t.rating)}</span></div>
            <p class="testimonial-text">${text}</p>
            <footer class="testimonial-footer">${footer}</footer>
          </article>`;
        }).join('');
        reviewsEl.innerHTML = `<div class="container"><h2>Reviews</h2><p><a href="/reviews.html">Alle reviews</a></p><div class="testimonials-grid">${cardHtml}</div></div>`;
      } else {
        reviewsEl.innerHTML = '<div class="container"><h2>Reviews</h2><p><a href="/reviews.html">Bekijk alle reviews</a>.</p></div>';
      }
    }
  } catch (err) {
    const reviewsEl = document.getElementById('reviews');
    if (reviewsEl) reviewsEl.innerHTML = '<div class="container"><h2>Reviews</h2><p><a href="/reviews.html">Bekijk reviews</a>.</p></div>';
  }

  const ctaText = pickLang(service.ctaText, lang) || (lang === 'en' ? 'Check availability' : 'Check beschikbaarheid');
  const ctaEl = document.getElementById('cta');
  if (ctaEl) {
    ctaEl.innerHTML = `
      <div class="container">
        <p><a href="/contact.html" class="pricing-btn">${escapeHtml(ctaText)}</a></p>
        <p><a href="https://wa.me/31621888970?text=Hoi%20Tim!%20Ik%20wil%20graag%20een%20${encodeURIComponent(serviceTitle)}%20boeken." target="_blank" rel="noopener" class="contact-whatsapp" aria-label="Contact via WhatsApp"><svg class="whatsapp-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.865 9.865 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> WhatsApp</a></p>
      </div>
    `;
  }

  const andereEl = document.getElementById('andere-diensten');
  if (andereEl) {
    const otherFeesttypes = FEESTTYPES.filter((s) => s.slug !== slug);
    const meerFeesttypesTitle = lang === 'en' ? 'More party types' : 'Meer feesttypes';
    let html = `
      <div class="container">
        <h2>${escapeHtml(meerFeesttypesTitle)}</h2>
        <ul class="link-list">
          ${otherFeesttypes.map((s) =>
      `<li><a href="/diensten/${s.slug}.html">${escapeHtml(lang === 'en' ? (s.titleEn || s.title) : s.title)}</a></li>`
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
    if (FEESTTYPES.some((f) => f.slug === slug)) {
      const populairePlaatsenTitle = lang === 'en' ? 'Popular places in the area' : 'Populaire plaatsen in de regio';
      const werkgebiedLink = lang === 'en' ? 'View my full service area' : 'Bekijk mijn volledige werkgebied';
      html += `
        <h2 style="margin-top: 2rem;">${escapeHtml(populairePlaatsenTitle)}</h2>
        <ul class="link-list">
          ${POPULAIRE_PLAATSEN.map((l) => `<li><a href="/locaties/${l.slug}.html">DJ in ${escapeHtml(l.name)}</a></li>`).join('')}
        </ul>
        <p><a href="/werkgebied.html">${escapeHtml(werkgebiedLink)}</a></p>
      `;
    }
    html += '</div>';
    andereEl.innerHTML = html;
  }
}

if (typeof document !== 'undefined') {
  window.addEventListener('langchange', renderServicePage);
  document.addEventListener('partialsloaded', renderServicePage);
}
