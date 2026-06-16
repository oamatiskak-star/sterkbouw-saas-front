// lib/calc/rekenmodellen/lift.js — LiftModel (P5.1).
import { num } from './_helpers';

const LiftModel = {
  object: 'lift',
  label: 'Lift',
  output: ['personenlift'],
  inputs: [
    { key: 'aantal', label: 'Aantal liften', type: 'number', default: 1, groep: 'maat' },
    { key: 'stops', label: 'Stops', type: 'number', default: 3, groep: 'maat' },
    { key: 'type', label: 'Type', type: 'choice', default: 'personen', groep: 'basis', opties: [['personen', 'Personenlift'], ['miva', 'MIVA/rolstoel']] },
  ],
  advancedInputs: [],
  defaults: {},
  bereken(v) {
    const aantal = Math.max(1, Math.round(num(v.aantal, 1)));
    const stops = Math.max(2, Math.round(num(v.stops, 3)));
    // Meerprijs per extra stop boven 2 (ruwweg 8% van de basis per stop) → uitgedrukt in extra st.
    const factor = 1 + Math.max(0, stops - 2) * 0.08;
    const regels = [{ combiCode: 'P5-LIFT', hoeveelheid: Math.round(aantal * factor * 100) / 100, omschrijving: `Personenlift (${stops} stops${v.type === 'miva' ? ', MIVA' : ''})` }];
    return { hoeveelheden: { liften: aantal, stops }, regels, samenvatting: [{ label: 'Liften', waarde: aantal, eenheid: 'st' }, { label: 'Stops', waarde: stops, eenheid: 'st' }] };
  },
};
export default LiftModel;
