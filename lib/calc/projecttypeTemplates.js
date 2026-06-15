// lib/calc/projecttypeTemplates.js
// P4 — projecttype-templates: per projecttype een basisstructuur (hoofdstukken + subhoofdstukken)
// zodat de werktafel nooit leeg start. Sub-codes = echte subcategorie-codes → combi-routing klopt.
// Namen worden bij instantiatie uit de DB gehaald (sterkcalc_visual_categories/subcategories).

export const PROJECTTYPE_LABELS = {
  nieuwbouw: 'Nieuwbouw',
  renovatie: 'Renovatie',
  transformatie: 'Transformatie',
  uitbreiding: 'Uitbreiding',
  verduurzaming: 'Verduurzaming',
  badkamer: 'Badkamer renovatie',
  woning: 'Woning renovatie',
  appartementencomplex: 'Appartementencomplex',
};

// Standaard subhoofdstuk-codes per hoofdstukcategorie (echte subcategorieën, met combi-dekking).
const CAT_SUBS = {
  '00': ['01', '02', '03', '04'],
  '01': ['01', '06', '07', '10', '11'],
  '02': ['01', '03', '06', '07', '14'],
  '03': ['01', '02', '04', '06'],
  '04': ['01', '03', '04', '10'],
  '05': ['01', '02', '03', '05'],
  '07': ['01', '02', '14'],
  '08': ['01', '02', '07', '09'],
  '09': ['01', '02', '03', '04'],
  '10': ['01', '02', '08'],
  '11': ['01', '02', '04', '10'],
  '12': ['01', '02', '04', '10', '11'],
  '14': ['01', '02', '03', '04', '05', '08'],
  '15': ['01', '02', '03'],
  '17': ['01', '02', '03', '06'],
  '18': ['01', '02', '04', '06'],
  '19': ['01', '02', '03', '05', '09'],
  '20': ['01', '02', '03', '04'],
  '21': ['01', '02', '14'],
  '22': ['01', '02', '06'],
  '23': ['01', '02', '03', '04'],
  '24': ['01', '02', '04', '08'],
  '25': ['01', '02', '03', '04', '05'],
  '26': ['01', '02', '03', '04'],
  '27': ['01', '02', '03', '04', '05', '06'],
  '28': ['01', '02', '03', '04'],
  '29': ['01', '03', '05', '06'],
  '30': ['01', '02', '08'],
  '31': ['02', '03', '04'],
  '32': ['01', '02', '04', '06'],
  '36': ['01', '02', '03'],
};

// Hoofdstuk-codes per projecttype (volgorde = werktafel-volgorde).
const TEMPLATES = {
  nieuwbouw: ['00', '03', '04', '05', '07', '09', '10', '11', '12', '14', '15', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '36'],
  transformatie: ['00', '02', '03', '04', '07', '09', '14', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '36'],
  renovatie: ['00', '02', '14', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '36'],
  uitbreiding: ['00', '01', '03', '04', '05', '07', '09', '10', '11', '12', '14', '17', '18', '19', '21', '22', '24', '25', '28', '36'],
  verduurzaming: ['00', '10', '11', '12', '23', '24', '25', '26', '28', '36'],
  badkamer: ['00', '02', '20', '21', '22', '24', '25', '26', '27', '28'],
  woning: ['00', '02', '14', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '36'],
  appartementencomplex: ['00', '01', '02', '03', '04', '05', '07', '09', '10', '11', '12', '14', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '36'],
};

// Geeft de structuur als [{cat, subs:[..]}] voor een projecttype.
export function templateVoor(projecttype) {
  const cats = TEMPLATES[projecttype] || TEMPLATES.nieuwbouw;
  return cats.map((cat) => ({ cat, subs: CAT_SUBS[cat] || [] }));
}

export function isGeldigProjecttype(pt) {
  return !!TEMPLATES[pt];
}
