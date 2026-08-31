/* ===== DEEJAY TIM - Lightweight i18n ===== */
(function () {
  const STORAGE_KEY = 'deejaytim-lang';
  let dict = {};
  let currentLang = 'nl';

  const script = document.currentScript;
  const scriptSrc = script && script.src ? script.src : '';
  const i18nBase = scriptSrc ? scriptSrc.replace(/\/[^/]+$/, '/') : '';

  function getEmbeddedLang(lang) {
    const el = document.getElementById('i18n-' + lang);
    if (el && el.textContent) {
      try {
        return JSON.parse(el.textContent.trim());
      } catch (_) {}
    }
    return null;
  }

  async function loadLang(lang) {
    const embedded = getEmbeddedLang(lang);
    if (typeof location !== 'undefined' && (location.protocol === 'http:' || location.protocol === 'https:')) {
      try {
        const base = i18nBase || new URL('i18n/', location.href).href;
        const res = await fetch(base + lang + '.json', { cache: 'no-store' });
        if (res.ok) {
          dict[lang] = await res.json();
          return;
        }
      } catch (_) {}
    }
    dict[lang] = embedded || {};
  }

  function get(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  }

  const PRICE_TOKEN_RE = /\{(fromJustDj|fromAllIn|fromWedding|justDj|allIn|wedding|extraHour|kmRate|hours|travelKm|postcode|travel50|hour|km|ex50)\}/;

  function withPrices(str) {
    if (typeof str !== 'string' || str.indexOf('{') === -1) return str;
    try {
      if (typeof window.__djPriceInterpolate === 'function') {
        return window.__djPriceInterpolate(str);
      }
    } catch (_) {}
    return str;
  }

  function resolved(str) {
    const next = withPrices(str);
    if (typeof next === 'string' && PRICE_TOKEN_RE.test(next)) return null;
    return next;
  }

  function t(key) {
    const v = get(dict[currentLang], key);
    const str = v != null ? String(v) : (get(dict.nl, key) || key);
    return withPrices(str);
  }

  /**
   * @param {Element|Document|undefined} scopeRoot - If an Element, only update i18n nodes inside it (faster after PJAX). Title/meta/lang UI always update.
   * @param {{ silent?: boolean }} [opts] - silent skips langchange (used after pricing load).
   */
  function apply(scopeRoot, opts) {
    document.documentElement.lang = currentLang;
    const path = typeof location !== 'undefined' ? location.pathname || '' : '';
    const isHome = path === '/' || path === '/index.html' || path === '';
    const isInspiratie = /^\/inspiratie\/?$/.test(path) || path === '/inspiratie/index.html';
    const titleKey = isInspiratie ? 'pages.inspiratieIndex.pageTitle' : 'page.title';
    const descKey = isInspiratie ? 'pages.inspiratieIndex.pageDescription' : 'page.description';
    const title = resolved(get(dict[currentLang], titleKey));
    const desc = resolved(get(dict[currentLang], descKey));
    /* Alleen homepage/inspiratie-index: voorkom dat page.title elke unieke paginatitel overschrijft */
    if ((isHome || isInspiratie) && title) document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && desc && (isHome || isInspiratie) && !metaDesc.hasAttribute('data-price-meta')) {
      metaDesc.setAttribute('content', desc);
    }
    const metaOgTitle = document.querySelector('meta[property="og:title"]');
    if (metaOgTitle && title && (isHome || isInspiratie)) metaOgTitle.setAttribute('content', title);
    const metaOgDesc = document.querySelector('meta[property="og:description"]');
    if (metaOgDesc && desc && (isHome || isInspiratie)) metaOgDesc.setAttribute('content', desc);
    const metaTwTitle = document.querySelector('meta[name="twitter:title"]');
    if (metaTwTitle && title && (isHome || isInspiratie)) metaTwTitle.setAttribute('content', title);
    const metaTwDesc = document.querySelector('meta[name="twitter:description"]');
    if (metaTwDesc && desc && (isHome || isInspiratie)) metaTwDesc.setAttribute('content', desc);

    const root =
      scopeRoot && scopeRoot.nodeType === Node.ELEMENT_NODE ? scopeRoot : document;

    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = resolved(get(dict[currentLang], key));
      if (val != null) el.textContent = val;
    });

    root.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = resolved(get(dict[currentLang], key));
      if (val != null) el.innerHTML = val;
    });

    root.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const val = resolved(get(dict[currentLang], key));
      if (val != null) el.setAttribute('aria-label', val);
    });

    root.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      const val = resolved(get(dict[currentLang], key));
      if (val != null) el.setAttribute('alt', val);
    });

    root.querySelectorAll('ul[data-i18n-list]').forEach(ul => {
      const key = ul.getAttribute('data-i18n-list');
      const arr = get(dict[currentLang], key);
      if (Array.isArray(arr)) {
        const items = arr.map((item) => resolved(item)).filter((v) => v != null);
        if (!items.length) return;
        const existing = ul.querySelectorAll('li');
        if (existing.length === items.length) {
          existing.forEach((li, i) => { li.textContent = items[i]; });
        } else {
          ul.textContent = '';
          items.forEach((v) => {
            const li = document.createElement('li');
            li.textContent = v;
            ul.appendChild(li);
          });
        }
      }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      const isActive = lang === currentLang;
      btn.setAttribute('aria-pressed', isActive);
      btn.setAttribute('aria-current', isActive ? 'true' : 'false');
      btn.setAttribute('title', t(`lang.${lang}`));
    });

    document.querySelectorAll('.lang-toggle').forEach((g) => {
      g.setAttribute('aria-label', t('lang.toggleAria'));
    });

    if (!opts || !opts.silent) {
      try { window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } })); } catch (_) {}
    }
    try {
      if (typeof window.__djApplyPricePlaceholders === 'function') {
        window.__djApplyPricePlaceholders(root === document ? document : root);
      }
    } catch (_) {}
  }

  async function setLang(lang) {
    if (lang !== 'nl' && lang !== 'en') return;
    if (!dict[lang]) await loadLang(lang);
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
    apply();
  }

  function initLangToggle() {
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.lang-toggle .lang-btn');
      if (!btn) return;
      const lang = btn.getAttribute('data-lang');
      if (lang === 'nl' || lang === 'en') {
        e.preventDefault();
        setLang(lang);
      }
    });
  }

  window.i18n = { t, setLang, apply, get currentLang() { return currentLang; } };

  function runInit() {
    (async function init() {
      const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || 'nl';
      currentLang = saved === 'en' ? 'en' : 'nl';
      await loadLang('nl');
      await loadLang('en');
      if (!dict[currentLang]) currentLang = 'nl';
      apply();
      initLangToggle();
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit);
  } else {
    runInit();
  }

  document.addEventListener('headerloaded', function () {
    if (window.i18n?.apply) window.i18n.apply();
  });
  document.addEventListener('partialsloaded', function (e) {
    if (!window.i18n?.apply) return;
    if (e.detail?.fromPjax) {
      const main = document.querySelector('#main-content');
      window.i18n.apply(main || undefined);
    } else {
      window.i18n.apply();
    }
  });
})();
