/* ===== DEEJAY TIM - Unified site header ===== */
/* Renders consistent navigation across ALL pages */
/* Primary: Home, DJ huren, Prijzen, Diensten (dropdown) | Secondary: Werkgebied, Inspiratie (dropdown), Reviews, Blog, Contact */

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
    <!-- Primary: commercial pages -->
    <li><a href="/" class="nav-link" data-nav="home" data-i18n="nav.home">Home</a></li>
    <li><a href="/dj-huren.html" class="nav-link" data-nav="dj-huren" data-i18n="nav.djHuren">DJ huren</a></li>
    <li><a href="/prijzen.html" class="nav-link" data-nav="prijzen" data-i18n="nav.prijzen">Prijzen</a></li>
    <li class="nav-dropdown" data-nav="diensten">
      <a href="/diensten/" class="nav-link nav-dropdown-trigger" data-nav="diensten" data-i18n="nav.diensten" aria-haspopup="true" aria-expanded="false" id="nav-diensten-trigger">Diensten</a>
      <ul class="nav-dropdown-menu" aria-labelledby="nav-diensten-trigger" role="menu">
        <li role="none"><a href="/diensten/bruiloft-dj.html" role="menuitem" data-i18n="nav.bruiloftDj">Bruiloft DJ</a></li>
        <li role="none"><a href="/diensten/verjaardag-dj.html" role="menuitem" data-i18n="nav.verjaardagDj">Verjaardag DJ</a></li>
        <li role="none"><a href="/diensten/bedrijfsfeest-dj.html" role="menuitem" data-i18n="nav.bedrijfsfeestDj">Bedrijfsfeest DJ</a></li>
        <li role="none"><a href="/diensten/schoolfeest-dj.html" role="menuitem" data-i18n="nav.schoolfeestDj">Schoolfeest DJ</a></li>
        <li role="none"><a href="/diensten/buurtfeest-dj.html" role="menuitem" data-i18n="nav.buurtfeestDj">Buurtfeest DJ</a></li>
        <li role="none"><a href="/diensten/slagingsfeest-dj.html" role="menuitem" data-i18n="nav.slagingsfeestDj">Slagingsfeest DJ</a></li>
      </ul>
    </li>
    <li class="nav-divider" aria-hidden="true"></li>
    <!-- Secondary: informative pages -->
    <li><a href="/werkgebied.html" class="nav-link" data-nav="werkgebied" data-i18n="nav.werkgebied">Werkgebied</a></li>
    <li class="nav-dropdown" data-nav="inspiratie">
      <a href="/inspiratie/" class="nav-link nav-dropdown-trigger" data-nav="inspiratie" data-i18n="nav.inspiratie" aria-haspopup="true" aria-expanded="false" id="nav-inspiratie-trigger">Inspiratie</a>
      <ul class="nav-dropdown-menu" aria-labelledby="nav-inspiratie-trigger" role="menu">
        <li role="none"><a href="/feest-muziek-inspiratie.html" role="menuitem" data-i18n="nav.feestMuziekInspiratie">Feest muziek inspiratie</a></li>
        <li role="none"><a href="/feest-playlist-generator.html" role="menuitem" data-i18n="nav.playlistGenerator">Playlist generator</a></li>
        <li role="none"><a href="/fotos-feesten.html" role="menuitem" data-i18n="nav.fotosFeesten">Foto's feesten</a></li>
        <li role="none"><a href="/dj-set-up.html" role="menuitem" data-i18n="nav.djSetup">DJ set-up</a></li>
      </ul>
    </li>
    <li><a href="/reviews.html" class="nav-link" data-nav="reviews" data-i18n="nav.reviews">Reviews</a></li>
    <li><a href="/blog/index.html" class="nav-link" data-nav="blog" data-i18n="nav.blog">Blog</a></li>
    <li><a href="/contact.html" class="nav-link" data-nav="contact" data-i18n="nav.contact">Contact</a></li>
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
    const links = document.querySelectorAll('.nav-link[data-nav]');
    const dropdowns = document.querySelectorAll('.nav-dropdown[data-nav]');

    links.forEach((a) => {
      const nav = a.getAttribute('data-nav');
      a.classList.remove('nav-active');
      if (path === '/' || path === '/index.html') {
        if (nav === 'home') a.classList.add('nav-active');
      } else if (path === '/dj-huren.html' || path.endsWith('/dj-huren.html')) {
        if (nav === 'dj-huren') a.classList.add('nav-active');
      } else if (path === '/prijzen.html') {
        if (nav === 'prijzen') a.classList.add('nav-active');
      } else if (path.startsWith('/diensten/')) {
        if (nav === 'diensten') a.classList.add('nav-active');
      } else if (path === '/werkgebied.html') {
        if (nav === 'werkgebied') a.classList.add('nav-active');
      } else if (path === '/inspiratie/' || path.startsWith('/inspiratie/') || path === '/feest-muziek-inspiratie.html' || path === '/feest-playlist-generator.html' || path === '/fotos-feesten.html' || path === '/dj-set-up.html') {
        if (nav === 'inspiratie') a.classList.add('nav-active');
      } else if (path === '/reviews.html') {
        if (nav === 'reviews') a.classList.add('nav-active');
      } else if (path === '/blog/index.html' || path.startsWith('/blog/')) {
        if (nav === 'blog') a.classList.add('nav-active');
      } else if (path === '/contact.html') {
        if (nav === 'contact') a.classList.add('nav-active');
      }
    });

    dropdowns.forEach((dd) => {
      const trigger = dd.querySelector('.nav-dropdown-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', dd.querySelector('.nav-link.nav-active') ? 'true' : 'false');
    });
  }

  function initDropdowns() {
    document.querySelectorAll('.nav-dropdown').forEach((dd) => {
      const trigger = dd.querySelector('.nav-dropdown-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', (e) => {
        if (window.matchMedia('(max-width: 768px)').matches) {
          e.preventDefault();
          const expanded = trigger.getAttribute('aria-expanded') === 'true';
          trigger.setAttribute('aria-expanded', !expanded);
          dd.classList.toggle('dropdown-open', !expanded);
        }
      });
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (window.matchMedia('(max-width: 768px)').matches) {
            e.preventDefault();
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', !expanded);
            dd.classList.toggle('dropdown-open', !expanded);
          }
        }
      });
    });
  }

  function render() {
    const el = document.getElementById('site-header');
    if (el) {
      el.innerHTML = HEADER_HTML;
      setActiveState();
      initDropdowns();
      window.addEventListener('hashchange', setActiveState);
      document.dispatchEvent(new CustomEvent('headerloaded'));
      if (window.i18n?.setLang) {
        window.i18n.apply?.();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
