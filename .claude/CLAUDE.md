# sterkbouw-saas-front — projectregels

## Klantportaal (`/portaal/[token]`) — mobiel is de standaard
Elke offerte moet op mobiel net zo strak ogen als de door Orlando goedgekeurde versie (09-10-2026).

- Tabler (Bootstrap) wordt globaal geladen en zijn utilities (`.p-4`, `.mt-3`, `.w-8`, `.shadow-sm`, `.border` …)
  hebben `!important` met andere waarden dan Tailwind. Tailwind-preflight staat uit.
- Daarom: de portaal-wrapper heeft klasse `.portaal`; `styles/portaal.css` wordt **automatisch gegenereerd**
  door `scripts/gen-portaal-css.mjs` (draait bij `npm run dev` en `prebuild`). Niet handmatig bewerken;
  wel het resultaat meecommitten.
- Knop-reset voor iOS: `:where(.portaal) button` in `styles/globals.css`.
- Nieuwe portaalsecties: `items-start`, `break-words`, bedrag onder de titel op mobiel, marges
  `px-3 py-3 sm:px-8 sm:py-4` en kaarten `p-4 sm:p-8` (zie OffertePortalCalculatie/Werkomschrijving).
- Altijd testen op 390px breed vóór live zetten.

## Calculatie / btw
- `computeTotalen` ondersteunt btw per regel via `row.meta.btw` (bijv. 0 voor zonnepanelen bij woning,
  9 voor stukadoors-/schilderwerk). Eén tarief rekent identiek aan vroeger.
- Particuliere klanten: offerte → werkomschrijving (`content.werkomschrijving`) → volledige calculatie.
