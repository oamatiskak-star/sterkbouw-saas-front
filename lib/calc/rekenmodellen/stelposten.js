// lib/calc/rekenmodellen/stelposten.js — StelpostenModel (P4.3).
// Vrije bedragen die geen vaste eenheidsprijs hebben: onvoorzien (% van bouwsom), meerwerk-
// reservering en losse stelposten. Elke post landt 1-op-1 als €-regel (combi P5-STEL = €1/€).
// De omschrijving pas je daarna in de werktafel aan.
import { num, round } from './_helpers';

const StelpostenModel = {
  object: 'stelposten',
  label: 'Stelposten & onvoorzien',
  output: ['onvoorzien', 'meerwerk-reservering', 'stelposten'],
  inputs: [
    { key: 'bouwsom', label: 'Bouwsom (richt)', type: 'number', eenheid: '€', default: 250000, groep: 'maat' },
    { key: 'onvoorzien_pct', label: 'Onvoorzien', type: 'number', eenheid: '%', default: 5, groep: 'basis' },
    { key: 'meerwerk_pct', label: 'Meerwerk-reservering', type: 'number', eenheid: '%', default: 0, groep: 'basis' },
  ],
  advancedInputs: [
    { key: 'stelpost1', label: 'Stelpost 1 (€)', type: 'number', default: 0 },
    { key: 'stelpost2', label: 'Stelpost 2 (€)', type: 'number', default: 0 },
    { key: 'stelpost3', label: 'Stelpost 3 (€)', type: 'number', default: 0 },
    { key: 'stelpost4', label: 'Stelpost 4 (€)', type: 'number', default: 0 },
  ],
  defaults: {},
  bereken(v) {
    const bouwsom = num(v.bouwsom, 0);
    const regels = [];
    const onv = round(bouwsom * num(v.onvoorzien_pct, 5) / 100, 0);
    if (onv > 0) regels.push({ combiCode: 'P5-STEL', hoeveelheid: onv, omschrijving: `Onvoorzien (${num(v.onvoorzien_pct, 5)}%)` });
    const mw = round(bouwsom * num(v.meerwerk_pct, 0) / 100, 0);
    if (mw > 0) regels.push({ combiCode: 'P5-STEL', hoeveelheid: mw, omschrijving: `Meerwerk-reservering (${num(v.meerwerk_pct, 0)}%)` });
    for (let i = 1; i <= 4; i++) {
      const bedrag = round(num(v['stelpost' + i], 0), 0);
      if (bedrag > 0) regels.push({ combiCode: 'P5-STEL', hoeveelheid: bedrag, omschrijving: `Stelpost ${i}` });
    }
    const totaal = regels.reduce((s, r) => s + r.hoeveelheid, 0);
    return {
      hoeveelheden: { posten: regels.length, totaal_eur: totaal },
      regels,
      samenvatting: [
        { label: 'Stelposten', waarde: regels.length, eenheid: 'st' },
        { label: 'Totaal stelposten', waarde: totaal, eenheid: '€' },
      ],
    };
  },
};
export default StelpostenModel;
