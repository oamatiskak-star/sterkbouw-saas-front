// lib/calc/objectEngine.js — OBJECTGEDREVEN CALCULEREN (geen nieuwe engine; herorganisatie).
// Keten: RUIMTE → OBJECT → KEUZE → COMBI → COMPONENT → STABU.
// Een calculator denkt "wat moet ik bouwen?" en "welke keuzes maakt de klant?" — niet
// "welke combi/STABU?". Deze config zet per ruimte standaard objecten klaar (nooit leeg) en
// vertaalt maximaal 3 keuzes per object naar BESTAANDE, actieve combi's met hoeveelheden.
// STABU blijft de waarheid (in de combi-componenten), maar is geen invoer-interface.

// ---- Ruimte-type herkennen uit AI-klasse/naam ----
const TYPE_SYNONIEMEN = [
  ['badkamer', ['badkamer', 'bathroom', 'natte cel', 'doucheruimte', 'wasruimte']],
  ['toilet', ['toilet', 'wc', 'gastentoilet']],
  ['keuken', ['keuken', 'kitchen', 'kookruimte']],
  ['meterkast', ['meterkast', 'meterruimte']],
  ['technisch', ['cv', 'technische ruimte', 'installatieruimte', 'wtw-ruimte', 'berging-techniek']],
];
export function ruimteType(klasseOfNaam) {
  const s = (klasseOfNaam || '').toString().toLowerCase();
  for (const [type, woorden] of TYPE_SYNONIEMEN) if (woorden.some((w) => s.includes(w))) return type;
  return 'woonruimte'; // generieke afwerking + elektra
}

// ---- Maatvoering afleiden uit ruimte (zelfstandig, geen externe afhankelijkheid) ----
export function ruimteMaten(ruimte = {}) {
  const L = Number(ruimte.lengte) > 0 ? Number(ruimte.lengte) : 2.5;
  const B = Number(ruimte.breedte) > 0 ? Number(ruimte.breedte) : 2.5;
  const H = Number(ruimte.hoogte) > 0 ? Number(ruimte.hoogte) : 2.6;
  const vloer = round2(L * B);
  const omtrek = round2(2 * (L + B));
  const wand = round2(omtrek * H * 0.85); // 15% aftrek voor openingen/deuren
  return { lengte: L, breedte: B, hoogte: H, vloer, omtrek, plafond: vloer, wand };
}
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const max1 = (n) => Math.max(1, Math.round(Number(n) || 0));

// Helper: keuze-optie definitie
const opt = (v, label) => ({ v, label });

// ============================================================================
// OBJECT-TEMPLATES PER RUIMTE-TYPE
// Elk object: { key, naam, keuzes:[{key,label,opties,default}], resolve(vals, m) → [{combiCode, hoeveelheid, omschrijving}] }
// Max 3 keuzes per object (UX-regel). resolve gebruikt alléén bestaande combi-codes.
// ============================================================================

