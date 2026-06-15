// lib/calc/besteleenheden.js — P7.7 besteleenheid & verpakking.
// Vertaalt het verbruik (bv. 75 kg tegellijm) naar inkoop-eenheden (3 zakken à 25 kg), afgerond
// omhoog. Zo kan de werkvoorbereider daadwerkelijk bestellen i.p.v. omrekenen. Pure functies;
// geen DB-wijziging. Materialen zonder verpakkingsregel blijven per stuk/m²/m¹ besteld.
const norm = (e) => (e || '').toString().toLowerCase().replace('m2', 'm²').replace('m3', 'm³').replace('m1', 'm¹').trim();

// Verpakkingsregels: trefwoord + eenheid → verpakking + inhoud per verpakking.
const REGELS = [
  { match: /lijm/i, eenheid: 'kg', verpakking: 'zak', inhoud: 25 },
  { match: /voeg/i, eenheid: 'kg', verpakking: 'zak', inhoud: 5 },
  { match: /(cement|mortel|specie|metselspecie)/i, eenheid: 'kg', verpakking: 'zak', inhoud: 25 },
  { match: /(stuc|gips|pleister|raap|spack)/i, eenheid: 'kg', verpakking: 'zak', inhoud: 25 },
  { match: /(kit|sealant)/i, eenheid: 'kus', verpakking: 'koker', inhoud: 1 },
  { match: /(primer|coating|smeerfolie|waterdicht)/i, eenheid: 'l', verpakking: 'bus', inhoud: 10 },
  { match: /(verf|lak|grondverf|muurverf)/i, eenheid: 'l', verpakking: 'blik', inhoud: 10 },
  { match: /tegel/i, eenheid: 'm²', verpakking: 'doos', inhoud: 1.2 },
  { match: /(isolat|isolatie)/i, eenheid: 'm²', verpakking: 'pak', inhoud: 5 },
];

// Geeft {verpakking, inhoud, eenheid} of null (geen verpakkingsregel → per eigen eenheid bestellen).
export function verpakkingVoor(omschrijving, eenheid) {
  const e = norm(eenheid);
  for (const r of REGELS) {
    if (r.match.test(omschrijving || '') && (norm(r.eenheid) === e || e === '')) return { verpakking: r.verpakking, inhoud: r.inhoud, eenheid: r.eenheid };
  }
  return null;
}

// Verrijkt een bestelregel met besteleenheid + aantal verpakkingen (afgerond omhoog).
export function verrijkBestelregel(r) {
  const vp = verpakkingVoor(r.omschrijving, r.eenheid);
  if (!vp) return { ...r, bestel: null };
  const aantal = Math.max(1, Math.ceil((Number(r.hoeveelheid) || 0) / vp.inhoud));
  return { ...r, bestel: { ...vp, aantal } };
}

export const verrijkRegels = (regels = []) => regels.map(verrijkBestelregel);
