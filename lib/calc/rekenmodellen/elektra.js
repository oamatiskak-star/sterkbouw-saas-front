// lib/calc/rekenmodellen/elektra.js — ElektraModel (P10).
import { num, round, ja } from './_helpers';

const NIVEAU_F = { basis: 0.8, standaard: 1, uitgebreid: 1.3 };

const ElektraModel = {
  object: 'elektra',
  label: 'Elektra',
  output: ['lichtpunten', 'wandcontactdozen', 'schakelaars', 'meterkast', 'data', 'zonnepanelen'],
  inputs: [
    { key: 'woning_m2', label: 'Woonoppervlak', type: 'number', eenheid: 'm²', default: 120, groep: 'maat' },
    { key: 'niveau', label: 'Niveau', type: 'choice', default: 'standaard', groep: 'basis', opties: [['basis', 'Basis'], ['standaard', 'Standaard'], ['uitgebreid', 'Uitgebreid']] },
    { key: 'meterkast', label: 'Meterkast', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'zonnepanelen', label: 'Zonnepanelen', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
  ],
  advancedInputs: [
    { key: 'panelen', label: 'Aantal zonnepanelen', type: 'number', default: 10 },
    { key: 'data', label: 'Data-aansluitingen', type: 'number', default: 2 },
    { key: 'laadpaal', label: 'Laadpaal', type: 'choice', default: 'nee', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
    { key: 'brandmelders', label: 'Brandmelders', type: 'number', default: 3 },
    { key: 'keuring', label: 'Keuring', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  defaults: {},
  bereken(v) {
    const m2 = num(v.woning_m2, 120);
    const f = NIVEAU_F[v.niveau] || 1;
    const licht = Math.max(1, Math.ceil((m2 / 8) * f));
    const wcd = Math.max(1, Math.ceil((m2 / 6) * f));
    const regels = [
      { combiCode: 'CUR-2505', hoeveelheid: licht, omschrijving: 'Lichtpunten' },
      { combiCode: 'CUR-2503', hoeveelheid: wcd, omschrijving: 'Wandcontactdozen' },
      { combiCode: 'CUR-2504', hoeveelheid: licht, omschrijving: 'Schakelaars' },
    ];
    if (ja(v.meterkast)) { regels.push({ combiCode: 'CUR-2501', hoeveelheid: 1, omschrijving: 'Meterkast' }); regels.push({ combiCode: 'CUR-2502', hoeveelheid: 1, omschrijving: 'Groepenkast' }); }
    const data = Math.max(0, Math.round(num(v.data, 2)));
    if (data > 0) regels.push({ combiCode: 'CUR-2509', hoeveelheid: data, omschrijving: 'Data-aansluitingen' });
    if (ja(v.zonnepanelen)) regels.push({ combiCode: 'CUR-2511', hoeveelheid: Math.max(1, Math.round(num(v.panelen, 10))), omschrijving: 'Zonnepanelen' });
    if (ja(v.laadpaal)) regels.push({ combiCode: 'C3-2512', hoeveelheid: 1, omschrijving: 'Laadpaal-voorbereiding' });
    const bm = Math.max(0, Math.round(num(v.brandmelders, 3)));
    if (bm > 0) regels.push({ combiCode: 'C3-2514', hoeveelheid: bm, omschrijving: 'Brandmelders' });
    if (ja(v.keuring)) regels.push({ combiCode: 'C3-2515', hoeveelheid: 1, omschrijving: 'Keuring elektra' });
    return { hoeveelheden: { lichtpunten: licht, wcd }, regels, samenvatting: [{ label: 'Lichtpunten', waarde: licht, eenheid: 'st' }, { label: 'Wandcontactdozen', waarde: wcd, eenheid: 'st' }] };
  },
};
export default ElektraModel;