const BADKAMER = [
  {
    key: 'tegelwerk', naam: 'Tegelwerk',
    keuzes: [
      { key: 'wand', label: 'Wandtegels', default: '600x600', opties: [opt('300x600', '300×600'), opt('600x600', '600×600'), opt('1200x600', '1200×600')] },
      { key: 'vloer', label: 'Vloertegels', default: '600x600', opties: [opt('600x600', '600×600'), opt('800x800', '800×800')] },
      { key: 'voeg', label: 'Voeg', default: 'normaal', opties: [opt('normaal', 'Normaal'), opt('epoxy', 'Epoxy')] },
    ],
    resolve: (v, m) => {
      const out = [];
      out.push({ combiCode: v.wand === '300x600' ? 'CUR-2001' : 'C3-2001A', hoeveelheid: m.wand, omschrijving: `Wandtegels ${v.wand}` });
      out.push({ combiCode: v.vloer === '600x600' ? 'CUR-2002' : 'C3-2002A', hoeveelheid: m.vloer, omschrijving: `Vloertegels ${v.vloer}` });
      out.push({ combiCode: 'C3-2012', hoeveelheid: m.vloer, omschrijving: 'Waterdichting (smeerfolie)' });
      if (v.voeg === 'epoxy') out.push({ combiCode: 'C3-2009', hoeveelheid: round2(m.wand + m.vloer), omschrijving: 'Epoxy voegwerk' });
      return out;
    },
  },
  {
    key: 'sanitair', naam: 'Sanitair',
    keuzes: [
      { key: 'douche', label: 'Douche', default: 'inloop', opties: [opt('inloop', 'Inloop'), opt('cabine', 'Cabine')] },
      { key: 'wastafel', label: 'Wastafel', default: 'enkel', opties: [opt('enkel', 'Enkel'), opt('dubbel', 'Dubbel')] },
      { key: 'wc', label: 'Toilet', default: 'hang', opties: [opt('hang', 'Hangend'), opt('staand', 'Staand')] },
    ],
    resolve: (v) => [
      { combiCode: 'CUR-2703', hoeveelheid: 1, omschrijving: `Douche (${v.douche})` },
      { combiCode: 'CUR-2704', hoeveelheid: v.wastafel === 'dubbel' ? 2 : 1, omschrijving: `Wastafel (${v.wastafel})` },
      { combiCode: 'CUR-2701', hoeveelheid: 1, omschrijving: `Toilet (${v.wc})` },
    ],
  },
  {
    key: 'bad', naam: 'Bad',
    keuzes: [{ key: 'bad', label: 'Ligbad', default: 'nee', opties: [opt('nee', 'Geen'), opt('ja', 'Ja')] }],
    resolve: (v) => (v.bad === 'ja' ? [{ combiCode: 'CUR-2705', hoeveelheid: 1, omschrijving: 'Ligbad' }] : []),
  },
  {
    key: 'verwarming', naam: 'Verwarming',
    keuzes: [{ key: 'type', label: 'Type', default: 'radiator', opties: [opt('radiator', 'Designradiator'), opt('vloer', 'Vloerverwarming'), opt('geen', 'Geen')] }],
    resolve: (v, m) => {
      if (v.type === 'vloer') return [{ combiCode: 'CUR-2804', hoeveelheid: m.vloer, omschrijving: 'Vloerverwarming' }];
      if (v.type === 'radiator') return [{ combiCode: 'CUR-2803', hoeveelheid: 1, omschrijving: 'Designradiator' }];
      return [];
    },
  },
  {
    key: 'ventilatie', naam: 'Ventilatie',
    keuzes: [{ key: 'type', label: 'Type', default: 'mechanisch', opties: [opt('mechanisch', 'Mechanisch'), opt('wtw', 'WTW')] }],
    resolve: (v) => [{ combiCode: v.type === 'wtw' ? 'CUR-2602' : 'CUR-2601', hoeveelheid: 1, omschrijving: `Ventilatie (${v.type})` }],
  },
  {
    key: 'elektra', naam: 'Elektra',
    keuzes: [{ key: 'niveau', label: 'Niveau', default: 'basis', opties: [opt('basis', 'Basis'), opt('uitgebreid', 'Uitgebreid')] }],
    resolve: (v) => {
      const f = v.niveau === 'uitgebreid' ? 2 : 1;
      return [
        { combiCode: 'CUR-2505', hoeveelheid: 1 * f, omschrijving: 'Lichtpunt' },
        { combiCode: 'CUR-2503', hoeveelheid: 2 * f, omschrijving: 'Wandcontactdoos' },
      ];
    },
  },
];

