// lib/calc/rekenmodellen/fundering.js — FunderingModel (P7.2 referentie-implementatie).
// Calculator kiest "Fundering" + type + maatvoering + beton/bekisting/wapening. Onder water
// ontstaan betonvolume, bekisting, wapening, arbeid, grondwerk → bestaande combi's → werktafel.
// Systeembekisting gebruikt ISO-defaults: geen 40 vragen, alleen afwijkingen als geavanceerde input.
import { num, round } from './_helpers';

const WAPENING_KG_PER_M3 = { licht: 60, standaard: 90, zwaar: 130 };
const BEREIKBAARHEID_F = { standaard: 1, moeilijk: 1.3 };
const ARBEIDSTYPE_F = { standaard: 1, versneld: 1.2 };
const ARBEID_UUR_PER_M3 = 2.5;

const FunderingModel = {
  object: 'fundering',
  label: 'Fundering',
  output: ['betonvolume', 'bekisting', 'wapening', 'grondwerk', 'arbeid', 'materieel (in combi’s)', 'verlies'],

  inputs: [
    { key: 'type', label: 'Type', type: 'choice', default: 'strook', groep: 'basis', opties: [['strook', 'Strokenfundering'], ['plaat', 'Plaatfundering'], ['poeren', 'Poeren'], ['palen', 'Heipalen']] },
    { key: 'betonsoort', label: 'Betonsoort', type: 'choice', default: 'C25/30', groep: 'basis', opties: [['C20/25', 'C20/25'], ['C25/30', 'C25/30'], ['C30/37', 'C30/37'], ['zvb', 'Zelfverdichtend']] },
    { key: 'bekisting', label: 'Bekisting', type: 'choice', default: 'systeem', groep: 'basis', opties: [['systeem', 'Systeembekisting (ISO)'], ['traditioneel', 'Traditioneel'], ['geen', 'Geen']] },
    { key: 'lengte', label: 'Lengte', type: 'number', eenheid: 'm', default: 30, groep: 'maat' },
    { key: 'breedte', label: 'Breedte', type: 'number', eenheid: 'm', default: 0.6, groep: 'maat' },
    { key: 'hoogte', label: 'Hoogte / dikte', type: 'number', eenheid: 'm', default: 0.5, groep: 'maat' },
  ],

  advancedInputs: [
    { key: 'wapening', label: 'Wapeningstype', type: 'choice', default: 'standaard', opties: [['licht', 'Licht'], ['standaard', 'Standaard'], ['zwaar', 'Zwaar']] },
    { key: 'bereikbaarheid', label: 'Bereikbaarheid', type: 'choice', default: 'standaard', opties: [['standaard', 'Standaard'], ['moeilijk', 'Moeilijk bereikbaar']] },
    { key: 'arbeidstype', label: 'Uitvoering', type: 'choice', default: 'standaard', opties: [['standaard', 'Standaard'], ['versneld', 'Versneld']] },
    { key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 5 },
    { key: 'aantal', label: 'Aantal (poeren/palen)', type: 'number', default: 6 },
  ],

  defaults: {},

  bereken(v) {
    const L = num(v.lengte, 30), B = num(v.breedte, 0.6), H = num(v.hoogte, 0.5);
    const verliesF = 1 + num(v.verlies, 5) / 100;
    const wapKg = WAPENING_KG_PER_M3[v.wapening] || 90;
    const arbeidF = (BEREIKBAARHEID_F[v.bereikbaarheid] || 1) * (ARBEIDSTYPE_F[v.arbeidstype] || 1);
    const geenBekisting = v.bekisting === 'geen';
    const regels = [];
    let hoeveelheden = {};
    let samenvatting = [];

    if (v.type === 'palen') {
      const n = Math.max(1, Math.round(num(v.aantal, 10)));
      regels.push({ combiCode: 'CUR-0405', hoeveelheid: n, omschrijving: `Heipalen (${n} st)` });
      hoeveelheden = { palen: n };
      samenvatting = [{ label: 'Aantal palen', waarde: n, eenheid: 'st' }];
    } else if (v.type === 'poeren') {
      const n = Math.max(1, Math.round(num(v.aantal, 6)));
      const betonM3 = round(n * L * B * H * verliesF, 2);
      regels.push({ combiCode: 'CUR-0402', hoeveelheid: n, omschrijving: `Poeren (${n} st, ${v.betonsoort})` });
      hoeveelheden = { poeren: n, beton_m3: betonM3 };
      samenvatting = [{ label: 'Aantal poeren', waarde: n, eenheid: 'st' }, { label: 'Betonvolume', waarde: betonM3, eenheid: 'm³' }];
    } else if (v.type === 'plaat') {
      const betonM3 = round(L * B * H * verliesF, 2);
      const footprint = round(L * B, 2);
      const bekistingM2 = geenBekisting ? 0 : round(2 * (L + B) * H, 2);
      const wapeningKg = round(betonM3 * wapKg, 0);
      const arbeidUur = round(betonM3 * ARBEID_UUR_PER_M3 * arbeidF, 1);
      regels.push({ combiCode: 'C3-0301', hoeveelheid: round(footprint * 0.5, 2), omschrijving: 'Ontgraven bouwput' });
      regels.push({ combiCode: 'C3-0306', hoeveelheid: footprint, omschrijving: 'Zandbed aanbrengen' });
      regels.push({ combiCode: 'C3-0414', hoeveelheid: betonM3, omschrijving: `Betonstorten plaat (${v.betonsoort})` });
      if (bekistingM2 > 0) regels.push({ combiCode: 'C3-0409', hoeveelheid: bekistingM2, omschrijving: `Bekisting (${v.bekisting})` });
      regels.push({ combiCode: 'CUR-0410', hoeveelheid: footprint, omschrijving: `Wapening (${v.wapening}, ~${wapeningKg} kg)` });
      hoeveelheden = { beton_m3: betonM3, bekisting_m2: bekistingM2, wapening_kg: wapeningKg, arbeid_uur: arbeidUur, footprint_m2: footprint };
      samenvatting = bouwSamenvatting(betonM3, bekistingM2, wapeningKg, arbeidUur);
    } else {
      // strokenfundering
      const betonM3 = round(L * B * H * verliesF, 2);
      const grondM3 = round(L * B * H * 1.3, 2);
      const bekistingM2 = geenBekisting ? 0 : round(L * H * 2, 2);
      const wapeningKg = round(betonM3 * wapKg, 0);
      const arbeidUur = round(betonM3 * ARBEID_UUR_PER_M3 * arbeidF, 1);
      const footprint = round(L * B, 2);
      regels.push({ combiCode: 'C3-0302', hoeveelheid: round(L, 2), omschrijving: 'Funderingssleuven graven' });
      regels.push({ combiCode: 'C3-0304', hoeveelheid: grondM3, omschrijving: 'Grond afvoeren' });
      regels.push({ combiCode: 'C3-0414', hoeveelheid: betonM3, omschrijving: `Betonstorten fundering (${v.betonsoort})` });
      if (bekistingM2 > 0) regels.push({ combiCode: 'C3-0409', hoeveelheid: bekistingM2, omschrijving: `Bekisting (${v.bekisting})` });
      regels.push({ combiCode: 'CUR-0410', hoeveelheid: footprint, omschrijving: `Wapening (${v.wapening}, ~${wapeningKg} kg)` });
      hoeveelheden = { beton_m3: betonM3, bekisting_m2: bekistingM2, wapening_kg: wapeningKg, arbeid_uur: arbeidUur, grond_m3: grondM3, footprint_m2: footprint };
      samenvatting = bouwSamenvatting(betonM3, bekistingM2, wapeningKg, arbeidUur);
    }

    return { hoeveelheden, regels, samenvatting };
  },
};

function bouwSamenvatting(beton, bekisting, wapening, arbeid) {
  return [
    { label: 'Betonvolume', waarde: beton, eenheid: 'm³' },
    { label: 'Bekisting', waarde: bekisting, eenheid: 'm²' },
    { label: 'Wapening', waarde: wapening, eenheid: 'kg' },
    { label: 'Arbeid', waarde: arbeid, eenheid: 'uur' },
  ];
}

export default FunderingModel;
