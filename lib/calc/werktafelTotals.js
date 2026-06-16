// lib/calc/werktafelTotals.js
// Pure rekenmodule voor de Calculatie Werktafel.
// HARDE REGEL: totalen worden uit de onderliggende componenten berekend,
// niet alleen uit de hoofdregel. Een combi-regel aggregeert zijn componenten.

import { normalizeOpslagen } from './fixedPriceRules';

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};

// Centrale prijsfactor uit de calculatie-instellingen (user-controlled).
// De regiofactor (regionale prijsafwijking) wordt als TRANSPARANTE reken-tijd-
// multiplier op alle regelprijzen toegepast; de bronprijzen (curated kengetallen
// en componenten) blijven onaangeroerd → provenance blijft behouden en de factor
// is op elk moment aanpasbaar zonder de combi-/STABU-data te herschrijven.
// Dit is het ENIGE punt waar prijsdrift binnenkomt: prijspeil-indexering hangt
// hier later additief onder (regiofactor × prijspeilfactor).
export function priceFactor(opslagen) {
  const rf = parseFloat(opslagen?.regiofactor);
  return Number.isFinite(rf) && rf > 0 ? rf : 1;
}

// Per-eenheid prijzen van één regel, geschaald met de prijsfactor (default 1).
// Voor een combi-regel = som van de componenten (per 1 eenheid combi).
// Voor een gewone regel = de eigen prijsvelden.
export function rowUnitPrices(row, factor = 1) {
  const f = Number.isFinite(factor) && factor > 0 ? factor : 1;
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
    return { materiaalprijs: mat * f, arbeidsprijs: arb * f, materieelprijs: mtl * f };
  }
  return {
    materiaalprijs: n(row.materiaalprijs) * f,
    arbeidsprijs: n(row.arbeidsprijs) * f,
    materieelprijs: n(row.materieelprijs) * f,
  };
}

// Volledige afgeleide bedragen van één regel. `factor` = regio-/prijsfactor
// (uren blijven factor-onafhankelijk: dat is tijd, geen prijs).
export function computeRow(row, factor = 1) {
  const up = rowUnitPrices(row, factor);
  const hoeveelheid = n(row.hoeveelheid);
  const materiaal = hoeveelheid * up.materiaalprijs;
  const arbeid = hoeveelheid * up.arbeidsprijs;
  const materieel = hoeveelheid * up.materieelprijs;
  const kostprijs_eenheid = up.materiaalprijs + up.arbeidsprijs + up.materieelprijs;
  const kostprijs = materiaal + arbeid + materieel;
  const opslag = n(row.opslag_perc);
  const verkoopprijs = kostprijs * (1 + opslag / 100);
  const uren = n(row.norm) * hoeveelheid;
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
  const factor = priceFactor(opslagenRaw); // regiofactor zit niet in normalizeOpslagen
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
