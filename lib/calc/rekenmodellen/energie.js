// lib/calc/rekenmodellen/energie.js — EnergieModel (P5.2).
// PV, warmtepomp, laadpaal en buffervat als zelfstandig duurzaamheidsmodel (naast verwarming/
// elektra die ze ook bundelen). Mapt op bestaande combi's; geen migratie.
import { num, ja } from './_helpers';

const EnergieModel = {
  object: 'energie',
  label: 'Energie & duurzaamheid',
  output: ['zonnepanelen', 'warmtepomp', 'buffervat', 'laadpaal'],
  inputs: [
    { key: 'panelen', label: 'Zonnepanelen', type: 'number', default: 10, groep: 'maat' },
    { key: 'warmtepomp', label: 'Warmtepomp', type: 'choice', default: 'lucht', groep: 'basis', opties: [['geen', 'Geen'], ['lucht', 'Lucht-water'], ['hybride', 'Hybride']] },
    { key: 'laadpaal', label: 'Laadpaal', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
    { key: 'buffervat', label: 'Buffervat', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [
    { key: 'laadpalen', label: 'Aantal laadpalen', type: 'number', default: 1 },
  ],
  defaults: {},
  bereken(v) {
    const panelen = Math.max(0, Math.round(num(v.panelen, 10)));
    const regels = [];
    if (panelen > 0) regels.push({ combiCode: 'CUR-2511', hoeveelheid: panelen, omschrijving: 'Zonnepanelen' });
    if (v.warmtepomp === 'lucht') regels.push({ combiCode: 'CUR-2802', hoeveelheid: 1, omschrijving: 'Warmtepomp lucht-water' });
    if (v.warmtepomp === 'hybride') regels.push({ combiCode: 'C3-2813', hoeveelheid: 1, omschrijving: 'Hybride systeem' });
    if (ja(v.buffervat) && v.warmtepomp !== 'geen') regels.push({ combiCode: 'C3-2808', hoeveelheid: 1, omschrijving: 'Buffervat' });
    if (ja(v.laadpaal)) regels.push({ combiCode: 'C3-2512', hoeveelheid: Math.max(1, Math.round(num(v.laadpalen, 1))), omschrijving: 'Laadpaal-voorbereiding' });
    return {
      hoeveelheden: { panelen },
      regels,
      samenvatting: [
        { label: 'Zonnepanelen', waarde: panelen, eenheid: 'st' },
        { label: 'Warmtepomp', waarde: v.warmtepomp === 'geen' ? 0 : 1, eenheid: 'st' },
      ],
    };
  },
};
export default EnergieModel;
