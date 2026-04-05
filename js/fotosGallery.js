/**
 * Fotos feesten galerij – laadt data, rendert hero + grid, lightbox
 * Moet opnieuw initialiseren na PJAX (inline scripts draaien niet opnieuw; oude DOM-refs zijn ongeldig).
 */
(function () {
  const BASE = '/media/feesten/';

  /** Huidige fotoset voor lightbox (wordt bij elke init ververst) */
  let galleryPhotos = [];

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function src(filename) {
    return BASE + encodeURIComponent(filename);
  }

  function isFotosPage() {
    const p = location.pathname || '';
    return /fotos-feesten\.html$/.test(p);
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

  function getLightboxEls() {
    const lightbox = document.getElementById('fotosLightbox');
    const img = document.getElementById('fotosLightboxImg');
    return { lightbox, img };
  }

  let currentIndex = 0;

  function showPhoto(idx) {
    const { lightbox, img } = getLightboxEls();
    const photos = galleryPhotos;
    if (!lightbox || !img || !photos?.length) return;
    const n = photos.length;
    if (idx < 0) idx = n - 1;
    if (idx >= n) idx = 0;
    currentIndex = idx;
    const p = photos[idx];
    img.src = src(p.src);
    img.alt = p.alt || '';
    const counterEl = lightbox.querySelector('.fotos-lightbox-counter');
    if (counterEl) counterEl.textContent = `${idx + 1} / ${n}`;
  }

  function openLightbox(idx) {
    const { lightbox } = getLightboxEls();
    if (!lightbox || !galleryPhotos?.length) return;
    currentIndex = typeof idx === 'number' && !isNaN(idx) ? idx : 0;
    showPhoto(currentIndex);
    lightbox.hidden = false;
    lightbox.classList.add('open');
    document.body.classList.add('fotos-lightbox-open');
    lightbox.querySelector('.fotos-lightbox-close')?.focus();
  }

  function closeLightbox() {
    const { lightbox } = getLightboxEls();
    if (!lightbox) return;
    lightbox.hidden = true;
    lightbox.classList.remove('open');
    document.body.classList.remove('fotos-lightbox-open');
  }

  /** Eén keer: delegatie op document — werkt na PJAX met nieuwe #fotosLightbox in de DOM */
  function bindLightboxDelegationOnce() {
    if (window.__fotosGalleryDelegationBound) return;
    window.__fotosGalleryDelegationBound = true;

    document.addEventListener('click', (e) => {
      if (!isFotosPage()) return;
      const btn = e.target.closest('.fotos-gallery-btn');
      if (btn) {
        e.preventDefault();
        const i = parseInt(btn.dataset.index, 10);
        openLightbox(!isNaN(i) ? i : 0);
        return;
      }
      const closeBtn = e.target.closest('.fotos-lightbox-close');
      if (closeBtn && document.getElementById('fotosLightbox')?.contains(closeBtn)) {
        e.preventDefault();
        closeLightbox();
        return;
      }
      const lb = document.getElementById('fotosLightbox');
      if (e.target === lb) closeLightbox();
    });

    document.addEventListener('click', (e) => {
      if (!isFotosPage()) return;
      const lb = document.getElementById('fotosLightbox');
      if (!lb?.classList.contains('open')) return;
      if (e.target.closest('.fotos-lightbox-prev')) {
        e.stopPropagation();
        showPhoto(currentIndex - 1);
      } else if (e.target.closest('.fotos-lightbox-next')) {
        e.stopPropagation();
        showPhoto(currentIndex + 1);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (!isFotosPage()) return;
      const lb = document.getElementById('fotosLightbox');
      if (!lb?.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showPhoto(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showPhoto(currentIndex + 1);
      }
    });

    let touchStartX = 0;
    document.addEventListener(
      'touchstart',
      (e) => {
        if (!isFotosPage()) return;
        const lb = document.getElementById('fotosLightbox');
        if (!lb?.classList.contains('open') || !lb.contains(e.target)) return;
        touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );
    document.addEventListener(
      'touchend',
      (e) => {
        if (!isFotosPage()) return;
        const lb = document.getElementById('fotosLightbox');
        if (!lb?.classList.contains('open')) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) showPhoto(dx < 0 ? currentIndex + 1 : currentIndex - 1);
      },
      { passive: true }
    );
  }

  async function init() {
    if (!isFotosPage()) return;
    const data = await loadData();
    galleryPhotos = data.featured || [];
    renderGallery('fotosGallery', galleryPhotos);
    bindLightboxDelegationOnce();
  }

  function scheduleInit() {
    if (isFotosPage()) init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleInit);
  } else {
    scheduleInit();
  }
  document.addEventListener('partialsloaded', scheduleInit);
})();
