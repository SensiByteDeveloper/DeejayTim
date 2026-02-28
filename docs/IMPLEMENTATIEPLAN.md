# Implementatieplan | DJ Tim Website

## Overzicht wijzigingen

### Aangepaste bestanden

| Bestand | Wijzigingen |
|---------|-------------|
| `index.html` | `<main>` landmark, taal-toggle in nav, data-i18n op alle vertaalbare elementen, aria-attributen, video keyboard + role |
| `styles.css` | Taal-toggle styling, `:focus-visible` op interactieve elementen, `prefers-reduced-motion`, nav-toggle target size |
| `script.js` | Nav aria-expanded, form success state met i18n, video keydown handler |
| `i18n/nl.json` | Woordenboek Nederlands |
| `i18n/en.json` | Woordenboek Engels |
| `i18n/i18n.js` | Lightweight i18n laag met localStorage persistence |

### Nieuwe bestanden

| Bestand | Doel |
|---------|------|
| `docs/UX_AUDIT.md` | UX-audit en prioriteiten |
| `docs/ACCESSIBILITY_AUDIT.md` | WCAG 2.2 AA checklist |
| `docs/IMPLEMENTATIEPLAN.md` | Dit bestand |
| `docs/ACCESSIBILITY_QA.md` | Handmatig teststappenplan |

---

## Concreet uitgevoerde codewijzigingen

### 1. Semantiek & landmarks
- `<main id="main-content">` rond hero, intro, diensten, hands-up, contact
- Nav: `aria-label="Hoofdnavigatie"`, toggle: `aria-expanded`, `aria-controls="nav-menu"`

### 2. Taal-toggle (D)
- Compacte segmented control (NL | EN) in nav, rechts (desktop), in hamburger (mobiel)
- `aria-pressed`, `aria-current`, `aria-label` op groep
- `localStorage` key `deejaytim-lang`
- `document.documentElement.lang` wordt geüpdatet bij wissel

### 3. i18n (E)
- Dictionary-based: `i18n/nl.json`, `i18n/en.json`
- `data-i18n`, `data-i18n-aria`, `data-i18n-list` op elementen
- Fallback-objecten in `i18n.js` voor file:// of netwerkfout
- URL-strategie: geen wijziging (SPA, keuze via localStorage; toekomstige uitbreiding naar `/nl`/`/en` mogelijk)

### 4. Focus & keyboard
- `:focus-visible` op links, buttons, form inputs, video floats, pricing-btn
- Video floats: `tabindex="0"`, `role="button"`, Enter/Space
- Hamburger: `min-width/height: 44px` voor WCAG 2.5.8

### 5. Reduced motion
- `@media (prefers-reduced-motion: reduce)`: `scroll-behavior: auto`, `animation-duration` en `transition-duration` naar 0.01ms

### 6. Formulier
- Success state als `<p class="form-success" role="status">` in plaats van `alert()`
- Vertaalde success message via `i18n.t('contact.success')`
- `aria-required="true"` op vereiste velden

---

## Linting / accessibility tests

### Vanilla HTML

- **ESLint + eslint-plugin-jsx-a11y**: niet direct van toepassing (geen JSX)
- **Alternatief**: [ axe-core ](https://github.com/dequelabs/axe-core) of [ Pa11y ](https://github.com/pa11y/pa11y) voor HTML

### Voorgestelde setup (Playwright + axe)

```bash
npm init -y
npm install -D @playwright/test @axe-core/playwright
```

```js
// tests/a11y.spec.js
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test('homepage has no critical a11y violations', async ({ page }) => {
  await page.goto('http://localhost:8080'); // of je dev server
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### Uitvoeren

```bash
npx playwright install chromium
npx playwright test tests/a11y.spec.js
```

---

## Toekomstige verbeteringen

1. Form validatie: `aria-invalid`, `aria-describedby` bij fouten
2. Focus trap in modals bij toetsenbordnavigatie
3. URL-strategie `/nl` / `/en` als SEO en deelbaarheid belangrijk worden
