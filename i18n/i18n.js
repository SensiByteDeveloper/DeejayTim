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

  function t(key) {
    const v = get(dict[currentLang], key);
    return v != null ? String(v) : (get(dict.nl, key) || key);
  }

  function apply() {
    document.documentElement.lang = currentLang;
    const title = get(dict[currentLang], 'page.title');
    if (title) document.title = title;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = get(dict[currentLang], key);
      if (val != null) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const val = get(dict[currentLang], key);
      if (val != null) el.setAttribute('aria-label', val);
    });

    document.querySelectorAll('ul[data-i18n-list]').forEach(ul => {
      const key = ul.getAttribute('data-i18n-list');
      const arr = get(dict[currentLang], key);
      if (Array.isArray(arr)) {
        ul.querySelectorAll('li').forEach((li, i) => {
          if (arr[i] != null) li.textContent = arr[i];
        });
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

    try { window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: currentLang } })); } catch (_) {}
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

  window.i18n = { t, setLang, get currentLang() { return currentLang; } };

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
})();
