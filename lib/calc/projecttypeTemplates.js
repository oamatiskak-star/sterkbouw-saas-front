// lib/calc/projecttypeTemplates.js
// P5-D/E/F — projecttype-templates 2.0: per projecttype een VOLLEDIGE, geordende
// hoofdstukkenstructuur (DB-categoriecodes). Subhoofdstukken worden bij instantiatie
// uit de DB afgeleid (alleen subcategorieën mét combi-dekking), zodat élk getoond
// subhoofdstuk ook daadwerkelijk calculeerbaar is. Geen lege schermen, geen losse regels.
//
// De codes zijn de echte categorie-codes uit sterkcalc_visual_categories (STABU-aligned),
// zodat combi-routing en combi-voorstellen blijven werken. Keuken = K0 (eigen hoofdstuk,
// P5-E). Hoofdstuk 00 = Algemeen/ABK/staartkosten (P5-F).

export const PROJECTTYPE_LABELS = {
  nieuwbouw: 'Nieuwbouw',
  verbouw: 'Verbouw',
  herstel: 'Herstel',
  renovatie: 'Renovatie',
  transformatie: 'Transformatie',
  aanbouw: 'Aanbouw',
  uitbreiding: 'Uitbreiding (aanbouw/opbouw)',
  verduurzaming: 'Verduurzaming',
  badkamer: 'Badkamer renovatie',
  woning: 'Woning renovatie',
  appartementencomplex: 'Appartementencomplex',
};

// Fallback-namen (alleen gebruikt als de DB-titel niet geladen kan worden).
export const CAT_TITLES = {
  '00': 'Algemeen', '01': 'Voorbereiding', '02': 'Sloopwerk', '03': 'Grondwerk',
  '04': 'Fundering & grondwerk', '05': 'Betonwerk', '06': 'Betonwerken',
  '07': 'Staalskelet & constructie', '08': 'Gevel & buitenwand', '09': 'Metselwerk',
  '10': 'Gevelbekleding', '11': 'Dakconstructie', '12': 'Dakbedekking',
  '13': 'Dakopeningen & lichtstraten', '14': 'Ramen, deuren & kozijnen',
  '15': 'Glas & beglazing', '16': 'Trappen & bordessen', '17': 'Binnenwanden',
  '18': 'Plafonds', '19': 'Vloeren & dekvloeren', '20': 'Tegelwerk',
  '21': 'Stukadoorswerk', '22': 'Schilderwerk', '23': 'Isolatie & thermiek',
  '24': 'Installatiewerk', '25': 'Elektrotechniek', '26': 'Ventilatie & luchtbehandeling',
  '27': 'Sanitair', '28': 'Verwarming', '29': 'Sprinkler & brandveiligheid',
  '30': 'Terrein & buitenruimte', '31': 'Hekwerk & terreinvoorzieningen',
  '32': 'Afwatering & riolering', 'K0': 'Keuken',
};

// Geordende hoofdstuk-set per projecttype (volgorde = bouwvolgorde/werktafelvolgorde).
// Nieuwbouw = de volledige minimale set uit P5-D, op DB-codes:
//   Algemeen, Voorbereiding, Sloop, Grondwerk, Fundering, Beton, Staal, Gevel,
//   Metselwerk, Gevelbekleding, Dakconstructie, Dakbedekking, Dakopeningen, Kozijnen,
//   Glas, Trappen, Binnenwanden, Plafonds, Vloeren, Tegelwerk, Stukadoorswerk,
//   Schilderwerk, Isolatie, Elektra, Ventilatie, Sanitair, Verwarming, Brandveiligheid,
//   Keuken, Terrein, Riolering.
const TEMPLATES = {
  nieuwbouw: ['00','01','02','03','04','05','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','25','26','27','28','29','K0','30','32'],
  verbouw: ['00','02','07','14','15','16','17','18','19','20','21','22','23','25','26','27','28','K0','32'],
  herstel: ['00','02','08','09','11','12','14','22','23'],
  transformatie: ['00','01','02','03','08','09','11','12','14','15','16','17','18','19','20','21','22','23','25','26','27','28','29','K0','30','32'],
  aanbouw: ['00','01','03','04','05','07','08','09','10','11','12','13','14','15','16','17','18','19','21','22','23','25','26','28','32'],
  renovatie: ['00','02','14','16','17','18','19','20','21','22','23','25','26','27','28','29','K0','32'],
  uitbreiding: ['00','01','03','04','05','07','08','09','10','11','12','13','14','15','16','17','18','19','21','22','23','25','26','28','32'],
  verduurzaming: ['00','10','11','12','14','15','23','25','26','28','29'],
  badkamer: ['00','02','17','18','20','21','23','25','26','27','28'],
  woning: ['00','02','14','16','17','18','19','20','21','22','23','25','26','27','28','K0','32'],
  appartementencomplex: ['00','01','02','03','04','05','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','25','26','27','28','29','K0','30','31','32'],
};

// Kritieke domeinen die in een complete offerte aanwezig én gevuld horen te zijn.
// Gebruikt door de volledigheidscheck (P5-J): ontbreken hiervan = expliciete waarschuwing.
const KRITIEKE_DOMEINEN = {
  nieuwbouw: ['00','04','11','14','25','26','27','28','29','K0'],
  verbouw: ['00','02','25','28'],
  herstel: ['00'],
  transformatie: ['00','14','25','26','27','28','29','K0'],
  aanbouw: ['00','04','11','14','25','28'],
  renovatie: ['00','25','27','28'],
  uitbreiding: ['00','04','11','14','25','28'],
  verduurzaming: ['00','23','25','26','28'],
  badkamer: ['00','20','23','25','27','28'],
  woning: ['00','25','27','28','K0'],
  appartementencomplex: ['00','04','11','14','25','26','27','28','29','K0'],
};

// Geeft de geordende lijst hoofdstuk-codes voor een projecttype.
export function templateVoor(projecttype) {
  return TEMPLATES[projecttype] || TEMPLATES.nieuwbouw;
}

// Geeft de kritieke domeinen (codes) voor de volledigheidscheck.
export function kritiekeDomeinen(projecttype) {
  return KRITIEKE_DOMEINEN[projecttype] || KRITIEKE_DOMEINEN.nieuwbouw;
}

export function isGeldigProjecttype(pt) {
  return !!TEMPLATES[pt];
}
