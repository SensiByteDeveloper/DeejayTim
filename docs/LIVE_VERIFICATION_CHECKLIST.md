# Live verificatie-checklist – deejaytim.nl

## 1. Asset loading (local vs production)

### Controleer in browser DevTools:
- [ ] **Network tab:** Geen 404 voor `styles.css`, `script.js`, `i18n/nl.json`, `i18n/en.json`
- [ ] **Console:** Geen CORS- of path errors
- [ ] **Cache:** Hard refresh (Cmd+Shift+R / Ctrl+Shift+R) en controleer of `?v=3` in de URL staat bij de geladen assets

### Verificatie:
- Open `https://deejaytim.nl/styles.css?v=3` – moet 200 OK geven
- Open `https://deejaytim.nl/script.js?v=3` – moet 200 OK geven
- Open `https://deejaytim.nl/i18n/nl.json` – moet 200 OK geven

### Cache-busting:
- Versie staat in `index.html`: `styles.css?v=3`, `script.js?v=3`, `i18n/i18n.js?v=3`
- Bij elke deploy: verhoog `?v=` naar een nieuw nummer (bijv. v=4)

---

## 2. Mobile Safari – layout & overlap

### Controleer op iPhone:
- [ ] **Player overlapt geen content** – er is ruimte onderaan de pagina (padding-bottom)
- [ ] **Safe area** – player respecteert notch/home indicator (geen afgesneden onderkant)
- [ ] **Mini-icoon** – bij ingeklapte player staat het rode icoon rechtsonder, binnen de safe area

### Test:
- Scroll naar beneden op de contactpagina
- De laatste content (telefoon, e-mail) moet niet overlappen met de player
- De player moet boven de home indicator staan

### Technische checks:
- `viewport-fit=cover` in meta viewport
- `body.intro-done:not(.no-music)` heeft `padding-bottom: calc(76px + env(safe-area-inset-bottom))`
- `#musicPlayer` heeft `bottom: env(safe-area-inset-bottom)`

---

## 3. Iconen – consistentie

### Controleer:
- [ ] Play/Pause – duidelijke rode cirkel met wit icoon (geen emoji)
- [ ] Next – rode cirkel met skip-icoon
- [ ] Mute – grijze cirkel met speaker-icoon (volume on/off)
- [ ] Collapse – min-teken voor minimaliseren
- [ ] Alle iconen zijn SVG, geen emoji (🔊🔇▶⏭♪)

### Vergelijk lokaal vs live:
- Desktop: iconen moeten identiek zijn
- Mobile: iconen moeten gecentreerd en scherp zijn

---

## 4. WCAG / toegankelijkheid

### Controleer:
- [ ] **aria-labels:** Play/Pause-knop heeft dynamische label (Afspelen/Pauzeren)
- [ ] **aria-labels:** Mute-knop heeft dynamische label (Muziek dempen/Muziek aanzetten)
- [ ] **Focus-visible:** Tab door de knoppen – rode outline zichtbaar
- [ ] **Geen autoplay:** Audio start pas na expliciete klik op "Verder" (met muziek)

### Test met toetsenbord:
- Tab naar alle player-knoppen
- Elke focus moet zichtbaar zijn (outline)

---

## 5. Snel overzicht wijzigingen

| Onderdeel | Wijziging |
|-----------|-----------|
| `index.html` | viewport-fit=cover, cache-busting ?v=3, SVG iconen i.p.v. emoji |
| `styles.css` | safe-area-inset, padding-bottom body, music-icon-btn stijlen |
| `script.js` | updatePlayState, updateMuteAria, playing class, aria-labels |
| `i18n/*.json` | pauseAria, unmuteAria toegevoegd |
