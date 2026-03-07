/* ===== DEEJAY TIM - Central pricing renderer ===== */
/* Fetches /data/pricing.json and replaces [data-price] and [data-range] elements */

let _pricing = null;

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

async function loadPricing() {
  if (_pricing) return _pricing;
  try {
    const res = await fetch('/data/pricing.json');
    if (!res.ok) throw new Error('Failed to load pricing');
    _pricing = await res.json();
    return _pricing;
  } catch (err) {
    console.warn('[renderPricing] Failed to load pricing.json:', err);
    return null;
  }
}

function formatPrice(p) {
  if (p == null) return '—';
  return `€${Number(p).toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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
  const km = pricing.extraKm;
  const hour = pricing.extraHour;
  const tpl = pickLang(pricing.subtitle, lang) || (lang === 'en' ? 'Prices excl. VAT, incl. 4 hours DJ and incl. travel up to 30km from 3332 SN. Extra km: {km}. Extra hour: {hour}.' : 'Prijzen zijn excl. BTW, incl. 4 uur DJ en incl. reiskosten tot 30km vanuit 3332 SN. Extra km: {km}. Extra uur: {hour}.');
  el.textContent = tpl.replace('{km}', formatPrice(km)).replace('{hour}', formatPrice(hour));
}

function renderExtrasList(el, pricing) {
  if (!pricing) return;
  const lang = getLang();
  const extras = Array.isArray(pricing.extras) ? pricing.extras : (pricing.extras?.[lang] ?? pricing.extras?.nl ?? []);
  if (!extras?.length) return;
  el.innerHTML = extras.map((item) => `<li>${typeof item === 'string' ? item : pickLang(item, lang)}</li>`).join('');
}

function updatePricingMetaAndSchema(pricing) {
  if (!pricing) return;
  const j = pricing.justDj?.from;
  const a = pricing.allIn?.from;
  const w = pricing.wedding?.from;
  const fp = formatPrice;
  const meta = document.querySelector('meta[name="description"][data-price-meta]');
  if (meta && j != null && a != null) {
    const parts = [`Just DJ vanaf ${fp(j)}`, `All-in DJ Show vanaf ${fp(a)}`];
    if (w != null) parts.push(`Bruiloft DJ vanaf ${fp(w)}`);
    meta.setAttribute('content', `Prijzen DJ Tim: ${parts.join(', ')}. 4 uur incl. Reiskosten tot 30 km. Regio Zwijndrecht en Rotterdam.`);
  }

  /* FAQ "Wat kost een DJ gemiddeld?" heeft nu statische, genuanceerde tekst in prijzen.html – niet overschrijven */

  const werkgebiedFaq = document.querySelector('script[type="application/ld+json"][data-faq-werkgebied]');
  if (werkgebiedFaq && j != null && a != null) {
    try {
      const faq = JSON.parse(werkgebiedFaq.textContent);
      const q = faq.mainEntity?.find((e) => e['@type'] === 'Question' && e.name && e.name.includes('Hoeveel kost'));
      if (q?.acceptedAnswer) {
        q.acceptedAnswer.text = `Vanaf ${fp(j)} (Just DJ) of ${fp(a)} (All-in, incl. set-up). Zie prijzen voor actuele tarieven.`;
        werkgebiedFaq.textContent = JSON.stringify(faq);
      }
    } catch (_) {}
  }
}

export async function renderPricing() {
  const pricing = await loadPricing();
  document.querySelectorAll('[data-price]').forEach((el) => renderPriceElement(el, pricing));
  document.querySelectorAll('[data-range]').forEach((el) => renderRangeElement(el, pricing));
  document.querySelectorAll('[data-price-subtitle]').forEach((el) => renderSubtitleElement(el, pricing));
  document.querySelectorAll('[data-extras]').forEach((el) => renderExtrasList(el, pricing));
  updatePricingMetaAndSchema(pricing);
}


export function getPricing() {
  return _pricing;
}

export async function getPricingAsync() {
  return loadPricing();
}

if (typeof document !== 'undefined') {
  const run = () => renderPricing();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  document.addEventListener('partialsloaded', run);
  window.addEventListener('langchange', run);
}
