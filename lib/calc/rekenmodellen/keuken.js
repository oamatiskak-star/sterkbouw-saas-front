// lib/calc/rekenmodellen/keuken.js — KeukenModel (P8, diepe variant).
import { num, round, ja } from './_helpers';

const KeukenModel = {
  object: 'keuken',
  label: 'Keuken',
  output: ['keukenblok', 'apparatuur', 'werkblad', 'spoelbak', 'kraan', 'water/afvoer', 'elektra', 'spatwand'],
  inputs: [
    { key: 'lengte', label: 'Keukenlengte', type: 'number', eenheid: 'm', default: 4, groep: 'maat' },
    { key: 'niveau', label: 'Niveau', type: 'choice', default: 'standaard', groep: 'basis', opties: [['basis', 'Basis'], ['standaard', 'Standaard'], ['premium', 'Premium']] },
    { key: 'werkblad', label: 'Werkblad', type: 'choice', default: 'composiet', groep: 'basis', opties: [['kunststof', 'Kunststof'], ['composiet', 'Composiet'], ['steen', 'Natuursteen']] },
    { key: 'apparatuur', label: 'Apparatuur', type: 'choice', default: 'volledig', groep: 'basis', opties: [['geen', 'Geen'], ['basis', 'Basis'], ['volledig', 'Volledig']] },
  ],
  advancedInputs: [
    { key: 'spoelbak', label: 'Spoelbak', type: 'choice', default: '1', opties: [['1', '1'], ['1.5', '1,5'], ['2', '2']] },
    { key: 'spatwand', label: 'Spatwand (tegel)', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'elektra', label: 'Elektra', type: 'choice', default: 'standaard', opties: [['standaard', 'Standaard'], ['uitgebreid', 'Uitgebreid']] },
  ],
  defaults: {},
  bereken(v) {
    const lengte = num(v.lengte, 4);
    const regels = [];
    regels.push({ combiCode: v.niveau === 'basis' ? 'CUR-2051' : 'CUR-2052', hoeveelheid: 1, omschrijving: `Keukenblok (${v.niveau})` });
    if (v.apparatuur !== 'geen') regels.push({ combiCode: 'P5-K002', hoeveelheid: 1, omschrijving: `Inbouwapparatuur (${v.apparatuur})` });
    regels.push({ combiCode: 'P5-K003', hoeveelheid: round(lengte), omschrijving: `Werkblad ${v.werkblad}` });
    regels.push({ combiCode: 'CUR-2053', hoeveelheid: 1, omschrijving: 'Keukenaansluiting (water/afvoer)' });
    regels.push({ combiCode: 'P5-K004', hoeveelheid: num(v.spoelbak, 1) >= 2 ? 2 : 1, omschrijving: 'Spoelbak' });
    regels.push({ combiCode: 'P5-K005', hoeveelheid: 1, omschrijving: 'Keukenkraan' });
    const wcd = v.elektra === 'uitgebreid' ? 6 : 4;
    regels.push({ combiCode: 'CUR-2503', hoeveelheid: wcd, omschrijving: 'Wandcontactdozen keuken' });
    regels.push({ combiCode: 'CUR-2505', hoeveelheid: 2, omschrijving: 'Lichtpunten' });
    if (ja(v.spatwand)) regels.push({ combiCode: 'CUR-2005', hoeveelheid: round(lengte * 0.6), omschrijving: 'Spatwand tegelwerk' });
    return {
      hoeveelheden: { keukenlengte_m: lengte, werkblad_m: round(lengte) },
      regels,
      samenvatting: [{ label: 'Keukenlengte', waarde: round(lengte), eenheid: 'm' }, { label: 'Werkblad', waarde: round(lengte), eenheid: 'm' }],
    };
  },
};
export default KeukenModel;
