/* ===== DEEJAY TIM - Central pricing renderer ===== */
/* Fetches /data/pricing.json and replaces [data-price] and [data-range] elements */

import {
  loadPricing,
  getPricing as getCachedPricing,
  formatEuro,
  interpolatePrices,
  applyPricePlaceholders
} from './pricing.js?v=4';

function getLang() {
  return (typeof window !== 'undefined' && window.i18n?.currentLang) || 'nl';
}

function pickLang(obj, lang) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] ?? obj.nl ?? obj.en ?? '';
}

function pickLangArr(arr, lang) {
  if (!Array.isArray(arr)) return arr;
  const o = arr;
  if (typeof o[0] === 'object' && o[0] && (o[0].nl != null || o[0].en != null)) {
    return o.map((item) => pickLang(item, lang));
  }
  if (typeof o === 'object' && (o.nl || o.en)) return o[lang] ?? o.nl ?? o.en ?? [];
  return o;
}

function formatPrice(p) {
  return formatEuro(p);
}

function renderPriceElement(el, pricing) {
  if (!pricing) return;
  const lang = getLang();
  const key = el.getAttribute('data-price');
  const format = el.getAttribute('data-price-format') || 'amount';
  const fromLabel = lang === 'en' ? 'From ' : 'Vanaf ';
  if (key === 'justDj') {
    const j = pricing.justDj;
    const note = pickLang(j?.note, lang);
    if (format === 'full') {
      const hoursLabel = lang === 'en' ? ' hours' : ' uur';
      el.textContent = `${fromLabel}${formatPrice(j?.from)} (${j?.hoursIncluded || 4}${hoursLabel}, ${note})`;
    } else {
      el.textContent = formatPrice(j?.from);
    }
  } else if (key === 'justDjFrom') {
    const j = pricing.justDj;
    el.textContent = `${fromLabel}${formatPrice(j?.from)}`;
  } else if (key === 'allIn') {
    const a = pricing.allIn;
    const note = pickLang(a?.note, lang);
    if (format === 'full') {
      const hoursLabel = lang === 'en' ? ' hours' : ' uur';
      el.textContent = `${fromLabel}${formatPrice(a?.from)} (${a?.hoursIncluded || 4}${hoursLabel} ${note})`;
    } else {
      el.textContent = formatPrice(a?.from);
    }
  } else if (key === 'allInFrom') {
    const a = pricing.allIn;
    el.textContent = `${fromLabel}${formatPrice(a?.from)}`;
  } else if (key === 'weddingFrom') {
    const w = pricing.wedding;
    if (w) el.textContent = `${fromLabel}${formatPrice(w.from)}`;
  } else if (key === 'wedding') {
    const w = pricing.wedding;
    if (w) el.textContent = formatPrice(w.from);
  } else if (key === 'extraHour') {
    el.textContent = formatPrice(pricing.extraHour);
  } else if (key === 'extraHourFrom') {
    el.textContent = `${fromLabel}${formatPrice(pricing.extraHour)}`;
  }
}

function renderRangeElement(el, pricing) {
  if (!pricing) return;
  const key = el.getAttribute('data-range');
  if (key === 'typical') {
    const r = pricing.typicalRange;
    el.textContent = `De meeste feesten vallen tussen ${formatPrice(r.from)} en ${formatPrice(r.to)}.`;
  }
}

function renderSubtitleElement(el, pricing) {
  if (!pricing) return;
  const lang = getLang();
  const tpl =
    pickLang(pricing.subtitle, lang) ||
    (lang === 'en'
      ? 'Private rates; no VAT. All packages: {hours} hours DJ included, including {travelKm} km travel from {postcode}; beyond that {kmRate} per extra km driven. Extra hour {extraHour}.'
      : 'Particuliere tarieven, geen btw. Alle pakketten: {hours} uur DJ inbegrepen, inclusief {travelKm} km reiskosten vanaf {postcode}; daarboven {kmRate} per extra gereden km. Extra uur {extraHour}.');
  const next = interpolatePrices(tpl, pricing, lang);
  if (/\{(hours|travelKm|postcode|kmRate|travel50|extraHour|justDj|allIn|wedding)\}/.test(next)) return;
  el.textContent = next;
}

function renderExtrasList(el, pricing) {
  if (!pricing) return;
  const lang = getLang();
  const extras = Array.isArray(pricing.extras) ? pricing.extras : (pricing.extras?.[lang] ?? pricing.extras?.nl ?? []);
  if (!extras?.length) return;
  el.innerHTML = extras.map((item) => `<li>${typeof item === 'string' ? item : pickLang(item, lang)}</li>`).join('');
}

