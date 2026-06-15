// lib/calc/rekenmodellen/verwarming.js — VerwarmingModel (P10).
import { num, round, ja } from './_helpers';

const SYSTEEM = { cv: 'CB-CV', warmtepomp: 'CUR-2802', hybride: 'C3-2813' };

const VerwarmingModel = {
  object: 'verwarming',
  label: 'Verwarming',
  output: ['opwekking', 'afgifte', 'thermostaat', 'leidingen', 'boiler'],
  inputs: [
    { key: 'woning_m2', label: 'Woonoppervlak', type: 'number', eenheid: 'm²', default: 120, groep: 'maat' },
    { key: 'systeem', label: 'Opwekking', type: 'choice', default: 'cv', groep: 'basis', opties: [['cv', 'CV-ketel'], ['warmtepomp', 'Warmtepomp'], ['hybride', 'Hybride']] },
    { key: 'afgifte', label: 'Afgifte', type: 'choice', default: 'radiatoren', groep: 'basis', opties: [['radiatoren', 'Radiatoren'], ['vloerverwarming', 'Vloerverwarming']] },
    { key: 'thermostaat', label: 'Thermostaat', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [
    { key: 'radiatoren', label: 'Aantal radiatoren', type: 'number', default: 0 },
    { key: 'boiler', label: 'Boiler', type: 'choice', default: 'nee', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
    { key: 'leidingisolatie', label: 'Leidingisolatie', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  defaults: {},
  bereken(v) {
    const m2 = num(v.woning_m2, 120);
    const regels = [{ combiCode: SYSTEEM[v.systeem] || 'CB-CV', hoeveelheid: 1, omschrijving: `Verwarming opwekking (${v.systeem})` }];
    if (v.afgifte === 'vloerverwarming') {
      regels.push({ combiCode: 'CUR-2804', hoeveelheid: round(m2), omschrijving: 'Vloerverwarming' });
    } else {
      const rad = Math.max(1, Math.round(num(v.radiatoren, 0) || Math.ceil(m2 / 20)));
      regels.push({ combiCode: 'CUR-2803', hoeveelheid: rad, omschrijving: 'Radiatoren' });
    }
    if (ja(v.thermostaat)) regels.push({ combiCode: 'CUR-2806', hoeveelheid: 1, omschrijving: 'Thermostaat' });
    regels.push({ combiCode: 'C3-2807', hoeveelheid: round(m2 * 0.6), omschrijving: 'Leidingen verwarming' });
    if (ja(v.boiler)) regels.push({ combiCode: 'CUR-2809', hoeveelheid: 1, omschrijving: 'Boiler' });
    if (ja(v.leidingisolatie)) regels.push({ combiCode: 'C3-2811', hoeveelheid: round(m2 * 0.6), omschrijving: 'Isolatie cv-leidingen' });
    return { hoeveelheden: { woning_m2: round(m2) }, regels, samenvatting: [{ label: 'Woonoppervlak', waarde: round(m2), eenheid: 'm²' }] };
  },
};
export default VerwarmingModel;
