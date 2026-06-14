# PROJECT_STATUS — SterkCalc (sterkbouw-saas-front)

Next.js 14 (Pages Router) + Supabase. Live SterkCalc-frontend (Vercel `sterkbouw-saas-front`).
Supabase-DB: **pmovazftwoxjopqkuuhp** (sterkbouww). NEXT_PUBLIC_SUPABASE_URL wijst hierheen.

## 🔴 HERSTEL HIER NA CRASH
- Branch: `feat/calculatie-werktafel`.
- Fase 1 (Calculatie Werktafel) + Fase 2 (combi-bibliotheek + invoegen) **gebouwd, build groen (next build exit 0)**.
- DB-migraties al toegepast op pmovaz-prod: `werktafel_datamodel` (12 tabellen + 2 enums + RLS), `werktafel_opslagen` jsonb-kolom op calculaties, STABU-seed (116 posten), combi-seed (6 cat / 8 combi / 21 comp). Bestanden: `supabase/migrations/20260614_0{1,2,3}_*.sql`.
- Volgende: PR mergen na Orlando's review; daarna Fase 3 (bouwdelen) → 4 (generator+relatie-engine) → 5 (planning) → 6 (bestellen/offerte/rapportages) → AI-laag.

## Architectuur (hard, van Orlando)
- `werktafel_*`-tabellen = PRIMAIRE calculatiebron. Legacy `calculatie_regels` + `v_calculatie_2jours` blijven leesbaar/legacy, niet de bron.
- Totalen ALTIJD uit componenten (`lib/calc/werktafelTotals.js`). Combi's ALTIJD openklapbaar naar arbeid/materiaal/materieel.
- AK/ABK/risico/winst: user-controlled (`werktafel_opslagen`), NOOIT door AI/optimalisatie (`lib/calc/fixedPriceRules.js` AI_LOCKED_OPSLAG_FIELDS).
- Geen mockdata in productieflow; bestaande wizard (`pages/calculaties/index.js`) niet geslopen; geen App Router.

## Modules
- ✅ Fase 1 Werktafel: `pages/calculaties/[id]/werktafel.js` + `components/calculatie/werktafel/{Werktafel,HoofdstukBoom,RegelTabel,EigenschappenPaneel,LiveTotalen}.jsx` + `hooks/useWerktafel.js` + `services/werktafel.js`. Hoofdstukken-boom, regels (toevoegen/verwijderen/dupliceren/verplaatsen), STABU-prefill, combi-openklap, live totalen, opslaan/laden, versiehistorie.
- ✅ Fase 2 Combi: `pages/calculaties/[id]/combis.js` + `components/calculatie/combis/CombiBibliotheek.jsx` + `services/combis.js`. Categorieën, kaarten, detail (componenten), "Invoegen" → combi-regel met componenten.
- ✅ Niet-brekend: "Open Werktafel" + "Combi-bibliotheek" knoppen op `pages/calculaties/[id].js`.
- ⏳ Fase 3-6 + AI: nog te bouwen.

## Verificatie (2026-06-14)
- `npm run build` → exit 0; `/calculaties/[id]/werktafel` + `/combis` gecompileerd (.next/server/pages).
- DB advisors: nieuwe tabellen schoon (RLS aan + policies).
