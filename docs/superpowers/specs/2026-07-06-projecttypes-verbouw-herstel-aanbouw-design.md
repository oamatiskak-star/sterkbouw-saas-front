# Design — Projecttypes Verbouw / Herstel / Aanbouw

**Datum:** 2026-07-06
**Doel:** De STABU-calculator (werktafel) kan alle door Orlando gevraagde bouwtypes calculeren:
Verbouw, Herstel, Nieuwbouw, Renovatie, Transformatie, Aanbouw.

## Gap-analyse

Bestaande projecttypes (`lib/calc/projecttypeTemplates.js`): `nieuwbouw`, `renovatie`,
`transformatie`, `uitbreiding` (aanbouw/opbouw), `verduurzaming`, `badkamer`, `woning`,
`appartementencomplex`.

Van de 6 gevraagde types waren **Nieuwbouw / Renovatie / Transformatie** al aanwezig en
**Aanbouw** zat verstopt onder `uitbreiding`. Ontbraken: **Verbouw**, **Herstel**, en een
expliciet **Aanbouw**-type.

## Beslissingen (Orlando, 2026-07-06)

- **Aanbouw** = eigen selecteerbaar type (naast het bestaande `uitbreiding`), met de bewezen
  uitbreiding-hoofdstukkenset.
- **Herstel** = strak: alleen casco-/schil-herstel.
- **Verbouw** = herindelen/wijzigen van bestaand vastgoed (sloop/strip + constructie/doorbraak
  + kozijnen + binnenwanden + volledige afbouw + installaties + keuken), géén nieuwbouw-fundering/casco.

## Nieuwe types (STABU-categoriecodes)

| Type | Template (geordende hoofdstukken) | Kritieke domeinen |
|---|---|---|
| `verbouw` | 00,02,07,14,15,16,17,18,19,20,21,22,23,25,26,27,28,K0,32 | 00,02,25,28 |
| `herstel` | 00,02,08,09,11,12,14,22,23 | 00 |
| `aanbouw` | 00,01,03,04,05,07,08,09,10,11,12,13,14,15,16,17,18,19,21,22,23,25,26,28,32 | 00,04,11,14,25,28 |

Labels: `verbouw: 'Verbouw'`, `herstel: 'Herstel'`, `aanbouw: 'Aanbouw'`.

## Wijzigingen

1. **`lib/calc/projecttypeTemplates.js`** — 3 sleutels toevoegen aan `PROJECTTYPE_LABELS`,
   `TEMPLATES` en `KRITIEKE_DOMEINEN`. Volgorde: hoofdtypes (nieuwbouw, verbouw, herstel,
   renovatie, transformatie, aanbouw) eerst, daarna de bestaande specialisaties.
2. **`pages/calculaties/nieuw.js`** — de hardcoded `TYPES`-array (regel 19) vervangen door
   afleiding uit `PROJECTTYPE_LABELS` (`Object.keys(PROJECTTYPE_LABELS)`), zodat de dropdown
   nooit meer uit sync raakt met de templates (één bron van waarheid).

## Waarom géén DB-migratie

- Subhoofdstukken worden bij instantiatie runtime uit de DB afgeleid (alleen
  combi-bevattende subcategorieën). Alle gebruikte categoriecodes bestaan al met
  combi-dekking.
- `lib/calc/projecttypeRekenmodellen.js` leidt aanbevolen rekenmodellen af via
  `templateVoor()` — werkt automatisch mee zodra de types in `TEMPLATES` staan.
- `project_type` kent geen DB check-constraint/enum → vrij tekstveld.

## Verificatie

- `npm run build` → exit 0.
- Voor elk nieuw type: nieuwe calculatie opent een **gevulde** werktafel met de juiste
  hoofdstukken en de volledigheidscheck waarschuwt op de juiste kritieke domeinen.

## Levering

Feature-branch `feat/projecttypes-verbouw-herstel-aanbouw` → PR. Merge naar prod
(app.sterkbouw.nl) pas na Orlando's "go" (geen auto-deploy). Implementatie door Fable 5.
