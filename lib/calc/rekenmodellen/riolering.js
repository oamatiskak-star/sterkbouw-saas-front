// lib/calc/rekenmodellen/riolering.js — RioleringModel (P2.3).
// Buitenriolering, hemelwaterafvoer, infiltratie en aansluiting — bij nieuwbouw standaard
// vergeten. Objectgedreven met de bestaande afwatering/riolering-combi's (cat 32).
import { num, round, ja } from './_helpers';

const RioleringModel = {
  object: 'riolering',
  label: 'Riolering & hemelwater',
  output: ['vuilwaterafvoer', 'hemelwaterafvoer', 'kolken', 'inspectieputten', 'infiltratie', 'aansluiting riool', 'pompput'],
  inputs: [
    { key: 'vuilwater_m', label: 'Vuilwaterafvoer', type: 'number', eenheid: 'm', default: 30, groep: 'maat' },
    { key: 'hwa_m', label: 'Hemelwaterafvoer', type: 'number', eenheid: 'm', default: 40, groep: 'maat' },
    { key: 'stelsel', label: 'Stelsel', type: 'choice', default: 'gescheiden', groep: 'basis', opties: [['gescheiden', 'Gescheiden'], ['gemengd', 'Gemengd']] },
    { key: 'aansluiting', label: 'Aansluiting op riool', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'infiltratie', label: 'Infiltratie (HWA)', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
  ],
  advancedInputs: [
    { key: 'kolken', label: 'Kolken', type: 'number', default: 2 },
    { key: 'putten', label: 'Inspectieputten', type: 'number', default: 2 },
    { key: 'infiltratiekratten', label: 'Infiltratiekratten', type: 'number', default: 10 },
    { key: 'ontstopping', label: 'Ontstoppingspunten', type: 'number', default: 1 },
    { key: 'pompput', label: 'Pompput', type: 'choice', default: 'nee', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
  ],
  defaults: {},

  bereken(v) {
    const vuil = num(v.vuilwater_m, 30);
    const hwa = num(v.hwa_m, 40);
    const regels = [];
    if (vuil > 0) regels.push({ combiCode: 'C3-3211', hoeveelheid: round(vuil), omschrijving: 'Vuilwaterafvoer' });
    if (hwa > 0) regels.push({ combiCode: 'CUR-3201', hoeveelheid: round(hwa), omschrijving: 'Hemelwaterafvoer' });
    const kolken = Math.max(0, Math.round(num(v.kolken, 2)));
    if (kolken > 0) regels.push({ combiCode: 'C3-3203', hoeveelheid: kolken, omschrijving: 'Kolken' });
    const putten = Math.max(0, Math.round(num(v.putten, 2)));
    if (putten > 0) regels.push({ combiCode: 'C3-3205', hoeveelheid: putten, omschrijving: 'Inspectieputten' });
    const ontst = Math.max(0, Math.round(num(v.ontstopping, 1)));
    if (ontst > 0) regels.push({ combiCode: 'C3-3213', hoeveelheid: ontst, omschrijving: 'Ontstoppingspunten' });
    if (ja(v.infiltratie)) { const k = Math.max(1, Math.round(num(v.infiltratiekratten, 10))); regels.push({ combiCode: 'C3-3207', hoeveelheid: k, omschrijving: 'Infiltratiekratten' }); }
    if (ja(v.pompput)) regels.push({ combiCode: 'C3-3214', hoeveelheid: 1, omschrijving: 'Pompput' });
    if (ja(v.aansluiting)) regels.push({ combiCode: 'CUR-3206', hoeveelheid: 1, omschrijving: 'Aansluiting op riool' });

    return {
      hoeveelheden: { vuilwater_m: round(vuil), hwa_m: round(hwa) },
      regels,
      samenvatting: [{ label: 'Vuilwater', waarde: round(vuil), eenheid: 'm' }, { label: 'Hemelwater', waarde: round(hwa), eenheid: 'm' }],
    };
  },
};
export default RioleringModel;
