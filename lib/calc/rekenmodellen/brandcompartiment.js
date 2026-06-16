// lib/calc/rekenmodellen/brandcompartiment.js — BrandcompartimentModel (P2.2).
// De duurste post bij transformatie/appartementen: compartimentering, woningscheidende wand/vloer
// (brand + geluid), brandwerende doorvoeren/deuren, brandmelding, noodverlichting, vluchtroute.
import { num, round, ja } from './_helpers';

const BrandcompartimentModel = {
  object: 'brandcompartiment',
  label: 'Brandcompartiment',
  output: ['brandscheidingen', 'woningscheidende wand (geluid)', 'woningscheidende vloer', 'brandwerende doorvoeren', 'brandwerende deuren', 'rookmelders', 'brandmeldinstallatie', 'noodverlichting', 'vluchtroute', 'blussers/haspels'],
  inputs: [
    { key: 'woningen', label: 'Woningen / compartimenten', type: 'number', default: 8, groep: 'maat' },
    { key: 'scheidingswand_m2', label: 'Scheidingswanden', type: 'number', eenheid: 'm²', default: 240, groep: 'maat' },
    { key: 'scheidingsvloer_m2', label: 'Scheidingsvloeren', type: 'number', eenheid: 'm²', default: 300, groep: 'maat' },
    { key: 'niveau', label: 'Niveau', type: 'choice', default: 'compleet', groep: 'basis', opties: [['basis', 'Basis'], ['compleet', 'Compleet']] },
    { key: 'brandmeld', label: 'Brandmeldinstallatie', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'noodverlichting', label: 'Noodverlichting', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [
    { key: 'geluidswerend', label: 'Woningscheidend = ook geluid', type: 'choice', default: 'ja', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'doorvoeren', label: 'Brandwerende doorvoeren', type: 'number', default: 0 },
    { key: 'brandwerende_deuren', label: 'Brandwerende deuren', type: 'number', default: 0 },
    { key: 'rookmelders', label: 'Rookmelders', type: 'number', default: 0 },
    { key: 'vluchtroute_borden', label: 'Vluchtroutebordjes', type: 'number', default: 0 },
    { key: 'bekleding_m2', label: 'Brandwerende bekleding (m²)', type: 'number', default: 0 },
  ],
  defaults: {},

  bereken(v) {
    const woningen = Math.max(1, Math.round(num(v.woningen, 8)));
    const wand = num(v.scheidingswand_m2, 240);
    const vloer = num(v.scheidingsvloer_m2, 300);
    const auto = (val, perWoning) => (Math.max(0, Math.round(num(val, 0))) || woningen * perWoning);
    const regels = [];

    if (wand > 0) regels.push({ combiCode: 'C3-2911', hoeveelheid: round(wand), omschrijving: 'Brandscheidingen (wand)' });
    if (ja(v.geluidswerend) && wand > 0) regels.push({ combiCode: 'C3-1709', hoeveelheid: round(wand), omschrijving: 'Geluidswerende wand (woningscheidend)' });
    if (vloer > 0) regels.push({ combiCode: 'P5-B916', hoeveelheid: round(vloer), omschrijving: 'Woningscheidende vloer (brand + geluid)' });

    regels.push({ combiCode: 'C3-2905', hoeveelheid: auto(v.doorvoeren, 6), omschrijving: 'Brandwerende doorvoeren' });
    regels.push({ combiCode: 'CUR-1413', hoeveelheid: auto(v.brandwerende_deuren, 1), omschrijving: 'Brandwerende deuren' });
    regels.push({ combiCode: 'C3-2908', hoeveelheid: auto(v.rookmelders, 2), omschrijving: 'Rookmelders' });

    if (ja(v.brandmeld)) regels.push({ combiCode: 'P5-B907', hoeveelheid: woningen, omschrijving: 'Brandmeldinstallatie' });
    if (ja(v.noodverlichting)) regels.push({ combiCode: 'C3-2513', hoeveelheid: woningen * 3, omschrijving: 'Noodverlichting' });

    if (v.niveau === 'compleet') {
      regels.push({ combiCode: 'P5-B909', hoeveelheid: auto(v.vluchtroute_borden, 2), omschrijving: 'Vluchtroute-aanduiding' });
      regels.push({ combiCode: 'C3-2904', hoeveelheid: woningen, omschrijving: 'Brandblussers' });
      regels.push({ combiCode: 'C3-2903', hoeveelheid: Math.max(1, Math.round(woningen / 4)), omschrijving: 'Brandhaspels' });
    }
    const bekl = num(v.bekleding_m2, 0);
    if (bekl > 0) regels.push({ combiCode: 'C3-2906', hoeveelheid: round(bekl), omschrijving: 'Brandwerende bekleding' });

    return {
      hoeveelheden: { woningen, scheidingswand_m2: round(wand), scheidingsvloer_m2: round(vloer) },
      regels,
      samenvatting: [
        { label: 'Compartimenten', waarde: woningen, eenheid: 'st' },
        { label: 'Scheidingswand', waarde: round(wand), eenheid: 'm²' },
        { label: 'Scheidingsvloer', waarde: round(vloer), eenheid: 'm²' },
      ],
    };
  },
};
export default BrandcompartimentModel;
