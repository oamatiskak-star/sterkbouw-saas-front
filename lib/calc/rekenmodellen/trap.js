// lib/calc/rekenmodellen/trap.js — TrapModel (P9).
import { num, round, ja } from './_helpers';

const TRAP = { houten: 'C3-1601', beton: 'C3-1603', vlizo: 'C3-1609' };

const TrapModel = {
  object: 'trap',
  label: 'Trap',
  output: ['trap', 'leuning', 'trapbekleding'],
  inputs: [
    { key: 'aantal', label: 'Aantal trappen', type: 'number', default: 1, groep: 'maat' },
    { key: 'type', label: 'Type', type: 'choice', default: 'houten', groep: 'basis', opties: [['houten', 'Houten trap'], ['beton', 'Betonnen trap'], ['vlizo', 'Vlizotrap']] },
    { key: 'leuning', label: 'Leuning/balustrade', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'bekleding', label: 'Trapbekleding', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
  ],
  advancedInputs: [
    { key: 'leuninglengte', label: 'Leuninglengte (m¹)', type: 'number', eenheid: 'm', default: 4 },
    { key: 'bekleding_m2', label: 'Bekleding (m²)', type: 'number', eenheid: 'm²', default: 4 },
  ],
  defaults: {},
  bereken(v) {
    const aantal = Math.max(1, Math.round(num(v.aantal, 1)));
    const regels = [{ combiCode: TRAP[v.type] || 'C3-1601', hoeveelheid: aantal, omschrijving: `Trap (${v.type})` }];
    if (ja(v.leuning)) regels.push({ combiCode: 'C3-1605', hoeveelheid: round(num(v.leuninglengte, 4) * aantal), omschrijving: 'Trapleuning/balustrade' });
    if (ja(v.bekleding)) regels.push({ combiCode: 'C3-1612', hoeveelheid: round(num(v.bekleding_m2, 4) * aantal), omschrijving: 'Trapbekleding' });
    return { hoeveelheden: { trappen: aantal }, regels, samenvatting: [{ label: 'Aantal trappen', waarde: aantal, eenheid: 'st' }] };
  },
};
export default TrapModel;