function fillPackageCard(card, pkg, lang) {
  if (!card || !pkg) return;
  const titleEl = card.querySelector('[data-package-title], .pricing-title, h2, h3');
  if (titleEl && !titleEl.hasAttribute('data-i18n')) {
    titleEl.textContent = pickLang(pkg.title, lang);
  } else if (titleEl && titleEl.hasAttribute('data-package-title')) {
    titleEl.textContent = pickLang(pkg.title, lang);
  }
  const subtitleEl = card.querySelector('[data-package-subtitle], .pricing-subtitle, .pricing-block-note');
  if (subtitleEl) subtitleEl.textContent = pickLang(pkg.subtitle, lang);
  const bulletsEl = card.querySelector('[data-package-bullets], .pricing-features, .pricing-block-includes');
  const bullets = pickLangArr(pkg.bullets, lang);
  if (bulletsEl && bullets.length) {
    bulletsEl.innerHTML = bullets.map((item) => `<li>${item}</li>`).join('');
  }
  const extraEl = card.querySelector('[data-package-extra], .pricing-note, .pricing-block-extra');
  if (extraEl) extraEl.remove();
  const audienceEl = card.querySelector('[data-package-audience], .pricing-audience, .pricing-block-audience');
  if (audienceEl) audienceEl.remove();
  const chooseEl = card.querySelector('[data-package-choose]');
  if (chooseEl) chooseEl.remove();
  const badgeEl = card.querySelector('.card-badge');
  if (badgeEl && pkg.badge) badgeEl.textContent = pickLang(pkg.badge, lang);
}

function renderPackageCards(pricing) {
  if (!pricing?.packages) return;
  const lang = getLang();
  document.querySelectorAll('[data-package]').forEach((card) => {
    const id = card.getAttribute('data-package');
    const pkg = pricing.packages.find((p) => p.id === id);
    fillPackageCard(card, pkg, lang);
  });
}

function setMetaContent(selector, content) {
  const el = document.querySelector(selector);
  if (el && content) el.setAttribute('content', content);
}

function updatePricingMetaAndSchema(pricing) {
  if (!pricing) return;
  const lang = getLang();
  const j = pricing.justDj?.from;
  const a = pricing.allIn?.from;
  const w = pricing.wedding?.from;
  const fp = formatPrice;
  const hours = pricing.justDj?.hoursIncluded || 4;
  const hour = fp(pricing.extraHour);
  const km = pricing.travelIncludedKm ?? 30;
  const postcode = pricing.travelBasePostcode || '3332 SN';

  const meta = document.querySelector('meta[name="description"][data-price-meta]');
  if (meta && j != null && a != null) {
    const parts = [`DJ Only vanaf ${fp(j)}`, `All-in vanaf ${fp(a)}`];
    if (w != null) parts.push(`bruiloft vanaf ${fp(w)}`);
    meta.setAttribute('content', `Prijzen DJ Tim: ${parts.join(', ')}. Alle pakketten ${hours} uur, extra uur ${hour}. Reiskosten tot ${km} km inbegrepen vanaf ${postcode}. Regio Zwijndrecht, Drechtsteden en Rijnmond.`);
  }

  const path = (typeof location !== 'undefined' ? location.pathname : '') || '';
  if (/\/prijzen\.html$/.test(path) && j != null && a != null && w != null) {
    const title = `Prijzen DJ Tim | DJ Only ${fp(j)} · All-in ${fp(a)} · Bruiloft ${fp(w)}`;
    document.title = title;
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[name="twitter:title"]', title);
    const ogDesc = `Duidelijke vanafprijzen: DJ Only ${fp(j)}, All-in ${fp(a)}, bruiloft ${fp(w)}. ${hours} uur inbegrepen, extra uur ${hour}.`;
    setMetaContent('meta[property="og:description"]', ogDesc);
    setMetaContent('meta[name="twitter:description"]', ogDesc);
  }

  const homeDesc = document.querySelector('meta[name="description"]:not([data-price-meta])');
  if (homeDesc && (path === '/' || path === '/index.html' || path === '') && j != null && a != null && w != null) {
    const interpolated = interpolatePrices(homeDesc.getAttribute('content') || '', pricing, lang);
    if (interpolated) homeDesc.setAttribute('content', interpolated);
  }

  document.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
    try {
      const data = JSON.parse(el.textContent);
      if (data && data['@type'] === 'LocalBusiness' && j != null && w != null) {
        data.priceRange = `${fp(j)}-${fp(w)}`;
        el.textContent = JSON.stringify(data, null, 2);
      }
    } catch (_) {}
  });

  const werkgebiedFaq = document.querySelector('script[type="application/ld+json"][data-faq-werkgebied]');
  if (werkgebiedFaq && j != null && a != null) {
    try {
      const faq = JSON.parse(werkgebiedFaq.textContent);
      const costQ = faq.mainEntity?.find((e) => e['@type'] === 'Question' && e.name && e.name.includes('Hoeveel kost'));
      if (costQ?.acceptedAnswer) {
        costQ.acceptedAnswer.text = `Vanaf ${fp(j)} (DJ Only), ${fp(a)} (All-in) of ${fp(w)} (bruiloft). Alle pakketten ${hours} uur. Zie prijzen voor actuele tarieven.`;
      }
      const travelQ = faq.mainEntity?.find((e) => e['@type'] === 'Question' && e.name && e.name.includes('Hoe ver rijdt'));
      if (travelQ?.acceptedAnswer) {
        travelQ.acceptedAnswer.text = interpolatePrices(
          'Reiskosten zijn inbegrepen tot {travelKm} km vanuit Zwijndrecht ({postcode}). Daarboven reken ik {kmRate} per extra gereden kilometer; bij een locatie op 50 km afstand komt er dan {travel50} bij op de prijs voor extra reiskosten. Tot ongeveer 50 km rijd ik sowieso voor feesten. Verder dan 50 km is in overleg. Neem contact op voor de mogelijkheden.',
          pricing,
          'nl'
        );
      }
      const placesQ = faq.mainEntity?.find((e) => e['@type'] === 'Question' && e.name && e.name.includes('Welke plaatsen'));
      if (placesQ?.acceptedAnswer) {
        placesQ.acceptedAnswer.text = interpolatePrices(
          'Kerngebied: Drechtsteden en Rijnmond. Tot ±50 km ook Den Haag, Gouda, Woerden en Waalwijk. Reiskosten inbegrepen tot {travelKm} km; tot 50 km rijd ik sowieso, verder in overleg.',
          pricing,
          'nl'
        );
      }
      werkgebiedFaq.textContent = JSON.stringify(faq);
    } catch (_) {}
  }
}

