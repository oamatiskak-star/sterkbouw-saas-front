// lib/calc/rekenmodellen/dak.js — DakModel (P8).
import { num, round, ja } from './_helpers';

const DEKKING = { pannen: 'CB-DAKPAN', epdm: 'CUR-1202', bitumen: 'CUR-1201' };

const DakModel = {
  object: 'dak',
  label: 'Dak',
  output: ['dakbedekking', 'isolatie', 'constructie', 'dakrand', 'goten/HWA', 'nokvorsten'],
  inputs: [
    { key: 'oppervlak', label: 'Dakoppervlak', type: 'number', eenheid: 'm²', default: 80, groep: 'maat' },
    { key: 'type', label: 'Type', type: 'choice', default: 'pannen', groep: 'basis', opties: [['pannen', 'Hellend (pannen)'], ['epdm', 'Plat (EPDM)'], ['bitumen', 'Plat (bitumen)']] },
    { key: 'isolatie', label: 'Isolatie', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'constructie', label: 'Constructie meenemen', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [
    { key: 'steiger', label: 'Steiger', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'gevelhoogte', label: 'Gevelhoogte (t.b.v. steiger)', type: 'number', eenheid: 'm', default: 6 },
    { key: 'randlengte', label: 'Randlengte (goot/dakrand)', type: 'number', eenheid: 'm', default: 36 },
    { key: 'noklengte', label: 'Noklengte', type: 'number', eenheid: 'm', default: 10 },
    { key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 7 },
  ],
  defaults: {},
  bereken(v) {
    const opp = round(num(v.oppervlak, 80) * (1 + num(v.verlies, 7) / 100));
    const hellend = v.type === 'pannen';
    const rand = num(v.randlengte, 36);
    const nok = num(v.noklengte, 10);
    const regels = [];
    regels.push({ combiCode: DEKKING[v.type] || 'CB-DAKPAN', hoeveelheid: opp, omschrijving: `Dakbedekking (${v.type})` });
    if (ja(v.isolatie)) regels.push({ combiCode: 'CUR-1207', hoeveelheid: opp, omschrijving: 'Dakisolatie' });
    if (ja(v.constructie)) regels.push({ combiCode: hellend ? 'CUR-1101' : 'CUR-1106', hoeveelheid: opp, omschrijving: hellend ? 'Kapconstructie' : 'Platdakconstructie' });
    if (rand > 0) {
      regels.push({ combiCode: 'CUR-1211', hoeveelheid: rand, omschrijving: 'Goten' });
      regels.push({ combiCode: 'CUR-1210', hoeveelheid: Math.max(1, Math.round(rand / 6)), omschrijving: 'Hemelwaterafvoer' });
      if (!hellend) regels.push({ combiCode: 'C3-1209', hoeveelheid: rand, omschrijving: 'Dakrandafwerking' });
    }
    if (hellend && nok > 0) regels.push({ combiCode: 'C3-1212', hoeveelheid: nok, omschrijving: 'Nokvorsten' });
    if (ja(v.steiger) && rand > 0) regels.push({ combiCode: 'P5-A022', hoeveelheid: round(rand * num(v.gevelhoogte, 6)), omschrijving: 'Steiger (dakwerk)' });
    return {
      hoeveelheden: { oppervlak_m2: opp, randlengte_m: rand },
      regels,
      samenvatting: [{ label: 'Dakoppervlak', waarde: opp, eenheid: 'm²' }, { label: 'Randlengte', waarde: rand, eenheid: 'm' }],
    };
  },
};
export default DakModel;
