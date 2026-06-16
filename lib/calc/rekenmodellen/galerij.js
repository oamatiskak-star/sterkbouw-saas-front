// lib/calc/rekenmodellen/galerij.js — GalerijModel (P5.1).
import { num, round, ja } from './_helpers';

const GalerijModel = {
  object: 'galerij',
  label: 'Galerij',
  output: ['galerijvloer', 'balustrade/hekwerk'],
  inputs: [
    { key: 'lengte', label: 'Galerijlengte', type: 'number', eenheid: 'm', default: 30, groep: 'maat' },
    { key: 'breedte', label: 'Breedte', type: 'number', eenheid: 'm', default: 1.5, groep: 'maat' },
    { key: 'hekwerk', label: 'Balustrade/hekwerk', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [{ key: 'verdiepingen', label: 'Verdiepingen', type: 'number', default: 1 }],
  defaults: {},
  bereken(v) {
    const lengte = num(v.lengte, 30);
    const breedte = num(v.breedte, 1.5);
    const verd = Math.max(1, Math.round(num(v.verdiepingen, 1)));
    const opp = round(lengte * breedte * verd);
    const regels = [{ combiCode: 'P5-GAL', hoeveelheid: opp, omschrijving: 'Galerijvloer' }];
    if (ja(v.hekwerk)) regels.push({ combiCode: 'C3-1606', hoeveelheid: round(lengte * verd), omschrijving: 'Balustrade galerij' });
    return { hoeveelheden: { oppervlak_m2: opp }, regels, samenvatting: [{ label: 'Galerijvloer', waarde: opp, eenheid: 'm²' }] };
  },
};
export default GalerijModel;
