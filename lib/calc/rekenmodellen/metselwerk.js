// lib/calc/rekenmodellen/metselwerk.js — MetselwerkModel (P9).
import { num, round, ja } from './_helpers';

const SOORT = { buiten: 'CUR-0901', binnen: 'CUR-0902', dragend: 'CUR-0903' };

const MetselwerkModel = {
  object: 'metselwerk',
  label: 'Metselwerk',
  output: ['metselwerk', 'voegwerk', 'siermetselwerk', 'rollagen'],
  inputs: [
    { key: 'oppervlak', label: 'Oppervlak', type: 'number', eenheid: 'm²', default: 60, groep: 'maat' },
    { key: 'soort', label: 'Soort', type: 'choice', default: 'buiten', groep: 'basis', opties: [['buiten', 'Buitenmetselwerk'], ['binnen', 'Binnenmetselwerk'], ['dragend', 'Dragende wand']] },
    { key: 'voegwerk', label: 'Voegwerk', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'sier', label: 'Siermetselwerk', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
  ],
  advancedInputs: [
    { key: 'rollagen', label: 'Rollagen (m¹)', type: 'number', eenheid: 'm', default: 0 },
    { key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 5 },
  ],
  defaults: {},
  bereken(v) {
    const opp = round(num(v.oppervlak, 60) * (1 + num(v.verlies, 5) / 100));
    const regels = [{ combiCode: SOORT[v.soort] || 'CUR-0901', hoeveelheid: opp, omschrijving: `Metselwerk (${v.soort})` }];
    if (ja(v.voegwerk)) regels.push({ combiCode: 'CUR-0904', hoeveelheid: opp, omschrijving: 'Voegwerk' });
    if (ja(v.sier)) regels.push({ combiCode: 'C3-0911', hoeveelheid: opp, omschrijving: 'Siermetselwerk' });
    const rol = num(v.rollagen, 0);
    if (rol > 0) regels.push({ combiCode: 'C3-0905', hoeveelheid: rol, omschrijving: 'Rollagen' });
    return { hoeveelheden: { oppervlak_m2: opp }, regels, samenvatting: [{ label: 'Oppervlak', waarde: opp, eenheid: 'm²' }] };
  },
};
export default MetselwerkModel;
