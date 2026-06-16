// lib/calc/rapportageEngine.js
// Sprint 9 — Rapportage & Management. Leest uit werktafel/offerte/planning/bestellingen/versies.
// Pure functies; geen nieuwe calculatiemotor; AI uitsluitend adviserend (signaleert, wijzigt nooit).
import { computeRow, computeTotalen } from '@/lib/calc/werktafelTotals';
import { faseVanCategorie, FASE_LABEL } from '@/lib/calc/planningEngine';
import { berekenKpi, termijnBedragen } from '@/services/offerteExcellence';

const n = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0);
const r0 = (v) => Math.round(n(v));
const pct = (deel, geheel) => (geheel > 0 ? Math.round((deel / geheel) * 1000) / 10 : 0);

const MARGE_GRENS = 8; // % ondergrens voor waarschuwing

// Regio-/prijsfactor reconstrueren uit de (reeds factored) totalen, zodat de
// per-fase/hoofdstuk-kostprijzen exact optellen tot dezelfde directe kosten.
function factorUitTotalen(rows, totalen) {
  let raw = 0;
  for (const row of rows || []) raw += computeRow(row).kostprijs; // factor 1
  return raw > 0 ? n(totalen?.directe_kosten) / raw : 1;
}

// Kostprijs (directe kosten) per planningfase, afgeleid uit de werktafel.
function kostprijsPerFase(chapters, rows, factor = 1) {
  const chById = new Map((chapters || []).map((c) => [c.id, c]));
  const map = {};
  for (const row of rows || []) {
    const ch = chById.get(row.chapter_id);
    const fkey = faseVanCategorie(ch?.code);
    map[fkey] = (map[fkey] || 0) + computeRow(row, factor).kostprijs;
  }
  return map;
}

function margePerHoofdstuk(chapters, rows, totalen, factor = 1) {
  const opslagFactor = totalen.directe_kosten > 0 ? totalen.verkoopprijs_excl / totalen.directe_kosten : 1;
  const chById = new Map((chapters || []).map((c) => [c.id, c]));
  const map = new Map();
  for (const row of rows || []) {
    const ch = chById.get(row.chapter_id);
    const naam = ch?.naam || ch?.code || 'Overig';
    map.set(naam, (map.get(naam) || 0) + computeRow(row, factor).kostprijs);
  }
  return [...map.entries()].filter(([, k]) => k > 0).map(([naam, kostprijs]) => {
    const verkoop = kostprijs * opslagFactor;
    const marge = verkoop - kostprijs;
    return { naam, kostprijs: r0(kostprijs), verkoop: r0(verkoop), marge: r0(marge), margePct: pct(marge, verkoop), vlag: pct(marge, verkoop) < MARGE_GRENS ? 'laag' : null };
  }).sort((a, b) => b.kostprijs - a.kostprijs);
}

// Begroot / Actueel / Prognose per kostensoort.
function begrootActueelPrognose(totalen, bestellingen) {
  const besteld = (bestellingen || []).filter((b) => b.status !== 'concept').reduce((s, b) => s + n(b.totaal), 0);
  const geleverd = (bestellingen || []).filter((b) => b.status === 'geleverd').reduce((s, b) => s + n(b.totaal), 0);
  const matBegroot = n(totalen.materiaal);
  const rij = (label, begroot, actueel, prognose) => ({ label, begroot: r0(begroot), actueel: actueel == null ? null : r0(actueel), prognose: r0(prognose) });
  return [
    rij('Materiaal', matBegroot, geleverd, Math.max(matBegroot, besteld)),
    rij('Arbeid', totalen.arbeid, null, totalen.arbeid),
    rij('Materieel', totalen.materieel, null, totalen.materieel),
    rij('AK', totalen.akBedrag, null, totalen.akBedrag),
    rij('ABK', totalen.abkBedrag, null, totalen.abkBedrag),
    rij('Risico', totalen.risicoBedrag, null, totalen.risicoBedrag),
    rij('Winst', totalen.winstBedrag, null, totalen.winstBedrag),
  ];
}

