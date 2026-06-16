// lib/calc/rekenmodellen/gevel.js — GevelModel (P9).
import { num, round, ja } from './_helpers';

const DRAGER = { spouwmuur: 'CB-SPOUW', metselwerk: 'CUR-0901', houtskelet: 'C3-0806' };
const BEKLEDING = { hout: 'C3-1001', steenstrips: 'C3-1005', stuc: 'C3-1006', kunststof: 'C3-1002' };

const GevelModel = {
  object: 'gevel',
  label: 'Gevel',
  output: ['gevelconstructie', 'isolatie', 'bekleding', 'lateien'],
  inputs: [
    { key: 'oppervlak', label: 'Geveloppervlak', type: 'number', eenheid: 'm²', default: 120, groep: 'maat' },
    { key: 'drager', label: 'Constructie', type: 'choice', default: 'spouwmuur', groep: 'basis', opties: [['spouwmuur', 'Spouwmuur'], ['metselwerk', 'Metselwerk'], ['houtskelet', 'Houtskelet']] },
    { key: 'bekleding', label: 'Bekleding', type: 'choice', default: 'geen', groep: 'basis', opties: [['geen', 'Geen (zichtmetselwerk)'], ['hout', 'Hout'], ['steenstrips', 'Steenstrips'], ['stuc', 'Stuc'], ['kunststof', 'Kunststof']] },
    { key: 'isolatie', label: 'Gevelisolatie', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [
    { key: 'rc_waarde', label: 'Warmteweerstand Rc', type: 'number', eenheid: 'm²K/W', default: '' }, // spec/aanname (geen prijseffect tot combi-varianten)
    { key: 'steiger', label: 'Steiger', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'lateien', label: 'Lateien (aantal)', type: 'number', default: 8 },
    { key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 5 },
  ],
  defaults: {},
  bereken(v) {
    const opp = round(num(v.oppervlak, 120) * (1 + num(v.verlies, 5) / 100));
    const regels = [];
    regels.push({ combiCode: DRAGER[v.drager] || 'CB-SPOUW', hoeveelheid: opp, omschrijving: `Gevel (${v.drager})` });
    if (ja(v.isolatie)) regels.push({ combiCode: 'CUR-0807', hoeveelheid: opp, omschrijving: 'Gevelisolatie' });
    if (v.bekleding !== 'geen') regels.push({ combiCode: BEKLEDING[v.bekleding] || 'C3-1001', hoeveelheid: opp, omschrijving: `Gevelbekleding (${v.bekleding})` });
    const lat = Math.max(0, Math.round(num(v.lateien, 8)));
    if (lat > 0) regels.push({ combiCode: 'CUR-0809', hoeveelheid: lat, omschrijving: 'Lateien' });
    if (ja(v.steiger)) regels.push({ combiCode: 'P5-A022', hoeveelheid: opp, omschrijving: 'Gevelsteiger' });
    return { hoeveelheden: { oppervlak_m2: opp, lateien: lat }, regels, samenvatting: [{ label: 'Geveloppervlak', waarde: opp, eenheid: 'm²' }] };
  },
};
export default GevelModel;
