// lib/calc/rekenmodellen/kozijn.js — KozijnModel (P8).
import { num, round, ja } from './_helpers';

const KOZIJN = { hout: 'CUR-1403', aluminium: 'CUR-1402', kunststof: 'CB-KOZHR' };

const KozijnModel = {
  object: 'kozijn',
  label: 'Kozijnen',
  output: ['kozijn', 'beglazing', 'hang- en sluitwerk', 'vensterbank', 'montage'],
  inputs: [
    { key: 'aantal', label: 'Aantal', type: 'number', default: 8, groep: 'maat' },
    { key: 'breedte', label: 'Breedte', type: 'number', eenheid: 'm', default: 1.2, groep: 'maat' },
    { key: 'hoogte', label: 'Hoogte', type: 'number', eenheid: 'm', default: 1.4, groep: 'maat' },
    { key: 'materiaal', label: 'Materiaal', type: 'choice', default: 'kunststof', groep: 'basis', opties: [['kunststof', 'Kunststof'], ['hout', 'Hout'], ['aluminium', 'Aluminium']] },
    { key: 'beglazing', label: 'Beglazing', type: 'choice', default: 'hr', groep: 'basis', opties: [['hr', 'HR++'], ['triple', 'Triple']] },
    { key: 'hangsluit', label: 'Hang- en sluitwerk', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [
    { key: 'u_waarde', label: 'Warmtedoorgang U', type: 'number', eenheid: 'W/m²K', default: '' }, // spec/aanname (beglazing stuurt al de prijs)
    { key: 'vensterbank', label: 'Vensterbanken', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 5 },
  ],
  defaults: {},
  bereken(v) {
    const aantal = Math.max(1, Math.round(num(v.aantal, 8)));
    const opp = round(aantal * num(v.breedte, 1.2) * num(v.hoogte, 1.4) * (1 + num(v.verlies, 5) / 100));
    const regels = [];
    regels.push({ combiCode: KOZIJN[v.materiaal] || 'CB-KOZHR', hoeveelheid: opp, omschrijving: `Kozijnen ${v.materiaal} (incl. beglazing)` });
    if (v.beglazing === 'triple') regels.push({ combiCode: 'C3-1502', hoeveelheid: opp, omschrijving: 'Triple beglazing (upgrade)' });
    if (ja(v.hangsluit)) regels.push({ combiCode: 'CUR-1408', hoeveelheid: aantal, omschrijving: 'Hang- en sluitwerk' });
    if (ja(v.vensterbank)) regels.push({ combiCode: 'CUR-1409', hoeveelheid: round(aantal * num(v.breedte, 1.2)), omschrijving: 'Vensterbanken' });
    return {
      hoeveelheden: { aantal, oppervlak_m2: opp },
      regels,
      samenvatting: [{ label: 'Aantal kozijnen', waarde: aantal, eenheid: 'st' }, { label: 'Kozijnoppervlak', waarde: opp, eenheid: 'm²' }],
    };
  },
};
export default KozijnModel;
