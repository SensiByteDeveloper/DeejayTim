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
  const ctaDj = lang === 'en' ? 'View DJ hire' : 'Bekijk DJ huren';
  const ctaContact = lang === 'en' ? 'Get in touch' : 'Neem contact op';
  const errorMsg = lang === 'en' ? 'Blog posts could not be loaded. <a href="/dj-huren.html">View DJ hire</a> or <a href="/contact.html">get in touch</a>.' : 'De blogberichten konden niet worden geladen. <a href="/dj-huren.html">Bekijk DJ huren</a> of <a href="/contact.html">neem contact op</a>.';

  try {
    const posts = await loadJSON('/blog/index.json');
    if (!Array.isArray(posts)) throw new Error('Invalid index format');

    const ACCENT_COLORS = ['cyan', 'magenta', 'yellow', 'pink'];
    const sorted = [...posts].sort((a, b) => {
      const da = (a.date || '').replace(/-/g, '');
      const db = (b.date || '').replace(/-/g, '');
      return db.localeCompare(da);
    });

    const listHtml = sorted.map((post, i) => {
      const slug = escapeHtml(post.slug || '');
      const title = escapeHtml(pickLang(post.title, lang));
      const date = formatDate(post.date, lang);
      const excerpt = escapeHtml(pickLang(post.excerpt, lang));
      const url = `/blog/post.html?slug=${encodeURIComponent(post.slug)}`;
      const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];

      return `
        <a href="${url}" class="service-card service-card-${accent} service-card-blog">
          <time class="service-card-blog-date" datetime="${escapeHtml(post.date || '')}">${date}</time>
          <span class="service-card-title">${title}</span>
          <span class="service-card-desc">${excerpt}</span>
          <span class="service-card-blog-link">${readMore}</span>
        </a>
      `;
    }).join('');

    const ctaHtml = `
      <p class="cta-row"><a href="/dj-huren.html">${escapeHtml(ctaDj)}</a> <span aria-hidden="true">·</span> <a href="/contact.html" class="cta-button">${escapeHtml(ctaContact)}</a></p>
    `;

    container.innerHTML = `
      <div class="service-cards service-cards-inspiratie service-cards-blog">${listHtml}</div>
      ${ctaHtml}
    `;
  } catch (err) {
    console.warn('[renderBlogIndex] Failed:', err);
    container.innerHTML = `<p>${errorMsg}</p>`;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('langchange', renderBlogIndex);
  document.addEventListener('partialsloaded', renderBlogIndex);
}
