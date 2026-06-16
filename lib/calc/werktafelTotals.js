// lib/calc/werktafelTotals.js
// Pure rekenmodule voor de Calculatie Werktafel.
// HARDE REGEL: totalen worden uit de onderliggende componenten berekend,
// niet alleen uit de hoofdregel. Een combi-regel aggregeert zijn componenten.

import { normalizeOpslagen } from './fixedPriceRules';
import { prijspeilFactor, prijspeilFactorLoon, prijspeilFactorMateriaal } from './prijsindex';

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};
const pos = (v) => (Number.isFinite(v) && v > 0 ? v : 1);

// Standaard uurtarief voor het afleiden van manuren wanneer er geen norm is
// (gelijk aan planningEngine.STANDAARD_CONFIG.uurtarief). Curated combi's dragen
// geen norm-uren → uren worden afgeleid uit de (factor-onafhankelijke) arbeidskosten.
const UURTARIEF = 45;

// Centrale prijsfactor(en) uit de calculatie-instellingen (user-controlled).
// Het ENIGE punt waar prijsdrift binnenkomt:
//   factor = regiofactor (regionale prijsafwijking) × prijspeilfactor (CBS-indexering).
// Beide zijn TRANSPARANTE reken-tijd-multipliers op alle regelprijzen; de bronprijzen
// (curated kengetallen + componenten) blijven onaangeroerd → provenance blijft behouden
// en de factor is op elk moment aanpasbaar zonder de combi-/STABU-data te herschrijven.
//
// 1b: prijspeilfactor = CBS inputprijsindex bouwkosten (totaal) op de gekozen
//     prijspeildatum ÷ het basis-prijspeil.
// 1c: per kostencomponent verfijnd → materiaalprijzen volgen de CBS-materiaalindex,
//     arbeidsprijzen de loonindex, materieel de totaalindex (proxy). Zie ./prijsindex.

// Blended scalar (regio × totaal-prijspeil) — voor consumenten die één factor willen
// (bv. rapportage die de factor uit de totalen reconstrueert).
export function priceFactor(opslagen) {
  return pos(parseFloat(opslagen?.regiofactor)) * pos(prijspeilFactor(opslagen?.prijspeildatum));
}

// Per-component factoren { materiaal, arbeid, materieel } (increment 1c).
export function priceFactors(opslagen) {
  const regio = pos(parseFloat(opslagen?.regiofactor));
  const datum = opslagen?.prijspeildatum;
  return {
    materiaal: regio * pos(prijspeilFactorMateriaal(datum)),
    arbeid: regio * pos(prijspeilFactorLoon(datum)),
    materieel: regio * pos(prijspeilFactor(datum)),
  };
}

// Normaliseer een factor-argument naar { materiaal, arbeid, materieel }.
// Accepteert een getal (uniform op alle componenten) of een {materiaal,arbeid,materieel}-object.
function normFactor(factor) {
  if (factor && typeof factor === 'object') {
    return { materiaal: pos(factor.materiaal), arbeid: pos(factor.arbeid), materieel: pos(factor.materieel) };
  }
  const f = pos(factor);
  return { materiaal: f, arbeid: f, materieel: f };
}

// Per-eenheid prijzen van één regel, geschaald met de prijsfactor (default 1).
// `factor` = getal (uniform) of {materiaal,arbeid,materieel}.
// Voor een combi-regel = som van de componenten (per 1 eenheid combi).
// Voor een gewone regel = de eigen prijsvelden.
export function rowUnitPrices(row, factor = 1) {
  const F = normFactor(factor);
  const isCombi = row.type === 'combi' || row.is_combi;
  const comps = Array.isArray(row._components) ? row._components : [];
  if (isCombi && comps.length) {
    let mat = 0,
      arb = 0,
      mtl = 0;
    for (const c of comps) {
      const q = n(c.hoeveelheid);
      mat += q * n(c.materiaalprijs);
      arb += q * n(c.arbeidsprijs);
      mtl += q * n(c.materieelprijs);
    }
    return { materiaalprijs: mat * F.materiaal, arbeidsprijs: arb * F.arbeid, materieelprijs: mtl * F.materieel };
  }
  return {
    materiaalprijs: n(row.materiaalprijs) * F.materiaal,
    arbeidsprijs: n(row.arbeidsprijs) * F.arbeid,
    materieelprijs: n(row.materieelprijs) * F.materieel,
  };
}