const KEUKEN = [
  {
    key: 'keukenblok', naam: 'Keukenblok',
    keuzes: [{ key: 'niveau', label: 'Niveau', default: 'standaard', opties: [opt('basis', 'Basis'), opt('standaard', 'Standaard'), opt('premium', 'Premium')] }],
    resolve: (v) => [{ combiCode: v.niveau === 'basis' ? 'CUR-2051' : 'CUR-2052', hoeveelheid: 1, omschrijving: `Keukenblok (${v.niveau})` }],
  },
  {
    key: 'apparatuur', naam: 'Apparatuur',
    keuzes: [{ key: 'pakket', label: 'Pakket', default: 'volledig', opties: [opt('geen', 'Geen'), opt('basis', 'Basis'), opt('volledig', 'Volledig')] }],
    resolve: (v) => (v.pakket === 'geen' ? [] : [{ combiCode: 'P5-K002', hoeveelheid: 1, omschrijving: `Inbouwapparatuur (${v.pakket})` }]),
  },
  {
    key: 'werkblad', naam: 'Werkblad',
    keuzes: [
      { key: 'materiaal', label: 'Materiaal', default: 'composiet', opties: [opt('kunststof', 'Kunststof'), opt('composiet', 'Composiet'), opt('steen', 'Natuursteen')] },
      { key: 'lengte', label: 'Lengte', default: '4', opties: [opt('3', '3 m'), opt('4', '4 m'), opt('5', '5 m')] },
    ],
    resolve: (v) => [{ combiCode: 'P5-K003', hoeveelheid: Number(v.lengte) || 4, omschrijving: `Werkblad ${v.materiaal}` }],
  },
  {
    key: 'water', naam: 'Water & afvoer',
    keuzes: [{ key: 'spoelbak', label: 'Spoelbak', default: '1', opties: [opt('1', '1'), opt('1.5', '1,5'), opt('2', '2')] }],
    resolve: (v) => [
      { combiCode: 'CUR-2053', hoeveelheid: 1, omschrijving: 'Keukenaansluiting (water/afvoer)' },
      { combiCode: 'P5-K004', hoeveelheid: Number(v.spoelbak) >= 2 ? 2 : 1, omschrijving: 'Spoelbak' },
      { combiCode: 'P5-K005', hoeveelheid: 1, omschrijving: 'Keukenkraan' },
    ],
  },
  {
    key: 'elektra', naam: 'Elektra',
    keuzes: [{ key: 'niveau', label: 'Niveau', default: 'standaard', opties: [opt('standaard', 'Standaard'), opt('uitgebreid', 'Uitgebreid')] }],
    resolve: (v) => {
      const wcd = v.niveau === 'uitgebreid' ? 6 : 4;
      return [
        { combiCode: 'CUR-2503', hoeveelheid: wcd, omschrijving: 'Wandcontactdozen keuken' },
        { combiCode: 'CUR-2505', hoeveelheid: 2, omschrijving: 'Lichtpunten' },
      ];
    },
  },
  {
    key: 'afwerking', naam: 'Afwerking (spatwand)',
    keuzes: [{ key: 'spatwand', label: 'Spatwand', default: 'tegel', opties: [opt('tegel', 'Tegel'), opt('geen', 'Geen')] }],
    resolve: (v) => (v.spatwand === 'geen' ? [] : [{ combiCode: 'CUR-2005', hoeveelheid: 3, omschrijving: 'Keuken spatwand tegelwerk' }]),
  },
];

const TOILET = [
  {
    key: 'tegelwerk', naam: 'Tegelwerk',
    keuzes: [{ key: 'hoogte', label: 'Tegelhoogte', default: '150', opties: [opt('120', '120 cm'), opt('150', '150 cm'), opt('plafond', 'Tot plafond')] }],
    resolve: (v, m) => {
      const h = v.hoogte === 'plafond' ? m.hoogte : Number(v.hoogte) / 100;
      return [{ combiCode: 'C3-2004', hoeveelheid: round2(m.omtrek * h * 0.85), omschrijving: `Toilet tegelwerk (${v.hoogte})` }];
    },
  },
  {
    key: 'sanitair', naam: 'Sanitair',
    keuzes: [
      { key: 'wc', label: 'Toilet', default: 'hang', opties: [opt('hang', 'Hangend'), opt('staand', 'Staand')] },
      { key: 'fontein', label: 'Fontein', default: 'ja', opties: [opt('ja', 'Ja'), opt('nee', 'Nee')] },
    ],
    resolve: (v) => {
      const out = [{ combiCode: 'CUR-2701', hoeveelheid: 1, omschrijving: `Toilet (${v.wc})` }];
      if (v.fontein === 'ja') out.push({ combiCode: 'CUR-2704', hoeveelheid: 1, omschrijving: 'Fontein' });
      return out;
    },
  },
  {
    key: 'ventilatie', naam: 'Ventilatie',
    keuzes: [{ key: 'type', label: 'Type', default: 'rooster', opties: [opt('rooster', 'Rooster'), opt('mechanisch', 'Mechanisch')] }],
    resolve: (v) => [{ combiCode: v.type === 'mechanisch' ? 'CUR-2601' : 'CUR-2604', hoeveelheid: 1, omschrijving: `Ventilatie (${v.type})` }],
  },
  {
    key: 'elektra', naam: 'Elektra',
    keuzes: [],
    resolve: () => [
      { combiCode: 'CUR-2505', hoeveelheid: 1, omschrijving: 'Lichtpunt' },
      { combiCode: 'CUR-2503', hoeveelheid: 1, omschrijving: 'Wandcontactdoos' },
    ],
  },
];

