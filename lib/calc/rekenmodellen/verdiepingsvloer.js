// lib/calc/rekenmodellen/verdiepingsvloer.js — VerdiepingsvloerModel (P4.2).
// Constructieve verdiepingsvloeren (kanaalplaat/breedplaat) — ontbraken naast de begane grondvloer.
import { num, round, ja } from './_helpers';

const TYPE = { kanaalplaat: 'C3-0511', breedplaat: 'C3-0510' };

const VerdiepingsvloerModel = {
  object: 'verdiepingsvloer',
  label: 'Verdiepingsvloer',
  output: ['vloerelementen', 'druklaag/wapening'],
  inputs: [
    { key: 'oppervlak', label: 'Vloeroppervlak', type: 'number', eenheid: 'm²', default: 90, groep: 'maat' },
    { key: 'verdiepingen', label: 'Verdiepingen', type: 'number', default: 1, groep: 'maat' },
    { key: 'type', label: 'Type', type: 'choice', default: 'kanaalplaat', groep: 'basis', opties: [['kanaalplaat', 'Kanaalplaatvloer'], ['breedplaat', 'Breedplaatvloer']] },
    { key: 'druklaag', label: 'Druklaag/wapening', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [{ key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 3 }],
  defaults: {},
  bereken(v) {
    const opp = round(num(v.oppervlak, 90) * Math.max(1, Math.round(num(v.verdiepingen, 1))) * (1 + num(v.verlies, 3) / 100));
    const regels = [{ combiCode: TYPE[v.type] || 'C3-0511', hoeveelheid: opp, omschrijving: `Verdiepingsvloer (${v.type})` }];
    if (ja(v.druklaag)) regels.push({ combiCode: 'C3-0505', hoeveelheid: opp, omschrijving: 'Druklaag / wapening' });
    return { hoeveelheden: { oppervlak_m2: opp }, regels, samenvatting: [{ label: 'Vloeroppervlak', waarde: opp, eenheid: 'm²' }] };
  },
};
export default VerdiepingsvloerModel;
