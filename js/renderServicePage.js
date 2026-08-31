/* ===== DEEJAY TIM - Service page renderer ===== */
/* Data-driven content injection for /diensten/*.html pages */

import { handsUpEnabled, mentionsHandsUp } from './siteFeatures.js';
import { loadPricing, interpolateDeep, formatEuro } from './pricing.js?v=4';

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

function pickVisibleList(arr, lang) {
  return pickLangArr(arr, lang).filter((item) => {
    const text = typeof item === 'string' ? item : pickLang(item, lang);
    return handsUpEnabled() || !mentionsHandsUp(text);
  });
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
  let pricingData = null;
  try {
    pricingData = await loadPricing();
  } catch (_) {}
  if (pricingData) service = interpolateDeep(service, pricingData, lang);

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
  const introExtra = pickLang(service.introExtra, lang);
  const introLinks = lang === 'en'
    ? 'View <a href="/prijzen.html">prices</a>, read <a href="/reviews.html">reviews</a> or <a href="/contact.html">send me a message</a>.'
    : 'Bekijk <a href="/prijzen.html">prijzen</a>, lees <a href="/reviews.html">reviews</a> of <a href="/contact.html">stuur me een berichtje</a>.';
  setContent(document.getElementById('intro'), `
    <div class="container">
      ${breadcrumbHtml}
      <h1>${escapeHtml(h1Text)}</h1>
      <p>${escapeHtml(intro)}</p>
      ${introExtra ? `<p>${escapeHtml(introExtra)}</p>` : ''}
      <p>${introLinks}</p>
    </div>
  `);

  const directTitle = pickLang(service.directContact?.title, lang);
  const directBody = pickLang(service.directContact?.body, lang);
  const introEl = document.getElementById('intro');
  let directEl = document.getElementById('direct-contact');
  if (directTitle && directBody) {
    if (!directEl && introEl) {
      directEl = document.createElement('section');
      directEl.id = 'direct-contact';
      directEl.className = 'section section-compact direct-contact';
      introEl.insertAdjacentElement('afterend', directEl);
    }
    if (directEl) {
      setContent(directEl, `
        <div class="container">
          <h2>${escapeHtml(directTitle)}</h2>
          <p>${escapeHtml(directBody)}</p>
        </div>
      `);
    }
  } else if (directEl) {
    directEl.hidden = true;
  }

  if (slug === 'verjaardag-dj') {
    const verjaardagTypes = [
      { slug: 'sweet-16-dj', title: 'Sweet 16 DJ' },
      { slug: 'dj-18-jaar', title: lang === 'en' ? 'DJ 18 to 21' : 'DJ 18 tot 21 jaar' },
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

  const watJeKrijgt = pickVisibleList(service.watJeKrijgt, lang);
  const watJeKrijgtTitle = lang === 'en' ? 'What you get' : 'Wat je krijgt';
  const watJeKrijgtFallback = lang === 'en' ? '<p>We\'ll determine together what you need.</p>' : '<p>In overleg bepalen we wat je nodig hebt.</p>';
  setContent(document.getElementById('wat-je-krijgt'), `
    <div class="container">
      <h2>${escapeHtml(watJeKrijgtTitle)}</h2>
      ${watJeKrijgt.length ? `<ul>${watJeKrijgt.map((x) => `<li>${escapeHtml(typeof x === 'string' ? x : pickLang(x, lang))}</li>`).join('')}</ul>` : watJeKrijgtFallback}
    </div>
  `);

  const muziek = pickVisibleList(service.muziek, lang);
  const muziekIntroRaw = pickLang(service.muziekIntro, lang);
  const muziekIntroParts = Array.isArray(muziekIntroRaw)
    ? muziekIntroRaw.filter(Boolean)
    : (muziekIntroRaw ? [muziekIntroRaw] : []);
  const muziekTitle = lang === 'en' ? 'Music' : 'Muziek';
  const muziekFallback = lang === 'en' ? '<p>Wide repertoire, adaptable to your wishes.</p>' : '<p>Breed repertoire, aanpasbaar aan jouw wensen.</p>';
  const muziekHtml = muziek.length ? `<ul>${muziek.map((x) => `<li>${escapeHtml(typeof x === 'string' ? x : pickLang(x, lang))}</li>`).join('')}</ul>` : muziekFallback;
  const muziekLinks = lang === 'en'
    ? '<p class="section-links">Looking for more inspiration? See the <a href="/feest-muziek-inspiratie.html">party music examples</a> — style ideas, not a fixed playlist.</p>'
    : '<p class="section-links">Meer inspiratie? Bekijk de <a href="/feest-muziek-inspiratie.html">feest muziek voorbeelden</a> — ter illustratie, geen vaste playlist.</p>';
  const examples = pickLangArr(service.musicExamples, lang);
  const examplesIntro = pickLang(service.musicExamplesIntro, lang)
    || (lang === 'en'
      ? 'Examples of artists and styles that can fit this kind of party. Not a set list: we discuss wishes beforehand and I read the dance floor.'
      : 'Voorbeelden van artiesten en stijlen die bij dit type feest kunnen passen. Geen vaste setlist: we bespreken wensen vooraf en ik speel in op de dansvloer.');
  const examplesHtml = examples.length
    ? `<p class="section-intro">${escapeHtml(examplesIntro)}</p><ul class="music-examples">${examples.map((x) => `<li>${escapeHtml(typeof x === 'string' ? x : pickLang(x, lang))}</li>`).join('')}</ul>`
    : '';
  setContent(document.getElementById('muziek'), `
    <div class="container">
      <h2>${escapeHtml(muziekTitle)}</h2>
      ${muziekIntroParts.map((p) => `<p class="section-intro">${escapeHtml(p)}</p>`).join('')}
      ${muziekHtml}
      ${examplesHtml}
      ${muziekLinks}
    </div>
  `);

  const apparatuur = pickLangArr(service.apparatuur, lang);
  const apparatuurTitle = lang === 'en' ? 'Sound and lighting' : 'Geluid en licht';
  const apparatuurFallback = lang === 'en' ? '<p>Complete standard setup available. See <a href="/prijzen.html">prices</a> for DJ Only vs All-in.</p>' : '<p>Complete standaard techniek mogelijk. Zie <a href="/prijzen.html">prijzen</a> voor het verschil tussen DJ Only en All-in.</p>';
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

  const extraSections = Array.isArray(service.extraSections) ? service.extraSections : [];
  const werkwijzeEl = document.getElementById('werkwijze');
  if (werkwijzeEl && extraSections.length) {
    const extraHtml = extraSections.map((sec) => {
      const tTitle = pickLang(sec.title, lang);
      const tBody = pickLang(sec.body, lang);
      if (!tTitle || !tBody) return '';
      return `<h2>${escapeHtml(tTitle)}</h2><p>${escapeHtml(tBody)}</p>`;
    }).join('');
    if (extraHtml) {
      const box = werkwijzeEl.querySelector('.container') || werkwijzeEl;
      box.insertAdjacentHTML('beforeend', extraHtml);
    }
  }

  if (pricingData && document.getElementById('wat-je-krijgt')) {
    const isWedding = slug === 'bruiloft-dj';
    const hour = formatEuro(pricingData.extraHour);
    const hours = pricingData.justDj?.hoursIncluded || 4;
    const priceStrip = isWedding
      ? (lang === 'en'
        ? `<p class="service-price-strip">Wedding DJ from ${formatEuro(pricingData.wedding?.from)} for ${hours} hours. Extra hour ${hour}. See <a href="/prijzen.html">prices</a>.</p>`
        : `<p class="service-price-strip">Bruiloft DJ vanaf ${formatEuro(pricingData.wedding?.from)} voor ${hours} uur. Extra uur ${hour}. Zie <a href="/prijzen.html">prijzen</a>.</p>`)
      : (lang === 'en'
        ? `<p class="service-price-strip">DJ Only from ${formatEuro(pricingData.justDj?.from)} · All-in from ${formatEuro(pricingData.allIn?.from)} · ${hours} hours included · extra hour ${hour}. See <a href="/prijzen.html">prices</a>.</p>`
        : `<p class="service-price-strip">DJ Only vanaf ${formatEuro(pricingData.justDj?.from)} · All-in vanaf ${formatEuro(pricingData.allIn?.from)} · ${hours} uur inbegrepen · extra uur ${hour}. Zie <a href="/prijzen.html">prijzen</a>.</p>`);
    const wj = document.getElementById('wat-je-krijgt')?.querySelector('.container');
    if (wj && !wj.querySelector('.service-price-strip')) wj.insertAdjacentHTML('beforeend', priceStrip);
  }

  let faqItems = [];
  const faqPageKey = service.faqPage || (slug === 'bruiloft-dj' ? 'bruiloft' : slug === 'verjaardag-dj' ? 'verjaardag' : slug === 'bedrijfsfeest-dj' ? 'bedrijfsfeest' : slug === 'schoolfeest-dj' ? 'schoolfeest' : slug === 'buurtfeest-dj' ? 'buurtfeest' : slug === 'slagingsfeest-dj' ? 'slagingsfeest' : (VERJAARDAG_SLUGS.includes(slug) ? 'verjaardag' : ''));
  try {
    const { getFaqItems, loadFaq, injectFaqJsonLd } = await import('/js/renderFaq.js');
    const faqData = await loadFaq();
    faqItems = getFaqItems(faqData, faqPageKey, service.faq, lang, pricingData);
    injectFaqJsonLd(faqItems, 'data-service-faq');
  } catch (_) {
    faqItems = (service.faq || []).map((item) => ({
      q: pickLang(item.q, lang),
      a: pickLang(item.a, lang)
    }));
  }
  const faqTitle = lang === 'en' ? 'Frequently asked questions' : 'Veelgestelde vragen';
  const faqFallback = lang === 'en' ? '<p>See the <a href="/veelgestelde-vragen.html">general FAQ</a>.</p>' : '<p>Bekijk de <a href="/veelgestelde-vragen.html">algemene FAQ</a>.</p>';
  setContent(document.getElementById('faq'), `
    <div class="container">
      <h2>${escapeHtml(faqTitle)}</h2>
      ${faqItems.length ? faqItems.map((item) => `
        <details class="faq-item">
          <summary>${escapeHtml(item.q)}</summary>
          <p>${escapeHtml(item.a || '')}</p>
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

  const ctaText = pickLang(service.ctaText, lang) || (lang === 'en' ? 'Send me a message' : 'Stuur me een berichtje');
  const secondaryCta = lang === 'en' ? 'View prices' : 'Bekijk prijzen';
  const ctaEl = document.getElementById('cta');
  if (ctaEl) {
    ctaEl.innerHTML = `
      <div class="container">
        <p class="cta-row cta-row-buttons">
          <a href="/contact.html" class="cta-button">${escapeHtml(ctaText)}</a>
          <a href="/prijzen.html" class="cta-button-secondary">${escapeHtml(secondaryCta)}</a>
        </p>
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