const WOONRUIMTE = [
  {
    key: 'afwerking', naam: 'Afwerking (wand & plafond)',
    keuzes: [{ key: 'wand', label: 'Wandafwerking', default: 'stuc', opties: [opt('stuc', 'Stucwerk'), opt('spack', 'Spackspuitwerk')] }],
    resolve: (v, m) => [{ combiCode: v.wand === 'spack' ? 'CUR-2105' : 'CB-STUC', hoeveelheid: round2(m.wand + m.plafond), omschrijving: 'Wand- en plafondafwerking' }],
  },
  {
    key: 'vloer', naam: 'Vloer',
    keuzes: [{ key: 'type', label: 'Afwerking', default: 'tegel', opties: [opt('tegel', 'Tegel'), opt('geen', 'Geen (kale dekvloer)')] }],
    resolve: (v, m) => (v.type === 'geen' ? [] : [{ combiCode: 'CUR-2002', hoeveelheid: m.vloer, omschrijving: 'Vloertegels' }]),
  },
  {
    key: 'elektra', naam: 'Elektra',
    keuzes: [{ key: 'niveau', label: 'Niveau', default: 'standaard', opties: [opt('standaard', 'Standaard'), opt('uitgebreid', 'Uitgebreid')] }],
    resolve: (v) => {
      const wcd = v.niveau === 'uitgebreid' ? 6 : 3;
      const lp = v.niveau === 'uitgebreid' ? 3 : 2;
      return [
        { combiCode: 'CUR-2503', hoeveelheid: wcd, omschrijving: 'Wandcontactdozen' },
        { combiCode: 'CUR-2505', hoeveelheid: lp, omschrijving: 'Lichtpunten' },
      ];
    },
  },
];

const METERKAST = [
  { key: 'meterkast', naam: 'Meterkast', keuzes: [], resolve: () => [{ combiCode: 'CUR-2501', hoeveelheid: 1, omschrijving: 'Meterkast' }] },
];
const TECHNISCH = [
  {
    key: 'verwarming', naam: 'Verwarmingsinstallatie',
    keuzes: [{ key: 'type', label: 'Systeem', default: 'cv', opties: [opt('cv', 'CV-ketel'), opt('warmtepomp', 'Warmtepomp')] }],
    resolve: (v) => [{ combiCode: v.type === 'warmtepomp' ? 'CUR-2802' : 'CB-CV', hoeveelheid: 1, omschrijving: `Verwarming (${v.type})` }],
  },
  {
    key: 'ventilatie', naam: 'Ventilatie-unit',
    keuzes: [{ key: 'type', label: 'Type', default: 'wtw', opties: [opt('wtw', 'WTW'), opt('mechanisch', 'Mechanisch')] }],
    resolve: (v) => [{ combiCode: v.type === 'wtw' ? 'CUR-2602' : 'CUR-2601', hoeveelheid: 1, omschrijving: `Ventilatie (${v.type})` }],
  },
];

export const OBJECT_TEMPLATES = {
  badkamer: BADKAMER,
  keuken: KEUKEN,
  toilet: TOILET,
  woonruimte: WOONRUIMTE,
  meterkast: METERKAST,
  technisch: TECHNISCH,
};

export const RUIMTE_TYPE_LABELS = {
  badkamer: 'Badkamer', keuken: 'Keuken', toilet: 'Toilet',
  woonruimte: 'Woonruimte', meterkast: 'Meterkast', technisch: 'Technische ruimte',
};

// Objecten (met default-keuzes ingevuld) voor een ruimte van een bepaald type.
export function objectenVoorType(type) {
  return OBJECT_TEMPLATES[type] || OBJECT_TEMPLATES.woonruimte;
}

// Default keuze-waarden voor een object.
export function defaultKeuzes(objectDef) {
  const v = {};
  for (const k of objectDef.keuzes) v[k.key] = k.default;
  return v;
}

// Resolve één object → combi-instructies (combiCode + hoeveelheid). Hoeveelheden afgerond ≥1
// voor stuk-eenheden gebeurt in de apply-laag op basis van de combi-eenheid.
export function resolveObject(objectDef, keuzeVals, maten) {
  try {
    return (objectDef.resolve(keuzeVals || defaultKeuzes(objectDef), maten) || []).filter((i) => i && i.combiCode && Number(i.hoeveelheid) > 0);
  } catch {
    return [];
  }
}

export { max1 };
