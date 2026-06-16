// lib/calc/rekenmodellen/terrein.js — TerreinModel (P2.3).
// Terreininrichting/bestrating/grondwerk/groen/hekwerk/buitenverlichting — bij nieuwbouw
// standaard vergeten. Objectgedreven met de bestaande terrein- en hekwerkcombi's.
import { num, round, ja } from './_helpers';

const VERHARDING = { bestrating: 'CB-TERREIN', terras: 'CUR-3002', oprit: 'C3-3003', grind: 'C3-3012' };
const HEK = { schutting: 'CUR-3008', sierhek: 'C3-3102', gaashek: 'C3-3103', afscheiding: 'C3-3107' };

const TerreinModel = {
  object: 'terrein',
  label: 'Terrein & buitenruimte',
  output: ['grondwerk terrein', 'verharding', 'hekwerk', 'poorten', 'buitenverlichting', 'beplanting', 'keerwand', 'drainage'],
  inputs: [
    { key: 'verharding_m2', label: 'Verharding', type: 'number', eenheid: 'm²', default: 120, groep: 'maat' },
    { key: 'groen_m2', label: 'Groen/beplanting', type: 'number', eenheid: 'm²', default: 60, groep: 'maat' },
    { key: 'verhardingstype', label: 'Verhardingstype', type: 'choice', default: 'bestrating', groep: 'basis', opties: [['bestrating', 'Bestrating'], ['terras', 'Terras'], ['oprit', 'Oprit'], ['grind', 'Grind']] },
    { key: 'hekwerk', label: 'Erfafscheiding', type: 'choice', default: 'schutting', groep: 'basis', opties: [['geen', 'Geen'], ['schutting', 'Schutting'], ['sierhek', 'Sierhekwerk'], ['gaashek', 'Gaashekwerk']] },
    { key: 'buitenverlichting', label: 'Buitenverlichting', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [
    { key: 'grondwerk_m2', label: 'Grondwerk terrein (m²)', type: 'number', default: 0 },
    { key: 'hek_m', label: 'Erfafscheiding (m¹)', type: 'number', default: 40 },
    { key: 'poorten', label: 'Poorten', type: 'number', default: 1 },
    { key: 'verlichting_aantal', label: 'Lichtpunten buiten', type: 'number', default: 4 },
    { key: 'keerwand_m', label: 'Keerwand (m¹)', type: 'number', default: 0 },
    { key: 'drainage_m', label: 'Drainage (m¹)', type: 'number', default: 0 },
  ],
  defaults: {},

  bereken(v) {
    const verh = num(v.verharding_m2, 120);
    const groen = num(v.groen_m2, 60);
    const grond = num(v.grondwerk_m2, 0) || verh;
    const regels = [];
    if (grond > 0) regels.push({ combiCode: 'C3-3005', hoeveelheid: round(grond), omschrijving: 'Grondwerk terrein' });
    if (verh > 0) regels.push({ combiCode: VERHARDING[v.verhardingstype] || 'CB-TERREIN', hoeveelheid: round(verh), omschrijving: `Verharding (${v.verhardingstype})` });
    if (v.hekwerk !== 'geen') { const m = num(v.hek_m, 40); if (m > 0) regels.push({ combiCode: HEK[v.hekwerk] || 'CUR-3008', hoeveelheid: round(m), omschrijving: `Erfafscheiding (${v.hekwerk})` }); }
    const poorten = Math.max(0, Math.round(num(v.poorten, 1)));
    if (poorten > 0) regels.push({ combiCode: 'C3-3104', hoeveelheid: poorten, omschrijving: 'Poorten' });
    if (ja(v.buitenverlichting)) { const n = Math.max(1, Math.round(num(v.verlichting_aantal, 4))); regels.push({ combiCode: 'C3-3010', hoeveelheid: n, omschrijving: 'Buitenverlichting' }); }
    if (groen > 0) regels.push({ combiCode: 'C3-3007', hoeveelheid: round(groen), omschrijving: 'Beplanting' });
    const keer = num(v.keerwand_m, 0); if (keer > 0) regels.push({ combiCode: 'C3-3009', hoeveelheid: round(keer), omschrijving: 'Keerwand tuin' });
    const drain = num(v.drainage_m, 0); if (drain > 0) regels.push({ combiCode: 'C3-3011', hoeveelheid: round(drain), omschrijving: 'Drainage terrein' });

    return {
      hoeveelheden: { verharding_m2: round(verh), groen_m2: round(groen) },
      regels,
      samenvatting: [{ label: 'Verharding', waarde: round(verh), eenheid: 'm²' }, { label: 'Groen', waarde: round(groen), eenheid: 'm²' }],
    };
  },
};
export default TerreinModel;
