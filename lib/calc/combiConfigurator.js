// lib/calc/combiConfigurator.js
// Parametrische combi-configurator: maten → oppervlakten → hoeveelheid.
// Geen mockdata: prijzen komen uit de combi-componenten (afgeleid van stabu_posten).

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};

// Oppervlakten uit ruimtematen (meters) + openingen (m²).
export function berekenRuimte({ lengte, breedte, hoogte }, openingen = []) {
  const l = n(lengte), b = n(breedte), h = n(hoogte);
  const vloer = l * b;
  const plafond = l * b;
  const wand_bruto = 2 * (l + b) * h;
  const openingen_m2 = (openingen || []).reduce((s, o) => s + (n(o.breedte) / 1000) * (n(o.hoogte) / 1000) * (n(o.aantal) || 1), 0);
  const wand_netto = Math.max(0, wand_bruto - openingen_m2);
  return {
    vloer: round1(vloer),
    plafond: round1(plafond),
    wand_bruto: round1(wand_bruto),
    openingen_m2: round1(openingen_m2),
    wand_netto: round1(wand_netto),
  };
}

// Kostprijs per 1 eenheid combi (som componenten).
export function combiUnitKost(components) {
  return (components || []).reduce(
    (s, c) => s + n(c.hoeveelheid_per_eenheid) * (n(c.materiaalprijs) + n(c.arbeidsprijs) + n(c.materieelprijs)),
    0
  );
}

// Bepaalt de combi-hoeveelheid uit de maten op basis van de driver/eenheid.
// driver: 'wand' | 'vloer' | 'plafond' | 'stuk'
export function combiHoeveelheid(combi, opp, driver) {
  const eenheid = (combi?.eenheid || '').toLowerCase();
  if (driver === 'stuk' || eenheid === 'st' || eenheid === 'stk' || eenheid === 'set') return 1;
  if (driver === 'vloer') return opp.vloer;
  if (driver === 'plafond') return opp.plafond;
  // default voor m²-combi's: netto wandoppervlak
  return opp.wand_netto;
}

// Realtime regels (per component × combi-hoeveelheid).
export function configureerRegels(components, hoeveelheid) {
  const q = n(hoeveelheid);
  return (components || []).map((c) => {
    const perEenheid = n(c.materiaalprijs) + n(c.arbeidsprijs) + n(c.materieelprijs);
    const hoev = n(c.hoeveelheid_per_eenheid) * q;
    return { ...c, hoeveelheid_totaal: round2(hoev), totaal: round2(hoev * perEenheid) };
  });
}

const round1 = (v) => Math.round(n(v) * 10) / 10;
const round2 = (v) => Math.round(n(v) * 100) / 100;

export const DRIVERS = [
  { key: 'wand', label: 'Wandoppervlak (netto)' },
  { key: 'vloer', label: 'Vloeroppervlak' },
  { key: 'plafond', label: 'Plafondoppervlak' },
  { key: 'stuk', label: 'Per stuk (1×)' },
];