// Cashflow per fase: termijn-inkomsten vs uitgaven (directe kosten per fase).
function cashflow(chapters, rows, planning, offerte, kpi, factor = 1) {
  const fases = planning?.fases || [];
  const kpf = kostprijsPerFase(chapters, rows, factor);
  const termijnen = termijnBedragen(offerte?.termijnen, kpi?.investering || 0);
  // verdeel termijnen evenredig over de fases op basis van cumulatieve duur
  const totDuur = fases.reduce((s, f) => s + f.duur_dagen, 0) || 1;
  let cumDuur = 0;
  let tIdx = 0;
  let cum = 0, piek = 0;
  const rijen = [];
  for (const f of fases) {
    cumDuur += f.duur_dagen;
    const grens = (cumDuur / totDuur) * 100;
    let inkomst = 0;
    let cumPct = termijnen.slice(0, tIdx).reduce((s, t) => s + n(t.pct), 0);
    while (tIdx < termijnen.length && cumPct + n(termijnen[tIdx].pct) <= grens + 0.001) { inkomst += n(termijnen[tIdx].bedrag); cumPct += n(termijnen[tIdx].pct); tIdx++; }
    const uitgave = kpf[f.key] || 0;
    const netto = inkomst - uitgave;
    cum += netto; piek = Math.min(piek, cum);
    rijen.push({ fase: f.label, inkomst: r0(inkomst), uitgave: r0(uitgave), netto: r0(netto), cumulatief: r0(cum) });
  }
  // resterende termijnen op oplevering
  if (tIdx < termijnen.length) {
    const rest = termijnen.slice(tIdx).reduce((s, t) => s + n(t.bedrag), 0);
    cum += rest; rijen.push({ fase: 'Oplevering (resttermijn)', inkomst: r0(rest), uitgave: 0, netto: r0(rest), cumulatief: r0(cum) });
  }
  return { rijen, piekfinanciering: r0(piek) };
}

function inkoopRapport(bestellingen) {
  const besteld = bestellingen.filter((b) => b.status !== 'concept').reduce((s, b) => s + n(b.totaal), 0);
  const ontvangen = bestellingen.filter((b) => b.status === 'geleverd').reduce((s, b) => s + n(b.totaal), 0);
  const vandaag = new Date().toISOString().slice(0, 10);
  const geplaatst = bestellingen.filter((b) => b.status !== 'concept');
  const optijd = geplaatst.filter((b) => b.status === 'geleverd' && (!b.verwacht_at || (b.geleverd_at || '').slice(0, 10) <= b.verwacht_at)).length;
  const vertraagd = bestellingen.filter((b) => b.status === 'geplaatst' && b.verwacht_at && b.verwacht_at < vandaag).length;
  return {
    besteld: r0(besteld), ontvangen: r0(ontvangen), openstaand: r0(besteld - ontvangen),
    aantal_leveranciers: new Set(bestellingen.map((b) => b.leverancier_id).filter(Boolean)).size,
    leverbetrouwbaarheid: geplaatst.length ? pct(optijd, geplaatst.length) : null,
    vertraagde_leveringen: vertraagd,
  };
}

function risicoKaarten(totalen, planning, bestellingen, bap) {
  const kaarten = [];
  if (totalen.margePct < MARGE_GRENS) kaarten.push({ niveau: 'hoog', soort: 'marge', tekst: `Marge ${Math.round(totalen.margePct)}% onder de grens van ${MARGE_GRENS}%.` });
  const mat = bap.find((b) => b.label === 'Materiaal');
  if (mat && mat.prognose > mat.begroot) kaarten.push({ niveau: 'midden', soort: 'prijsrisico', tekst: `Materiaal-prognose (${mat.prognose}) overschrijdt begroting (${mat.begroot}).` });
  for (const w of planning?.waarschuwingen || []) if (w.niveau === 'risico') kaarten.push({ niveau: 'midden', soort: 'planning', tekst: w.tekst });
  const vandaag = new Date().toISOString().slice(0, 10);
  if ((bestellingen || []).some((b) => b.status === 'geplaatst' && b.verwacht_at && b.verwacht_at < vandaag)) kaarten.push({ niveau: 'hoog', soort: 'levering', tekst: 'Eén of meer leveringen zijn vertraagd.' });
  if (n(totalen.directe_kosten) === 0) kaarten.push({ niveau: 'midden', soort: 'data', tekst: 'Geen werkregels/kosten in de werktafel — calculatie incompleet.' });
  return kaarten;
}

