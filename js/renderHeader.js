/* ===== DEEJAY TIM - Unified site header ===== */
/* Renders consistent navigation across ALL pages */

(function () {
  const HEADER_HTML = `
<div class="bg-grid"></div>
<div class="bg-glow"></div>
<nav class="nav" aria-label="Hoofdnavigatie" data-i18n-aria="nav.ariaLabel">
  <a href="/" class="nav-logo">
    <img src="/favicon.svg" alt="" class="nav-logo-icon" width="32" height="32">
    <span>DEEJAY TIM</span>
  </a>
  <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav-menu">
    <span></span><span></span><span></span>
  </button>
  <div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>
  <ul class="nav-links" id="nav-menu">
    <li><a href="/#intro" class="nav-link" data-nav="intro" data-i18n="nav.intro">Intro</a></li>
    <li><a href="/#diensten" class="nav-link" data-nav="diensten" data-i18n="nav.diensten">Diensten</a></li>
    <li><a href="/#hands-up" class="nav-link" data-nav="hands-up" data-i18n="nav.handsUp">Hands Up!</a></li>
    <li><a href="/#contact" class="nav-link" data-nav="contact" data-i18n="nav.contact">Contact</a></li>
    <li class="nav-divider" aria-hidden="true"></li>
    <li><a href="/dj-huren.html" class="nav-link" data-nav="dj-huren">DJ huren</a></li>
    <li><a href="/prijzen.html" class="nav-link" data-nav="prijzen">Prijzen</a></li>
    <li><a href="/blog/index.html" class="nav-link" data-nav="blog">Blog</a></li>
    <li><a href="/feest-muziek-inspiratie.html" class="nav-link" data-nav="muziek">Muziek inspiratie</a></li>
    <li class="nav-music-wrap">
      <button type="button" class="nav-music-toggle" id="navMusicToggle" aria-pressed="false" aria-label="Muziek aan" aria-describedby="navMusicToggleDesc" title="Muziek inschakelen">
        <span class="nav-music-icon nav-music-icon-off" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
        </span>
        <span class="nav-music-icon nav-music-icon-on" aria-hidden="true" hidden>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        </span>
        <span id="navMusicToggleDesc" class="sr-only">Muziek inschakelen</span>
      </button>
    </li>
    <li class="nav-lang-wrap">
      <div class="lang-toggle" role="group" aria-label="Taal wijzigen" data-i18n-aria="lang.toggleAria">
        <button type="button" class="lang-btn" aria-pressed="true" aria-current="true" data-lang="nl" title="Nederlands">NL</button>
        <button type="button" class="lang-btn" aria-pressed="false" data-lang="en" title="English">EN</button>
      </div>
    </li>
  </ul>
</nav>
`;

  function setActiveState() {
    const path = (typeof location !== 'undefined' && location.pathname) ? location.pathname : '';
    const hash = (typeof location !== 'undefined' && location.hash) ? location.hash.slice(1) : '';
    const links = document.querySelectorAll('.nav-link[data-nav]');
    links.forEach((a) => {
      const nav = a.getAttribute('data-nav');
      a.classList.remove('nav-active');
      if (hash && (hash === 'intro' || hash === 'diensten' || hash === 'hands-up' || hash === 'contact')) {
        if (nav === hash) a.classList.add('nav-active');
      } else if (path === '/dj-huren.html' || path.endsWith('/dj-huren.html')) {
        if (nav === 'dj-huren') a.classList.add('nav-active');
      } else if (path === '/prijzen.html') {
        if (nav === 'prijzen') a.classList.add('nav-active');
      } else if (path === '/blog/index.html' || path.startsWith('/blog/')) {
        if (nav === 'blog') a.classList.add('nav-active');
      } else if (path === '/feest-muziek-inspiratie.html' || path === '/feest-playlist-generator.html') {
        if (nav === 'muziek') a.classList.add('nav-active');
      }
    });
  }

  function render() {
    const el = document.getElementById('site-header');
    if (el) {
      el.innerHTML = HEADER_HTML;
      setActiveState();
      window.addEventListener('hashchange', setActiveState);
      document.dispatchEvent(new CustomEvent('headerloaded'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
