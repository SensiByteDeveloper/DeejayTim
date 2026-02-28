// ===== DEEJAY TIM - Interactie & Muziek =====

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMusicPlayer();
  initSmoothScroll();
  initScrollEffects();
  initForm();
  initVideoPreviews();
  initVideoRandomPositions();
  initHandsUpModal();
  initWhatsAppWidget();
  window.addEventListener('resize', initVideoRandomPositions);
});

// WhatsApp Chat Widget – toggle popup
function initWhatsAppWidget() {
  const widget = document.getElementById('whatsappWidget');
  const trigger = widget?.querySelector('.whatsapp-float');
  const popup = document.getElementById('whatsappPopup');
  const closeBtn = widget?.querySelector('.whatsapp-popup-close');

  if (!widget || !trigger || !popup) return;

  const open = () => {
    widget.classList.add('open');
    popup.setAttribute('aria-hidden', 'false');
    trigger?.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    widget.classList.remove('open');
    popup.setAttribute('aria-hidden', 'true');
    trigger?.setAttribute('aria-expanded', 'false');
  };

  trigger.addEventListener('click', () => {
    if (widget.classList.contains('open')) close();
    else open();
  });
  closeBtn?.addEventListener('click', close);
  widget.querySelector('.whatsapp-popup-cta')?.addEventListener('click', close);
  document.addEventListener('click', (e) => {
    if (widget.classList.contains('open') && !widget.contains(e.target)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && widget.classList.contains('open')) close();
  });
}

// Navigation
function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const backdrop = document.getElementById('navBackdrop');

  const closeMenu = () => {
    links?.classList.remove('open');
    nav?.classList.remove('menu-open');
    toggle?.setAttribute('aria-expanded', 'false');
    backdrop?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    links?.classList.add('open');
    nav?.classList.add('menu-open');
    toggle?.setAttribute('aria-expanded', 'true');
    backdrop?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });

  toggle?.addEventListener('click', () => {
    const open = links?.classList.toggle('open');
    nav?.classList.toggle('menu-open', open);
    toggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
    backdrop?.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  backdrop?.addEventListener('click', closeMenu);

  links?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links?.classList.contains('open')) closeMenu();
  });
}

