# PROJECT_STATUS — SterkCalc (sterkbouw-saas-front)

Next.js 14 (Pages Router) + Supabase. Live SterkCalc-frontend (Vercel `sterkbouw-saas-front`, domein **app.sterkbouw.nl**).
Supabase-DB: **pmovazftwoxjopqkuuhp** (sterkbouww). `NEXT_PUBLIC_SUPABASE_URL`/anon wijst hierheen.
Laatst bijgewerkt: **2026-06-15**.

## 🔴 HERSTEL HIER NA CRASH
- **P8 (Rekenmodellen uitbreiden) lokaal klaar, build groen, branch `p8-rekenmodellen-uitbreiding` op main:** 5 nieuwe diepe rekenmodellen volgens hetzelfde patroon als Badkamer/Fundering: **KozijnModel** (materiaal/beglazing/hang-sluit/vensterbank), **DakModel** (pannen/EPDM/bitumen + isolatie/constructie/goten/HWA/nokvorst), **BinnenwandModel** (metalstud/gips/kalkzandsteen/cellenbeton + afwerking 2-zijdig + deuren), **KeukenModel** (blok/werkblad/apparatuur/spoelbak/elektra/spatwand) en **ToiletModel** (wand-/vloertegels/wc/fontein/ventilatie/elektra). Alle gemapt op BESTAANDE actieve combi-codes (geverifieerd tegen cat 11/12/13/14/15/17/20/25/26/27/K0). Geregistreerd in `lib/calc/rekenmodellen/index.js` → verschijnen automatisch in de Rekenmodellen-sectie op `/calculaties/[id]/objecten` + configurator. Geen DB-wijziging.
- **✅ P7 COMPLEET (canonieke calculator-flow) — alles gemerged in main (#31-#39).**
  - **P7.1** flow-spine: sidebar = calculator-ketting + groepen (Calculatie / Bibliotheek-naslag / Systeem); `FaseStepper`; legacy `nieuw-legacy` → redirect.
  - **P7.2** Rekenmodel-laag onder Object Engine (`lib/calc/rekenmodellen/`: BadkamerModel + FunderingModel; systeembekisting = ISO-defaults) + `RekenmodelConfigurator`.
  - **P7.3** AI-volledigheidscontrole op objectregels (`lib/calc/volledigheidsRegels.js` → `VolledigheidsCheck`).
  - **P7.4** Projectmap project-hub (`services/projectmap.js` + `Projectmap.jsx` bovenaan dashboard).
  - **P7.5** Scenario-vergelijker + AI-optimalisatie (`lib/calc/scenarios.js`, `services/optimalisatie.js`, `/calculaties/[id]/optimalisatie`).
  - **P7.6** Offerte-afronding (`VerzendModule.jsx`: e-mail/PDF/portaal + audittrail).
  - **P7.7** Bestellen besteleenheid/verpakking (`lib/calc/besteleenheden.js`); planning-bouwfase + leverancier bleken al aanwezig.
  - **P7.8** Documentcontrole (`lib/calc/documentControle.js` + `DocumentControle.jsx` op AI-pagina + intake).
  - **P7.9** Werktafel visuele finale: **geaudit tegen canoniek scherm 8 / Layer 4B — geen discrepantie**. Grid-chapter-rijen, commercieel-eerst kolommen, volledige AK/ABK/risico/winst/btw-breakdown in `LiveTotalen`, EigenschappenPaneel+STABU, navigator = al op 2Jours-niveau (P5). Geen rebuild nodig.
- Branch: **`main`** (P5+P6+ObjectEngine gemerged, working tree schoon). Geen open PR's vóór P7.1.
- Canonieke keten draait end-to-end live: **PROJECT → DOCUMENTEN → AI-HERKENNING (ruimtes + objecten) → RUIMTE-/BOUWDEEL-TYPES (herhaling) → COMBI'S → COMPONENTEN → STABU → WERKTAFEL → INSTELLINGEN → OFFERTE (PDF) → AKKOORD**.
- Laatste merges: #10/#11 Visions, #12 Visions+ objecten, #13 copy-defaults, #14 offerte-PDF+akkoord. Plus #8/#9 routing-fix (root + login → /calculaties).
- **P6-OBJ — Objectgedreven calculeren (2026-06-15, lokaal, build groen, branch `p6b-object-engine` stacked op P6):** nieuwe keten RUIMTE → OBJECT → KEUZE → COMBI → COMPONENT → STABU. `lib/calc/objectEngine.js` (config, geen nieuwe engine): per ruimte-type (badkamer/keuken/toilet/woonruimte/meterkast/technisch) standaard objecten + max 3 keuzes per object → vertaald naar BESTAANDE actieve combi-codes met hoeveelheid-drivers (vloer/wand/omtrek/stuk). `services/objectEngine.js` past instructies toe via `voegCombiToe` (routeert naar subhoofdstuk; geen losse regels, geen STABU-zoekactie). Nieuwe pagina `/calculaties/[id]/objecten` (Ruimte→Object→Keuze→"Vul werktafel"); ruimtes uit AI of handmatig. Links toegevoegd in AI-pagina + werktafel-toolbar. `services/combis.js` +loadCombisByCodes. Badkamer heeft altijd tegelwerk; keuken altijd apparatuur (acceptatie). GEEN DB-migratie nodig (alle combi-codes bestonden al). Werktafel/offerte/planning/etc. ongewijzigd.
- **P6 — Canonical Intake & AI-First Workflow (2026-06-15, lokaal, build groen, branch `p6-intake-ai-first` stacked op P5):** `/calculaties/nieuw` herbouwd tot **Project Intake Center** (5 stappen: Project → Documenten → AI-analyse → Bouwdelen-voorstel → gevulde Werktafel). Projectintake met verplicht (naam/opdrachtgever/plaats/type) + optioneel (werkadres/omschrijving/referentie/start+einddatum/contact/tel/email); GEEN oppervlakte/hoeveelheden/bouwsom. Documentcenter (drag-drop, 8 categorieën, dossier-kaarten met type/grootte/status) → bucket `sterkcalc-vision-uploads`. AI-analyse loopt vision over leesbare docs → telkaarten + "AI heeft gevonden"-samenvatting. Bouwdelen-voorstel (AI-vondsten + kritieke projecttype-domeinen, aanvinkbaar, BouwdeelKiezer voor toevoegen) + projecttype-validatie. Afronden-gate (project/docs/analyse) plaatst template + gekozen bouwdelen in de werktafel → opent nooit leeg. **P6-L gerespecteerd:** werktafel/combi-bib/planning/bestellen/rapportage/offerte ONGEWIJZIGD. Nieuw: `services/documenten.js`, `services/p6Intake.js`; uitgebreid: `services/aiAnalyse.js` (analyseDocument + verwerkVisionExtract), `services/projecten.js` (extra velden + return {calculatieId,projectId}), `pages/calculaties/nieuw.js`. Migratie `20260615_15_p6_document_dossier.sql` (document_sources +calculatie_id/mime_type/file_size/page_count/analyse_status) op prod.
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
