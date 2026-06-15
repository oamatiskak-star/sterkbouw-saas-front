// lib/calc/rekenmodellen/vloer.js — VloerModel (P9).
import { num, round, ja } from './_helpers';

const DEKVLOER = { zandcement: 'CUR-1901', anhydriet: 'CUR-1902', gietvloer: 'CUR-1913', vloerverwarming: 'CUR-1909' };
const AFWERKING = { tegel: 'CUR-2002', hout: 'C3-1904', geen: null };

const VloerModel = {
  object: 'vloer',
  label: 'Vloer',
  output: ['dekvloer', 'isolatie', 'ondervloer', 'afwerking'],
  inputs: [
    { key: 'oppervlak', label: 'Vloeroppervlak', type: 'number', eenheid: 'm²', default: 90, groep: 'maat' },
    { key: 'dekvloer', label: 'Dekvloer', type: 'choice', default: 'zandcement', groep: 'basis', opties: [['zandcement', 'Zandcement'], ['anhydriet', 'Anhydriet'], ['vloerverwarming', 'Met vloerverwarming'], ['gietvloer', 'Gietvloer']] },
    { key: 'isolatie', label: 'Vloerisolatie', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'afwerking', label: 'Afwerking', type: 'choice', default: 'tegel', groep: 'basis', opties: [['tegel', 'Tegels'], ['hout', 'Houten vloer'], ['geen', 'Geen']] },
  ],
  advancedInputs: [
    { key: 'ondervloer', label: 'Geluidsondervloer', type: 'choice', default: 'nee', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
    { key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 5 },
  ],
  defaults: {},
  bereken(v) {
    const opp = round(num(v.oppervlak, 90) * (1 + num(v.verlies, 5) / 100));
    const regels = [{ combiCode: DEKVLOER[v.dekvloer] || 'CUR-1901', hoeveelheid: opp, omschrijving: `Dekvloer (${v.dekvloer})` }];
    if (ja(v.isolatie)) regels.push({ combiCode: 'CUR-1905', hoeveelheid: opp, omschrijving: 'Vloerisolatie' });
    if (ja(v.ondervloer)) regels.push({ combiCode: 'C3-1910', hoeveelheid: opp, omschrijving: 'Geluidsondervloer' });
    const afw = AFWERKING[v.afwerking];
    if (afw) regels.push({ combiCode: afw, hoeveelheid: opp, omschrijving: `Vloerafwerking (${v.afwerking})` });
    return { hoeveelheden: { oppervlak_m2: opp }, regels, samenvatting: [{ label: 'Vloeroppervlak', waarde: opp, eenheid: 'm²' }] };
  },
};
export default VloerModel;
