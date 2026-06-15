// lib/calc/rekenmodellen/schilderwerk.js — SchilderwerkModel (P9).
import { num, round, ja } from './_helpers';

const SchilderwerkModel = {
  object: 'schilderwerk',
  label: 'Schilderwerk',
  output: ['wanden', 'plafonds', 'houtwerk', 'kozijnen', 'deuren'],
  inputs: [
    { key: 'wand_m2', label: 'Wandoppervlak', type: 'number', eenheid: 'm²', default: 120, groep: 'maat' },
    { key: 'plafond_m2', label: 'Plafondoppervlak', type: 'number', eenheid: 'm²', default: 60, groep: 'maat' },
    { key: 'locatie', label: 'Locatie', type: 'choice', default: 'binnen', groep: 'basis', opties: [['binnen', 'Binnen'], ['buiten', 'Buiten']] },
    { key: 'wanden', label: 'Wanden', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'plafonds', label: 'Plafonds', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [
    { key: 'houtwerk_m2', label: 'Houtwerk (m²)', type: 'number', eenheid: 'm²', default: 0 },
    { key: 'kozijnen_m2', label: 'Kozijnen (m²)', type: 'number', eenheid: 'm²', default: 0 },
    { key: 'deuren', label: 'Deuren (aantal)', type: 'number', default: 0 },
  ],
  defaults: {},
  bereken(v) {
    const wand = num(v.wand_m2, 120);
    const plafond = num(v.plafond_m2, 60);
    const regels = [];
    if (ja(v.wanden)) regels.push({ combiCode: v.locatie === 'buiten' ? 'C3-2202' : 'CUR-2206', hoeveelheid: round(wand), omschrijving: `Wanden schilderen (${v.locatie})` });
    if (ja(v.plafonds)) regels.push({ combiCode: 'CUR-2207', hoeveelheid: round(plafond), omschrijving: 'Plafonds sauzen' });
    const hout = num(v.houtwerk_m2, 0);
    if (hout > 0) regels.push({ combiCode: 'CUR-2203', hoeveelheid: round(hout), omschrijving: 'Houtwerk schilderen' });
    const koz = num(v.kozijnen_m2, 0);
    if (koz > 0) regels.push({ combiCode: 'CUR-2204', hoeveelheid: round(koz), omschrijving: 'Kozijnen schilderen' });
    const deuren = Math.max(0, Math.round(num(v.deuren, 0)));
    if (deuren > 0) regels.push({ combiCode: 'C3-2205', hoeveelheid: deuren, omschrijving: 'Deuren schilderen' });
    return { hoeveelheden: { wand_m2: round(wand), plafond_m2: round(plafond) }, regels, samenvatting: [{ label: 'Wanden', waarde: round(wand), eenheid: 'm²' }, { label: 'Plafonds', waarde: round(plafond), eenheid: 'm²' }] };
  },
};
export default SchilderwerkModel;
