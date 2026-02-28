# Contactformulier & WhatsApp setup

## E-mailintegratie (Formspree)

1. Ga naar [formspree.io](https://formspree.io) en maak een gratis account.
2. Klik op **New Form** en geef een naam (bijv. "Deejay Tim contact").
3. Kopieer je Form ID (bijv. `xbcdrfgk` uit `https://formspree.io/f/xbcdrfgk`).
4. Open `index.html` en vervang `YOUR_FORM_ID` in het formulier:
   ```html
   action="https://formspree.io/f/JOUW_FORM_ID"
   ```
5. Bevestig je e-mailadres in Formspree – daar ontvang je de formulierinzendingen.

## WhatsApp-link

De WhatsApp-knop is al gekoppeld aan 06 21 888 970. Bij een klik opent WhatsApp (of de webversie) met een standaardbericht: *"Hoi Tim! Ik heb een vraag over een DJ-booking voor mijn feest."*  
Dit kan je aanpassen door de `text=...` parameter in de link te wijzigen (URL-gecodeerd).

## One.com

Bij One.com kun je de site als statische HTML hosten. Formspree werkt zonder backend; je hoeft alleen `YOUR_FORM_ID` te vervangen.
