/* ===== DEEJAY TIM - Central pricing renderer ===== */
/* Fetches /data/pricing.json and replaces [data-price] and [data-range] elements */

let _pricing = null;

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
  const key = el.getAttribute('data-price');
  const format = el.getAttribute('data-price-format') || 'amount';
  if (key === 'justDj') {
    const j = pricing.justDj;
    if (format === 'full') {
      el.textContent = `Vanaf ${formatPrice(j.from)} (${j.hoursIncluded} uur, ${j.note})`;
    } else {
      el.textContent = formatPrice(j.from);
    }
  } else if (key === 'justDjFrom') {
    const j = pricing.justDj;
    el.textContent = `Vanaf ${formatPrice(j.from)}`;
  } else if (key === 'allIn') {
    const a = pricing.allIn;
    if (format === 'full') {
      el.textContent = `Vanaf ${formatPrice(a.from)} (${a.hoursIncluded} uur ${a.note})`;
    } else {
      el.textContent = formatPrice(a.from);
    }
  } else if (key === 'allInFrom') {
    const a = pricing.allIn;
    el.textContent = `Vanaf ${formatPrice(a.from)}`;
  } else if (key === 'weddingFrom') {
    const w = pricing.wedding;
    if (w) el.textContent = `Vanaf ${formatPrice(w.from)}`;
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
  const km = pricing.extraKm;
  const hour = pricing.extraHour;
  el.textContent = `Prijzen zijn excl. BTW, incl. 4 uur DJ en incl. reiskosten tot 30km vanuit 3332 SN. Extra km: ${formatPrice(km)}. Extra uur: ${formatPrice(hour)}.`;
}

function renderExtrasList(el, pricing) {
  if (!pricing?.extras?.length) return;
  el.innerHTML = pricing.extras.map((item) => `<li>${item}</li>`).join('');
}

function updatePricingMetaAndSchema(pricing) {
  if (!pricing) return;
  const j = pricing.justDj?.from;
  const a = pricing.allIn?.from;
  const r = pricing.typicalRange;
  const fp = formatPrice;
  const priceText = r ? `De meeste feesten vallen tussen ${fp(r.from)} en ${fp(r.to)}. ` : '';
  const justAllText = (j != null && a != null) ? `Just DJ vanaf ${fp(j)}, All-in vanaf ${fp(a)}.` : '';

  const meta = document.querySelector('meta[name="description"][data-price-meta]');
  if (meta && j != null && a != null) {
    meta.setAttribute('content', `Prijzen DJ Tim: Just DJ vanaf ${fp(j)}, All-in vanaf ${fp(a)}. 4 uur incl. Reiskosten tot 30 km inbegrepen. Regio Zwijndrecht en Rotterdam.`);
  }

  const faqScript = document.querySelector('script[type="application/ld+json"][data-faq-pricing]');
  if (faqScript && (j != null || a != null || r)) {
    try {
      const faq = JSON.parse(faqScript.textContent);
      const q = faq.mainEntity?.find((e) => e['@type'] === 'Question' && e.name && e.name.includes('Wat kost een DJ gemiddeld'));
      if (q?.acceptedAnswer) {
        q.acceptedAnswer.text = priceText + justAllText;
        faqScript.textContent = JSON.stringify(faq);
      }
    } catch (_) {}
  }

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
}
