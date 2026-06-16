// lib/calc/rekenmodellen/ventilatie.js — VentilatieModel (P10).
import { num, round, ja } from './_helpers';

const VentilatieModel = {
  object: 'ventilatie',
  label: 'Ventilatie',
  output: ['systeem', 'kanalen', 'roosters', 'CO2-sturing'],
  inputs: [
    { key: 'woning_m2', label: 'Woonoppervlak', type: 'number', eenheid: 'm²', default: 120, groep: 'maat' },
    { key: 'systeem', label: 'Systeem', type: 'choice', default: 'wtw', groep: 'basis', opties: [['mechanisch', 'Mechanisch (C)'], ['wtw', 'WTW (D)']] },
    { key: 'roosters', label: 'Ventielen/roosters', type: 'number', default: 8, groep: 'basis' },
    { key: 'co2', label: 'CO₂-sturing', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
  ],
  advancedInputs: [
    { key: 'luchtdebiet_m3h', label: 'Luchtdebiet', type: 'number', eenheid: 'm³/h', default: '' }, // spec/aanname
    { key: 'kanalen_m', label: 'Kanalen (m¹)', type: 'number', eenheid: 'm', default: 0 },
  ],
  defaults: {},
  bereken(v) {
    const m2 = num(v.woning_m2, 120);
    const regels = [{ combiCode: v.systeem === 'wtw' ? 'CUR-2602' : 'CUR-2601', hoeveelheid: 1, omschrijving: `Ventilatiesysteem (${v.systeem})` }];
    const kanalen = num(v.kanalen_m, 0) || round(m2 * 0.4);
    if (kanalen > 0) regels.push({ combiCode: 'CUR-2603', hoeveelheid: round(kanalen), omschrijving: 'Ventilatiekanalen' });
    const roosters = Math.max(0, Math.round(num(v.roosters, 8)));
    if (roosters > 0) regels.push({ combiCode: 'CUR-2604', hoeveelheid: roosters, omschrijving: 'Ventielen/roosters' });
    if (ja(v.co2)) regels.push({ combiCode: 'C3-2611', hoeveelheid: 1, omschrijving: 'CO₂-sturing' });
    return { hoeveelheden: { kanalen_m: round(kanalen), roosters }, regels, samenvatting: [{ label: 'Kanalen', waarde: round(kanalen), eenheid: 'm' }, { label: 'Roosters', waarde: roosters, eenheid: 'st' }] };
  },
};
export default VentilatieModel;
