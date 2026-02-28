# Accessibility Audit | WCAG 2.2 AA | DJ Tim Website

## Checklist per component

### 1. Semantische HTML & Landmarks

| Onderdeel | Status | Fix |
|-----------|--------|-----|
| Landmarks | ⚠️ | Geen `<main>`, geen `<footer>`; nav is OK |
| header.hero | ⚠️ | `<header>` gebruikt voor hero – OK, maar geen `<main>` wrapper |
| Secties | ✅ | `<section id="...">` aanwezig |
| Navigatie | ✅ | `<nav>` met semantische links |

**Actie:** `<main>` toevoegen rond alle secties; optioneel `<footer>` voor contact-info onderaan.

---

### 2. Headings-structuur

| Locatie | Status | Fix |
|---------|--------|-----|
| h1 | ✅ | "DEEJAY TIM" – uniek |
| h2 | ✅ | Section titles (De ervaring, Diensten, etc.) |
| Skipping | ⚠️ | Controleer of er geen niveau wordt overgeslagen |

**Actie:** Geen skip van h1→h3; structuur is logisch.

---

### 3. Kleurcontrast

| Element | Verhouding | WCAG AA (4.5:1 tekst) |
|---------|------------|------------------------|
| .text-bright op bg-dark | ~15:1 | ✅ |
| .text-dim op bg-dark | ~5:1 | ✅ |
| .neon-cyan op bg-dark | ~4.8:1 | ✅ (groot tekst) |
| .neon-pink op bg-dark | ~4.2:1 | ⚠️ Randgeval |
| .pricing-note (italic dim) | ~4:1 | ⚠️ Verifiëren |

**Actie:** text-dim iets verhogen indien < 4.5:1; neon kleuren vooral voor grote/CTA teksten.

---

### 4. Focus management & zichtbare focus

| Element | Status | Fix |
|---------|--------|-----|
| Links | ⚠️ | Default outline vaak uitgezet; geen custom ring |
| Buttons | ⚠️ | Geen expliciete :focus-visible stijl |
| Form inputs | ❌ | `outline: none` zonder alternatief |
| Video floats | ⚠️ | Geen toetsenbord-focus (div, geen button) |
| Modals | ✅ | Escape sluit; focus trapping ontbreekt |

**Actie:** Custom focus ring (2px solid var(--neon-cyan)) voor alle interactieve elementen; `:focus-visible` gebruiken.

---

### 5. Toetsenbordbediening

| Component | Status | Fix |
|-----------|--------|-----|
| Nav links | ✅ | Tab-navigeerbaar |
| Hamburger | ✅ | Button, tabbaar |
| Hands Up trigger | ✅ | role="button", tabindex="0", Enter/Space |
| Video floats | ⚠️ | Geen tabindex/keyboard (div) |
| Modals | ✅ | Escape sluit |
| Taal-toggle | 🆕 | Toetsenbord + aria |

**Actie:** Video floats `tabindex="0"` + keydown (Enter/Space); focus trap in modals (optioneel, nice-to-have).

---

### 6. Form labels, helptekst, errors

| Veld | Status | Fix |
|------|--------|-----|
| Labels | ✅ | `<label for="...">` gekoppeld |
| aria-describedby | ❌ | Niet gebruikt voor helptekst |
| aria-invalid | ❌ | Niet bij validatiefouten |
| Error messages | ❌ | Alleen browser-default; geen custom errors |

**Actie:** Bij client-side validatie: `aria-invalid="true"` en `aria-describedby` voor fouttekst.

---

### 7. Alternatieve teksten

| Element | Status | Fix |
|---------|--------|-----|
| hero-photo | ✅ | alt="Deejay Tim" |
| Hands Up img | ✅ | alt aanwezig |
| iPhone frame | ✅ | alt="" (decoratief) |
| Emoji knoppen (🔇🔊) | ⚠️ | aria-label aanwezig op button |
| Video hint | ✅ | Tekst "Klik voor geluid" |

**Actie:** Video elements: `aria-label` of titel voor context.

---

### 8. Responsieve tekst & zoom

| Criterium | Status |
|-----------|--------|
| Zoom 200% | ✅ | Geen fixed px voor kritieke content; rem/em |
| Reflow | ✅ | Geen horizontale scroll bij zoom |

**Actie:** Geen extra actie; layout is flexibel.

---

### 9. Reduced motion

| Element | Status | Fix |
|---------|--------|-----|
| scroll-behavior | ⚠️ | `scroll-behavior: smooth` altijd aan |
| Animaties | ⚠️ | Geen `prefers-reduced-motion` check |
| Video float transitions | ⚠️ | Geen respect voor voorkeur |

**Actie:** `@media (prefers-reduced-motion: reduce)` met `animation: none`, `transition: none` waar passend.

---

### 10. Target size (WCAG 2.2: 2.5.8)

| Element | Min 24×24 px | Status |
|---------|--------------|--------|
| Nav links | ~44px height | ✅ |
| pricing-btn | Groot | ✅ |
| Music controls | 38×38px | ✅ |
| Hamburger | ~35px | ⚠️ Iets klein |
| .handsup-phone-clickable | Groot | ✅ |
| Modal close | 48×48px | ✅ |

**Actie:** Hamburger touch target vergroten (padding); taal-toggle knoppen min 44×44px.

---

### 11. Consistente navigatie (3.2.x)

| Criterium | Status |
|-----------|--------|
| Nav blijft opzelfde plek | ✅ |
| Links doen wat verwacht | ✅ |
| Geen onverwachte contextwijziging | ✅ |

---

### 12. Taal-attributen

| Element | Status | Fix |
|---------|--------|-----|
| `<html lang="nl">` | ✅ | Aanwezig |
| Bij EN toggle | 🆕 | `document.documentElement.lang = 'en'` bij switch |

---

## Samenvatting prioriteiten

1. **Kritiek:** Focus indicators (form inputs, links, buttons)
2. **Kritiek:** `<main>` landmark
3. **Hoog:** prefers-reduced-motion
4. **Hoog:** Form aria-invalid + error messaging
5. **Medium:** Video floats keyboard accessible
6. **Medium:** Target size hamburger
7. **Laag:** Kleurcontrast verfijnen
