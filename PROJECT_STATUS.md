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
- ✅ Categorie-assets (44): `public/werktafel/kaarten/` (volledige kaarten, PNG) + `public/werktafel/fotos/` (losse foto's, JPG) + `public/werktafel/categories.json` (code/slug/titel/subtitel/kaart/foto). Rechtenvrije bron `Stabu werktafel afbeeldingen.png`. Klaar om te koppelen aan de Fase 3 categorie-/bouwdeel-kiezer. Nog niet in UI gewired.
- ⏳ Fase 3-6 + AI: nog te bouwen.

## L2 — Visuele afbeeldingenbibliotheek (Laag 1-4) — 2026-06-14
Gebouwd door CLI L2, additief naast L1's werktafel. **Raakt geen bestaande bestanden of tabellen aan.**
- **DB (pmovaz, prod, toegepast):** migratie `supabase/migrations/20260614_04_seed_sterkcalc_visual_library.sql`. 4 tabellen `sterkcalc_visual_{categories,subcategories,assets,asset_candidates}` (RLS gespiegeld). Geseed: **44 hoofdtegels + 660 subtegels (15/tegel) + 44 assets + 660 kandidaten** (525 queued / 135 icon_fallback voor admin-tegels).
- **STABU-mapping:** `stabu_mapping` jsonb is een **1-op-1 spiegel van L1's `lib/calc/werktafelCategorieMap.js` (CATEGORIE_STABU)** — dat blijft de authoritatieve bron. Wijzig je die map → draai `node scripts/build_sterkcalc_visual_library.js` + `node scripts/seed_sterkcalc_visual_db.js` opnieuw.
- **Storage:** bucket `sterkcalc-visual-assets` (public). 44 hoofdtegel-foto's geüpload (publieke URL bevestigd HTTP 200). Subtegels: nog geen beeld → tonen `icon_key` (Lucide) als fallback.
- **Data (single source of truth):** `scripts/build_sterkcalc_visual_library.js` genereert `data/sterkcalc_visual_*.json` (3 vereiste + 1 kandidaten) **én** de SQL-migratie. Seeder = `scripts/seed_sterkcalc_visual_db.js` (JSON→DB, idempotent, ws-shim voor node<22).
- **Beeld-acquisitie (gegated):** `scripts/acquire_sterkcalc_visual_assets.js` — vult subtegel-beelden via Pexels/Unsplash/Pixabay (key) of AI (OPENAI_API_KEY), cropt 16:9 (512/768/1024, vereist `sharp`). Zonder keys = veilige no-op. Geen mock, geen 2Jours-assets.
- **Koppeling voor L1 (CategorieKiezer):** subtegels zijn nu DB-beschikbaar. Laag 2 ophalen: `select * from sterkcalc_visual_subcategories where category_code = $code order by sort_order`. Hoofdtegel-thumbnail blijft `categories.json` (ongewijzigd) óf `sterkcalc_visual_assets.source_url` (storage-URL). **Rendering-regel:** `image_key` is altijd gevuld (= identifier, géén "heeft beeld"-vlag). Toon beeld alleen als er een asset bestaat met `review_status='approved'` AND `active=true`; anders `icon_key` (Lucide).
- **Beeld-pilot 02+20 (2026-06-14, v2 met vision-QA):** engine gehard — curated EN-queries (`scripts/data/visual_search_queries.js`), Pexels avg_color B&W-filter, **Claude-vision-QA** (claude-haiku-4-5) keurt branding/voertuigtekst/logo/watermerk/z-w/irrelevant af. Migratie `20260614_05` = `review_status` (pending_review|approved|rejected) op assets. Resultaat (v3, multi-provider Pexels+Pixabay + alt-queries + strengere merk-QA): **25/30 schone stock** (pending_review), **5 → needs_generation** (02/06, 20/10, 20/11, 20/12, 20/15 — natte-cel-detailshots, AI-stap). Niets live. Review-artefacten: `scripts/build_pilot_review.js` → `public/sterkcalc/visual-assets/_pilot_review.html`. **GEBLOKKEERD:** OpenAI-key insufficient_quota → `gpt-image-1` (AI-generatie) wacht op gefactureerde image-gen-key. Keys (Pexels/Pixabay/OpenAI/Anthropic) staan in `orlando-core-os/local-agent/.env`.

## Verificatie (2026-06-14)
- `npm run build` → exit 0; `/calculaties/[id]/werktafel` + `/combis` gecompileerd (.next/server/pages).
- DB advisors: nieuwe tabellen schoon (RLS aan + policies).
- L2-laag: DB-counts 44/660/44/660 bevestigd via MCP; bucket public-URL HTTP 200; 4 scripts `node --check` groen; acquire `--dry-run` gate-no-op correct.
