// lib/calc/rekenmodellen/sanitair.js — SanitairModel (P10). Losse sanitaire toestellen (project-breed).
import { num, round, ja } from './_helpers';

const SanitairModel = {
  object: 'sanitair',
  label: 'Sanitair',
  output: ['toiletten', 'wastafels', 'douches', 'baden', 'afvoeren', 'leidingen'],
  inputs: [
    { key: 'toiletten', label: 'Toiletten', type: 'number', default: 2, groep: 'basis' },
    { key: 'wastafels', label: 'Wastafels', type: 'number', default: 2, groep: 'basis' },
    { key: 'douches', label: 'Douches', type: 'number', default: 1, groep: 'basis' },
  ],
  advancedInputs: [
    { key: 'baden', label: 'Baden', type: 'number', default: 0 },
    { key: 'meubels', label: 'Badkamermeubels', type: 'number', default: 1 },
    { key: 'leidingen_m', label: 'Leidingen (m¹)', type: 'number', eenheid: 'm', default: 30 },
  ],
  defaults: {},
  bereken(v) {
    const t = Math.max(0, Math.round(num(v.toiletten, 2)));
    const w = Math.max(0, Math.round(num(v.wastafels, 2)));
    const d = Math.max(0, Math.round(num(v.douches, 1)));
    const b = Math.max(0, Math.round(num(v.baden, 0)));
    const m = Math.max(0, Math.round(num(v.meubels, 1)));
    const regels = [];
    if (t > 0) regels.push({ combiCode: 'CUR-2701', hoeveelheid: t, omschrijving: 'Toiletten' });
    if (w > 0) regels.push({ combiCode: 'CUR-2704', hoeveelheid: w, omschrijving: 'Wastafels met kraan' });
    if (d > 0) regels.push({ combiCode: 'CUR-2703', hoeveelheid: d, omschrijving: 'Douches' });
    if (b > 0) regels.push({ combiCode: 'CUR-2705', hoeveelheid: b, omschrijving: 'Baden' });
    if (m > 0) regels.push({ combiCode: 'CUR-2713', hoeveelheid: m, omschrijving: 'Badkamermeubels' });
    const toestellen = t + w + d + b;
    if (toestellen > 0) regels.push({ combiCode: 'C3-2707', hoeveelheid: toestellen, omschrijving: 'Afvoeren sanitair' });
    const leid = num(v.leidingen_m, 30);
    if (leid > 0) regels.push({ combiCode: 'C3-2714', hoeveelheid: round(leid), omschrijving: 'Leidingen sanitair' });
    return { hoeveelheden: { toestellen }, regels, samenvatting: [{ label: 'Toestellen', waarde: toestellen, eenheid: 'st' }, { label: 'Leidingen', waarde: round(leid), eenheid: 'm' }] };
  },
};
export default SanitairModel;