function aiSignalen(totalen, planning, bestellingen, margeHfd) {
  const s = [];
  if (totalen.margePct < MARGE_GRENS) s.push({ type: 'marge', advies: `Totale marge ${Math.round(totalen.margePct)}% is laag — verhoog winst of verlaag directe kosten (gebruikerskeuze).` });
  const neg = margeHfd.filter((m) => m.margePct < MARGE_GRENS);
  if (neg.length) s.push({ type: 'marge', advies: `Lage marge bij: ${neg.slice(0, 3).map((m) => m.naam).join(', ')}.` });
  if ((planning?.samenvatting?.totaal_weken || 0) > 40) s.push({ type: 'planning', advies: `Doorlooptijd ${planning.samenvatting.totaal_weken} weken — overweeg extra capaciteit of parallelle fases.` });
  const concepts = (bestellingen || []).filter((b) => b.status === 'concept').length;
  if (concepts) s.push({ type: 'inkoop', advies: `${concepts} concept-bestelling(en) nog niet geplaatst — controleer leverdatums.` });
  if (!bestellingen?.length) s.push({ type: 'inkoop', advies: 'Nog geen bestellingen — genereer bestelvoorstellen uit de inkooppagina.' });
  return s;
}

export function versieVergelijking(versieSnapshots) {
  // versieSnapshots: [{version_no, label, snapshot:{rows, opslagen}}] nieuw→oud
  const metTot = (versieSnapshots || []).map((v) => ({ ...v, totalen: computeTotalen(v.snapshot?.rows || [], v.snapshot?.opslagen) }));
  if (metTot.length < 2) return { beschikbaar: false, versies: metTot };
  const [nieuw, oud] = metTot;
  const d = (a, b) => r0((a || 0) - (b || 0));
  return {
    beschikbaar: true,
    nieuw: { label: nieuw.label || `V${nieuw.version_no}`, ...nieuw.totalen },
    oud: { label: oud.label || `V${oud.version_no}`, ...oud.totalen },
    verschil: {
      verkoop: d(nieuw.totalen.verkoopprijs_excl, oud.totalen.verkoopprijs_excl),
      kostprijs: d(nieuw.totalen.directe_kosten, oud.totalen.directe_kosten),
      marge: d(nieuw.totalen.marge, oud.totalen.marge),
      margePct: Math.round((n(nieuw.totalen.margePct) - n(oud.totalen.margePct)) * 10) / 10,
      ak: d(nieuw.totalen.akBedrag, oud.totalen.akBedrag),
      winst: d(nieuw.totalen.winstBedrag, oud.totalen.winstBedrag),
    },
  };
}

export function bouwRapportage({ totalen, chapters, rows, offerte, planning, bestellingen = [], versieSnapshots = [] }) {
  const kpi = offerte ? berekenKpi(offerte, totalen) : { investering: totalen.verkoopprijs_incl, bouwsom: totalen.verkoopprijs_excl };
  const factor = factorUitTotalen(rows, totalen); // regio-/prijsfactor uit de totalen
  const bap = begrootActueelPrognose(totalen, bestellingen);
  const margeHfd = margePerHoofdstuk(chapters, rows, totalen, factor);
  const inkoop = inkoopRapport(bestellingen);
  return {
    kpi: {
      verkoopwaarde: r0(totalen.verkoopprijs_excl), kostprijs: r0(totalen.directe_kosten),
      brutomarge: r0(totalen.marge), marge_pct: Math.round(totalen.margePct),
      risico: r0(totalen.risicoBedrag), ak: r0(totalen.akBedrag), abk: r0(totalen.abkBedrag), winst: r0(totalen.winstBedrag),
      besteld: inkoop.besteld, openstaand_inkoop: inkoop.openstaand,
      planning_weken: planning?.samenvatting?.totaal_weken || 0, planning_eind: planning?.samenvatting?.eind_datum || null,
    },
    begroot_actueel_prognose: bap,
    marge_hoofdstuk: margeHfd,
    risico_kaarten: risicoKaarten(totalen, planning, bestellingen, bap),
    planning_rapport: planning?.samenvatting ? { ...planning.samenvatting, vertraagde_fases: (planning.fases || []).filter((f) => f.duur_dagen > 25).map((f) => f.label) } : null,
    inkoop_rapport: inkoop,
    cashflow: cashflow(chapters, rows, planning, offerte, kpi, factor),
    ai_signalen: aiSignalen(totalen, planning, bestellingen, margeHfd),
    versievergelijking: versieVergelijking(versieSnapshots),
  };
}