export async function renderPricing(retryAttempt = 0) {
  const pricing = await loadPricing();
  const lang = getLang();
  if (pricing && typeof window !== 'undefined' && window.i18n?.apply) {
    window.i18n.apply(undefined, { silent: true });
  }
  document.querySelectorAll('[data-price]').forEach((el) => renderPriceElement(el, pricing));
  document.querySelectorAll('[data-range]').forEach((el) => renderRangeElement(el, pricing));
  document.querySelectorAll('[data-price-subtitle]').forEach((el) => renderSubtitleElement(el, pricing));
  document.querySelectorAll('[data-extras]').forEach((el) => renderExtrasList(el, pricing));
  renderPackageCards(pricing);
  updatePricingMetaAndSchema(pricing);
  applyPricePlaceholders(document, pricing, lang);

  /* Eén retry bij mislukte fetch (intermitterend netwerk / cache) */
  if (!pricing && document.querySelector('[data-price]') && retryAttempt < 1) {
    setTimeout(() => renderPricing(retryAttempt + 1).catch(() => {}), 400);
  }
}


export function getPricing() {
  return getCachedPricing();
}

export async function getPricingAsync() {
  return loadPricing();
}

if (typeof document !== 'undefined') {
  /**
   * Prijzen pas vullen ná i18n/microtasks (queueMicrotask) en vóór paint (rAF),
   * zodat homepage/PJAX niet lege [data-price]-spans tonen door volgorde-races.
   */
  function scheduleRenderPricing() {
    const exec = () => {
      renderPricing().catch(() => {});
    };
    const runAfterLayout = () => {
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(exec);
      } else {
        exec();
      }
    };
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(runAfterLayout);
    } else {
      setTimeout(runAfterLayout, 0);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleRenderPricing);
  } else {
    scheduleRenderPricing();
  }
  document.addEventListener('partialsloaded', scheduleRenderPricing);
  document.addEventListener('pjax:navigate', () => {
    scheduleRenderPricing();
  });
  window.addEventListener('langchange', scheduleRenderPricing);

  /* Langchange kan al vuren vóór deze module geladen is (defer header → i18n.apply vóór modules). */
  setTimeout(() => {
    const priceSpans = document.querySelectorAll('[data-price]');
    if (!priceSpans.length) return;
    const empty = [...priceSpans].some((el) => !el.textContent?.trim());
    if (empty) scheduleRenderPricing();
  }, 300);
}
