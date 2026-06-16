// lib/calc/rekenmodellen/plafond.js — PlafondModel (P4.1).
import { num, round, ja } from './_helpers';

const TYPE = { gips: 'C3-1801', systeem: 'C3-1802', verlaagd: 'C3-1803', spuit: 'C3-1813', houten: 'C3-1815' };

const PlafondModel = {
  object: 'plafond',
  label: 'Plafonds',
  output: ['plafond', 'plafondisolatie', 'akoestisch'],
  inputs: [
    { key: 'oppervlak', label: 'Plafondoppervlak', type: 'number', eenheid: 'm²', default: 60, groep: 'maat' },
    { key: 'type', label: 'Type', type: 'choice', default: 'gips', groep: 'basis', opties: [['gips', 'Gipsplafond'], ['systeem', 'Systeemplafond'], ['verlaagd', 'Verlaagd'], ['spuit', 'Spuitplafond'], ['houten', 'Houten']] },
    { key: 'isolatie', label: 'Plafondisolatie', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
    { key: 'akoestisch', label: 'Akoestisch', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
  ],
  advancedInputs: [{ key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 5 }],
  defaults: {},
  bereken(v) {
    const opp = round(num(v.oppervlak, 60) * (1 + num(v.verlies, 5) / 100));
    const regels = [{ combiCode: TYPE[v.type] || 'C3-1801', hoeveelheid: opp, omschrijving: `Plafond (${v.type})` }];
    if (ja(v.isolatie)) regels.push({ combiCode: 'C3-1806', hoeveelheid: opp, omschrijving: 'Plafondisolatie' });
    if (ja(v.akoestisch)) regels.push({ combiCode: 'C3-1804', hoeveelheid: opp, omschrijving: 'Akoestisch plafond' });
    return { hoeveelheden: { oppervlak_m2: opp }, regels, samenvatting: [{ label: 'Plafond', waarde: opp, eenheid: 'm²' }] };
  },
};
export default PlafondModel;
