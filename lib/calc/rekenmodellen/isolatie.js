// lib/calc/rekenmodellen/isolatie.js — IsolatieModel (P4.1, na-isolatie/verduurzaming).
import { num, round, ja } from './_helpers';

const LOCATIE = { spouw: 'C3-2301', dak: 'C3-2302', vloer: 'C3-2303', gevel: 'C3-2304' };

const IsolatieModel = {
  object: 'isolatie',
  label: 'Isolatie (na-isolatie)',
  output: ['isolatie', 'luchtdichting', 'kierdichting'],
  inputs: [
    { key: 'oppervlak', label: 'Oppervlak', type: 'number', eenheid: 'm²', default: 100, groep: 'maat' },
    { key: 'locatie', label: 'Locatie', type: 'choice', default: 'spouw', groep: 'basis', opties: [['spouw', 'Spouw'], ['dak', 'Dak'], ['vloer', 'Vloer'], ['gevel', 'Gevel (binnen/buiten)']] },
    { key: 'luchtdichting', label: 'Luchtdichting', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
    { key: 'kierdichting', label: 'Kierdichting', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
  ],
  advancedInputs: [
    { key: 'lengte_m', label: 'Lucht-/kierdichting (m¹)', type: 'number', eenheid: 'm', default: 0 },
    { key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 5 },
  ],
  defaults: {},
  bereken(v) {
    const opp = round(num(v.oppervlak, 100) * (1 + num(v.verlies, 5) / 100));
    const lengte = num(v.lengte_m, 0) || round(Math.sqrt(opp) * 4); // schatting omtrek als 0
    const regels = [{ combiCode: LOCATIE[v.locatie] || 'C3-2301', hoeveelheid: opp, omschrijving: `Isolatie (${v.locatie})` }];
    if (ja(v.luchtdichting)) regels.push({ combiCode: 'C3-2311', hoeveelheid: lengte, omschrijving: 'Luchtdichting' });
    if (ja(v.kierdichting)) regels.push({ combiCode: 'C3-2315', hoeveelheid: lengte, omschrijving: 'Kierdichting' });
    return { hoeveelheden: { oppervlak_m2: opp }, regels, samenvatting: [{ label: 'Isolatie', waarde: opp, eenheid: 'm²' }] };
  },
};
export default IsolatieModel;
