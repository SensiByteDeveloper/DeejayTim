/* ===== DEEJAY TIM - Shared pricing helpers ===== */
/* Source of truth: /data/pricing.json */

let _pricing = null;
let _loadPromise = null;

function getLang() {
  return (typeof window !== 'undefined' && window.i18n?.currentLang) || 'nl';
}

export function formatEuro(n) {
  if (n == null || n === '') return '—';
  return `€${Number(n).toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatFrom(n, lang = getLang()) {
  const prefix = lang === 'en' ? 'From ' : 'Vanaf ';
  return `${prefix}${formatEuro(n)}`;
}

export function formatKmRate(n, lang = getLang()) {
  if (n == null || n === '') return '—';
  const loc = lang === 'en' ? 'en-GB' : 'nl-NL';
  return `€${Number(n).toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function travelSurcharge(pricing, oneWayKm) {
  if (!pricing) return 0;
  const included = Number(pricing.travel?.includedKm ?? pricing.travelIncludedKm ?? 30);
  const rate = Number(pricing.travel?.extraKmRate ?? pricing.extraKm ?? 0.35);
  const extraOneWay = Math.max(0, Number(oneWayKm) - included);
  const roundTrip = pricing.travel?.roundTrip !== false;
  return extraOneWay * (roundTrip ? 2 : 1) * rate;
}

export function normalizePricing(raw) {
  if (!raw) return null;
  const pkg = (id) => (raw.packages || []).find((p) => p.id === id);
  const travelIn = raw.travel || {};
  const includedKm = travelIn.includedKm ?? raw.travelIncludedKm ?? 30;
  const extraKmRate = travelIn.extraKmRate ?? raw.extraKm ?? 0.35;
  const postalCode = travelIn.postalCode ?? raw.travelBasePostcode ?? '3332 SN';
  const just = pkg('justDj');
  const allIn = pkg('allIn');
  const wedding = pkg('wedding');
  const travel = {
    includedKm,
    extraKmRate,
    postalCode,
    roundTrip: travelIn.roundTrip !== false,
    exampleDistanceKm: travelIn.exampleDistanceKm ?? 50
  };
  return {
    ...raw,
    extraHour: raw.extraHour ?? 100,
    extraKm: extraKmRate,
    travelIncludedKm: includedKm,
    travelBasePostcode: postalCode,
    travel,
    justDj: {
      from: just?.from ?? raw.justDj?.from,
      hoursIncluded: just?.hoursIncluded ?? raw.justDj?.hoursIncluded ?? 4,
      note: just?.note ?? raw.justDj?.note
    },
    allIn: {
      from: allIn?.from ?? raw.allIn?.from,
      hoursIncluded: allIn?.hoursIncluded ?? raw.allIn?.hoursIncluded ?? 4,
      note: allIn?.note ?? raw.allIn?.note
    },
    wedding: {
      from: wedding?.from ?? raw.wedding?.from,
      hoursIncluded: wedding?.hoursIncluded ?? raw.wedding?.hoursIncluded ?? 4,
      note: wedding?.note ?? raw.wedding?.note
    }
  };
}

export function priceTokens(pricing, lang = getLang()) {
  if (!pricing) return {};
  const hours = pricing.justDj?.hoursIncluded ?? 4;
  const exampleKm = pricing.travel?.exampleDistanceKm ?? 50;
  return {
    justDj: formatEuro(pricing.justDj?.from),
    allIn: formatEuro(pricing.allIn?.from),
    wedding: formatEuro(pricing.wedding?.from),
    extraHour: formatEuro(pricing.extraHour),
    kmRate: formatKmRate(pricing.travel?.extraKmRate ?? pricing.extraKm, lang),
    fromJustDj: formatFrom(pricing.justDj?.from, lang),
    fromAllIn: formatFrom(pricing.allIn?.from, lang),
    fromWedding: formatFrom(pricing.wedding?.from, lang),
    hours: String(hours),
    travelKm: String(pricing.travel?.includedKm ?? pricing.travelIncludedKm ?? 30),
    postcode: pricing.travel?.postalCode ?? pricing.travelBasePostcode ?? '3332 SN',
    travel50: formatEuro(travelSurcharge(pricing, exampleKm)),
    hour: formatEuro(pricing.extraHour),
    km: formatKmRate(pricing.travel?.extraKmRate ?? pricing.extraKm, lang),
    ex50: formatEuro(travelSurcharge(pricing, exampleKm))
  };
}

const TOKEN_RE = /\{(fromJustDj|fromAllIn|fromWedding|justDj|allIn|wedding|extraHour|kmRate|hours|travelKm|postcode|travel50|hour|km|ex50)\}/g;

export function interpolatePrices(str, pricing, lang = getLang()) {
  if (str == null) return str;
  if (typeof str !== 'string') return str;
  if (str.indexOf('{') === -1) return str;
  if (!pricing) return str;
  const tokens = priceTokens(pricing, lang);
  return str.replace(TOKEN_RE, (_, key) => (tokens[key] != null ? tokens[key] : `{${key}}`));
}

export function interpolateDeep(value, pricing, lang = getLang()) {
  if (!pricing) return value;
  if (typeof value === 'string') return interpolatePrices(value, pricing, lang);
  if (Array.isArray(value)) return value.map((v) => interpolateDeep(v, pricing, lang));
  if (value && typeof value === 'object') {
    const out = Array.isArray(value) ? [] : {};
    for (const [k, v] of Object.entries(value)) out[k] = interpolateDeep(v, pricing, lang);
    return out;
  }
  return value;
}

function shouldSkipNode(node) {
  const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  if (!el) return true;
  const tag = el.closest?.('script:not([type="application/ld+json"]):not([type="application/json"]), style, noscript, textarea');
  return Boolean(tag);
}

export function applyPricePlaceholders(root, pricing, lang = getLang()) {
  if (!root || !pricing) return;
  if (root.nodeType === Node.DOCUMENT_NODE) {
    const title = root.querySelector('title');
    if (title) title.textContent = interpolatePrices(title.textContent, pricing, lang);
    root.querySelectorAll('meta[content]').forEach((el) => {
      const c = el.getAttribute('content');
      if (c && c.includes('{')) el.setAttribute('content', interpolatePrices(c, pricing, lang));
    });
    root.querySelectorAll('script[type="application/ld+json"], script[type="application/json"]').forEach((el) => {
      if (el.id === 'i18n-nl' || el.id === 'i18n-en') return;
      if (el.textContent && el.textContent.includes('{')) {
        el.textContent = interpolatePrices(el.textContent, pricing, lang);
      }
    });
    root = root.body || root.documentElement;
  }
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || node.nodeValue.indexOf('{') === -1) return NodeFilter.FILTER_REJECT;
      if (shouldSkipNode(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    n.nodeValue = interpolatePrices(n.nodeValue, pricing, lang);
  }
}

export function installPriceInterpolator(pricing) {
  if (typeof window === 'undefined') return;
  window.__djPriceInterpolate = (str) => interpolatePrices(str, pricing, getLang());
  window.__djApplyPricePlaceholders = (root) => applyPricePlaceholders(root || document, pricing, getLang());
  try {
    applyPricePlaceholders(document, pricing, getLang());
    if (window.i18n?.apply) window.i18n.apply(undefined, { silent: true });
  } catch (_) {}
}

export async function loadPricing() {
  if (_pricing) return _pricing;
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    try {
      const res = await fetch('/data/pricing.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load pricing');
      _pricing = normalizePricing(await res.json());
      installPriceInterpolator(_pricing);
      return _pricing;
    } catch (err) {
      console.warn('[pricing] Failed to load pricing.json:', err);
      _loadPromise = null;
      return null;
    }
  })();
  return _loadPromise;
}

export function getPricing() {
  return _pricing;
}
