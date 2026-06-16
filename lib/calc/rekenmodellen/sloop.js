// lib/calc/rekenmodellen/sloop.js — SloopModel (P2.1, incl. asbest).
// "Wat wordt verwijderd?" objectgedreven: strippen/complete sloop + losse onderdelen, asbest
// (inventarisatie/sanering) en puinafvoer. Voorkomt vergeten sloop- en asbestkosten.
import { num, round, ja } from './_helpers';

const NIVEAU = { strippen: 'C3-0202', complete: 'CUR-0201' };

const SloopModel = {
  object: 'sloop',
  label: 'Sloop & asbest',
  output: ['strippen/sloop', 'badkamer/keuken', 'tegelwerk', 'plafonds', 'vloeren', 'binnenwanden', 'kozijnen', 'installaties', 'asbest', 'puinafvoer'],
  inputs: [
    { key: 'oppervlak', label: 'Oppervlak (te slopen)', type: 'number', eenheid: 'm²', default: 80, groep: 'maat' },
    { key: 'niveau', label: 'Niveau', type: 'choice', default: 'strippen', groep: 'basis', opties: [['strippen', 'Strippen (casco)'], ['complete', 'Complete sloop'], ['gedeeltelijk', 'Gedeeltelijk (per onderdeel)']] },
    { key: 'asbest', label: 'Asbest', type: 'choice', default: 'geen', groep: 'basis', opties: [['geen', 'Geen'], ['inventarisatie', 'Alleen inventarisatie'], ['sanering', 'Sanering']] },
    { key: 'puinafvoer', label: 'Puinafvoer', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
  ],
  advancedInputs: [
    { key: 'badkamers', label: 'Badkamers slopen', type: 'number', default: 0 },
    { key: 'keukens', label: 'Keukens verwijderen', type: 'number', default: 0 },
    { key: 'kozijnen', label: 'Kozijnen verwijderen', type: 'number', default: 0 },
    { key: 'tegelwerk_m2', label: 'Tegelwerk (m²)', type: 'number', default: 0 },
    { key: 'plafonds_m2', label: 'Plafonds (m²)', type: 'number', default: 0 },
    { key: 'vloeren_m2', label: 'Vloeren (m²)', type: 'number', default: 0 },
    { key: 'binnenwanden_m2', label: 'Binnenwanden (m²)', type: 'number', default: 0 },
    { key: 'installaties', label: 'Installaties demonteren', type: 'number', default: 0 },
    { key: 'asbest_m2', label: 'Asbest (m²)', type: 'number', default: 20 },
    { key: 'puin_m3', label: 'Puin (m³)', type: 'number', default: 0 },
  ],
  defaults: {},

  bereken(v) {
    const opp = num(v.oppervlak, 80);
    const regels = [];
    if (v.niveau !== 'gedeeltelijk' && opp > 0) regels.push({ combiCode: NIVEAU[v.niveau] || 'C3-0202', hoeveelheid: round(opp), omschrijving: v.niveau === 'complete' ? 'Complete sloop' : 'Strippen (casco)' });
    const bk = Math.max(0, Math.round(num(v.badkamers, 0)));
    if (bk > 0) regels.push({ combiCode: 'CUR-0207', hoeveelheid: bk * 5, omschrijving: 'Badkamers slopen' });
    const kk = Math.max(0, Math.round(num(v.keukens, 0)));
    if (kk > 0) regels.push({ combiCode: 'CUR-0208', hoeveelheid: kk, omschrijving: 'Keukens verwijderen' });
    const koz = Math.max(0, Math.round(num(v.kozijnen, 0)));
    if (koz > 0) regels.push({ combiCode: 'CUR-0209', hoeveelheid: koz, omschrijving: 'Kozijnen verwijderen' });
    const paar = [['tegelwerk_m2', 'CUR-0206', 'Tegelwerk verwijderen'], ['plafonds_m2', 'CUR-0204', 'Plafonds verwijderen'], ['vloeren_m2', 'CUR-0205', 'Vloeren verwijderen'], ['binnenwanden_m2', 'CUR-0203', 'Binnenwanden slopen']];
    for (const [k, code, oms] of paar) { const m = num(v[k], 0); if (m > 0) regels.push({ combiCode: code, hoeveelheid: round(m), omschrijving: oms }); }
    const inst = Math.max(0, Math.round(num(v.installaties, 0)));
    if (inst > 0) regels.push({ combiCode: 'CUR-0212', hoeveelheid: inst, omschrijving: 'Installaties demonteren' });

    if (v.asbest === 'inventarisatie' || v.asbest === 'sanering') regels.push({ combiCode: 'P5-D216', hoeveelheid: 1, omschrijving: 'Asbestinventarisatie' });
    if (v.asbest === 'sanering') regels.push({ combiCode: 'C3-0215', hoeveelheid: round(num(v.asbest_m2, 20)), omschrijving: 'Asbestsanering (gecertificeerd)' });

    if (ja(v.puinafvoer)) {
      const puin = num(v.puin_m3, 0) || round(opp * 0.2, 1);
      if (puin > 0) regels.push({ combiCode: 'CUR-0214', hoeveelheid: puin, omschrijving: 'Puinafvoer (container)' });
    }

    return {
      hoeveelheden: { oppervlak_m2: round(opp), posten: regels.length },
      regels,
      samenvatting: [
        { label: 'Te slopen', waarde: round(opp), eenheid: 'm²' },
        { label: 'Sloopposten', waarde: regels.length, eenheid: 'st' },
        ...(v.asbest === 'sanering' ? [{ label: 'Asbestsanering', waarde: round(num(v.asbest_m2, 20)), eenheid: 'm²' }] : []),
      ],
    };
  },
};
export default SloopModel;
