/* ===== DEEJAY TIM - Pjax navigation ===== */
/* Intercept internal links, fetch content, replace main – music keeps playing (no full reload) */

(function () {
  const MAIN_SELECTOR = '#main-content';
  const SCRIPT_MAP = {
    '/dj-huren.html': ['/js/renderDjHurenReviews.js'],
    '/reviews.html': ['/js/renderReviewsPage.js'],
    '/fotos-feesten.html': ['/js/fotosGallery.js'],
    '/': ['/js/content.js', '/js/renderPricing.js'],
    '/index.html': ['/js/content.js', '/js/renderPricing.js'],
    '/prijzen.html': ['/js/renderPricing.js'],
    '/blog/index.html': ['/js/renderBlogIndex.js']
  };

  function getPath(url) {
    try {
      const u = new URL(url, location.origin);
      return u.pathname.replace(/\/$/, '') || '/';
    } catch (_) {
      return '';
    }
  }

  function getScriptsForPath(path) {
    const normalized = path === '' ? '/' : path;
    const fromMap = SCRIPT_MAP[normalized] || SCRIPT_MAP[path + '/'];
    if (fromMap) return fromMap;
    if (path.startsWith('/diensten/') && path.endsWith('.html')) {
      return ['/js/renderServicePage.js'];
    }
    if (path.startsWith('/locaties/') && (path.endsWith('.html') || path === '/locaties' || path === '/locaties/')) {
      return ['/js/renderLocationPage.js'];
    }
    return [];
  }

  function isInternalLink(link) {
    if (!link || link.tagName !== 'A') return false;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;
    if (link.target === '_blank' || link.hasAttribute('download')) return false;
    try {
      const url = new URL(href, location.origin);
      return url.origin === location.origin;
    } catch (_) {
      return false;
    }
  }

  function isSamePage(href) {
    try {
      const url = new URL(href, location.origin);
      const current = new URL(location.href);
      return url.pathname === current.pathname && url.search === current.search;
    } catch (_) {
      return false;
    }
  }

  function scrollToHash(url) {
    try {
      const hash = new URL(url, location.origin).hash;
      if (hash) {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return true;
        }
      }
    } catch (_) {}
    return false;
  }

  async function loadPage(url) {
    const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    if (!res.ok) throw new Error(res.status);
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const fetchedMain = doc.querySelector(MAIN_SELECTOR);
    const title = doc.querySelector('title');
    const metaDesc = doc.querySelector('meta[name="description"]');
    const mainAttrs = {};
    if (fetchedMain) {
      for (const a of fetchedMain.attributes) {
        if (a.name.startsWith('data-') || a.name === 'class') mainAttrs[a.name] = a.value;
      }
    }
    return {
      mainHTML: fetchedMain ? fetchedMain.innerHTML : '',
      mainAttrs,
      title: title ? title.textContent : document.title,
      metaDesc: metaDesc ? metaDesc.getAttribute('content') || '' : ''
    };
  }

  async function runScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(script);
    });
  }

  async function navigateTo(url, pushState = true) {
    const path = getPath(url);
    const main = document.querySelector(MAIN_SELECTOR);
    if (!main) return;

    try {
      const { mainHTML, mainAttrs, title, metaDesc } = await loadPage(url);

      main.innerHTML = mainHTML;
      ['data-service', 'data-location', 'class'].forEach((name) => main.removeAttribute(name));
      for (const [name, value] of Object.entries(mainAttrs)) {
        main.setAttribute(name, value);
      }
      document.title = title;
      const meta = document.querySelector('meta[name="description"]');
      if (meta && metaDesc) meta.setAttribute('content', metaDesc);

      if (pushState) {
        history.pushState({ pjax: true, url }, '', url);
      }

      if (!scrollToHash(url)) window.scrollTo(0, 0);

      const scripts = getScriptsForPath(path);
      for (const src of scripts) {
        try {
          await runScript(src);
        } catch (_) {}
      }

      document.dispatchEvent(new CustomEvent('pjax:navigate', { detail: { url, path } }));
      if (window.i18n?.apply) window.i18n.apply();
      document.dispatchEvent(new CustomEvent('partialsloaded', { detail: { fromPjax: true } }));
    } catch (err) {
      location.href = url;
    }
  }

  const VIDEO_RETURN_KEY = 'deejaytim-video-return';

  function init() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link || !isInternalLink(link)) return;
      if (link.hasAttribute('data-no-pjax')) return;
      if (isSamePage(link.href)) return;

      try {
        const targetUrl = new URL(link.href, location.origin);
        const targetPath = (targetUrl.pathname || '/').replace(/\/$/, '') || '/';
        const currentPath = (location.pathname || '/').replace(/\/$/, '') || '/';
        const isGoingToHome = targetPath === '' || targetPath === '/';
        if (targetUrl.hash === '#video' && isGoingToHome && currentPath !== '' && currentPath !== '/') {
          sessionStorage.setItem(VIDEO_RETURN_KEY, location.pathname || '/inspiratie/');
        }
      } catch (_) {}

      e.preventDefault();
      navigateTo(link.href);
    }, true);

    window.addEventListener('popstate', () => {
      const url = history.state?.pjax ? history.state.url : location.href;
      navigateTo(url, false);
    });
  }

  window.pjaxNavigate = (url) => navigateTo(url);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
