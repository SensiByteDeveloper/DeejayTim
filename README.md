# Deejay Tim Website

Een moderne, dark neon themed website voor Deejay Tim met visuele interactie, achtergrondmuziek en een zwevende music player.

## Wat je moet doen

### 1. Media toevoegen
Plaats je eigen bestanden in de map `media/`:

- **Foto's:** `photo1.jpg`, `photo2.jpg`, `photo3.jpg`, `photo4.jpg` (of andere namen – pas dan de HTML aan)
- **Video's:** `video1.mp4`, `video2.mp4` (download van Instagram of exporteer vanuit je bronnen)
- **Achtergrondmuziek:** `Let's Go DJ Tim.wav`

### 2. Formulier koppelen
Het contactformulier is nu een placeholder. Koppel het aan een service zoals:
- [Formspree](https://formspree.io/)
- [Netlify Forms](https://docs.netlify.com/forms/setup/)
- Of je eigen backend

Pas in `script.js` de `initForm()` functie aan om het formulier naar jouw endpoint te versturen.

### 3. Website hosten
- Upload naar Netlify, Vercel of je eigen hosting
- Of gebruik GitHub Pages voor gratis hosting

## Features

- **Dark neon design** – Donkere achtergrond met cyan, pink en magenta accenten
- **Zwevende music player** – Onderaan het scherm, klik op het handvat om in/uit te klappen
- **Eenvoudige mute** – Klik op 🔇 om de muziek aan/uit te zetten
- **Hands Up!** – Sectie over de interactieve DJ app
- **Responsive** – Werkt op mobiel en desktop

## Development

Open `index.html` direct in je browser of gebruik een lokale server:

```bash
# Met Python
python -m http.server 8000

# Of met npx
npx serve .
```