// Music Player – multi-track, shuffle
const MUSIC_TRACKS = [
  { src: "media/DJ Tim - Let's Go DJ Tim.mp3", title: "Let's Go DJ Tim" },
  { src: "media/DJ Tim - Bounce Control.mp3", title: "Bounce Control" },
  { src: "media/DJ Tim - Faz Assim.mp3", title: "Faz Assim" },
  { src: "media/DJ Tim - Waistline Spin.mp3", title: "Waistline Spin" }
];
const PLAYLIST_ORDER = [...MUSIC_TRACKS];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initMusicPlayer() {
  const player = document.getElementById('musicPlayer');
  const muteBtn = document.getElementById('musicMute');
  const playBtn = document.getElementById('musicPlay');
  const collapseBtn = document.getElementById('musicCollapse');
  const expandBtn = document.getElementById('musicExpand');
  const progressEl = document.getElementById('musicProgress');
  const progressFill = document.getElementById('musicProgressFill');
  const trackTrigger = document.getElementById('musicTrackTrigger');
  const introOverlay = document.getElementById('musicIntroOverlay');
  const pageContent = document.getElementById('page-content');
  const audio = document.getElementById('bgMusic');

  // Tijdens intro: verberg rest van pagina voor screenreaders (VoiceOver focust alleen op keuze)
  const setPageContentInert = (inert) => {
    if (!pageContent) return;
    if (inert) {
      pageContent.setAttribute('aria-hidden', 'true');
      pageContent.setAttribute('inert', '');
    } else {
      pageContent.removeAttribute('aria-hidden');
      pageContent.removeAttribute('inert');
    }
  };
  const MUSIC_PREF_KEY = 'deejaytim-music';
  const getStoredMusicPref = () => {
    try { return localStorage.getItem(MUSIC_PREF_KEY); } catch (_) { return null; }
  };
  const setStoredMusicPref = (v) => {
    try { if (v) localStorage.setItem(MUSIC_PREF_KEY, v); } catch (_) {}
  };

  const radioWith = document.getElementById('musicChoiceWith');
  const radioWithout = document.getElementById('musicChoiceWithout');
  const submitBtn = document.getElementById('musicIntroSubmit');

  // Pre-select op basis van opgeslagen keuze (default: zonder muziek)
  const savedPref = getStoredMusicPref();
  if (savedPref === 'with' && radioWith) {
    radioWith.checked = true;
    radioWithout.checked = false;
  } else {
    radioWithout.checked = true;
    radioWith.checked = false;
  }

  if (document.body.classList.contains('intro-pending')) {
    setPageContentInert(true);
    requestAnimationFrame(() => (radioWith?.checked ? radioWith : radioWithout)?.focus());
  }
  const trackDisplay = document.getElementById('musicTrackDisplay');
  const playlistEl = document.getElementById('musicPlaylist');
  const nextBtn = player?.querySelector('.music-next');

  if (!audio || !player) return;

  player.classList.add('muted'); // Geen geluid tot expliciete user action (Verder met "met muziek")

  let playbackOrder = shuffleArray(MUSIC_TRACKS);
  let currentIndex = 0;

  const getCurrentTrack = () => playbackOrder[currentIndex];

  const indexInPlaylist = (track) => PLAYLIST_ORDER.findIndex((t) => t.src === track.src);

  const updateUI = () => {
    const t = getCurrentTrack();
    if (trackDisplay) trackDisplay.textContent = t?.title ?? '';
    const activeIdx = indexInPlaylist(t);
    playlistEl?.querySelectorAll('[role="option"]').forEach((el, i) => {
      el.setAttribute('aria-selected', i === activeIdx);
      el.classList.toggle('active', i === activeIdx);
    });
  };

  const updateMediaSession = () => {
    if (!('mediaSession' in navigator)) return;
    const track = getCurrentTrack();
    const baseUrl = typeof location !== 'undefined' ? new URL('.', location.href).href : '';
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track?.title ?? 'Deejay Tim',
      artist: 'Deejay Tim',
      album: 'Deejay Tim',
      artwork: [
        { src: baseUrl + 'favicon-180.png', sizes: '180x180', type: 'image/png' },
        { src: baseUrl + 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }
      ]
    });
  };

  const setupMediaSessionHandlers = () => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', () => {
      if (!player?.classList.contains('muted')) audio?.play().catch(() => {});
    });
    navigator.mediaSession.setActionHandler('pause', () => audio?.pause());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
    navigator.mediaSession.setActionHandler('seekbackward', (d) => {
      audio.currentTime = Math.max(0, audio.currentTime - (d.seekOffset || 10));
    });
    navigator.mediaSession.setActionHandler('seekforward', (d) => {
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (d.seekOffset || 10));
    });
  };

  const loadAndPlay = (displayIndex) => {
    if (displayIndex < 0 || displayIndex >= PLAYLIST_ORDER.length) return;
    const t = PLAYLIST_ORDER[displayIndex];
    currentIndex = playbackOrder.findIndex((x) => x.src === t.src);
    if (currentIndex < 0) currentIndex = 0;
    audio.src = t.src;
    audio.load();
    if (!player.classList.contains('muted')) {
      audio.play().catch(() => {});
    }
    updateUI();
    updateMediaSession();
  };

  const playNext = () => {
    if (currentIndex + 1 >= playbackOrder.length) {
      playbackOrder = shuffleArray(MUSIC_TRACKS);
      loadAndPlay(indexInPlaylist(playbackOrder[0]));
    } else {
      const nextTrack = playbackOrder[currentIndex + 1];
      loadAndPlay(indexInPlaylist(nextTrack));
    }
  };

  const playPrev = () => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prev = currentIndex - 1;
    const prevTrack = playbackOrder[prev < 0 ? playbackOrder.length - 1 : prev];
    loadAndPlay(indexInPlaylist(prevTrack));
  };

  let introDone = false;
  const runIntroDone = () => {
    if (introDone) return;
    introDone = true;
    setPageContentInert(false);
    player?.classList.remove('draw-attention');
    document.body.classList.remove('intro-pending');
    document.body.classList.add('intro-done');
    introOverlay?.classList.add('faded');
    introOverlay?.setAttribute('aria-hidden', 'true');
    updateMusicToggleState();
    setTimeout(() => introOverlay?.remove(), 600);
  };

  const setCollapsed = (collapsed) => {
    player.classList.toggle('state-collapsed', collapsed);
    player.classList.toggle('state-expanded', !collapsed);
    collapseBtn?.setAttribute('aria-expanded', !collapsed);
    expandBtn?.setAttribute('aria-expanded', collapsed);
    expandBtn?.toggleAttribute('hidden', !collapsed);
  };

  loadAndPlay(indexInPlaylist(playbackOrder[0]));

  const startExperience = () => {
    player.classList.remove('muted');
    muteBtn?.setAttribute('aria-pressed', 'false');
    audio.play().then(() => { playBtn.textContent = '⏸'; }).catch(() => {});
    runIntroDone();
  };

  const startExperienceWithoutMusic = () => {
    document.body.classList.add('no-music');
    audio.pause();
    runIntroDone();
  };

  /* API voor "Achtergrondmuziek aan/uit" + nav-toggle */
  const musicToggle = document.getElementById('navMusicToggle');
  const musicToggleDesc = document.getElementById('navMusicToggleDesc');
  const t = (key) => (typeof window.i18n !== 'undefined' && window.i18n.t ? window.i18n.t(key) : key);

  const updateMusicToggleState = () => {
    if (!musicToggle || !musicToggleDesc) return;
    const on = !document.body.classList.contains('no-music');
    musicToggle.setAttribute('aria-pressed', String(on));
    musicToggle.setAttribute('aria-label', on ? t('music.toggleOffAria') : t('music.toggleOnAria'));
    musicToggle.setAttribute('title', on ? t('music.toggleOffTitle') : t('music.toggleOnTitle'));
    musicToggleDesc.textContent = on ? t('music.toggleOffTitle') : t('music.toggleOnTitle');
    const iconOn = musicToggle.querySelector('.nav-music-icon-on');
    const iconOff = musicToggle.querySelector('.nav-music-icon-off');
    if (iconOn) iconOn.hidden = !on;
    if (iconOff) iconOff.hidden = on;
  };

  window.deejayTimMusic = {
    getPreference: () => getStoredMusicPref(),
    setPreference: (withMusic) => {
      setStoredMusicPref(withMusic ? 'with' : 'without');
      if (withMusic) {
        document.body.classList.remove('no-music');
        player?.classList.remove('muted');
        muteBtn?.setAttribute('aria-pressed', 'false');
        audio?.play().catch(() => {});
        updateMuteAria();
        updatePlayState();
      } else {
        document.body.classList.add('no-music');
        audio?.pause();
      }
      updateMusicToggleState();
    }
  };

  musicToggle?.addEventListener('click', () => {
    const on = musicToggle.getAttribute('aria-pressed') === 'true';
    window.deejayTimMusic?.setPreference(!on);
  });
  window.addEventListener('langchange', () => {
    updateMusicToggleState();
    updatePlayState();
    updateMuteAria();
  });

  // Verder: start ervaring na expliciete klik (audio NOOIT automatisch)
  const onSubmit = () => {
    const withMusic = radioWith?.checked;
    setStoredMusicPref(withMusic ? 'with' : 'without');
    if (withMusic) startExperience();
    else startExperienceWithoutMusic();
  };
  submitBtn?.addEventListener('click', onSubmit);
  submitBtn?.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !submitBtn.disabled) {
      e.preventDefault();
      onSubmit();
    }
  });

  const updatePlayState = () => {
    const playing = !audio.paused;
    if (playBtn) {
      playBtn.classList.toggle('is-playing', playing);
      playBtn.setAttribute('aria-label', playing ? (t('music.pauseAria') || 'Pauzeren') : (t('music.playAria') || 'Afspelen'));
    }
  };
  const updateMuteAria = () => {
    if (muteBtn) muteBtn.setAttribute('aria-label', player?.classList.contains('muted') ? (t('music.unmuteAria') || 'Muziek aanzetten') : (t('music.muteAria') || 'Muziek dempen'));
  };

  audio.addEventListener('ended', playNext);
  audio.addEventListener('play', updatePlayState);
  audio.addEventListener('pause', updatePlayState);

  muteBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    player.classList.toggle('muted');
    muteBtn?.setAttribute('aria-pressed', player.classList.contains('muted'));
    updateMuteAria();
    if (player.classList.contains('muted')) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    updatePlayState();
  });

  collapseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setCollapsed(true);
  });
  expandBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setCollapsed(false);
  });

  trackTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = player.classList.toggle('playlist-open');
    trackTrigger?.setAttribute('aria-expanded', open);
    playlistEl?.setAttribute('aria-hidden', !open);
  });

  progressEl?.addEventListener('click', (e) => {
    if (!audio.duration || isNaN(audio.duration)) return;
    const rect = progressEl.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  playBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (player.classList.contains('muted')) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    updatePlayState();
  });

  nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); playNext(); });

  const updateProgress = () => {
    if (!progressFill || !audio.duration || isNaN(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
    progressEl?.setAttribute('aria-valuenow', Math.round(pct));
  };
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', updateProgress);

  // Playlist UI – Let's Go altijd bovenaan
  PLAYLIST_ORDER.forEach((t, i) => {
    const div = document.createElement('div');
    div.role = 'option';
    div.setAttribute('aria-selected', i === 0);
    div.className = 'music-playlist-item' + (i === 0 ? ' active' : '');
    div.textContent = t.title;
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      loadAndPlay(i);
      player.classList.remove('playlist-open');
      trackTrigger?.setAttribute('aria-expanded', 'false');
      playlistEl?.setAttribute('aria-hidden', 'true');
    });
    playlistEl?.appendChild(div);
  });

  setCollapsed(false);
  muteBtn?.setAttribute('aria-pressed', player.classList.contains('muted'));
  updatePlayState();
  updateMuteAria();
  updateUI();
  updateProgress();
  updateMediaSession();
  setupMediaSessionHandlers();

  player?.classList.add('draw-attention');
  const stopAttention = () => player?.classList.remove('draw-attention');
  setTimeout(stopAttention, 6200);
  collapseBtn?.addEventListener('click', stopAttention);
  document.addEventListener('scroll', stopAttention, { once: true });
}

