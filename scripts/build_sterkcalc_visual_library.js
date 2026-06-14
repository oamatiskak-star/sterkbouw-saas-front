#!/usr/bin/env node
/**
 * SterkCalc — Visuele afbeeldingenbibliotheek: generator (single source of truth)
 * ------------------------------------------------------------------------------
 * Genereert deterministisch uit deze ene bron:
 *   - data/sterkcalc_visual_categories.json      (44 hoofdtegels)
 *   - data/sterkcalc_visual_subcategories.json   (44 x 15 = 660 subtegels)
 *   - data/sterkcalc_visual_assets.json          (44 hoofdtegel-foto's, reeds in repo)
 *   - supabase/migrations/20260614_04_seed_sterkcalc_visual_library.sql
 *
 * Architectuur (optie 1): 44 hoofdtegels = zichtbare werktafel-UI, STABU blijft de
 * motor. `stabu_mapping` is een INDICATIEVE UI->STABU-brug (hoofdstukcodes), geen
 * vervanging van STABU. De 44 hoofdtegels hebben al rechtenvrije foto's in
 * /public/werktafel/fotos/ ; subtegels krijgen nu een icon_key-fallback + een
 * search_query als acquisitie-kandidaat (status needs_image), conform de gekozen
 * "icon-fallback nu, queries klaar"-aanpak.
 *
 * Run:  node scripts/build_sterkcalc_visual_library.js
 * Niet-destructief: schrijft alleen bovenstaande output-bestanden.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const MIGR_DIR = path.join(ROOT, 'supabase', 'migrations');
const CATEGORIES_SRC = path.join(ROOT, 'public', 'werktafel', 'categories.json');

const STORAGE_BUCKET = 'sterkcalc-visual-assets';
const MIGRATION_NAME = '20260614_04_seed_sterkcalc_visual_library';

// ── INDICATIEVE STABU-hoofdstukken per hoofdtegel (UI -> motor) ───────────────
// Codes verwijzen naar public.stabu_posten.hoofdstuk_code. Leeg = administratief.
// AUTHORITATIEVE BRON: lib/calc/werktafelCategorieMap.js (CATEGORIE_STABU), eigenaar
// = CLI L1 (calc-engine). Deze const is een 1-op-1 spiegel zodat DB en engine niet
// divergeren. Wijzigt L1 die map → draai deze generator opnieuw.
const STABU = {
  '00': [], '01': [], '02': ['10'], '03': ['12'], '04': ['20', '21'],
  '05': ['21'], '06': ['21'], '07': ['25'], '08': ['22', '23'], '09': ['22', '36'],
  '10': ['31'], '11': ['24'], '12': ['33', '50'], '13': ['34'], '14': ['30'],
  '15': ['34'], '16': ['32'], '17': ['44'], '18': ['44'], '19': ['42', '48'],
  '20': ['41'], '21': ['40'], '22': ['46'], '23': ['37'], '24': ['60', '61', '52'],
  '25': ['70', '75'], '26': ['61', '62'], '27': ['53', '51', '52'], '28': ['60', '55'], '29': ['54'],
  '30': ['15', '16', '17'], '31': ['17'], '32': ['14', '50'], '33': [], '34': ['82', '83'],
  '35': [], '36': [], '37': [], '38': [], '39': [], '40': [], '41': [], '42': [],
  'A0': [],
};

// ── Lucide icon_key per hoofdtegel (fallback wanneer geen foto) ───────────────
const ICONS = {
  '00': 'ClipboardList', '01': 'HardHat', '02': 'Hammer', '03': 'Shovel', '04': 'Layers',
  '05': 'Box', '06': 'Boxes', '07': 'Frame', '08': 'Building2', '09': 'BrickWall',
  '10': 'PanelsTopLeft', '11': 'Triangle', '12': 'Home', '13': 'Sun', '14': 'DoorOpen',
  '15': 'Square', '16': 'MoveVertical', '17': 'Columns2', '18': 'PanelTop', '19': 'Grid2x2',
  '20': 'Grid3x3', '21': 'Brush', '22': 'PaintRoller', '23': 'Thermometer', '24': 'Wrench',
  '25': 'Zap', '26': 'Wind', '27': 'ShowerHead', '28': 'Flame', '29': 'FireExtinguisher',
  '30': 'Trees', '31': 'Fence', '32': 'Droplets', '33': 'Container', '34': 'Truck',
  '35': 'Forklift', '36': 'Users', '37': 'Package', '38': 'Euro', '39': 'ShieldCheck',
  '40': 'Handshake', '41': 'FileText', '42': 'CalendarRange', 'A0': 'Settings',
};

// ── 15 subtegels per hoofdtegel (sleutel = bestaande categorie-code) ──────────
// Opdracht-tile 43 (Instellingen) is gekoppeld aan bestaande A0 (Instellingen).
const SUBS = {
  '00': ['Projectgegevens', 'Klantgegevens', 'Locatiegegevens', 'Projectomschrijving', 'Calculatie-instellingen', 'Versiebeheer', 'Documentbeheer', 'Notities', 'Projectfasering', 'Templates', 'BTW-instellingen', 'Opslagen', 'Regiofactor', 'Prijspeildatum', 'Algemene voorwaarden'],
  '01': ['Bouwplaatsinrichting', 'Bouwkeet', 'Bouwstroom', 'Bouwwater', 'Tijdelijke opslag', 'Bouwhekken', 'Uitzetten', 'Inmeten', 'Vergunningen', 'Veiligheidsvoorzieningen', 'Werkvoorbereiding', 'Startwerkzaamheden', 'Projectmobilisatie', 'Bouwplaatsverlichting', 'Tijdelijke toegangswegen'],
  '02': ['Complete sloop', 'Stripwerk', 'Binnenwanden slopen', 'Plafonds verwijderen', 'Vloeren verwijderen', 'Tegelwerk verwijderen', 'Badkamer slopen', 'Keuken verwijderen', 'Kozijnen verwijderen', 'Dakbedekking verwijderen', 'Gevel slopen', 'Installaties demonteren', 'Beton zagen', 'Puin afvoeren', 'Asbestsanering'],
  '03': ['Ontgraven bouwput', 'Funderingssleuven graven', 'Kruipruimte ontgraven', 'Grond afvoeren', 'Grond aanvullen', 'Zandbed aanbrengen', 'Bodemverbetering', 'Taluds maken', 'Bouwwegen', 'Grondkering', 'Trillingsverdichting', 'Drainagevoorbereiding', 'Kabelsleuven', 'Rioolsleuven', 'Terreinegalisatie'],
  '04': ['Strokenfundering', 'Poeren', 'Funderingsbalken', 'Betonvloer op zand', 'Paalfundering', 'PS-fundering', 'Fundering herstellen', 'Onderstempeling', 'Bekisting fundering', 'Wapening fundering', 'Kruipruimte drainage', 'Vorstrand fundering', 'Kimconstructie', 'Betonstorten fundering', 'Fundering isoleren'],
  '05': ['Betonvloer', 'Betonwand', 'Betonkolom', 'Betonbalk', 'Wapening', 'Bekisting', 'Beton storten', 'Beton afwerken', 'Prefab beton', 'Breedplaatvloer', 'Kanaalplaatvloer', 'Druklaag', 'Kimnaden', 'Betonreparatie', 'Betonboren'],
  '06': ['Bedrijfsvloeren', 'Betonverharding', 'Keerwanden', 'Betontrappen', 'Prefab elementen', 'Funderingsblokken', 'Kolommen', 'Liggers', 'Wanden', 'Betonlateien', 'Betonranden', 'Betonputten', 'Terrasvloeren', 'Betonvloeren op peil', 'Specials'],
  '07': ['Stalen kolommen', 'Stalen liggers', 'Vakwerken', 'Portalen', 'Staalplaatvloeren', 'Stalen trappen', 'Bordessen', 'Leuningen', 'Ankers', 'Boutverbindingen', 'Laswerk', 'Conservering', 'Montage staal', 'Constructieve versterking', 'Hijsvoorzieningen'],
  '08': ['Spouwmuur', 'Buitenblad', 'Binnenblad', 'Kalkzandsteen', 'Cellenbeton', 'Houtskeletbouw', 'Gevelisolatie', 'Geveldragers', 'Lateien', 'Dilataties', 'Spouwankers', 'Waterkering', 'Raamdorpels', 'Gevelherstel', 'Geveldoorvoeren'],
  '09': ['Buitenmetselwerk', 'Binnenmetselwerk', 'Dragende wanden', 'Voegwerk', 'Rollagen', 'Gevelbanden', 'Schoorstenen', 'Metselwerk herstel', 'Kalkzandsteen lijmwerk', 'Cellenbeton lijmwerk', 'Siermetselwerk', 'Kimlaag', 'Penanten', 'Spouwmuur metselen', 'Steigerwerk metselwerk'],
  '10': ['Houten gevelbekleding', 'Kunststof gevelbekleding', 'Aluminium gevelbekleding', 'Vezelcement platen', 'Steenstrips', 'Stucgevel', 'Gevelpanelen', 'Gevelisolatiesysteem', 'Achterconstructie', 'Ventilerende gevel', 'Dakrandbekleding', 'Boeidelen', 'Waterslagen', 'Gevelreiniging', 'Gevelcoating'],
  '11': ['Kapconstructie', 'Spanten', 'Gordingen', 'Dakbeschot', 'Houtskelet dak', 'Platdakconstructie', 'Dakopbouw', 'Dakkapelconstructie', 'Dakversterking', 'Dakisolatie constructief', 'Overstekken', 'Boeidelen', 'Ravelingen', 'Dakdoorvoeren', 'Constructieherstel'],
  '12': ['Bitumen dakbedekking', 'EPDM', 'PVC dakbedekking', 'Dakpannen', 'Leien', 'Zinken dak', 'Dakisolatie', 'Dampremmer', 'Dakrandafwerking', 'HWA', 'Goten', 'Nokvorsten', 'Loodslabben', 'Dakreparatie', 'Groendak'],
  '13': ['Dakraam', 'Lichtstraat', 'Lichtkoepel', 'Dakkapel', 'Dakdoorvoer', 'Rookgasdoorvoer', 'Ventilatiedoorvoer', 'Sparing maken', 'Raveling', 'Waterdichte aansluiting', 'Zonwering dakraam', 'Lichtstraat aluminium', 'Lichtstraat kunststof', 'Brandluik', 'Toegangsluik dak'],
  '14': ['Kunststof kozijnen', 'Aluminium kozijnen', 'Houten kozijnen', 'Binnendeuren', 'Buitendeuren', 'Schuifpuien', 'Stelkozijnen', 'Hang- en sluitwerk', 'Vensterbanken', 'Raamdorpels', 'Kozijnmontage', 'Kozijnvervanging', 'Brandwerende deuren', 'Garage deuren', 'Puien'],
  '15': ['HR++ glas', 'Triple glas', 'Veiligheidsglas', 'Brandwerend glas', 'Geluidswerend glas', 'Glaslatten', 'Beglazingskit', 'Glasmontage', 'Glas vervangen', 'Doucheglas', 'Balustradeglas', 'Dakbeglazing', 'Isolatieglas', 'Enkel glas verwijderen', 'Glas in lood'],
  '16': ['Houten trap', 'Stalen trap', 'Betonnen trap', 'Bordes', 'Trapleuningen', 'Balustrades', 'Trapgat maken', 'Traprenovatie', 'Vlizotrap', 'Brandtrap', 'Buitentrap', 'Trapbekleding', 'Traptreden', 'Hekwerken trap', 'Leuningdragers'],
  '17': ['Gipswanden', 'Metalstud wanden', 'Kalkzandsteen binnenwand', 'Cellenbeton binnenwand', 'HSB binnenwand', 'Voorzetwanden', 'Schachtwanden', 'Brandwerende wanden', 'Geluidswerende wanden', 'Glaswanden', 'Scheidingswanden', 'Wandisolatie', 'Wandopeningen', 'Lateien binnenwand', 'Wandafwerking voorbereiding'],
  '18': ['Gipsplafond', 'Systeemplafond', 'Verlaagd plafond', 'Akoestisch plafond', 'Brandwerend plafond', 'Plafondisolatie', 'Plafondrachels', 'Plafondplaten', 'Koofwerk', 'Plafondluiken', 'Lichtlijnen', 'Plafondherstel', 'Spuitplafond', 'Metalstud plafond', 'Houten plafond'],
  '19': ['Zandcementdekvloer', 'Anhydrietvloer', 'Betonvloer', 'Houten vloer', 'Vloerisolatie', 'Droogbouwvloer', 'Egaline', 'Vloerverwarming infrezen', 'Cementdekvloer met vloerverwarming', 'Ondervloer', 'Parket voorbereiding', 'Tegelvloer voorbereiding', 'Gietvloer', 'Vloerluiken', 'Vloerreparatie'],
  '20': ['Wandtegels', 'Vloertegels', 'Badkamer tegelwerk', 'Toilet tegelwerk', 'Keuken tegelwerk', 'Buiten tegels', 'Natuursteen', 'Tegellijm', 'Voegwerk tegels', 'Kimband', 'Afschotvloer', 'Douchegoot', 'Tegelplinten', 'Tegelwerk verwijderen', 'Tegelreparatie'],
  '21': ['Wandstucwerk', 'Plafondstucwerk', 'Raapwerk', 'Sierpleister', 'Spackspuitwerk', 'Pleisterwerk', 'Buitenstucwerk', 'Hoekprofielen', 'Gaaswapening', 'Stucstopprofielen', 'Stucwerk herstel', 'Betonlook stuc', 'Leemstuc', 'Sausklaar stucen', 'Behangklaar stucen'],
  '22': ['Binnen schilderwerk', 'Buiten schilderwerk', 'Houtwerk schilderen', 'Kozijnen schilderen', 'Deuren schilderen', 'Wanden sauzen', 'Plafonds sauzen', 'Lakwerk', 'Beitswerk', 'Grondverf', 'Plamuren', 'Schuren', 'Kitwerk', 'Coating', 'Schilderwerk herstel'],
  '23': ['Spouwisolatie', 'Dakisolatie', 'Vloerisolatie', 'Gevelisolatie', 'Binnenisolatie', 'PIR platen', 'Minerale wol', 'EPS isolatie', 'XPS isolatie', 'Dampremmende folie', 'Luchtdichting', 'Rc-verbetering', 'Akoestische isolatie', 'Brandwerende isolatie', 'Kierdichting'],
  '24': ['Waterleiding', 'Afvoerleiding', 'Gasleiding', 'CV-leiding', 'Leidingwerk algemeen', 'Doorvoeren', 'Mantelbuizen', 'Technische ruimte', 'Meterkast voorbereiding', 'Installatieschachten', 'Montagebeugels', 'Isolatie leidingen', 'Appendages', 'Inregelen', 'Installatie testen'],
  '25': ['Meterkast', 'Groepenkast', 'Wandcontactdozen', 'Schakelaars', 'Lichtpunten', 'Kabelgoten', 'Leidingen elektra', 'Aarding', 'Data bekabeling', 'Domotica', 'Zonnepanelen elektra', 'Laadpaal voorbereiding', 'Noodverlichting', 'Brandmeldinstallatie', 'Keuring elektra'],
  '26': ['Mechanische ventilatie', 'WTW-installatie', 'Ventilatiekanalen', 'Roosters', 'Dakdoorvoer ventilatie', 'Afzuigpunten', 'Toevoerpunten', 'Luchtbehandeling', 'Kanaalisolatie', 'Ventilatiebox', 'CO2-sturing', 'Geluiddempers', 'Brandkleppen', 'Inregelen ventilatie', 'Onderhoud ventilatie'],
  '27': ['Toilet', 'Badkamer', 'Douche', 'Wastafel', 'Bad', 'Kranen', 'Afvoeren', 'Inbouwreservoir', 'Douchegoot', 'Sanitair montage', 'Kitwerk sanitair', 'Waterdichting', 'Badkamermeubel', 'Leidingen sanitair', 'Accessoires'],
  '28': ['CV-ketel', 'Warmtepomp', 'Radiatoren', 'Vloerverwarming', 'Verdelers', 'Thermostaat', 'Leidingen verwarming', 'Buffervat', 'Boiler', 'Inregelen', 'Isolatie leidingen', 'Lucht-water systeem', 'Hybride systeem', 'Warmteafgifte', 'Onderhoud verwarming'],
  '29': ['Sprinklerkoppen', 'Sprinklerleidingen', 'Brandhaspels', 'Brandblussers', 'Brandwerende doorvoeren', 'Brandwerende bekleding', 'Brandmeldinstallatie', 'Rookmelders', 'Vluchtroute aanduiding', 'Noodverlichting', 'Brandscheidingen', 'Brandkleppen', 'Compartimentering', 'Brandwerend glas', 'Brandveiligheidsrapport'],
  '30': ['Bestrating', 'Terrassen', 'Opritten', 'Tuinpaden', 'Grondwerk terrein', 'Borders', 'Beplanting', 'Schuttingen', 'Keerwanden tuin', 'Buitenverlichting', 'Drainage terrein', 'Grind', 'Kunstgras', 'Terreininrichting', 'Tuinmuren'],
  '31': ['Bouwhek', 'Sierhekwerk', 'Gaashekwerk', 'Poorten', 'Leuningen buiten', 'Balustrades buiten', 'Terreinafscheiding', 'Parkeerbeugels', 'Fietsenrekken', 'Slagbomen', 'Buitenmeubilair', 'Afvalvoorzieningen', 'Bewegwijzering', 'Valbeveiliging', 'Hekwerk montage'],
  '32': ['Hemelwaterafvoer', 'Rioolleidingen', 'Kolken', 'Drainage', 'Inspectieputten', 'Aansluiting riool', 'Infiltratiekratten', 'Goten', 'Dakafvoer', 'Terreinriolering', 'Vuilwaterafvoer', 'Regenwaterafvoer', 'Ontstoppingspunten', 'Pompput', 'Scheidingsput'],
  '33': ['Bouwkeet', 'Steigers tijdelijk', 'Stempels', 'Noodvoorzieningen', 'Tijdelijke elektra', 'Tijdelijke wateraansluiting', 'Tijdelijke verwarming', 'Tijdelijke verlichting', 'Afzettingen', 'Loopbruggen', 'Bouwliften', 'Containers', 'Opslag', 'Bescherming bestaand werk', 'Tijdelijke dakafdichting'],
  '34': ['Kraanwerk', 'Hijswerk', 'Bouwlift', 'Verreiker', 'Transport materialen', 'Afvaltransport', 'Intern transport', 'Lossen', 'Laden', 'Verticaal transport', 'Horizontaal transport', 'Containerwissel', 'Transportkosten', 'Hijsplan', 'Logistiek'],
  '35': ['Graafmachine', 'Minigraver', 'Shovel', 'Trilplaat', 'Betonmolen', 'Steiger', 'Hoogwerker', 'Bouwlift', 'Zaagmachine', 'Boormachine', 'Stofafzuiging', 'Pompen', 'Aggregaat', 'Compressoren', 'Meetgereedschap'],
  '36': ['Timmerman', 'Metselaar', 'Tegelzetter', 'Stukadoor', 'Schilder', 'Elektricien', 'Installateur', 'Loodgieter', 'Grondwerker', 'Sloper', 'Voeger', 'Dakdekker', 'Monteur', 'Uitvoerder', 'Calculator'],
  '37': ['Hout', 'Beton', 'Staal', 'Bakstenen', 'Kalkzandsteen', 'Isolatie', 'Gipsplaten', 'Tegels', 'Verf', 'Leidingen', 'Elektra materiaal', 'Bevestigingsmiddelen', 'Folies', 'Kitten', 'Prefab onderdelen'],
  '38': ['Kostprijs', 'Materiaalprijs', 'Arbeidsprijs', 'Materieelprijs', 'Onderaanneming', 'AK', 'ABK', 'Risico', 'Winst', 'BTW', 'Regiofactor', 'Prijspeil', 'Indexering', 'Marge', 'Fixed price optimalisatie'],
  '39': ['Risicoposten', 'Onvoorzien', 'Kwaliteitscontrole', 'Keuringen', 'Veiligheid', 'Bouwfouten', 'Herstelkosten', 'Meerwerk risico', 'Planning risico', 'Leveringsrisico', 'Prijsrisico', "Technische risico's", 'Vergunning risico', 'Garantie', 'Opleverpunten'],
  '40': ['Metselwerk onderaannemer', 'Installatie onderaannemer', 'Elektra onderaannemer', 'Stukadoor onderaannemer', 'Schilder onderaannemer', 'Dakdekker onderaannemer', 'Tegelzetter onderaannemer', 'Sloop onderaannemer', 'Grondwerk onderaannemer', 'Kozijnenleverancier', 'Betonleverancier', 'Steigerbouwer', 'Transporteur', 'Specialistisch werk', 'Offertevergelijking'],
  '41': ['Tekeningen', 'Bestek', 'Constructieberekening', 'Vergunning', "Foto's", 'Offertes leveranciers', 'Werkbonnen', 'Rapportages', 'Planningdocumenten', 'Meetstaten', 'Calculatiebijlagen', 'Risicodocumenten', 'Opleverdocumenten', 'Garanties', 'Revisiedocumenten'],
  '42': ['Hoofdplanning', 'Weekplanning', 'Personeelsplanning', 'Faseplanning', 'Kritieke pad', 'Afhankelijkheden', 'Doorlooptijd', 'Startdatum', 'Opleverdatum', 'Werkdagen', 'Capaciteit', 'Vertragingen', 'Mijlpalen', 'Bouwvolgorde', 'Gantt-overzicht'],
  'A0': ['Gebruikersinstellingen', 'Calculatieprofielen', 'Opslagpercentages', 'Prijsbronnen', 'Regio-instellingen', 'STABU-instellingen', 'Combi-instellingen', 'AI-instellingen', 'Exportinstellingen', 'PDF-template', 'Rollen en rechten', 'Bedrijfsgegevens', 'Notificaties', 'Integraties', 'Systeembeheer'],
};

// Hoofdtegels die administratief zijn (geen fotografische subtegel-acquisitie nuttig).
const ADMIN_CATS = new Set(['00', '36', '37', '38', '39', '40', '41', '42', 'A0']);

// ── Helpers ──────────────────────────────────────────────────────────────────
function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // accenten weg
    .replace(/&/g, ' en ')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}
function sqlStr(v) {
  if (v === null || v === undefined) return 'null';
  return `'${String(v).replace(/'/g, "''")}'`;
}
function sqlJson(obj) {
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}
function pad2(n) { return String(n).padStart(2, '0'); }

// ── Bouw datamodel uit bron ──────────────────────────────────────────────────
const srcCats = JSON.parse(fs.readFileSync(CATEGORIES_SRC, 'utf8')).categorieen;

const categories = [];
const subcategories = [];
const assets = [];

srcCats.forEach((c, i) => {
  const code = c.code;
  const imageKey = `cat_${code.toLowerCase()}_${c.slug.replace(/^[^_]*_/, '')}`;
  const stabuChapters = STABU[code] || [];
  const stabuMapping = { hoofdstukken: stabuChapters, bron: 'indicatief — werktafel→STABU-motor' };

  categories.push({
    code,
    title: c.titel,
    subtitle: c.subtitel,
    sort_order: i,
    icon_key: ICONS[code] || 'Square',
    image_key: imageKey,
    stabu_mapping: stabuMapping,
    active: true,
  });

  // Hoofdtegel-asset = bestaande rechtenvrije foto in de repo.
  assets.push({
    image_key: imageKey,
    title: c.titel,
    description: c.subtitel,
    category_code: code,
    subcategory_code: null,
    source_type: 'own_repo',
    source_url: null,
    license_status: 'rechtenvrij',
    local_path: c.foto,
    storage_path: `categories/${imageKey}.jpg`,
    width: null,
    height: null,
    file_type: 'jpg',
    checksum: null,
    active: true,
  });

  // Subtegels
  const subs = SUBS[code] || [];
  subs.forEach((title, j) => {
    const subCode = pad2(j + 1);
    const slug = slugify(title);
    subcategories.push({
      category_code: code,
      code: subCode,
      title,
      subtitle: null,
      sort_order: j,
      icon_key: ICONS[code] || 'Square', // fallback-icoon (erft hoofdtegel)
      image_key: `sub_${code.toLowerCase()}_${subCode}_${slug}`,
      stabu_mapping: stabuMapping,
      active: true,
      // afgeleid, niet gepersisteerd in subcat-tabel maar gebruikt voor candidates:
      _search_query: ADMIN_CATS.has(code)
        ? `${c.titel} ${title} icoon administratie`
        : `${title} bouw Nederland ${c.titel}`,
      _admin: ADMIN_CATS.has(code),
    });
  });
});

// ── Schrijf JSON-bestanden ───────────────────────────────────────────────────
fs.mkdirSync(DATA_DIR, { recursive: true });

const meta = (dataset, count) => ({
  dataset,
  version: '1.0.0',
  generated: '2026-06-14',
  bron: 'scripts/build_sterkcalc_visual_library.js — single source of truth',
  bucket: STORAGE_BUCKET,
  aantal: count,
});

fs.writeFileSync(
  path.join(DATA_DIR, 'sterkcalc_visual_categories.json'),
  JSON.stringify({ _meta: meta('SterkCalc visuele hoofdtegels (werktafel-UI)', categories.length), categories }, null, 2) + '\n'
);

const subsOut = subcategories.map(({ _search_query, _admin, ...rest }) => rest);
fs.writeFileSync(
  path.join(DATA_DIR, 'sterkcalc_visual_subcategories.json'),
  JSON.stringify({ _meta: meta('SterkCalc visuele subtegels', subsOut.length), subcategories: subsOut }, null, 2) + '\n'
);

fs.writeFileSync(
  path.join(DATA_DIR, 'sterkcalc_visual_assets.json'),
  JSON.stringify({ _meta: meta('SterkCalc visuele assets (hoofdtegel-foto’s)', assets.length), assets }, null, 2) + '\n'
);

// Acquisitie-backlog (1 kandidaat per subtegel) — interne seed-bron, JSON-gedreven.
const candidates = subcategories.map(s => ({
  category_code: s.category_code,
  subcategory_code: s.code,
  search_query: s._search_query,
  source_type: s._admin ? 'icon' : 'stock_or_ai',
  status: s._admin ? 'icon_fallback' : 'queued',
}));
fs.writeFileSync(
  path.join(DATA_DIR, 'sterkcalc_visual_asset_candidates.json'),
  JSON.stringify({ _meta: meta('SterkCalc acquisitie-backlog', candidates.length), candidates }, null, 2) + '\n'
);

// ── Genereer SQL-migratie ────────────────────────────────────────────────────
const ddl = `-- ============================================================
-- SterkCalc — Visuele afbeeldingenbibliotheek (additief, niet-destructief)
-- Doel-DB: pmovazftwoxjopqkuuhp (sterkbouww). GEGENEREERD door
-- scripts/build_sterkcalc_visual_library.js — niet handmatig bewerken.
--
-- Architectuur (optie 1): 44 hoofdtegels = zichtbare werktafel-UI; STABU blijft
-- de motor. stabu_mapping = indicatieve UI->STABU-brug (hoofdstukcodes).
-- RLS-model gespiegeld van bestaande werktafel-tabellen: SELECT permissief,
-- write voor authenticated + service_role.
-- ============================================================

-- ── TABELLEN ───────────────────────────────────────────────
create table if not exists public.sterkcalc_visual_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  subtitle text,
  sort_order int not null default 0,
  icon_key text,
  image_key text,
  stabu_mapping jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sterkcalc_visual_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_code text not null,
  code text not null,
  title text not null,
  subtitle text,
  sort_order int not null default 0,
  icon_key text,
  image_key text,
  stabu_mapping jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (category_code, code)
);
create index if not exists idx_scv_subcat_cat on public.sterkcalc_visual_subcategories(category_code, sort_order);

create table if not exists public.sterkcalc_visual_assets (
  id uuid primary key default gen_random_uuid(),
  image_key text not null unique,
  title text,
  description text,
  category_code text,
  subcategory_code text,
  source_type text,
  source_url text,
  license_status text,
  local_path text,
  storage_path text,
  width int,
  height int,
  file_type text,
  checksum text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_scv_assets_cat on public.sterkcalc_visual_assets(category_code, subcategory_code);

create table if not exists public.sterkcalc_visual_asset_candidates (
  id uuid primary key default gen_random_uuid(),
  category_code text,
  subcategory_code text,
  search_query text,
  source_type text,
  source_url text,
  preview_url text,
  license_note text,
  status text not null default 'queued',
  selected boolean not null default false,
  rejected_reason text,
  created_at timestamptz not null default now()
);
create index if not exists idx_scv_cand_status on public.sterkcalc_visual_asset_candidates(status, category_code);

-- ── RLS (gespiegeld bestaand model) ────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'sterkcalc_visual_categories','sterkcalc_visual_subcategories',
    'sterkcalc_visual_assets','sterkcalc_visual_asset_candidates'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname=t||'_select') then
      execute format($p$create policy %I on public.%I for select using (true);$p$, t||'_select', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname=t||'_insert') then
      execute format($p$create policy %I on public.%I for insert with check (auth.uid() is not null or auth.role() = 'service_role');$p$, t||'_insert', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname=t||'_update') then
      execute format($p$create policy %I on public.%I for update using (auth.uid() is not null or auth.role() = 'service_role');$p$, t||'_update', t);
    end if;
    if not exists (select 1 from pg_policies where schemaname='public' and tablename=t and policyname=t||'_delete') then
      execute format($p$create policy %I on public.%I for delete using (auth.uid() is not null or auth.role() = 'service_role');$p$, t||'_delete', t);
    end if;
  end loop;
end $$;
`;

// Idempotente seed-helper
function seedBlock(table, cols, rows, notExistsKeys) {
  if (!rows.length) return '';
  const colList = cols.join(', ');
  const valuesSql = rows.map(r => '  (' + cols.map(c => r[c]).join(', ') + ')').join(',\n');
  const where = notExistsKeys
    .map(k => `s.${k} = v.${k}`)
    .join(' and ');
  return `\n-- seed: ${table} (${rows.length} rijen)\ninsert into public.${table} (${colList})\nselect ${cols.map(c => 'v.' + c).join(', ')}\nfrom (values\n${valuesSql}\n) as v(${colList})\nwhere not exists (select 1 from public.${table} s where ${where});\n`;
}

// categories
const catRows = categories.map(c => ({
  code: sqlStr(c.code),
  title: sqlStr(c.title),
  subtitle: sqlStr(c.subtitle),
  sort_order: c.sort_order,
  icon_key: sqlStr(c.icon_key),
  image_key: sqlStr(c.image_key),
  stabu_mapping: sqlJson(c.stabu_mapping),
  active: c.active,
}));
const catSql = seedBlock(
  'sterkcalc_visual_categories',
  ['code', 'title', 'subtitle', 'sort_order', 'icon_key', 'image_key', 'stabu_mapping', 'active'],
  catRows, ['code']
);

// subcategories
const subRows = subcategories.map(s => ({
  category_code: sqlStr(s.category_code),
  code: sqlStr(s.code),
  title: sqlStr(s.title),
  subtitle: sqlStr(s.subtitle),
  sort_order: s.sort_order,
  icon_key: sqlStr(s.icon_key),
  image_key: sqlStr(s.image_key),
  stabu_mapping: sqlJson(s.stabu_mapping),
  active: s.active,
}));
const subSql = seedBlock(
  'sterkcalc_visual_subcategories',
  ['category_code', 'code', 'title', 'subtitle', 'sort_order', 'icon_key', 'image_key', 'stabu_mapping', 'active'],
  subRows, ['category_code', 'code']
);

// assets
const assetRows = assets.map(a => ({
  image_key: sqlStr(a.image_key),
  title: sqlStr(a.title),
  description: sqlStr(a.description),
  category_code: sqlStr(a.category_code),
  subcategory_code: sqlStr(a.subcategory_code),
  source_type: sqlStr(a.source_type),
  license_status: sqlStr(a.license_status),
  local_path: sqlStr(a.local_path),
  storage_path: sqlStr(a.storage_path),
  file_type: sqlStr(a.file_type),
  active: a.active,
}));
const assetSql = seedBlock(
  'sterkcalc_visual_assets',
  ['image_key', 'title', 'description', 'category_code', 'subcategory_code', 'source_type', 'license_status', 'local_path', 'storage_path', 'file_type', 'active'],
  assetRows, ['image_key']
);

// candidates (1 per subtegel = acquisitie-backlog)
const candRows = subcategories.map(s => ({
  category_code: sqlStr(s.category_code),
  subcategory_code: sqlStr(s.code),
  search_query: sqlStr(s._search_query),
  source_type: sqlStr(s._admin ? 'icon' : 'stock_or_ai'),
  status: sqlStr(s._admin ? 'icon_fallback' : 'queued'),
}));
const candSql = seedBlock(
  'sterkcalc_visual_asset_candidates',
  ['category_code', 'subcategory_code', 'search_query', 'source_type', 'status'],
  candRows, ['category_code', 'subcategory_code', 'search_query']
);

const sql = ddl + '\n-- ── SEED ───────────────────────────────────────────────────\n' + catSql + subSql + assetSql + candSql;

fs.mkdirSync(MIGR_DIR, { recursive: true });
fs.writeFileSync(path.join(MIGR_DIR, `${MIGRATION_NAME}.sql`), sql);

console.log('SterkCalc visual library gegenereerd:');
console.log(`  categories     : ${categories.length}`);
console.log(`  subcategories  : ${subcategories.length}`);
console.log(`  assets         : ${assets.length}`);
console.log(`  candidates     : ${candRows.length}`);
console.log(`  migratie       : supabase/migrations/${MIGRATION_NAME}.sql`);
