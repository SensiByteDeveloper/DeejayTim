/**
 * Fotos feesten galerij – laadt data, rendert hero + grid, lightbox
 */
(function () {
  const BASE = '/media/feesten/';

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function src(filename) {
    return BASE + encodeURIComponent(filename);
  }

  async function loadData() {
    try {
      const res = await fetch('/data/fotos-feesten.json');
      return await res.json();
    } catch (_) {
      return { hero: null, featured: [], more: [] };
    }
  }

  function renderGallery(containerId, items) {
    const el = document.getElementById(containerId);
    if (!el || !items?.length) return;
    el.innerHTML = items.map((item, i) => `
      <figure class="fotos-gallery-item">
        <button type="button" class="fotos-gallery-btn" data-index="${i}" data-src="${escapeHtml(src(item.src))}" data-alt="${escapeHtml(item.alt || '')}" aria-label="Vergroot: ${escapeHtml(item.alt || 'foto')}">
          <img src="${src(item.src)}" alt="${escapeHtml(item.alt || 'Sfeerfoto feest')}" loading="${i < 4 ? 'eager' : 'lazy'}">
        </button>
      </figure>
    `).join('');
  }

  function initLightbox(photos) {
    const lightbox = document.getElementById('fotosLightbox');
    const img = document.getElementById('fotosLightboxImg');
    const closeBtn = lightbox?.querySelector('.fotos-lightbox-close');
    const prevBtn = lightbox?.querySelector('.fotos-lightbox-prev');
    const nextBtn = lightbox?.querySelector('.fotos-lightbox-next');
    const counterEl = lightbox?.querySelector('.fotos-lightbox-counter');

    if (!lightbox || !img || !photos?.length) return;

    let currentIndex = 0;

    const showPhoto = (idx) => {
      const n = photos.length;
      if (idx < 0) idx = n - 1;
      if (idx >= n) idx = 0;
      currentIndex = idx;
      const p = photos[idx];
      img.src = src(p.src);
      img.alt = p.alt || '';
      if (counterEl) counterEl.textContent = `${idx + 1} / ${n}`;
    };

    const open = (idx) => {
      currentIndex = typeof idx === 'number' ? idx : 0;
      showPhoto(currentIndex);
      lightbox.hidden = false;
      lightbox.classList.add('open');
      document.body.classList.add('fotos-lightbox-open');
      closeBtn?.focus();
    };

    const close = () => {
      lightbox.hidden = true;
      lightbox.classList.remove('open');
      document.body.classList.remove('fotos-lightbox-open');
    };

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.fotos-gallery-btn');
      if (btn) {
        e.preventDefault();
        const idx = parseInt(btn.dataset.index, 10);
        open(!isNaN(idx) ? idx : 0);
      }
    });

    prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); showPhoto(currentIndex - 1); });
    nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); showPhoto(currentIndex + 1); });

    closeBtn?.addEventListener('click', close);
    lightbox?.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox?.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') { e.preventDefault(); showPhoto(currentIndex - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); showPhoto(currentIndex + 1); }
    });

    let touchStartX = 0;
    lightbox?.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lightbox?.addEventListener('touchend', (e) => {
      if (!lightbox.classList.contains('open')) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) showPhoto(dx < 0 ? currentIndex + 1 : currentIndex - 1);
    }, { passive: true });
  }

  async function init() {
    const data = await loadData();
    const photos = data.featured || [];

    renderGallery('fotosGallery', photos);

    initLightbox(photos);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
