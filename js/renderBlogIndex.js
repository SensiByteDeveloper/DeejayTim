/* ===== DEEJAY TIM - Blog index renderer ===== */
/* Loads /blog/index.json and renders post list sorted by date desc */

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

export async function renderBlogIndex() {
  const container = document.querySelector('[data-blog-index]');
  if (!container) return;

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
      const title = escapeHtml(post.title || '');
      const date = formatDate(post.date);
      const excerpt = escapeHtml(post.excerpt || '');
      const url = `/blog/post.html?slug=${encodeURIComponent(post.slug)}`;

      return `
        <article class="blog-card">
          <div class="blog-card-content">
            <time class="blog-card-date" datetime="${escapeHtml(post.date || '')}">${date}</time>
            <h2 class="blog-card-title"><a href="${url}">${title}</a></h2>
            <p class="blog-card-excerpt">${excerpt}</p>
            <a href="${url}" class="blog-card-link">Lees meer →</a>
          </div>
        </article>
      `;
    }).join('');

    const ctaHtml = `
      <div class="blog-cta">
        <h3>Zoek je een DJ voor jouw feest?</h3>
        <p>
          <a href="/dj-huren.html" class="pricing-btn">Bekijk DJ huren</a>
          <a href="/contact.html" class="blog-cta-link">Of neem contact op</a>
        </p>
      </div>
    `;

    container.innerHTML = `
      <div class="blog-list">${listHtml}</div>
      ${ctaHtml}
    `;
  } catch (err) {
    console.warn('[renderBlogIndex] Failed:', err);
    container.innerHTML = `
      <p>De blogberichten konden niet worden geladen. <a href="/dj-huren.html">Bekijk DJ huren</a> of <a href="/contact.html">neem contact op</a>.</p>
    `;
  }
}
