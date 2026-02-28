# Accessibility QA | Handmatig teststappenplan

## Doel
Handmatig controleren of de DJ Tim website voldoet aan WCAG 2.2 niveau AA.

---

## 1. Screenreader

### VoiceOver (macOS)
- **Start**: Cmd + F5
- **Navigeer**: Control + Option + pijltjestoetsen
- **Activeren**: Control + Option + spatie

| Stap | Actie | Verwachting |
|------|-------|-------------|
| 1.1 | Open homepage, laat VoiceOver alle landmarks voorlezen | Hoofdnavigatie, Main, secties herkend |
| 1.2 | Tab door navigatie | Elk link/button heeft duidelijke naam |
| 1.3 | Ga naar taal-toggle | "NL, button, pressed" / "EN, button" (of equivalent) |
| 1.4 | Activeer EN-knop | Pagina wordt Engels, "EN, button, pressed" |
| 1.5 | Ga naar contactformulier | Labels bij velden hoorbaar |
| 1.6 | Submit formulier (lege velden) | Foutmelding of required-indicatie hoorbaar |
| 1.7 | Vul formulier in en submit | "Bedankt! We nemen..." of Engelse equivalent hoorbaar |
| 1.8 | Tab naar video-float | "♪ Klik voor geluid" of Engelse versie |
| 1.9 | Open Hands Up! modal | Titel "Hands Up! in actie" / "in action" hoorbaar |
| 1.10 | Sluit modal met Escape | Focus terug op trigger of vorige focus |

### NVDA (Windows)
- Gratis download: [nvaccess.org](https://www.nvaccess.org/)
- Navigeer met pijltjestoetsen, Tab, Enter

### iOS VoiceOver
- Instellingen → Toegankelijkheid → Spraak
- Test vooral taal-toggle en formulier op mobiel

---

## 2. Alleen toetsenbord

| Stap | Actie | Verwachting |
|------|-------|-------------|
| 2.1 | Gebruik uitsluitend Tab, Shift+Tab, Enter, Spatie, Escape | Alle functies bereikbaar |
| 2.2 | Tab door de pagina | Focus is altijd zichtbaar (ring/outline) |
| 2.3 | Open hamburgermenu | Toggle krijgt focus, Escape sluit menu |
| 2.4 | Ga naar taal-toggle | Pijltjes of Tab om NL/EN te kiezen, Enter/Space activeert |
| 2.5 | Klik op video-float (Enter/Space) | Video modal opent met geluid |
| 2.6 | Sluit video modal | Escape sluit, focus zichtbaar |
| 2.7 | Hands Up! trigger (Enter/Space) | Modal opent |
| 2.8 | Focus in formulier | Tab door velden, geen focus “vast” |

---

## 3. Zichtbare focus

| Stap | Actie | Verwachting |
|------|-------|-------------|
| 3.1 | Tab door alle interactieve elementen | Ieder element heeft duidelijke focus-indicator |
| 3.2 | Controleer kleurcontrast van focus ring | Minimaal 3:1 tegen de achtergrond |
| 3.3 | Taal-toggle NL/EN | Focus op actieve knop duidelijk zichtbaar |

---

## 4. Zoom en reflow

| Stap | Actie | Verwachting |
|------|-------|-------------|
| 4.1 | Zoom 200% (Ctrl/Cmd + +) | Geen horizontaal scrollen, content blijft leesbaar |
| 4.2 | Zoom 400% | Layout past zich aan, tekst niet afgesneden |
| 4.3 | Mobiel viewport | Taal-toggle in hamburgermenu zichtbaar |

---

## 5. Reduced motion

| Stap | Actie | Verwachting |
|------|-------|-------------|
| 5.1 | macOS: Systeemvoorkeuren → Toegankelijkheid → Weergave → "Reduce motion" | Animaties geminimaliseerd, scroll gedrag aangepast |
| 5.2 | Windows: Instellingen → Toegankelijkheid → Visuele effecten → Animaties uit | Pagina reageert op `prefers-reduced-motion` |

---

## 6. Kleurcontrast

| Stap | Actie | Verwachting |
|------|-------|-------------|
| 6.1 | Gebruik contrast-checker (bijv. WebAIM) | Tekst min. 4.5:1 (normaal), 3:1 (groot) |
| 6.2 | Controleer .text-dim, .neon-* op donkere achtergrond | Voldoen aan eisen of worden aangepast |

---

## 7. Taal-attributen

| Stap | Actie | Verwachting |
|------|-------|-------------|
| 7.1 | Inspecteer `<html lang="...">` | `lang="nl"` of `lang="en"` correct na taalwissel |
| 7.2 | Wissel naar EN | `lang="en"` |

---

## Checklist kort

- [ ] Screenreader leest landmarks en knoppen correct
- [ ] Volledige bediening met toetsenbord mogelijk
- [ ] Focus altijd zichtbaar
- [ ] Formulier: labels, required, success state
- [ ] Taal-toggle: aria-labels, persistentie, html lang
- [ ] Zoom 200%+: geen horizontale scroll
- [ ] Reduced motion werkt
- [ ] Kleurcontrast voldoet aan WCAG AA