// Smooth scroll
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Scroll-animaties
function initScrollEffects() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.pricing-card, .hands-up-content, .intro-text').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  observer.observe(document.querySelector('.intro-text') || document.body);
}

// Formvalidatie – e-mail en telefoon
function clearFormErrors(form) {
  form.querySelectorAll('.form-group').forEach((g) => {
    const input = g.querySelector('input, textarea');
    const err = g.querySelector('.form-error-msg');
    if (input) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
    if (err) err.remove();
    g.classList.remove('has-error');
  });
}
function showFieldError(inputEl, i18nKey) {
  const group = inputEl.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  const msg = window.i18n?.t?.(i18nKey) ?? i18nKey;
  let el = group.querySelector('.form-error-msg');
  if (!el) {
    el = document.createElement('span');
    el.className = 'form-error-msg';
    el.id = inputEl.id ? inputEl.id + '-error' : 'form-error-' + (Math.random().toString(36).slice(2));
    el.setAttribute('role', 'alert');
    el.textContent = msg;
    group.appendChild(el);
  } else {
    el.textContent = msg;
  }
  inputEl.setAttribute('aria-invalid', 'true');
  const descId = el.id;
  const existingDesc = inputEl.getAttribute('aria-describedby');
  inputEl.setAttribute('aria-describedby', existingDesc ? existingDesc + ' ' + descId : descId);
}
function isValidEmail(val) {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) && trimmed.length <= 254;
}
function isValidPhone(val) {
  if (!val || typeof val !== 'string') return false;
  const digits = val.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 15) return false;
  if (digits.length === 9) return digits.startsWith('0') || digits.startsWith('6');
  if (digits.length === 10) return digits.startsWith('06') || digits.startsWith('0');
  if (digits.length === 11) return digits.startsWith('31') || /^[1-9]\d{10}$/.test(digits);
  return /^[1-9]\d{8,14}$/.test(digits);
}

