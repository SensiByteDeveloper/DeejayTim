/* ===== DEEJAY TIM - Blog index renderer ===== */
/* Loads /blog/index.json and renders post list sorted by date desc */

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

export async function renderBlogIndex() {
  const container = document.querySelector('[data-blog-index]');
  if (!container) return;

  const lang = getLang();
  const readMore = lang === 'en' ? 'Read more →' : 'Lees meer →';
  const ctaTitle = lang === 'en' ? 'Looking for a DJ for your party?' : 'Zoek je een DJ voor jouw feest?';
  const ctaDj = lang === 'en' ? 'View DJ hire' : 'Bekijk DJ huren';
  const ctaContact = lang === 'en' ? 'Or get in touch' : 'Of neem contact op';
  const errorMsg = lang === 'en' ? 'Blog posts could not be loaded. <a href="/dj-huren.html">View DJ hire</a> or <a href="/contact.html">get in touch</a>.' : 'De blogberichten konden niet worden geladen. <a href="/dj-huren.html">Bekijk DJ huren</a> of <a href="/contact.html">neem contact op</a>.';

  try {
    const posts = await loadJSON('/blog/index.json');
    if (!Array.isArray(posts)) throw new Error('Invalid index format');

    const sorted = [...posts].sort((a, b) => {
      const da = (a.date || '').replace(/-/g, '');
      const db = (b.date || '').replace(/-/g, '');
      return db.localeCompare(da);
    });

    const listHtml = sorted.map((post) => {
      const slug = escapeHtml(post.slug || '');
      const title = escapeHtml(pickLang(post.title, lang));
      const date = formatDate(post.date, lang);
      const excerpt = escapeHtml(pickLang(post.excerpt, lang));
      const url = `/blog/post.html?slug=${encodeURIComponent(post.slug)}`;

      return `
        <article class="blog-card">
          <div class="blog-card-content">
            <time class="blog-card-date" datetime="${escapeHtml(post.date || '')}">${date}</time>
            <h2 class="blog-card-title"><a href="${url}">${title}</a></h2>
            <p class="blog-card-excerpt">${excerpt}</p>
            <a href="${url}" class="blog-card-link">${readMore}</a>
          </div>
        </article>
      `;
    }).join('');

    const ctaHtml = `
      <div class="blog-cta">
        <h3>${escapeHtml(ctaTitle)}</h3>
        <p>
          <a href="/dj-huren.html" class="pricing-btn">${escapeHtml(ctaDj)}</a>
          <a href="/contact.html" class="blog-cta-link">${escapeHtml(ctaContact)}</a>
        </p>
      </div>
    `;

    container.innerHTML = `
      <div class="blog-list">${listHtml}</div>
      ${ctaHtml}
    `;
  } catch (err) {
    console.warn('[renderBlogIndex] Failed:', err);
    container.innerHTML = `<p>${errorMsg}</p>`;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('langchange', renderBlogIndex);
}
