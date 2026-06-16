// lib/calc/rekenmodellen/badkamer.js — BadkamerModel (P7.2 referentie-implementatie).
// Object → keuzes → formules → hoeveelheden → bestaande combi's → werktafel.
// De gebruiker ziet maatvoering + 3 basiskeuzes; alles overige onder "Afwijkingen".
import { num, round, ja } from './_helpers';

const wandtegelCombi = (formaat) => (formaat === '300x600' ? 'CUR-2001' : 'C3-2001A');
const vloertegelCombi = (formaat) => (formaat === '600x600' ? 'CUR-2002' : 'C3-2002A');

const BadkamerModel = {
  object: 'badkamer',
  label: 'Badkamer',
  output: ['tegelwerk', 'lijm & voeg', 'kimband', 'kit', 'waterdichting', 'sanitair', 'elektra', 'ventilatie', 'verwarming', 'arbeid (in combi’s)'],

  inputs: [
    { key: 'lengte', label: 'Lengte', type: 'number', eenheid: 'm', default: 2.5, groep: 'maat' },
    { key: 'breedte', label: 'Breedte', type: 'number', eenheid: 'm', default: 2.2, groep: 'maat' },
    { key: 'hoogte', label: 'Hoogte', type: 'number', eenheid: 'm', default: 2.6, groep: 'maat' },
    { key: 'wandtegel', label: 'Wandtegels', type: 'choice', default: '600x600', groep: 'basis', opties: [['300x600', '30×60'], ['600x600', '60×60'], ['1200x600', '120×60']] },
    { key: 'vloertegel', label: 'Vloertegels', type: 'choice', default: '600x600', groep: 'basis', opties: [['600x600', '60×60'], ['800x800', '80×80'], ['1200x1200', '120×120']] },
    { key: 'douche', label: 'Douche', type: 'choice', default: 'inloop', groep: 'basis', opties: [['inloop', 'Inloopdouche'], ['cabine', 'Cabine']] },
  ],

  advancedInputs: [
    { key: 'openingen', label: 'Openingen (deuren/ramen)', type: 'number', default: 1 },
    { key: 'wastafel', label: 'Wastafel', type: 'choice', default: 'enkel', opties: [['enkel', 'Enkel'], ['dubbel', 'Dubbel']] },
    { key: 'wc', label: 'Toilet', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'bad', label: 'Ligbad', type: 'choice', default: 'nee', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
    { key: 'spiegel', label: 'Spiegel', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'meubel', label: 'Wastafelmeubel', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'verwarming', label: 'Verwarming', type: 'choice', default: 'radiator', opties: [['geen', 'Geen'], ['radiator', 'Designradiator'], ['vloerverwarming', 'Vloerverwarming'], ['beide', 'Radiator + vloer']] },
    { key: 'leidingwerk', label: 'Leidingwerk', type: 'choice', default: 'nieuw', opties: [['nieuw', 'Nieuw'], ['verplaatsen', 'Verplaatsen bestaand'], ['geen', 'Geen']] },
    { key: 'ventilatie', label: 'Ventilatie', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'voeg', label: 'Voeg', type: 'choice', default: 'normaal', opties: [['normaal', 'Normaal'], ['epoxy', 'Epoxy']] },
    { key: 'verlies', label: 'Verliesfactor', type: 'number', eenheid: '%', default: 10 },
  ],

  defaults: {},

  bereken(v) {
    const L = num(v.lengte, 2.5), B = num(v.breedte, 2.2), H = num(v.hoogte, 2.6);
    const verliesF = 1 + num(v.verlies, 10) / 100;
    const vloer = round(L * B);
    const plafond = vloer;
    const omtrek = round(2 * (L + B));
    const wandBruto = omtrek * H;
    const openingAftrek = num(v.openingen, 1) * 2; // ~2 m² per opening
    const wand = round(Math.max(0, wandBruto - openingAftrek));

    const wandTegelM2 = round(wand * verliesF);
    const vloerTegelM2 = round(vloer * verliesF);

    const regels = [];
    regels.push({ combiCode: wandtegelCombi(v.wandtegel), hoeveelheid: wandTegelM2, omschrijving: `Wandtegels ${v.wandtegel} (incl. lijm + voeg)` });
    regels.push({ combiCode: vloertegelCombi(v.vloertegel), hoeveelheid: vloerTegelM2, omschrijving: `Vloertegels ${v.vloertegel} (incl. lijm + voeg)` });
    regels.push({ combiCode: 'C3-2012', hoeveelheid: vloer, omschrijving: 'Waterdichting (smeerfolie)' });
    regels.push({ combiCode: 'C3-2010', hoeveelheid: omtrek, omschrijving: 'Kimband (vloer-wand)' });
    regels.push({ combiCode: 'C3-2711', hoeveelheid: omtrek, omschrijving: 'Kitwerk sanitair' });
    if (v.voeg === 'epoxy') regels.push({ combiCode: 'C3-2009', hoeveelheid: round(wand + vloer), omschrijving: 'Epoxy voegwerk' });

    regels.push({ combiCode: 'CUR-2703', hoeveelheid: 1, omschrijving: `Douche (${v.douche})` });
    if (v.douche === 'inloop') regels.push({ combiCode: 'CUR-2012', hoeveelheid: 1, omschrijving: 'Douchegoot' });
    regels.push({ combiCode: 'CUR-2704', hoeveelheid: v.wastafel === 'dubbel' ? 2 : 1, omschrijving: `Wastafel (${v.wastafel})` });
    if (ja(v.wc)) regels.push({ combiCode: 'CUR-2701', hoeveelheid: 1, omschrijving: 'Toilet (hangend)' });
    if (ja(v.bad)) regels.push({ combiCode: 'CUR-2705', hoeveelheid: 1, omschrijving: 'Ligbad' });
    if (ja(v.meubel)) regels.push({ combiCode: 'CUR-2713', hoeveelheid: 1, omschrijving: 'Badkamermeubel' });
    if (ja(v.spiegel)) regels.push({ combiCode: 'C3-2715', hoeveelheid: 1, omschrijving: 'Spiegel / accessoires' });
    // Verwarming: radiator (st), vloerverwarming (vloer-m²) of beide.
    if (v.verwarming === 'radiator' || v.verwarming === 'beide') regels.push({ combiCode: 'CUR-2803', hoeveelheid: 1, omschrijving: 'Designradiator' });
    if (v.verwarming === 'vloerverwarming' || v.verwarming === 'beide') regels.push({ combiCode: 'CUR-2804', hoeveelheid: vloer, omschrijving: 'Vloerverwarming' });
    // Leidingwerk sanitair (nieuw of verplaatsen bestaand).
    if (v.leidingwerk && v.leidingwerk !== 'geen') {
      const f = v.leidingwerk === 'verplaatsen' ? 1.4 : 1;
      regels.push({ combiCode: 'C3-2714', hoeveelheid: round(omtrek * f), omschrijving: `Leidingwerk sanitair (${v.leidingwerk})` });
    }
    if (ja(v.ventilatie)) regels.push({ combiCode: 'CUR-2601', hoeveelheid: 1, omschrijving: 'Mechanische ventilatie' });
    regels.push({ combiCode: 'CUR-2505', hoeveelheid: 2, omschrijving: 'Lichtpunten' });
    regels.push({ combiCode: 'CUR-2503', hoeveelheid: 2, omschrijving: 'Wandcontactdozen' });

    const hoeveelheden = { vloer_m2: vloer, wand_m2: wand, plafond_m2: plafond, omtrek_m: omtrek, wandtegel_m2: wandTegelM2, vloertegel_m2: vloerTegelM2 };
    const samenvatting = [
      { label: 'Vloeroppervlak', waarde: vloer, eenheid: 'm²' },
      { label: 'Wandoppervlak (netto)', waarde: wand, eenheid: 'm²' },
      { label: 'Wandtegels incl. verlies', waarde: wandTegelM2, eenheid: 'm²' },
      { label: 'Vloertegels incl. verlies', waarde: vloerTegelM2, eenheid: 'm²' },
    ];
    return { hoeveelheden, regels, samenvatting };
  },
};

export default BadkamerModel;