// Form submit – Formspree voor e-mail, of fallback
function initForm() {
  const form = document.getElementById('contactForm') || document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    const emailEl = form.querySelector('#email');
    const phoneEl = form.querySelector('#phone');
    const errors = [];
    if (emailEl && !isValidEmail(emailEl.value)) {
      errors.push({ el: emailEl, key: 'contact.form.errorEmail' });
    }
    if (phoneEl && !isValidPhone(phoneEl.value)) {
      errors.push({ el: phoneEl, key: 'contact.form.errorPhone' });
    }
    if (errors.length) {
      errors.forEach(({ el, key }) => showFieldError(el, key));
      errors[0].el.focus({ preventScroll: false });
      return;
    }
    const action = form.getAttribute('action');
    if (action && action.includes('formspree.io') && !action.includes('YOUR_FORM_ID')) {
      const submitBtn = form.querySelector('.form-submit');
      const originalText = submitBtn?.textContent;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '…'; }
      try {
        const fd = new FormData(form);
        const res = await fetch(action, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        const data = await res.json();
        if (data.ok) showFormSuccess(form);
        else throw new Error(data.error || 'Er ging iets mis');
      } catch (err) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        alert('Er ging iets mis. Probeer het later opnieuw of stuur een mail naar contact@deejaytim.nl');
      }
    } else {
      showFormSuccess(form);
    }
  });

  const emailInput = form.querySelector('#email');
  const phoneInput = form.querySelector('#phone');
  [emailInput, phoneInput].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', () => {
      const group = el.closest('.form-group');
      if (group?.classList.contains('has-error')) {
        const err = group.querySelector('.form-error-msg');
        if (err) err.remove();
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
        group.classList.remove('has-error');
      }
    });
  });

  // Floating label – JS-fallback voor textarea (Safari :placeholder-shown werkt niet goed)
  const syncFloatingLabel = (el) => {
    const group = el?.closest('.form-group');
    if (!group) return;
    const hasValue = el.value.trim().length > 0;
    const hasFocus = document.activeElement === el;
    group.classList.toggle('label-floated', hasValue || hasFocus);
  };
  form.querySelectorAll('input, textarea').forEach((el) => {
    el.addEventListener('focus', () => requestAnimationFrame(() => syncFloatingLabel(el)));
    el.addEventListener('focusin', () => syncFloatingLabel(el));
    el.addEventListener('blur', () => syncFloatingLabel(el));
    el.addEventListener('input', () => syncFloatingLabel(el));
    syncFloatingLabel(el);
  });
}

