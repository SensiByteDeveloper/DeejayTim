/* ===== DEEJAY TIM - Blog post renderer ===== */
/* Reads slug from ?slug=... and loads /blog/posts/{slug}.json */

const BASE_URL = 'https://deejaytim.nl';

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

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('nl-NL', { year: 'numeric', month: 'long', day: 'numeric' });
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

function injectJsonLd(data) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    datePublished: data.date,
    description: data.description,
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

function getInternalLinksHtml() {
  return `
    <nav class="blog-internal-links" aria-label="Gerelateerde pagina's">
      <h3>Verder lezen</h3>
      <ul>
        <li><a href="/dj-huren.html">DJ huren</a></li>
        <li><a href="/werkgebied.html">Werkgebied</a></li>
        <li><a href="/diensten/bruiloft-dj.html">Bruiloft DJ</a></li>
        <li><a href="/locaties/dj-zwijndrecht.html">DJ Zwijndrecht</a></li>
      </ul>
      <div class="blog-cta-buttons">
        <a href="/contact.html" class="pricing-btn">Neem contact op</a>
        <a href="https://wa.me/31621888970?text=Hoi%20Tim!%20Ik%20heb%20een%20vraag%20over%20een%20DJ-booking." target="_blank" rel="noopener" class="blog-whatsapp-link">WhatsApp</a>
      </div>
    </nav>
  `;
}

export async function renderBlogPost() {
  const container = document.querySelector('[data-blog-post]');
  if (!container) return;

  const slug = getSlugFromUrl();
  if (!slug) {
    container.innerHTML = `
      <p>Geen artikel geselecteerd. <a href="/blog/index.html">Terug naar het blog</a>.</p>
    `;
    return;
  }

  try {
    const post = await loadJSON(`/blog/posts/${encodeURIComponent(slug)}.json`);

    document.title = `${escapeHtml(post.title)} | Deejay Tim`;
    setMeta('description', post.description || post.title);
    setCanonical(`${BASE_URL}/blog/post.html?slug=${encodeURIComponent(slug)}`);
    injectJsonLd(post);

    const postUrl = `${BASE_URL}/blog/post.html?slug=${encodeURIComponent(slug)}`;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', `${post.title} | Deejay Tim`);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', post.description || post.title);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', postUrl);

    const coverHtml = post.coverImage
      ? `<img src="${escapeHtml(post.coverImage)}" alt="" class="blog-post-cover">`
      : '';

    const bodyHtml = post.bodyHtml || '';

    container.innerHTML = `
      <article class="blog-post">
        <p class="blog-back"><a href="/blog/index.html">← Terug naar blog</a></p>
        <header class="blog-post-header">
          <h1 class="blog-post-title">${escapeHtml(post.title)}</h1>
          <time class="blog-post-date" datetime="${escapeHtml(post.date || '')}">${formatDate(post.date)}</time>
          ${coverHtml}
        </header>
        <div class="blog-post-body prose">${bodyHtml}</div>
        ${getInternalLinksHtml()}
      </article>
    `;
  } catch (err) {
    console.warn('[renderBlogPost] Failed:', err);
    container.innerHTML = `
      <p>Dit artikel kon niet worden geladen. <a href="/blog/index.html">Terug naar het blog</a> of <a href="/contact.html">neem contact op</a>.</p>
    `;
  }
}
