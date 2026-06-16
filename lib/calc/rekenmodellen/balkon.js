// lib/calc/rekenmodellen/balkon.js — BalkonModel (P5.1).
import { num, round, ja } from './_helpers';

const BalkonModel = {
  object: 'balkon',
  label: 'Balkons',
  output: ['balkons', 'balustrade/hekwerk'],
  inputs: [
    { key: 'aantal', label: 'Aantal balkons', type: 'number', default: 4, groep: 'maat' },
    { key: 'breedte', label: 'Breedte (per balkon)', type: 'number', eenheid: 'm', default: 4, groep: 'maat' },
    { key: 'hekwerk', label: 'Balustrade/hekwerk', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [],
  defaults: {},
  bereken(v) {
    const aantal = Math.max(1, Math.round(num(v.aantal, 4)));
    const breedte = num(v.breedte, 4);
    const regels = [{ combiCode: 'P5-BALK', hoeveelheid: aantal, omschrijving: 'Prefab betonbalkons' }];
    if (ja(v.hekwerk)) regels.push({ combiCode: 'C3-1606', hoeveelheid: round(aantal * breedte), omschrijving: 'Balustrade balkons' });
    return { hoeveelheden: { balkons: aantal }, regels, samenvatting: [{ label: 'Balkons', waarde: aantal, eenheid: 'st' }] };
  },
};
export default BalkonModel;