function showFormSuccess(form) {
  const msg = window.i18n?.t?.('contact.success') ?? 'Bedankt! We nemen zo snel mogelijk contact op.';
  const existing = form.querySelector('.form-success');
  if (existing) return;
  const el = document.createElement('p');
  el.className = 'form-success';
  el.style.cssText = 'color: var(--neon-cyan); margin-top: 1rem; font-weight: 600;';
  el.setAttribute('role', 'status');
  el.textContent = msg;
  form.appendChild(el);
  const submitBtn = form.querySelector('.form-submit');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = window.i18n?.t?.('contact.form.submit') || 'Verstuur';
  }
}

// Posities voor video's – max 20% overlap, alle 7 zichtbaar
function initVideoRandomPositions() {
  if (window.innerWidth < 1600) return;

  // Video ~533px hoog. Secties min 1000px → max ~12% overlap. Kleine marge (1rem) voor lucht.
  const positions = {
    hero: [
      { top: '25%', rotate: 10 }
    ],
    intro: [
      { top: '1rem', rotate: -8 },
      { bottom: '1rem', rotate: 12 }
    ],
    diensten: [
      { top: '1rem', rotate: -10 },
      { bottom: '1rem', rotate: 8 }
    ],
    'hands-up': [
      { top: '1rem', rotate: 6 },
      { bottom: '1rem', rotate: -12 }
    ]
  };

  document.querySelectorAll('.video-float').forEach((el) => {
    const zone = el.dataset.zone || 'right';
    let section, idx;
    if (el.closest('.hero')) { section = 'hero'; idx = 0; }
    else if (el.closest('#intro')) { section = 'intro'; idx = el.classList.contains('video-float-2') ? 0 : 1; }
    else if (el.closest('#diensten')) { section = 'diensten'; idx = el.classList.contains('video-float-3') ? 0 : 1; }
    else if (el.closest('#hands-up')) { section = 'hands-up'; idx = el.classList.contains('video-float-4') ? 0 : 1; }
    else return;

    const p = positions[section][idx];
    if (!p) return;

    el.style.left = zone === 'left' ? '1.5rem' : '';
    el.style.right = zone === 'right' ? '1.5rem' : '';
    el.style.top = p.top || '';
    el.style.bottom = p.bottom || '';
    el.style.transform = `rotate(${p.rotate}deg)`;
    el.style.setProperty('--video-rotate', `${p.rotate}deg`);
  });
}

