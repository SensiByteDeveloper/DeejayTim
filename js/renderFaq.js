/* ===== DEEJAY TIM - Central FAQ renderer ===== */
/* Loads /data/faq.json and fills [data-faq] containers */

import { handsUpEnabled, mentionsHandsUp } from './siteFeatures.js';
import { loadPricing, interpolatePrices } from './pricing.js?v=4';

function getLang() {
  return (typeof window !== 'undefined' && window.i18n?.currentLang) || 'nl';
}

function pickLang(obj, lang) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] ?? obj.nl ?? obj.en ?? '';
}

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

let _faq = null;

export async function loadFaq() {
  if (_faq) return _faq;
  const res = await fetch('/data/faq.json');
  if (!res.ok) throw new Error('Failed to load faq.json');
  _faq = await res.json();
  return _faq;
}

export function getFaqItems(faqData, pageKey, extraItems, lang, pricing) {
  const ip = (s) => interpolatePrices(s, pricing, lang);
  const ids = (faqData?.pages?.[pageKey] || []).filter((id) => handsUpEnabled() || id !== 'handsUp');
  const fromCentral = ids
    .map((id) => faqData.items?.[id])
    .filter(Boolean)
    .map((item) => ({
      q: ip(pickLang(item.q, lang)),
      a: ip(pickLang(item.a, lang))
    }));
  const extra = (extraItems || [])
    .map((item) => ({
      q: ip(pickLang(item.q, lang)),
      a: ip(pickLang(item.a, lang))
    }))
    .filter((item) => item.q && !fromCentral.some((c) => c.q === item.q))
    .filter((item) => handsUpEnabled() || !mentionsHandsUp(`${item.q} ${item.a}`));
  return [...fromCentral, ...extra];
}

export function renderFaqHtml(items, title) {
  if (!items.length) return '';
  const heading = title ? `<h2>${escapeHtml(title)}</h2>` : '';
  return `
    ${heading}
    <div class="faq-list">
    ${items
      .map(
        (item) => `
      <details class="faq-item">
        <summary>${escapeHtml(item.q)}</summary>
        <p>${escapeHtml(item.a)}</p>
      </details>`
      )
      .join('')}
    </div>
  `;
}

export function injectFaqJsonLd(items, attr = 'data-faq-jsonld') {
  document.querySelectorAll(`script[${attr}]`).forEach((el) => el.remove());
  if (!items.length) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute(attr, '');
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  });
  document.head.appendChild(script);
}

export async function renderFaqPage(pageKey, extraItems) {
  const lang = getLang();
  const title =
    lang === 'en' ? 'Frequently asked questions' : 'Veelgestelde vragen';
  const containers = document.querySelectorAll('[data-faq]');
  if (!containers.length) return [];

  let faqData = null;
  let pricing = null;
  try {
    faqData = await loadFaq();
  } catch (err) {
    console.warn('[renderFaq] Failed to load faq.json:', err);
  }
  try {
    pricing = await loadPricing();
  } catch (_) {}

  const key = pageKey || containers[0].getAttribute('data-faq') || 'site';
  const items = faqData ? getFaqItems(faqData, key, extraItems, lang, pricing) : [];

  containers.forEach((el) => {
    const elKey = el.getAttribute('data-faq') || key;
    const elItems = faqData ? getFaqItems(faqData, elKey, extraItems, lang, pricing) : items;
    const headingAttr = el.getAttribute('data-faq-title');
    const heading = headingAttr === '' ? '' : (headingAttr || title);
    const wrap = el.matches('.container') ? el : null;
    const html = renderFaqHtml(elItems, heading);
    if (wrap) {
      wrap.innerHTML = html;
    } else {
      el.innerHTML = `<div class="container">${html}</div>`;
    }
  });

  injectFaqJsonLd(items);
  return items;
}

export async function initFaqFromDom() {
  const el = document.querySelector('[data-faq]');
  if (!el) return;
  await renderFaqPage(el.getAttribute('data-faq'));
}

if (typeof document !== 'undefined') {
  const run = () => initFaqFromDom().catch(() => {});
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  document.addEventListener('partialsloaded', run);
  window.addEventListener('langchange', run);
}
