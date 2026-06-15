// lib/calc/rekenmodellen/abk.js — ABK / StaartkostenModel (P1.1).
// Hoofdstuk 00 mag nooit meer handmatig of vergeten zijn. Dit model bouwt de complete
// staartkosten objectgedreven op uit looptijd, bouwsom en projectcondities — defaults per
// projecttype, gebruiker vult alleen afwijkingen. Output = bestaande ABK-combi's onder 00.
import { num, round, ja } from './_helpers';

// Richtpercentage ABK t.o.v. bouwsom (alleen ter controle/indicatie; werkelijke kosten uit de regels).
const ABK_RICHT = { nieuwbouw: 7, renovatie: 9, transformatie: 10, uitbreiding: 8, verduurzaming: 7, badkamer: 6, woning: 8, appartementencomplex: 9 };
const AFVAL_PER_MAAND = { laag: 1, middel: 2, hoog: 4 };

const ABKModel = {
  object: 'abk',
  label: 'ABK / Staartkosten',
  output: ['bouwplaatsinrichting', 'ketenpark', 'opslag', 'bouwhekken', 'steiger', 'kraan', 'afvalcontainers', 'KAM/veiligheid', 'schoonmaak', 'oplevering', 'bouwstroom/-water', 'uitvoerder/toezicht', 'algemene bouwplaatsuren'],
  inputs: [
    { key: 'bouwsom', label: 'Bouwsom (richt)', type: 'number', eenheid: '€', default: 250000, groep: 'maat' },
    { key: 'looptijd_weken', label: 'Looptijd', type: 'number', eenheid: 'weken', default: 12, groep: 'maat' },
    { key: 'medewerkers', label: 'Medewerkers', type: 'number', default: 4, groep: 'maat' },
    { key: 'projecttype', label: 'Projecttype', type: 'choice', default: 'nieuwbouw', groep: 'basis', opties: [['nieuwbouw', 'Nieuwbouw'], ['renovatie', 'Renovatie'], ['transformatie', 'Transformatie'], ['uitbreiding', 'Uitbreiding'], ['badkamer', 'Badkamer'], ['woning', 'Woning'], ['appartementencomplex', 'Appartementen']] },
    { key: 'steiger', label: 'Steiger nodig', type: 'choice', default: 'ja', groep: 'basis', opties: [['ja', 'Ja'], ['nee', 'Nee']] },
    { key: 'kraan', label: 'Kraan nodig', type: 'choice', default: 'nee', groep: 'basis', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
  ],
  advancedInputs: [
    { key: 'binnenstedelijk', label: 'Binnenstedelijk', type: 'choice', default: 'nee', opties: [['nee', 'Nee'], ['ja', 'Ja']] },
    { key: 'afval', label: 'Afvalintensiteit', type: 'choice', default: 'middel', opties: [['laag', 'Laag'], ['middel', 'Middel'], ['hoog', 'Hoog']] },
    { key: 'steiger_m2', label: 'Steiger (m²)', type: 'number', eenheid: 'm²', default: 200 },
    { key: 'kraan_dagen', label: 'Kraandagen', type: 'number', default: 5 },
    { key: 'schoonmaak_m2', label: 'Schoonmaak (m²)', type: 'number', eenheid: 'm²', default: 150 },
    { key: 'bouwhek_m', label: 'Bouwhekken (m¹)', type: 'number', eenheid: 'm', default: 80 },
    { key: 'toezicht_per_week', label: 'Toezicht (dagdelen/week)', type: 'number', default: 2 },
  ],
  defaults: {},

  bereken(v) {
    const weken = Math.max(1, Math.round(num(v.looptijd_weken, 12)));
    const maanden = Math.max(1, Math.ceil(weken / 4.33));
    const afvalAantal = Math.max(1, (AFVAL_PER_MAAND[v.afval] || 2) * maanden);
    const toezichtWeken = round(weken * (num(v.toezicht_per_week, 2) / 5)); // dagdelen → fractie fte-week

    const regels = [
      { combiCode: 'P5-A020', hoeveelheid: 1, omschrijving: 'Bouwplaatsinrichting' },
      { combiCode: 'P5-A021', hoeveelheid: maanden, omschrijving: 'Ketenpark (huur)' },
      { combiCode: 'P5-A030', hoeveelheid: maanden, omschrijving: 'Opslag / loods' },
      { combiCode: 'P5-A023', hoeveelheid: afvalAantal, omschrijving: 'Afvalcontainers' },
      { combiCode: 'P5-A025', hoeveelheid: 1, omschrijving: 'Veiligheidsvoorzieningen & PBM' },
      { combiCode: 'P5-A026', hoeveelheid: 1, omschrijving: 'KAM' },
      { combiCode: 'P5-A028', hoeveelheid: round(num(v.schoonmaak_m2, 150)), omschrijving: 'Bouwschoonmaak' },
      { combiCode: 'P5-A027', hoeveelheid: 1, omschrijving: 'Oplevering & dossier' },
      { combiCode: 'P5-A034', hoeveelheid: maanden, omschrijving: 'Bouwstroom' },
      { combiCode: 'P5-A035', hoeveelheid: maanden, omschrijving: 'Bouwwater' },
      { combiCode: 'P5-A032', hoeveelheid: Math.max(1, toezichtWeken), omschrijving: 'Uitvoerder / toezicht' },
      { combiCode: 'P5-A033', hoeveelheid: weken, omschrijving: 'Algemene bouwplaatsuren' },
    ];
    if (ja(v.steiger)) regels.push({ combiCode: 'P5-A022', hoeveelheid: round(num(v.steiger_m2, 200)), omschrijving: 'Gevelsteiger' });
    if (ja(v.kraan)) regels.push({ combiCode: 'P5-A024', hoeveelheid: Math.max(1, Math.round(num(v.kraan_dagen, 5))), omschrijving: 'Mobiele kraan' });
    if (ja(v.binnenstedelijk)) regels.push({ combiCode: 'P5-A031', hoeveelheid: round(num(v.bouwhek_m, 80)), omschrijving: 'Bouwhekken' });

    const bouwsom = num(v.bouwsom, 0);
    const richtPct = ABK_RICHT[v.projecttype] || 7;
    const richtBedrag = round(bouwsom * richtPct / 100, 0);

    return {
      hoeveelheden: { weken, maanden, posten: regels.length },
      regels,
      samenvatting: [
        { label: 'Looptijd', waarde: weken, eenheid: 'weken' },
        { label: 'ABK-posten', waarde: regels.length, eenheid: 'st' },
        { label: `Richtlijn ABK (${richtPct}% van bouwsom)`, waarde: richtBedrag, eenheid: '€' },
      ],
    };
  },
};
export default ABKModel;
