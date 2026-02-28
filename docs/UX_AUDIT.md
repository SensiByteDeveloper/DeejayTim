# UX-Audit | DJ Tim Website

## A. Top-10 UX Verbeterpunten

| # | Bevinding | Impact |
|---|-----------|--------|
| 1 | **CTA-inconsistentie**: "Boek nu" vs "Boek All-in" vs "Boek Just DJ" – onduidelijk wat het verschil is voor de gebruiker | Medium |
| 2 | **Music overlay**: Geen "later"-optie; gebruiker moet klikken om verder te gaan. Kan frustrerend zijn bij herhaald bezoek | Medium |
| 3 | **Formulier feedback**: Na submit alleen `alert()`, geen success state of bevestiging in de UI | Hoog |
| 4 | **Empty/loading states**: Geen loading state bij form submit; video's laden stil zonder indicatie | Laag |
| 5 | **Navigatie labels**: "Intro"/"Diensten" zijn wat abstract; "Over mij"/"Prijzen" zijn duidelijker | Laag |
| 6 | **Mobiele navigatie**: Hamburger sluit bij klik op link maar er is geen visuele "sluiten"-feedback | Laag |
| 7 | **Content-hiërarchie**: Hands Up! sectie heeft veel tekst; mogelijk beter op te splitsen | Laag |
| 8 | **Microcopy**: "Let's talk!" is Engels terwijl rest NL; inconsistent voor monolinguale bezoeker | Medium |
| 9 | **Pricing cards**: Geen duidelijke "beste keuze" visuele differentiatie (badge is klein) | Laag |
| 10 | **Externe link (Instagram)**: Geen indicatie dat deze buiten de site gaat; `target="_blank"` zonder waarschuwing | Laag |

---image.png

## B. Quick Wins (1–2 uur)

- Taal-toggle NL/EN toevoegen (ook i18n-basis)
- Formulier: success/error states i.p.v. `alert()`
- Externe links: `aria-label` "Instagram (opent in nieuw tabblad)"
- Focus states expliciet stylen (outline/ring) voor toetsenbordgebruikers
- `prefers-reduced-motion` respecteren voor animaties

---

## C. Medium (1 dag)

- Music overlay: optie "Niet nu" of onthouden via localStorage
- Navigatielabels verduidelijken (Intro → Over mij, Diensten → Prijzen)
- Alle content vertalen voor EN-versie
- Form validatie met inline foutmeldingen
- Loading state bij form submit

---

## D. Larger (2–5 dagen)

- Volledige i18n met URL-strategie (`/nl` / `/en` of query param)
- A/B-tests voor CTA-teksten
- Performance: lazy load video's, optimalisatie afbeeldingen
- Uitgebreide error/empty states (bijv. bij geen video’s)
- Analytics + conversie-tracking

---

## E. Mobiel, leesbaarheid, consistentie

| Aspect | Status | Actie |
|--------|--------|-------|
| Mobiele UX | OK | Video's relatief geplaatst; nav werkt; taal-toggle compact in menu |
| Leesbaarheid | OK | Goede contrasten; font sizes redelijk |
| Consistentie | Verbeterbaar | CTA-styling consistent; taal-toggle past bij bestaande tokens |
| Empty states | Afwezig | Form submit heeft geen duidelijke success state |
| Loading states | Afwezig | Video's laden zonder indicator |
| Error states | Afwezig | Form errors alleen via browser defaults |
