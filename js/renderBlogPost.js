/* ===== DEEJAY TIM - Blog post renderer ===== */
/* Reads slug from ?slug=... and loads /blog/posts/{slug}.json */

import { loadPricing, interpolatePrices, getPricing } from './pricing.js?v=4';

const BASE_URL = 'https://deejaytim.nl';

function getLang() {
  return (typeof window !== 'undefined' && window.i18n?.currentLang) || 'nl';
}

function pickLang(obj, lang) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] ?? obj.nl ?? obj.en ?? '';
}

function getSlugFromUrl() {
  const params = new URLSearchParams(location.search);
  return params.get('slug') || '';
}

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function formatDate(dateStr, lang) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T12:00:00');
    const locale = lang === 'en' ? 'en-GB' : 'nl-NL';
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const JSON_LD_ID = 'blog-post-jsonld';

function injectJsonLd(data, lang) {
  const existing = document.getElementById(JSON_LD_ID);
  if (existing) existing.remove();
  const title = interpolatePrices(pickLang(data.title, lang), getPricing(), lang);
  const description = interpolatePrices(pickLang(data.description, lang), getPricing(), lang);
  const script = document.createElement('script');
  script.id = JSON_LD_ID;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    datePublished: data.date,
    description: description,
    author: {
      '@type': 'Person',
      name: 'DJ Tim',
      alternateName: 'Deejaytim'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/post.html?slug=${encodeURIComponent(data.slug)}`
    }
  });
  document.head.appendChild(script);
}

function getInternalLinksHtml(lang, slug) {
  const furtherReading = lang === 'en' ? 'Further reading' : 'Verder lezen';
  const checkAvail = lang === 'en' ? 'Send me a message' : 'Stuur me een berichtje';
  const waText = lang === 'en' ? 'Hi%20Tim!%20I%20have%20a%20question%20about%20a%20DJ%20booking.' : 'Hoi%20Tim!%20Ik%20heb%20een%20vraag%20over%20een%20DJ-booking.';
  const isWedding = /bruiloft|wedding/i.test(slug || '');
  const isBirthday = /verjaardag|birthday/i.test(slug || '');
  const links = isWedding
    ? [
        { href: '/diensten/bruiloft-dj.html', label: lang === 'en' ? 'Wedding DJ' : 'Bruiloft DJ' },
        { href: '/prijzen.html', label: lang === 'en' ? 'Prices' : 'Prijzen' },
        { href: '/contact.html', label: checkAvail }
      ]
    : isBirthday
      ? [
          { href: '/diensten/verjaardag-dj.html', label: lang === 'en' ? 'Birthday DJ' : 'Verjaardag DJ' },
          { href: '/prijzen.html', label: lang === 'en' ? 'Prices' : 'Prijzen' },
          { href: '/contact.html', label: checkAvail }
        ]
      : [
          { href: '/prijzen.html', label: lang === 'en' ? 'Prices' : 'Prijzen' },
          { href: '/diensten/bruiloft-dj.html', label: lang === 'en' ? 'Wedding DJ' : 'Bruiloft DJ' },
          { href: '/diensten/verjaardag-dj.html', label: lang === 'en' ? 'Birthday DJ' : 'Verjaardag DJ' },
          { href: '/contact.html', label: checkAvail }
        ];
  return `
    <nav class="blog-internal-links" aria-label="${lang === 'en' ? 'Related pages' : 'Gerelateerde pagina\'s'}">
      <h3>${escapeHtml(furtherReading)}</h3>
      <ul>
        ${links.map((l) => `<li><a href="${l.href}">${escapeHtml(l.label)}</a></li>`).join('')}
      </ul>
      <div class="blog-cta-buttons">
        <a href="/contact.html" class="cta-button">${escapeHtml(checkAvail)}</a>
        <a href="https://wa.me/31621888970?text=${waText}" target="_blank" rel="noopener" class="contact-whatsapp">WhatsApp</a>
      </div>
    </nav>
  `;
}

export async function renderBlogPost() {
  const container = document.querySelector('[data-blog-post]');
  if (!container) return;

  const lang = getLang();
  const backToBlog = lang === 'en' ? '← Back to blog' : '← Terug naar blog';
  const noArticle = lang === 'en' ? 'No article selected. <a href="/blog/index.html">Back to blog</a>.' : 'Geen artikel geselecteerd. <a href="/blog/index.html">Terug naar het blog</a>.';
  const loadError = lang === 'en' ? 'This article could not be loaded. <a href="/blog/index.html">Back to blog</a> or <a href="/contact.html">send me a message</a>.' : 'Dit artikel kon niet worden geladen. <a href="/blog/index.html">Terug naar het blog</a> of <a href="/contact.html">stuur me een berichtje</a>.';

  const slug = getSlugFromUrl();
  if (!slug) {
    container.innerHTML = `<p>${noArticle}</p>`;
    return;
  }

  try {
    const post = await loadJSON(`/blog/posts/${encodeURIComponent(slug)}.json`);
    const pricing = await loadPricing();
    const ip = (s) => interpolatePrices(s, pricing, lang);

    const title = ip(pickLang(post.title, lang));
    const description = ip(pickLang(post.description, lang));

    document.title = `${escapeHtml(title)} | Deejay Tim`;
    setMeta('description', description || title);
    setCanonical(`${BASE_URL}/blog/post.html?slug=${encodeURIComponent(slug)}`);
    injectJsonLd(post, lang);

    const postUrl = `${BASE_URL}/blog/post.html?slug=${encodeURIComponent(slug)}`;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', `${title} | Deejay Tim`);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description || title);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', postUrl);

    const coverHtml = post.coverImage
      ? `<img src="${escapeHtml(post.coverImage)}" alt="" class="blog-post-cover">`
      : '';

    const bodyHtml = ip(pickLang(post.bodyHtml, lang) || '');

    container.innerHTML = `
      <article class="blog-post">
        <p class="blog-back"><a href="/blog/index.html">${escapeHtml(backToBlog)}</a></p>
        <header class="blog-post-header">
          <h1 class="blog-post-title">${escapeHtml(title)}</h1>
          <time class="blog-post-date" datetime="${escapeHtml(post.date || '')}">${formatDate(post.date, lang)}</time>
          ${coverHtml}
        </header>
        <div class="blog-post-body prose">${bodyHtml}</div>
        ${getInternalLinksHtml(lang, slug)}
        <aside class="preferred-source" aria-label="${lang === 'en' ? 'Preferred source in Google' : 'Voorkeursbron in Google'}">
          <p>${lang === 'en' ? 'Enjoy these tips? Add Deejay Tim as a preferred source in Google.' : 'Lees je mijn tips graag? Voeg Deejay Tim toe als voorkeursbron in Google.'}</p>
          <div google-add-preferred-source-btn data-theme="dark" data-lang="${lang}"></div>
        </aside>
      </article>
    `;
  } catch (err) {
    console.warn('[renderBlogPost] Failed:', err);
    container.innerHTML = `<p>${loadError}</p>`;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('langchange', renderBlogPost);
}
