// lib/calc/volledigheidsRegels.js — P7.3 AI-volledigheidscontrole op OBJECTREGELS.
// Een calculator controleert niet "is hoofdstuk 26 gevuld?" maar "heeft mijn badkamer
// ventilatie?". Deze regels redeneren over objecten (ruimtes) en projecttype, en signaleren
// (niet blokkeren) ontbrekende essentiële onderdelen vóór de offerte.

const WONING_TYPES = ['nieuwbouw', 'woning', 'transformatie', 'renovatie', 'appartementencomplex', 'uitbreiding', 'verduurzaming'];

// Elke regel: voorwaarde (wanneer relevant) + eis (wat moet aanwezig zijn in de werktafel).
// ctx = { projecttype, objecten:Set, cats:Set, subs:Set }
const REGELS = [
  {
    id: 'badkamer-ventilatie', ernst: 'hoog', titel: 'Badkamer zonder ventilatie',
    advies: 'Voeg mechanische ventilatie of WTW toe aan de badkamer.',
    relevant: (c) => c.objecten.has('badkamer'),
    voldaan: (c) => c.cats.has('26'),
  },
  {
    id: 'badkamer-sanitair', ernst: 'hoog', titel: 'Badkamer zonder sanitair',
    advies: 'Voeg douche/wastafel/toilet toe aan de badkamer.',
    relevant: (c) => c.objecten.has('badkamer'),
    voldaan: (c) => c.cats.has('27'),
  },
  {
    id: 'keuken-apparatuur', ernst: 'hoog', titel: 'Keuken zonder apparatuur',
    advies: 'Voeg inbouwapparatuur toe aan de keuken.',
    relevant: (c) => c.objecten.has('keuken'),
    voldaan: (c) => c.subs.has('K0.02'),
  },
  {
    id: 'woning-verwarming', ernst: 'hoog', titel: 'Woning zonder verwarming',
    advies: 'Voeg een verwarmingsinstallatie toe (CV, warmtepomp of radiatoren).',
    relevant: (c) => WONING_TYPES.includes(c.projecttype),
    voldaan: (c) => c.cats.has('28'),
  },
  {
    id: 'woning-meterkast', ernst: 'middel', titel: 'Woning zonder meterkast',
    advies: 'Voeg een meterkast/groepenkast toe.',
    relevant: (c) => WONING_TYPES.includes(c.projecttype),
    voldaan: (c) => c.subs.has('25.01') || c.subs.has('25.02'),
  },
  {
    id: 'woning-ventilatie', ernst: 'middel', titel: 'Woning zonder ventilatie',
    advies: 'Voeg een ventilatiesysteem toe (mechanisch of WTW).',
    relevant: (c) => WONING_TYPES.includes(c.projecttype),
    voldaan: (c) => c.cats.has('26'),
  },
  {
    id: 'transformatie-brand', ernst: 'hoog', titel: 'Transformatie zonder brandwerendheid',
    advies: 'Voeg brandveiligheid/sprinkler toe — bij transformatie vrijwel altijd vereist.',
    relevant: (c) => c.projecttype === 'transformatie' || c.projecttype === 'appartementencomplex',
    voldaan: (c) => c.cats.has('29'),
  },
];

// Evalueert alle regels en geeft de OVERTREDINGEN terug (relevant én niet voldaan).
export function evalueerObjectRegels(ctx) {
  const c = {
    projecttype: (ctx.projecttype || 'nieuwbouw').toString().toLowerCase(),
    objecten: ctx.objecten instanceof Set ? ctx.objecten : new Set(ctx.objecten || []),
    cats: ctx.cats instanceof Set ? ctx.cats : new Set(ctx.cats || []),
    subs: ctx.subs instanceof Set ? ctx.subs : new Set(ctx.subs || []),
  };
  return REGELS.filter((r) => r.relevant(c) && !r.voldaan(c)).map((r) => ({ id: r.id, ernst: r.ernst, titel: r.titel, advies: r.advies }));
}