// Volledige afgeleide bedragen van één regel. `factor` = regio-/prijsfactor
// (uren blijven factor-onafhankelijk: dat is tijd, geen prijs).
export function computeRow(row, factor = 1) {
  const F = normFactor(factor);
  const up = rowUnitPrices(row, factor);
  const hoeveelheid = n(row.hoeveelheid);
  const materiaal = hoeveelheid * up.materiaalprijs;
  const arbeid = hoeveelheid * up.arbeidsprijs;
  const materieel = hoeveelheid * up.materieelprijs;
  const kostprijs_eenheid = up.materiaalprijs + up.arbeidsprijs + up.materieelprijs;
  const kostprijs = materiaal + arbeid + materieel;
  const opslag = n(row.opslag_perc);
  const verkoopprijs = kostprijs * (1 + opslag / 100);
  // Uren: norm-gebaseerd indien aanwezig; anders afgeleid uit de FACTOR-ONAFHANKELIJKE
  // arbeidskosten ÷ uurtarief (curated combi's dragen geen norm). Tijd is factor-invariant,
  // dus deel de regiofactor uit de arbeid weer weg.
  const normUren = n(row.norm) * hoeveelheid;
  const rawArbeid = arbeid / (F.arbeid || 1);
  const uren = normUren > 0 ? normUren : rawArbeid / UURTARIEF;
  return {
    unit: up,
    hoeveelheid,
    materiaal,
    arbeid,
    materieel,
    kostprijs_eenheid,
    kostprijs,
    verkoopprijs,
    uren,
  };
}

// Calculatie-totalen over alle regels + calculatie-niveau opslagen.
export function computeTotalen(rows, opslagenRaw) {
  const op = normalizeOpslagen(opslagenRaw);
  const factor = priceFactors(opslagenRaw); // per-component (regiofactor zit niet in normalizeOpslagen)
  let materiaal = 0,
    arbeid = 0,
    materieel = 0,
    uren = 0;
  for (const r of rows || []) {
    const c = computeRow(r, factor);
    materiaal += c.materiaal;
    arbeid += c.arbeid;
    materieel += c.materieel;
    uren += c.uren;
  }
  const directe_kosten = materiaal + arbeid + materieel;
  const akBedrag = directe_kosten * (op.ak / 100);
  const abkBedrag = directe_kosten * (op.abk / 100);
  const risicoBedrag = directe_kosten * (op.risico / 100);
  const subtotaal = directe_kosten + akBedrag + abkBedrag + risicoBedrag;
  const winstBedrag = subtotaal * (op.winst / 100);
  const kostprijs = directe_kosten;
  const verkoopprijs_excl = subtotaal + winstBedrag;
  const btwBedrag = verkoopprijs_excl * (op.btw / 100);
  const verkoopprijs_incl = verkoopprijs_excl + btwBedrag;
  const marge = verkoopprijs_excl - kostprijs;
  const margePct = verkoopprijs_excl > 0 ? (marge / verkoopprijs_excl) * 100 : 0;
  return {
    opslagen: op,
    materiaal,
    arbeid,
    materieel,
    uren,
    directe_kosten,
    akBedrag,
    abkBedrag,
    risicoBedrag,
    winstBedrag,
    kostprijs,
    verkoopprijs_excl,
    btwBedrag,
    verkoopprijs_incl,
    marge,
    margePct,
  };
}

export const fmtEUR = (v) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n(v));
export const fmtNum = (v, d = 2) =>
  new Intl.NumberFormat('nl-NL', { maximumFractionDigits: d }).format(n(v));