// Hands Up! – klik op afbeelding toont app-screenshots
function initHandsUpModal() {
  const trigger = document.getElementById('handsUpPreview');
  const modal = document.getElementById('handsupModal');
  const zoomModal = document.getElementById('handsupZoom');
  const closeBtn = modal?.querySelector('.handsup-overlay-close');

  if (!trigger || !modal) return;

  const open = () => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    closeZoom?.(); /* zoom ook sluiten als overlay sluit */
  };

  trigger.addEventListener('click', open);
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
  closeBtn?.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) close();
  });

  // Zoom modal – carousel met swipen en pijlen (NL/EN varianten)
  const HANDSUP_SLIDES = {
    nl: [
      { src: 'media/handsup-party.png', altKey: 'handsUp.screenParty' },
      { src: 'media/handsup-verzoeknummers.png', altKey: 'handsUp.screenRequests' }
    ],
    en: [
      { src: 'media/handsup-partyEN.png', altKey: 'handsUp.screenParty' },
      { src: 'media/handsup-verzoeknummersEN.png', altKey: 'handsUp.screenRequests' }
    ]
  };
  const getSlides = () => HANDSUP_SLIDES[window.i18n?.currentLang === 'en' ? 'en' : 'nl'];
  const zoomImg = document.getElementById('handsupZoomImg');
  const zoomCloseBtn = zoomModal?.querySelector('.handsup-zoom-close');
  const zoomBackdrop = zoomModal?.querySelector('.handsup-zoom-backdrop');
  const prevBtn = zoomModal?.querySelector('.handsup-carousel-prev');
  const nextBtn = zoomModal?.querySelector('.handsup-carousel-next');
  const dotsEl = zoomModal?.querySelector('.handsup-carousel-dots');

  let handsupIndex = 0;

  const getSlideAlt = (s) => (window.i18n?.t?.(s.altKey) ?? s.altKey);

  const goToSlide = (idx) => {
    const slides = getSlides();
    if (idx < 0) idx = slides.length - 1;
    if (idx >= slides.length) idx = 0;
    handsupIndex = idx;
    const s = slides[idx];
    if (zoomImg) { zoomImg.src = s.src; zoomImg.alt = getSlideAlt(s); }
    dotsEl?.querySelectorAll('button').forEach((btn, i) => {
      btn.setAttribute('aria-selected', i === idx);
    });
  };

  const openZoom = (srcOrIndex, alt) => {
    if (!zoomModal || !zoomImg) return;
    const slides = getSlides();
    const idx = typeof srcOrIndex === 'number' ? srcOrIndex : slides.findIndex(s => s.src === srcOrIndex);
    handsupIndex = idx >= 0 ? idx : 0;
    goToSlide(handsupIndex);
    zoomModal.classList.add('open');
    document.body.classList.add('handsup-zoom-open');
  };
  const closeZoom = () => {
    zoomModal?.classList.remove('open');
    document.body.classList.remove('handsup-zoom-open');
  };

  getSlides().forEach((_, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.role = 'tab';
    btn.setAttribute('aria-label', `Scherm ${i + 1}`);
    btn.setAttribute('aria-selected', i === 0);
    btn.addEventListener('click', () => goToSlide(i));
    dotsEl?.appendChild(btn);
  });

  prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(handsupIndex - 1); });
  nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(handsupIndex + 1); });

  let touchStartX = 0;
  const content = zoomModal?.querySelector('.handsup-zoom-content');
  content?.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  content?.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goToSlide(dx < 0 ? handsupIndex + 1 : handsupIndex - 1);
  }, { passive: true });

  const updateHandsupImages = () => {
    const slides = getSlides();
    const phones = modal?.querySelectorAll('.handsup-phone.handsup-phone-clickable');
    phones?.forEach((phone, i) => {
      const s = slides[i];
      if (!s) return;
      const screenImg = phone.querySelector('.handsup-phone-screen img');
      if (screenImg) { screenImg.src = s.src; screenImg.alt = getSlideAlt(s); }
      phone.dataset.zoomSrc = s.src;
    });
    if (zoomModal?.classList.contains('open')) goToSlide(handsupIndex);
  };

  updateHandsupImages();
  window.addEventListener('langchange', updateHandsupImages);

  document.querySelectorAll('.handsup-phone-clickable').forEach((phone) => {
    phone.addEventListener('click', (e) => {
      e.stopPropagation();
      const src = phone.dataset.zoomSrc;
      const alt = phone.querySelector('.handsup-phone-screen img')?.alt || '';
      if (src) openZoom(src, alt);
    });
  });

  zoomCloseBtn?.addEventListener('click', closeZoom);
  zoomBackdrop?.addEventListener('click', closeZoom);
  zoomModal?.addEventListener('click', (e) => { if (e.target === zoomModal) closeZoom(); });
  document.addEventListener('keydown', (e) => {
    if (zoomModal?.classList.contains('open')) {
      if (e.key === 'Escape') closeZoom();
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goToSlide(handsupIndex - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goToSlide(handsupIndex + 1); }
      return;
    }
    if (e.key === 'Escape' && modal?.classList.contains('open')) close();
  });
}

