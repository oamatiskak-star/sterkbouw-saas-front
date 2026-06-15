// lib/calc/rekenmodellen/staal.js — StaalconstructieModel (P1.3).
// Staal mag niet langer ontbreken bij nieuwbouw/uitbreiding/transformatie. Object: kolommen,
// liggers, portalen, windverbanden, lateien, raveling + montage, hijswerk, conservering en
// brandwerende behandeling. Staalgewicht drijft conservering/montage/brandwerend aan.
import { num, round, ja } from './_helpers';

// Specifiek oppervlak (m²/kg) voor conservering/brandwerend — vuistwaarde middelzware profielen.
const SPEC_OPP = 0.025;

const StaalconstructieModel = {
  object: 'staal',
  label: 'Staalconstructie',
  output: ['kolommen', 'liggers', 'portalen', 'windverbanden', 'lateien', 'raveling', 'montage', 'hijswerk', 'conservering', 'brandwerende coating'],
  inputs: [
    { key: 'kolommen', label: 'Stalen kolommen', type: 'number', default: 6, groep: 'maat' },
    { key: 'liggers_m', label: 'Liggers (totaal m¹)', type: 'number', eenheid: 'm', default: 40, groep: 'maat' },
    { key: 'gewicht_kg_m', label: 'Gewicht', type: 'number', eenheid: 'kg/m', default: 45, groep: 'maat' },
    { key: 'conservering', label: 'Conservering', type: 'choice', default: 'coating', groep: 'basis', opties: [['coating', 'Coating'], ['thermisch', 'Thermisch verzinkt'], ['geen', 'Geen']] },
    { key: 'brandwerend', label: 'Brandwerendheid', type: 'choice', default: 'geen', groep: 'basis', opties: [['geen', 'Geen'], ['60', '60 min'], ['90', '90 min']] },
    { key: 'hijs', label: 'Hijswerk/kraan', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [
    { key: 'portalen', label: 'Portalen', type: 'number', default: 0 },
    { key: 'windverbanden', label: 'Windverbanden', type: 'number', default: 0 },
    { key: 'lateien', label: 'Lateien', type: 'number', default: 0 },
    { key: 'raveling', label: 'Raveling/sparingen', type: 'number', default: 0 },
    { key: 'hijsdagen', label: 'Hijsdagen', type: 'number', default: 2 },
    { key: 'kolomhoogte', label: 'Kolomhoogte (m)', type: 'number', eenheid: 'm', default: 3 },
    { key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 3 },
  ],
  defaults: {},

  bereken(v) {
    const kolommen = Math.max(0, Math.round(num(v.kolommen, 6)));
    const liggersM = num(v.liggers_m, 40);
    const gpm = num(v.gewicht_kg_m, 45);
    const verliesF = 1 + num(v.verlies, 3) / 100;
    const kolomhoogte = num(v.kolomhoogte, 3);
    const staalKg = round((liggersM + kolommen * kolomhoogte) * gpm * verliesF, 0);
    const opp = round(staalKg * SPEC_OPP, 1);

    const regels = [];
    if (kolommen > 0) regels.push({ combiCode: 'C3-0701', hoeveelheid: kolommen, omschrijving: 'Stalen kolommen' });
    if (liggersM > 0) regels.push({ combiCode: 'C3-0702', hoeveelheid: round(liggersM), omschrijving: 'Stalen liggers' });
    const portalen = Math.max(0, Math.round(num(v.portalen, 0)));
    if (portalen > 0) regels.push({ combiCode: 'P5-S704', hoeveelheid: portalen, omschrijving: 'Stalen portalen' });
    const wind = Math.max(0, Math.round(num(v.windverbanden, 0)));
    if (wind > 0) regels.push({ combiCode: 'P5-S716', hoeveelheid: wind, omschrijving: 'Windverbanden' });
    const lateien = Math.max(0, Math.round(num(v.lateien, 0)));
    if (lateien > 0) regels.push({ combiCode: 'CUR-0809', hoeveelheid: lateien, omschrijving: 'Stalen lateien' });
    const raveling = Math.max(0, Math.round(num(v.raveling, 0)));
    if (raveling > 0) regels.push({ combiCode: 'P5-S718', hoeveelheid: raveling, omschrijving: 'Raveling/sparingen' });

    // Montage (per ton), conservering en brandwerend (per m²) volgen uit het staalgewicht.
    if (staalKg > 0) regels.push({ combiCode: 'P5-S713', hoeveelheid: round(staalKg / 1000, 2), omschrijving: 'Montage staalconstructie' });
    if (v.conservering === 'coating' && opp > 0) regels.push({ combiCode: 'C3-0712', hoeveelheid: opp, omschrijving: 'Conservering (coating)' });
    if (v.brandwerend !== 'geen' && opp > 0) regels.push({ combiCode: 'P5-S717', hoeveelheid: opp, omschrijving: `Brandwerende coating (${v.brandwerend} min)` });
    if (ja(v.hijs)) regels.push({ combiCode: 'P5-S715', hoeveelheid: Math.max(1, Math.round(num(v.hijsdagen, 2))), omschrijving: 'Hijswerk (kraan)' });

    return {
      hoeveelheden: { staal_kg: staalKg, oppervlak_m2: opp, kolommen, liggers_m: round(liggersM) },
      regels,
      samenvatting: [
        { label: 'Staalgewicht', waarde: staalKg, eenheid: 'kg' },
        { label: 'Te conserveren', waarde: opp, eenheid: 'm²' },
        { label: 'Kolommen', waarde: kolommen, eenheid: 'st' },
      ],
    };
  },
};
export default StaalconstructieModel;
