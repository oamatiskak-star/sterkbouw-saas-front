// lib/calc/rekenmodellen/toilet.js — ToiletModel (P8, diepe variant).
import { num, round, ja } from './_helpers';

const ToiletModel = {
  object: 'toilet',
  label: 'Toilet',
  output: ['wandtegels', 'vloertegels', 'toilet', 'fontein', 'ventilatie', 'elektra'],
  inputs: [
    { key: 'lengte', label: 'Lengte', type: 'number', eenheid: 'm', default: 1.2, groep: 'maat' },
    { key: 'breedte', label: 'Breedte', type: 'number', eenheid: 'm', default: 0.9, groep: 'maat' },
    { key: 'hoogte', label: 'Hoogte', type: 'number', eenheid: 'm', default: 2.6, groep: 'maat' },
    { key: 'wc', label: 'Toilet', type: 'choice', default: 'hang', groep: 'basis', opties: [['hang', 'Hangend'], ['staand', 'Staand']] },
    { key: 'tegelhoogte', label: 'Tegelhoogte', type: 'choice', default: '150', groep: 'basis', opties: [['120', '120 cm'], ['150', '150 cm'], ['plafond', 'Tot plafond']] },
    { key: 'fontein', label: 'Fontein', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [
    { key: 'vloertegel', label: 'Vloertegels', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'ventilatie', label: 'Ventilatie', type: 'choice', default: 'rooster', opties: [['rooster', 'Rooster'], ['mechanisch', 'Mechanisch']] },
    { key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 10 },
  ],
  defaults: {},
  bereken(v) {
    const L = num(v.lengte, 1.2), B = num(v.breedte, 0.9), H = num(v.hoogte, 2.6);
    const verliesF = 1 + num(v.verlies, 10) / 100;
    const vloer = round(L * B);
    const omtrek = round(2 * (L + B));
    const tegelH = v.tegelhoogte === 'plafond' ? H : num(v.tegelhoogte, 150) / 100;
    const wandTegel = round(omtrek * tegelH * 0.85 * verliesF);
    const regels = [];
    regels.push({ combiCode: 'C3-2004', hoeveelheid: wandTegel, omschrijving: `Toilet wandtegels (${v.tegelhoogte})` });
    if (ja(v.vloertegel)) regels.push({ combiCode: 'CUR-2002', hoeveelheid: round(vloer * verliesF), omschrijving: 'Vloertegels' });
    regels.push({ combiCode: 'CUR-2701', hoeveelheid: 1, omschrijving: `Toilet (${v.wc})` });
    if (ja(v.fontein)) regels.push({ combiCode: 'CUR-2704', hoeveelheid: 1, omschrijving: 'Fontein' });
    regels.push({ combiCode: v.ventilatie === 'mechanisch' ? 'CUR-2601' : 'CUR-2604', hoeveelheid: 1, omschrijving: `Ventilatie (${v.ventilatie})` });
    regels.push({ combiCode: 'CUR-2505', hoeveelheid: 1, omschrijving: 'Lichtpunt' });
    regels.push({ combiCode: 'CUR-2503', hoeveelheid: 1, omschrijving: 'Wandcontactdoos' });
    return {
      hoeveelheden: { vloer_m2: vloer, wandtegel_m2: wandTegel, omtrek_m: omtrek },
      regels,
      samenvatting: [{ label: 'Vloeroppervlak', waarde: vloer, eenheid: 'm²' }, { label: 'Wandtegels', waarde: wandTegel, eenheid: 'm²' }],
    };
  },
};
export default ToiletModel;
