/* Centrale schakelaars. Hands Up-code blijft in de site;
   zet handsUp op true om het blok, overlays en Hands Up-FAQ weer te tonen. */
export const SITE_FEATURES = {
  handsUp: false
};

export function handsUpEnabled() {
  return SITE_FEATURES.handsUp === true;
}

export function applySiteFeatures() {
  if (typeof document === 'undefined') return;
  if (handsUpEnabled()) {
    document.documentElement.dataset.handsUp = 'on';
  } else {
    delete document.documentElement.dataset.handsUp;
  }
}

export function mentionsHandsUp(value) {
  return /hands\s*up/i.test(String(value || ''));
}

applySiteFeatures();
