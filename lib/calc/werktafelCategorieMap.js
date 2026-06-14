// lib/calc/werktafelCategorieMap.js
// De 44 werktafel-categorieën (00–42 + A0) zijn de ZICHTBARE indeling.
// Daaronder mappen ze naar de officiële STABU-hoofdstukken (seed in stabu_posten)
// als prijzen-/postenbron. Administratieve categorieën hebben geen STABU-mapping.

export const CATEGORIE_STABU = {
  '00': [], // Algemeen
  '01': [], // Voorbereiding (bouwplaatsvoorz. niet geseed)
  '02': ['10'], // Sloopwerk
  '03': ['12'], // Grondwerk
  '04': ['20', '21'], // Fundering & grondwerk
  '05': ['21'], // Betonwerk (vloeren/constructies)
  '06': ['21'], // Betonwerken (wanden/kolommen/balken)
  '07': ['25'], // Staalskelet & constructie
  '08': ['22', '23'], // Gevel & buitenwand
  '09': ['22', '36'], // Metselwerk
  '10': ['31'], // Gevelbekleding
  '11': ['24'], // Dakconstructie
  '12': ['33', '50'], // Dakbedekking
  '13': ['34'], // Dakopeningen & lichtstraten
  '14': ['30'], // Ramen, deuren & kozijnen
  '15': ['34'], // Glas & beglazing
  '16': ['32'], // Trappen & bordessen
  '17': ['44'], // Binnenwanden
  '18': ['44'], // Plafonds
  '19': ['42', '48'], // Vloeren & dekvloeren
  '20': ['41'], // Tegelwerk
  '21': ['40'], // Stukadoorswerk
  '22': ['46'], // Schilderwerk
  '23': ['37'], // Isolatie & thermiek
  '24': ['60', '61', '52'], // Installatiewerk (werktuigbouw)
  '25': ['70', '75'], // Elektrotechniek
  '26': ['61', '62'], // Ventilatie & luchtbehandeling
  '27': ['53', '51', '52'], // Sanitair
  '28': ['60', '55'], // Verwarming
  '29': ['54'], // Sprinkler & brandveiligheid
  '30': ['15', '16', '17'], // Terrein & buitenruimte
  '31': ['17'], // Hekwerk & terreinvoorzieningen
  '32': ['14', '50'], // Afwatering & riolering
  '33': [], // Tijdelijke voorzieningen
  '34': ['82', '83'], // Transport & hijswerk
  '35': [], // Materieel
  '36': [], // Arbeid & uren
  '37': [], // Materialen & toebehoren
  '38': [], // Kosten & prijzen
  '39': [], // Risico's & kwaliteit
  '40': [], // Onderaanneming
  '41': [], // Documenten & bijlagen
  '42': [], // Planning & fasering
  A0: [], // Instellingen
};

export function stabuHoofdstukkenVoor(code) {
  return CATEGORIE_STABU[code] || [];
}

let _cache = null;
// Laadt het rechtenvrije tegel-manifest uit public/werktafel/categories.json.
export async function loadCategorieen() {
  if (_cache) return _cache;
  const res = await fetch('/werktafel/categories.json');
  if (!res.ok) throw new Error('categories.json niet gevonden');
  const data = await res.json();
  const list = (data.categorieen || []).map((c) => ({
    ...c,
    stabu: stabuHoofdstukkenVoor(c.code),
  }));
  _cache = list;
  return list;
}

// Map code -> categorie (voor thumbnails per hoofdstuk).
export function indexByCode(list) {
  const m = {};
  for (const c of list || []) m[c.code] = c;
  return m;
}
