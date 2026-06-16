// lib/calc/rekenmodellen/stucwerk.js — StucwerkModel (P4.1).
import { num, round, ja } from './_helpers';

const WAND = { sausklaar: 'C3-2114', behangklaar: 'CUR-2115', sierpleister: 'C3-2104', raapwerk: 'CUR-2103' };

const StucwerkModel = {
  object: 'stucwerk',
  label: 'Stukadoorswerk',
  output: ['wandstucwerk', 'plafondstucwerk', 'spackspuitwerk'],
  inputs: [
    { key: 'wand_m2', label: 'Wandoppervlak', type: 'number', eenheid: 'm²', default: 120, groep: 'maat' },
    { key: 'plafond_m2', label: 'Plafondoppervlak', type: 'number', eenheid: 'm²', default: 60, groep: 'maat' },
    { key: 'wandafwerking', label: 'Wandafwerking', type: 'choice', default: 'sausklaar', groep: 'basis', opties: [['sausklaar', 'Sausklaar'], ['behangklaar', 'Behangklaar'], ['sierpleister', 'Sierpleister'], ['raapwerk', 'Raapwerk']] },
    { key: 'plafond', label: 'Plafond stucen', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'spack', label: 'Spackspuitwerk', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
  ],
  advancedInputs: [{ key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 5 }],
  defaults: {},
  bereken(v) {
    const f = 1 + num(v.verlies, 5) / 100;
    const wand = round(num(v.wand_m2, 120) * f);
    const plafond = round(num(v.plafond_m2, 60) * f);
    const regels = [{ combiCode: WAND[v.wandafwerking] || 'C3-2114', hoeveelheid: wand, omschrijving: `Wandstucwerk (${v.wandafwerking})` }];
    if (ja(v.plafond) && plafond > 0) regels.push({ combiCode: ja(v.spack) ? 'CUR-2105' : 'CUR-2102', hoeveelheid: plafond, omschrijving: ja(v.spack) ? 'Spackspuitwerk plafond' : 'Plafondstucwerk' });
    return { hoeveelheden: { wand_m2: wand, plafond_m2: plafond }, regels, samenvatting: [{ label: 'Wand', waarde: wand, eenheid: 'm²' }, { label: 'Plafond', waarde: plafond, eenheid: 'm²' }] };
  },
};
export default StucwerkModel;
