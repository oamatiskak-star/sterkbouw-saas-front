// lib/calc/sterkcalc/portaalAdapter.js — zet de werktafel (chapters + rows) om naar de invoer van de centrale SterkCalc-planner.
// Schaduwmodus (I-6): de bestaande planningEngine blijft leidend voor planning, bestellen en rapportage.
// - Categorie → STABU-planningshoofdstuk uitsluitend via de centrale mapping (lib/sterkcalc-kennis/portaal_categorie_stabu.json,
//   status kandidaat). Categorieën zonder STABU-hoofdstuk → groep 'ONGEMAPT-<code>' (uren tellen mee, geen volgorderegels).
// - Regelcode = row.id (uniek); uren via dezelfde urenVanRow als de bestaande planning, met herkomstlabel:
//   'norm' (norm × hoeveelheid) of 'afgeleid' (arbeidskosten ÷ uurtarief uit de planningconfig, standaard € 45 — zichtbaar, niet
//   gelijkgetrokken met andere tarieven). Er worden geen prijzen, tarieven of opslagen gewijzigd of gebruikt in de planner.
import mapping from '@/lib/sterkcalc-kennis/portaal_categorie_stabu.json';
import kennis from '@/lib/sterkcalc-kennis/kennisregels.json';
import bron from '@/lib/sterkcalc-kennis/BRON.json';
import { computeRow } from '@/lib/calc/werktafelTotals';
import { urenVanRow } from '@/lib/calc/planningEngine';
import { conceptUitInvoer, canoniek } from '@/lib/calc/sterkcalc/planner.mjs';

const PER_CAT = Object.fromEntries(mapping.categorieen.map((c) => [c.categorie, c]));
const catCode = (ch) => (ch?.code || '').toString().padStart(2, '0');

export function invoerUitWerktafel(chapters, rows, config = {}) {
  const uurtarief = Number(config.uurtarief) || 45;
  const groepen = new Map(), regels = [], herkomst = { norm: 0, afgeleid: 0 }, ongemapt = {};
  for (const ch of chapters || []) {
    const cat = PER_CAT[catCode(ch)];
    const groep = cat ? cat.planner_groep : `ONGEMAPT-${catCode(ch)}`;
    if (!groepen.has(groep)) groepen.set(groep, cat?.planning_hoofdstuk ? `${cat.planning_hoofdstuk} (via ${cat.naam})` : (cat?.naam || ch.naam || groep));
    for (const r of (rows || []).filter((x) => x.chapter_id === ch.id)) {
      const norm = computeRow(r).uren > 0;
      const uren = urenVanRow(r, uurtarief);
      if (!(uren > 0)) continue;
      const u4 = (Math.round(uren * 1e4) / 1e4).toFixed(4);
      herkomst[norm ? 'norm' : 'afgeleid'] += Number(u4);
      if (groep.startsWith('ONGEMAPT-')) ongemapt[groep] = (ongemapt[groep] || 0) + Number(u4);
      regels.push({ code: String(r.id), hoofdstuk: groep, omschrijving: r.omschrijving || '', uren: u4 });
    }
  }
  const sorteer = (a, b) => (a.startsWith('ONGEMAPT') - b.startsWith('ONGEMAPT')) || a.localeCompare(b, 'nl', { numeric: true });
  const hoofdstukken = [...groepen.keys()].sort(sorteer).map((code) => ({ code, naam: groepen.get(code) }));
  const ploeg = String(Math.max(1, Math.round(Number(config.monteurs) || 2)));
  return { invoer: { ploeg, capaciteit: ploeg, hoofdstukken, regels }, herkomst, ongemapt, uurtarief };
}

// Schaduwresultaat: ALLEEN goedgekeurde/vastgestelde kennisregels (kandidaten inactief).
export function schaduwPlanning(chapters, rows, config = {}) {
  const { invoer, herkomst, ongemapt, uurtarief } = invoerUitWerktafel(chapters, rows, config);
  const res = conceptUitInvoer(invoer, kennis, { kandidaten: false });
  const c = canoniek(res);
  return { canoniek: c, herkomst, ongemapt, uurtarief, bron: { commit: bron.commit, kennis_sha256: bron.bestanden['kennisregels.json'].sha256 },
    mappingStatus: mapping.status };
}
