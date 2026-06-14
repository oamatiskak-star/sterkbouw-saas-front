# SterkCalc — visuele afbeeldingenbibliotheek (assets)

Doel van deze map: lokale opslag/cache van subtegel-beelden voordat ze naar de
Supabase Storage bucket `sterkcalc-visual-assets` gaan. De **44 hoofdtegels**
gebruiken de bestaande rechtenvrije foto's in `public/werktafel/fotos/` — die
worden niet hierheen gekopieerd.

## Bestandsnaam-conventie
- Hoofdtegel:  `cat_[code]_[slug].webp`            → bv. `cat_02_sloopwerk.webp`
- Subtegel:    `sub_[cat]_[sub]_[slug].webp`        → bv. `sub_02_03_binnenwanden_slopen.webp`
- Combi:       `combi_[cat]_[slug].webp`            → bv. `combi_09_spouwmuur_compleet.webp`

## Varianten (16:9)
Elke subtegel-asset wordt door `scripts/acquire_sterkcalc_visual_assets.js`
gecropt naar drie maten: `512x288`, `768x432`, `1024x576` (webp).

## Pijplijn
1. `node scripts/build_sterkcalc_visual_library.js` — (her)genereert data + migratie (single source of truth).
2. SQL-migratie `supabase/migrations/20260614_04_seed_sterkcalc_visual_library.sql` — tabellen + seed (44 + 660 + 44 + 660).
3. `node scripts/upload_sterkcalc_visual_assets.js` — upload hoofdtegel-foto's naar de bucket.
4. `node scripts/acquire_sterkcalc_visual_assets.js` — vul subtegel-beelden (stock/AI), gegated op API-keys.

## Regels
- Geen 2Jours-assets, logo's of watermarks als productiebeeld.
- Elk extern beeld krijgt `source_url` + `license_status`/`license_note`.
- Geen veilig beeld + geen AI → subtegel toont `icon_key` (Lucide) als fallback.
