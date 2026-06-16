// lib/calc/rekenmodellen/dakopening.js — DakopeningModel (P4.2).
// Dakkapellen, dakramen, lichtstraten en lichtkoepels — vaak vergeten naast de dakbedekking.
import { num } from './_helpers';

const DakopeningModel = {
  object: 'dakopening',
  label: 'Dakkapellen & dakramen',
  output: ['dakkapellen', 'dakramen', 'lichtstraten', 'lichtkoepels'],
  inputs: [
    { key: 'dakkapellen', label: 'Dakkapellen', type: 'number', default: 1, groep: 'maat' },
    { key: 'dakramen', label: 'Dakramen', type: 'number', default: 2, groep: 'maat' },
    { key: 'dakkapel_uitvoering', label: 'Dakkapel', type: 'choice', default: 'compleet', groep: 'basis', opties: [['compleet', 'Compleet (prefab)'], ['constructie', 'Alleen constructie']] },
  ],
  advancedInputs: [
    { key: 'lichtstraten', label: 'Lichtstraten', type: 'number', default: 0 },
    { key: 'lichtkoepels', label: 'Lichtkoepels', type: 'number', default: 0 },
  ],
  defaults: {},
  bereken(v) {
    const dk = Math.max(0, Math.round(num(v.dakkapellen, 1)));
    const dr = Math.max(0, Math.round(num(v.dakramen, 2)));
    const ls = Math.max(0, Math.round(num(v.lichtstraten, 0)));
    const lk = Math.max(0, Math.round(num(v.lichtkoepels, 0)));
    const regels = [];
    if (dk > 0) regels.push({ combiCode: v.dakkapel_uitvoering === 'constructie' ? 'C3-1108' : 'C3-1304', hoeveelheid: dk, omschrijving: `Dakkapellen (${v.dakkapel_uitvoering})` });
    if (dr > 0) regels.push({ combiCode: 'C3-1301', hoeveelheid: dr, omschrijving: 'Dakramen' });
    if (ls > 0) regels.push({ combiCode: 'C3-1302', hoeveelheid: ls, omschrijving: 'Lichtstraten' });
    if (lk > 0) regels.push({ combiCode: 'C3-1303', hoeveelheid: lk, omschrijving: 'Lichtkoepels' });
    return { hoeveelheden: { dakkapellen: dk, dakramen: dr }, regels, samenvatting: [{ label: 'Dakkapellen', waarde: dk, eenheid: 'st' }, { label: 'Dakramen', waarde: dr, eenheid: 'st' }] };
  },
};
export default DakopeningModel;
