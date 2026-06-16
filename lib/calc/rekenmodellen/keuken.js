// lib/calc/rekenmodellen/keuken.js — KeukenModel (P3.2: apparatuur per toestel).
// Geen "apparatuur-set" meer maar per toestel calculeerbaar (oven/kookplaat/afzuigkap/koelkast/
// vaatwasser/magnetron/quooker) + kookeiland. Keukenblok/werkblad/water/elektra/spatwand.
import { num, round, ja } from './_helpers';

const TOESTELLEN = [
  { key: 'oven', label: 'Inbouwoven', code: 'P5-K021', default: 'ja' },
  { key: 'kookplaat', label: 'Inductiekookplaat', code: 'P5-K022', default: 'ja' },
  { key: 'afzuigkap', label: 'Afzuigkap', code: 'P5-K023', default: 'ja' },
  { key: 'koelkast', label: 'Inbouwkoelkast', code: 'P5-K024', default: 'ja' },
  { key: 'vaatwasser', label: 'Vaatwasser', code: 'P5-K025', default: 'ja' },
  { key: 'magnetron', label: 'Magnetron/combi', code: 'P5-K026', default: 'nee' },
];

const KeukenModel = {
  object: 'keuken',
  label: 'Keuken',
  output: ['keukenblok', 'werkblad', 'kookeiland', 'apparatuur (per toestel)', 'spoelbak', 'kraan/quooker', 'water/afvoer', 'elektra', 'spatwand'],
  inputs: [
    { key: 'lengte', label: 'Keukenlengte', type: 'number', eenheid: 'm', default: 4, groep: 'maat' },
    { key: 'niveau', label: 'Niveau', type: 'choice', default: 'standaard', groep: 'basis', opties: [['basis', 'Basis'], ['standaard', 'Standaard'], ['premium', 'Premium']] },
    { key: 'werkblad', label: 'Werkblad', type: 'choice', default: 'composiet', groep: 'basis', opties: [['kunststof', 'Kunststof'], ['composiet', 'Composiet'], ['steen', 'Natuursteen']] },
    { key: 'kookeiland', label: 'Kookeiland', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
  ],
  advancedInputs: [
    ...TOESTELLEN.map((t) => ({ key: t.key, label: t.label, type: 'choice', default: t.default, opties: [['ja', 'Ja'], ['nee', 'Nee']] })),
    { key: 'quooker', label: 'Quooker', type: 'choice', default: 'nee', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
    { key: 'spoelbak', label: 'Spoelbak', type: 'choice', default: '1', opties: [['1', '1'], ['1.5', '1,5'], ['2', '2']] },
    { key: 'spatwand', label: 'Spatwand (tegel)', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'elektra', label: 'Elektra', type: 'choice', default: 'standaard', opties: [['standaard', 'Standaard'], ['uitgebreid', 'Uitgebreid']] },
  ],
  defaults: {},

  bereken(v) {
    const lengte = num(v.lengte, 4);
    const regels = [];
    regels.push({ combiCode: v.niveau === 'basis' ? 'CUR-2051' : 'CUR-2052', hoeveelheid: 1, omschrijving: `Keukenblok (${v.niveau})` });
    regels.push({ combiCode: 'P5-K003', hoeveelheid: round(lengte), omschrijving: `Werkblad ${v.werkblad}` });
    if (ja(v.kookeiland)) regels.push({ combiCode: 'P5-K006', hoeveelheid: 1, omschrijving: 'Kookeiland' });

    // Apparatuur per toestel.
    for (const t of TOESTELLEN) if (ja(v[t.key])) regels.push({ combiCode: t.code, hoeveelheid: 1, omschrijving: t.label });

    regels.push({ combiCode: 'CUR-2053', hoeveelheid: 1, omschrijving: 'Keukenaansluiting (water/afvoer)' });
    regels.push({ combiCode: 'P5-K004', hoeveelheid: num(v.spoelbak, 1) >= 2 ? 2 : 1, omschrijving: 'Spoelbak' });
    regels.push({ combiCode: ja(v.quooker) ? 'P5-K027' : 'P5-K005', hoeveelheid: 1, omschrijving: ja(v.quooker) ? 'Quooker' : 'Keukenkraan' });

    const wcd = v.elektra === 'uitgebreid' ? 6 : 4;
    regels.push({ combiCode: 'CUR-2503', hoeveelheid: wcd, omschrijving: 'Wandcontactdozen keuken' });
    regels.push({ combiCode: 'CUR-2505', hoeveelheid: 2, omschrijving: 'Lichtpunten' });
    if (ja(v.spatwand)) regels.push({ combiCode: 'CUR-2005', hoeveelheid: round(lengte * 0.6), omschrijving: 'Spatwand tegelwerk' });

    const toestellen = TOESTELLEN.filter((t) => ja(v[t.key])).length + (ja(v.quooker) ? 1 : 0);
    return {
      hoeveelheden: { keukenlengte_m: round(lengte), toestellen },
      regels,
      samenvatting: [{ label: 'Keukenlengte', waarde: round(lengte), eenheid: 'm' }, { label: 'Apparaten', waarde: toestellen, eenheid: 'st' }],
    };
  },
};
export default KeukenModel;
