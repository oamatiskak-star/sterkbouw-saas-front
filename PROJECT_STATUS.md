# PROJECT_STATUS — SterkCalc (sterkbouw-saas-front)

Next.js 14 (Pages Router) + Supabase. Live SterkCalc-frontend (Vercel `sterkbouw-saas-front`, domein **app.sterkbouw.nl**).
Supabase-DB: **pmovazftwoxjopqkuuhp** (sterkbouww). `NEXT_PUBLIC_SUPABASE_URL`/anon wijst hierheen.
Laatst bijgewerkt: **2026-06-15**.

## 🔴 HERSTEL HIER NA CRASH
- Branch: **`main`** (alles gemerged, working tree schoon). Geen open PR's.
- Canonieke keten draait end-to-end live: **PROJECT → DOCUMENTEN → AI-HERKENNING (ruimtes + objecten) → RUIMTE-/BOUWDEEL-TYPES (herhaling) → COMBI'S → COMPONENTEN → STABU → WERKTAFEL → INSTELLINGEN → OFFERTE (PDF) → AKKOORD**.
- Laatste merges: #10/#11 Visions, #12 Visions+ objecten, #13 copy-defaults, #14 offerte-PDF+akkoord. Plus #8/#9 routing-fix (root + login → /calculaties).
- **P5 — Canonical Calculator UX Rebuild (2026-06-15, lokaal, build groen, NIET gepusht):** werktafel = hoofdsysteem; linkerboom = pure navigator (scrollt naar grid); hoofdstukken+subhoofdstukken als grid-rijen (2Jours-look) met tellingen+combi-aantallen; kolommen commercieel-eerst (Omschrijving·Aantal·Eenheid·Opslag·Verkoop·Marge → Mat/Arb/Matl·Norm·Uren·STABU); auto combi-voorstellen op actief leeg subhoofdstuk; **bouwdeel = primaire invoer** (BouwdeelKiezer → alle combi's in 1 actie); **verplichte volledigheidscheck** vóór offerte (VolledigheidsCheck, "X open onderdelen", terug/toch doorgaan). Projecttype-template 2.0: volledige nieuwbouw (31 hoofdstukken, alle met combi-dekking), **Keuken = eigen hoofdstuk K0** (los van tegelwerk), **hoofdstuk 00 = ABK/staartkosten** met 10 combi's. Subhoofdstukken nu DB-afgeleid (alleen combi-bevattende). Gewijzigd: `lib/calc/projecttypeTemplates.js`, `services/werktafel.js`, `services/werktafelAnalyse.js`, `services/bouwdelen.js`, `hooks/useWerktafel.js`, `components/calculatie/werktafel/{Werktafel,RegelTabel,HoofdstukBoom}.jsx` + nieuw `{BouwdeelKiezer,VolledigheidsCheck}.jsx`.
- Migraties t/m `20260615_14_p5_keuken_abk.sql` toegepast op pmovaz-prod (keuken K0 + cat-00 ABK subcategorieën + 14 curated combi's met componenten).
- **2 openstaande aandachtspunten (van Orlando, niet code):**
  1. Vercel build-queue was 14–15 jun traag (15–45 min/deploy); auto-merge staat UIT op de repo → mergen vereist handmatig groene check.
  2. **`SUPABASE_SERVICE_ROLE_KEY` op Vercel is kapot** — newline in JWT (invalid header) + `ref` wijst naar core-os i.p.v. pmovaz. Server-routes met service-role (projecten/projects/start-calculation) zijn daardoor stuk. Visions/objecten/offerte werken eromheen via de pmovaz **anon**-client. Fix = juiste pmovaz service-role (zonder newline) + `SUPABASE_URL=pmovaz` op Vercel zetten.
- Volgende geplande diepgang: klantportaal + online ondertekening · IFC-parsing · PDF-detailregels per hoofdstuk.

## Architectuur (hard, van Orlando)
- STABU = enige rekenmotor. `werktafel_*`-tabellen = PRIMAIRE calculatiebron; legacy `calculatie_regels`/`v_calculatie_2jours` blijven legacy.
- Totalen ALTIJD uit componenten (`lib/calc/werktafelTotals.js`). Combi's ALTIJD openklapbaar (arbeid/materiaal/materieel).
- **AK/ABK/risico/winst = uitsluitend user-controlled**, NOOIT door AI. AI mag enkel herkennen/meten/classificeren/voorstellen.
- Calculatie-instellingen per calculatie (gekopieerd uit globale `sterkcalc_settings.calculatie_defaults`) én per versie (snapshot). Geen mockdata; additief; geen destructieve migraties; geen App Router.
- Vision/DB-writes lopen via pmovaz **anon**-client (server service-role is onbruikbaar, zie HERSTEL).

## Modules — status
- ✅ **Shell + browser-keten (S1):** SterkCalcLayout (route-based), Overzicht 44 tegels → 660 subtegels → bouwdelen → combi's → combi-detail → werktafel. 660 bouwdelen + 480 base-combi's + 2316 componenten gegenereerd.
- ✅ **Calculatielaag (S2):** combi-configurator + 5-staps wizard + STABU-browser. `lib/calc/combiConfigurator.js`.
- ✅ **Werktafel (Fase 1/2):** hoofdstukken-boom, regels, STABU-prefill, combi-openklap, live totalen, versiehistorie. `hooks/useWerktafel.js` + `services/werktafel.js`.
- ✅ **AI-laag / Visions (S3 + #10/#11/#12):** upload PDF/PNG/JPG/WEBP → Claude vision (tool-schema) → ruimtes + maten + openingen + losse objecten → groepering (ruimte-types & bouwdeel-types, herhaling) → combi-voorstel → werktafel × aantal. `pages/api/calculaties/vision.js` (thin proxy, alleen `ANTHROPIC_API_KEY`), `services/aiAnalyse.js`, `lib/calc/ruimteGroepering.js`, `pages/calculaties/[id]/ai.js`. Confidence-badges + analyse-historie. DWG/IFC → "exporteer naar PDF".
- ✅ **Project-/documentlaag (S4):** projecten/project-dashboard/zoeken.
- ✅ **Offertelaag (S5 + #14):** offerte-dashboard/builder + **professionele PDF** (`lib/offerte/genereerOffertePdf.js`, jsPDF) + opdrachtgever-velden + akkoord-workflow (concept→verzonden→getekend).
- ✅ **Planning/Bestellen/Rapportages (S6):** per `/calculaties/[id]/*`. `services/calcModules.js`.
- ✅ **Globale Instellingen (S7):** `sterkcalc_settings`; bron van per-calc defaults (copy-defaults #13 wired).
- ✅ **L2 visuele bibliotheek:** `sterkcalc_visual_*` (44/660/44/660), bucket `sterkcalc-visual-assets`. Subtegel-beeld-acquisitie gegated (zie onder).
- ⏳ **Resterende diepgang:** klantportaal + online ondertekening; IFC-parsing; PDF-detailregels per hoofdstuk; beeld-acquisitie AI-stap (OpenAI image-key).

## DB-migraties (pmovaz-prod, toegepast)
`20260614_01..03` (werktafel-datamodel + STABU-seed + combi-seed) · `04` (visual library) · `05` (nextgen-architectuur + AI-tabellen) · `05_visual_assets_review_status` · `06` (sterkcalc_offertes + sterkcalc_settings) · `07_vision` (vision-analyses + bucket + policies) · `08_objecten` (calculatie_objecten).

## Verificatie (2026-06-15)
- `npm run build` → exit 0. Prod-probe `/api/calculaties/vision`: GET→405, POST{}→400, dwg→422, 404-bestand→502 (kwam langs ANTHROPIC_API_KEY-check; geen service-role-afhankelijkheid).
- `app.sterkbouw.nl/calculaties` toont de nieuwe SterkCalc-UI; root `/`→/calculaties; oude admin alleen buiten /calculaties.
- L2: DB-counts 44/660/44/660; bucket public-URL HTTP 200.

## Beeld-acquisitie (gegated)
`scripts/acquire_sterkcalc_visual_assets.js` (Pexels/Unsplash/Pixabay/OpenAI + sharp). 25/30 pilot-stock pending_review, 5 → needs_generation (AI-stap). **GEBLOKKEERD:** OpenAI image-key (insufficient_quota). Keys in `orlando-core-os/local-agent/.env`.
