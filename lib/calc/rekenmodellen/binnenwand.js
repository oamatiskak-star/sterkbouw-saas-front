// lib/calc/rekenmodellen/binnenwand.js — BinnenwandModel (P8).
import { num, round, ja } from './_helpers';

const WAND = { metalstud: 'CUR-1702', gips: 'CUR-1701', kalkzandsteen: 'CUR-1703', cellenbeton: 'C3-1704' };
const AFWERKING = { stuc: 'CB-STUC', behangklaar: 'CUR-2115' };

const BinnenwandModel = {
  object: 'binnenwand',
  label: 'Binnenwanden',
  output: ['wandconstructie', 'afwerking (2 zijden)', 'binnendeuren'],
  inputs: [
    { key: 'lengte', label: 'Totale wandlengte', type: 'number', eenheid: 'm', default: 24, groep: 'maat' },
    { key: 'hoogte', label: 'Hoogte', type: 'number', eenheid: 'm', default: 2.6, groep: 'maat' },
    { key: 'type', label: 'Type', type: 'choice', default: 'metalstud', groep: 'basis', opties: [['metalstud', 'Metalstud'], ['gips', 'Gipsblokken'], ['kalkzandsteen', 'Kalkzandsteen'], ['cellenbeton', 'Cellenbeton']] },
    { key: 'afwerking', label: 'Afwerking', type: 'choice', default: 'stuc', groep: 'basis', opties: [['stuc', 'Stucwerk'], ['behangklaar', 'Behangklaar'], ['geen', 'Geen']] },
    { key: 'deuren', label: 'Binnendeuren', type: 'number', default: 5, groep: 'basis' },
  ],
  advancedInputs: [
    { key: 'brandwerend', label: 'Brandwerend', type: 'choice', default: 'nee', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
    { key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 5 },
  ],
  defaults: {},
  bereken(v) {
    const opp = round(num(v.lengte, 24) * num(v.hoogte, 2.6) * (1 + num(v.verlies, 5) / 100));
    const deuren = Math.max(0, Math.round(num(v.deuren, 5)));
    const regels = [];
    regels.push({ combiCode: ja(v.brandwerend) ? 'CUR-1708' : (WAND[v.type] || 'CUR-1702'), hoeveelheid: opp, omschrijving: `Binnenwand ${ja(v.brandwerend) ? 'brandwerend' : v.type}` });
    if (v.afwerking !== 'geen') regels.push({ combiCode: AFWERKING[v.afwerking] || 'CB-STUC', hoeveelheid: round(opp * 2), omschrijving: `Wandafwerking (${v.afwerking}, 2 zijden)` });
    if (deuren > 0) regels.push({ combiCode: 'CUR-1404', hoeveelheid: deuren, omschrijving: 'Binnendeuren (kozijn + deur + beslag)' });
    return {
      hoeveelheden: { wand_m2: opp, deuren },
      regels,
      samenvatting: [{ label: 'Wandoppervlak', waarde: opp, eenheid: 'm²' }, { label: 'Binnendeuren', waarde: deuren, eenheid: 'st' }],
    };
  },
};
export default BinnenwandModel;
