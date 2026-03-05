/* ===== DEEJAY TIM - Custom event tracking (no cookies) ===== */
/* Sends events to Cloudflare Worker → Analytics Engine */

const TRACK_ENDPOINT = 'https://events.deejaytim.nl/event';

function track(name, data = {}) {
  if (typeof name !== 'string' || !name || name.length > 64) return;
  const payload = {
    name,
    path: typeof location !== 'undefined' ? location.pathname || '/' : '/',
    ts: Date.now(),
    ...data
  };
  const body = JSON.stringify(payload);
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(TRACK_ENDPOINT, new Blob([body], { type: 'application/json' }));
  } else {
    fetch(TRACK_ENDPOINT, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    }).catch(() => {});
  }
}

function initClickTracking() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a?.href) return;
    const href = a.href;
    if (href.startsWith('tel:')) {
      track('click_call');
      return;
    }
    if (href.startsWith('mailto:')) {
      track('click_email');
      return;
    }
    if (href.includes('wa.me') || href.includes('whatsapp')) {
      track('click_whatsapp');
      return;
    }
    const text = (a.textContent || '').trim();
    if (/Boek nu/i.test(text) || a.classList.contains('hero-cta') || a.classList.contains('cta-button')) {
      track('click_book_now');
    }
  }, true);
}

function initPageTypeTracking() {
  const path = typeof location !== 'undefined' ? location.pathname : '';
  if (/\/locaties\/dj-/.test(path)) {
    track('location_open');
  } else if (/\/diensten\//.test(path) && !path.endsWith('/diensten/') && !path.endsWith('/diensten/index.html')) {
    track('service_open');
  } else if (/\/blog\/post\.html/.test(path)) {
    track('blog_open');
  }
}

function init() {
  initClickTracking();
  initPageTypeTracking();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

// Expose for non-module scripts (e.g. script.js, inline scripts)
if (typeof window !== 'undefined') window.track = track;

export { track, initClickTracking, initPageTypeTracking };