// Video previews: muted afspelen, klik opent modal met geluid + site muziek uit
function initVideoPreviews() {
  const modal = document.getElementById('videoModal');
  const modalPlayer = document.getElementById('videoModalPlayer');
  const modalClose = modal?.querySelector('.video-modal-close');
  const modalBackdrop = modal?.querySelector('.video-modal-backdrop');
  const bgMusic = document.getElementById('bgMusic');
  const musicPlayer = document.getElementById('musicPlayer');

  if (!modal || !modalPlayer) return;

  // Start muted video previews
  document.querySelectorAll('.video-float video').forEach(video => {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.play().catch(() => {});
  });

  const openVideo = (src) => {
    modalPlayer.src = src;
    modalPlayer.muted = false;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (bgMusic && !musicPlayer?.classList.contains('muted')) {
      bgMusic.pause();
    }
    modalPlayer.play().catch(() => {});
  };

  const closeVideo = () => {
    modal.classList.remove('open');
    modalPlayer.pause();
    modalPlayer.src = '';
    document.body.style.overflow = '';

    if (bgMusic && !musicPlayer?.classList.contains('muted')) {
      bgMusic.play().catch(() => {});
    }
  };

  document.querySelectorAll('.video-float[data-video]').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.getAttribute('data-video');
      if (src) openVideo(src);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const src = el.getAttribute('data-video');
        if (src) openVideo(src);
      }
    });
  });

  modalClose?.addEventListener('click', closeVideo);
  modalBackdrop?.addEventListener('click', closeVideo);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeVideo();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) closeVideo();
  });
}

// Visible class voor scroll-animaties
const style = document.createElement('style');
style.textContent = `
  .pricing-card.visible,
  .hands-up-content.visible,
  .intro-text.visible {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);
