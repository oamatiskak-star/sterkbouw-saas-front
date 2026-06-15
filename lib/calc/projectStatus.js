// lib/calc/projectStatus.js
// Sprint 10 — Bouw OS orkestratie. Leidt projectfase, health-score, open acties en oplever-checklist
// af uit BESTAANDE keten-data (geen nieuwe engines). Pure functies; AI uitsluitend adviserend.

export const FASES = ['concept', 'analyse', 'calculatie', 'offerte', 'akkoord', 'planning', 'bestellen', 'uitvoering', 'oplevering'];
export const FASE_LABEL = {
  concept: 'Concept', analyse: 'Analyse', calculatie: 'Calculatie', offerte: 'Offerte', akkoord: 'Akkoord',
  planning: 'Planning', bestellen: 'Bestellen', uitvoering: 'Uitvoering', oplevering: 'Oplevering',
};

const n = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0);
const idx = (k) => FASES.indexOf(k);

export function bepaalFase(ctx) {
  const { calculatie, totalen, offerte, planningVersies = 0, bestellingen = [], ruimtesCount = 0, documentenCount = 0 } = ctx;
  let i = 0;
  if (ruimtesCount > 0 || documentenCount > 0) i = Math.max(i, idx('analyse'));
  if (n(totalen?.directe_kosten) > 0) i = Math.max(i, idx('calculatie'));
  if (offerte) i = Math.max(i, idx('offerte'));
  if (offerte && ['akkoord', 'getekend'].includes(offerte.status)) i = Math.max(i, idx('akkoord'));
  if (planningVersies > 0) i = Math.max(i, idx('planning'));
  if (bestellingen.some((b) => b.status !== 'concept')) i = Math.max(i, idx('bestellen'));
  if (bestellingen.some((b) => b.status === 'geleverd')) i = Math.max(i, idx('uitvoering'));
  if (['opgeleverd', 'gearchiveerd', 'afgesloten'].includes(calculatie?.status)) i = idx('oplevering');
  return { key: FASES[i], index: i, label: FASE_LABEL[FASES[i]] };
}

// Health-score 0-100 uit 5 componenten (elk 0-20).
export function healthScore(ctx) {
  const { totalen, rowsCount = 0, offerte, planningVersies = 0, bestellingen = [], voorstellenCount = 0, risicoKaarten = [] } = ctx;
  const calc = n(totalen?.directe_kosten) > 0 ? 20 : rowsCount > 0 ? 10 : 0;
  const off = !offerte ? 0 : offerte.status === 'getekend' ? 20 : offerte.status === 'akkoord' ? 16 : ['verzonden', 'bekeken', 'vraag'].includes(offerte.status) ? 10 : 4;
  const plan = planningVersies > 0 ? 20 : 0;
  const geleverd = bestellingen.filter((b) => b.status === 'geleverd').length;
  const geplaatst = bestellingen.filter((b) => b.status !== 'concept').length;
  const ink = geplaatst > 0 && geleverd === geplaatst ? 20 : geplaatst > 0 ? 12 : voorstellenCount > 0 ? 6 : 0;
  const hoog = risicoKaarten.filter((r) => r.niveau === 'hoog').length;
  const ris = hoog === 0 && risicoKaarten.length === 0 ? 20 : hoog === 0 ? 14 : hoog === 1 ? 8 : 2;
  const score = calc + off + plan + ink + ris;
  return { score, kleur: score >= 70 ? 'groen' : score >= 40 ? 'oranje' : 'rood', componenten: { calculatie: calc, offerte: off, planning: plan, inkoop: ink, risico: ris } };
}

export function openActies(ctx) {
  const { totalen, offerte, planningVersies = 0, bestellingen = [], voorstellenCount = 0, risicoKaarten = [], fase } = ctx;
  const a = [];
  if (n(totalen?.directe_kosten) <= 0) a.push({ prio: 'hoog', tekst: 'Vul de werktafel — er zijn nog geen kosten gecalculeerd.', route: 'werktafel' });
  if (n(totalen?.directe_kosten) > 0 && !offerte) a.push({ prio: 'hoog', tekst: 'Maak een offerte van deze calculatie.', route: 'offerte' });
  if (offerte && offerte.status === 'concept') a.push({ prio: 'hoog', tekst: 'Verstuur de offerte naar de opdrachtgever.', route: 'offerte' });
  if (offerte && ['verzonden', 'bekeken'].includes(offerte.status)) a.push({ prio: 'midden', tekst: 'Wacht op akkoord — eventueel opvolgen.', route: 'offerte' });
  if (offerte && offerte.status === 'vraag') a.push({ prio: 'hoog', tekst: 'Klant heeft een vraag gesteld — beantwoord deze.', route: 'offerte' });
  if (['akkoord', 'getekend'].includes(offerte?.status) && planningVersies === 0) a.push({ prio: 'hoog', tekst: 'Akkoord ontvangen — maak de planning.', route: 'planning' });
  if (planningVersies > 0 && voorstellenCount > 0 && bestellingen.every((b) => b.status === 'concept')) a.push({ prio: 'midden', tekst: 'Plaats de bestellingen uit de bestelvoorstellen.', route: 'bestellen' });
  const vandaag = new Date().toISOString().slice(0, 10);
  if (bestellingen.some((b) => b.status === 'geplaatst' && b.verwacht_at && b.verwacht_at < vandaag)) a.push({ prio: 'hoog', tekst: 'Levering verstreken — controleer de status.', route: 'bestellen' });
  for (const r of risicoKaarten.filter((x) => x.niveau === 'hoog').slice(0, 2)) a.push({ prio: 'hoog', tekst: `Risico: ${r.tekst}`, route: 'rapportages' });
  if (fase?.key === 'uitvoering' && a.length === 0) a.push({ prio: 'midden', tekst: 'Rond de uitvoering af en lever het project op.', route: 'dashboard' });
  if (a.length === 0) a.push({ prio: 'laag', tekst: 'Geen openstaande acties — project op koers.', route: null });
  const rang = { hoog: 0, midden: 1, laag: 2 };
  return a.sort((x, y) => rang[x.prio] - rang[y.prio]);
}

export function opleverChecklist(ctx) {
  const { totalen, offerte, planningVersies = 0, bestellingen = [] } = ctx;
  return [
    { label: 'Calculatie gereed', ok: n(totalen?.directe_kosten) > 0 },
    { label: 'Offerte akkoord', ok: ['akkoord', 'getekend'].includes(offerte?.status) },
    { label: 'Planning afgerond', ok: planningVersies > 0 },
    { label: 'Bestellingen afgerond', ok: bestellingen.length > 0 && bestellingen.every((b) => b.status === 'geleverd') },
    { label: 'Rapportage beschikbaar', ok: n(totalen?.directe_kosten) > 0 },
  ];
}
