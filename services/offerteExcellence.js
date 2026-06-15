// services/offerteExcellence.js
// Sprint 6 — Offerte Excellence: KPI's, opties, termijnen, planning, klantportaal + events.
// Geen nieuwe AI/IFC/combi/STABU-logica; bouwt op de bestaande calculatie + offerte.
import supabase from '@/lib/supabase';
import { calcData } from '@/services/calcModules';

export const DEFAULT_TERMIJNEN = [
  { label: 'Bij opdracht', pct: 10 },
  { label: 'Start ruwbouw', pct: 25 },
  { label: 'Wind- en waterdicht', pct: 25 },
  { label: 'Start afbouw', pct: 25 },
  { label: 'Oplevering', pct: 15 },
];
export const DEFAULT_PLANNING = [
  { fase: 'Voorbereiding', weken: 2 },
  { fase: 'Ruwbouw', weken: 6 },
  { fase: 'Installaties', weken: 3 },
  { fase: 'Afbouw', weken: 4 },
  { fase: 'Oplevering', weken: 1 },
];

const n = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0);

// Netto optie-impact (geselecteerde opties): meer telt op, min eraf.
export function optiesNetto(opties) {
  return (opties || [])
    .filter((o) => o.geselecteerd)
    .reduce((s, o) => s + (o.soort === 'min' ? -n(o.bedrag) : n(o.bedrag)), 0);
}

// KPI-set voor de executive summary. Bedragen incl. geselecteerde opties.
export function berekenKpi(offerte, totalen) {
  const netto = optiesNetto(offerte?.opties);
  const bouwsom = n(totalen?.verkoopprijs_excl) + netto;
  const btw = bouwsom * (n(totalen?.opslagen?.btw) || 21) / 100;
  const investering = bouwsom + btw;
  const bouwtijd = (offerte?.planning || DEFAULT_PLANNING).reduce((s, f) => s + n(f.weken), 0);
  return {
    investering,
    bouwsom,
    oppervlakte_m2: n(offerte?.kpi?.oppervlakte_m2) || null,
    bouwtijd_weken: bouwtijd || null,
    risico: n(totalen?.risicoBedrag),
    marge_pct: n(totalen?.margePct),
    marge: n(totalen?.marge),
  };
}

// Termijnbedragen op basis van investering (incl. btw).
export function termijnBedragen(termijnen, investering) {
  const lijst = (termijnen && termijnen.length ? termijnen : DEFAULT_TERMIJNEN);
  return lijst.map((t) => ({ ...t, bedrag: Math.round((n(t.pct) / 100) * n(investering)) }));
}

// Volledige offerte-context (offerte + calculatie + totalen + KPI) voor builder/PDF.
export async function loadOfferteContext(calculatieId) {
  const [{ data: offRows }, calc] = await Promise.all([
    supabase.from('sterkcalc_offertes').select('*').eq('calculatie_id', calculatieId).order('created_at', { ascending: false }).limit(1),
    calcData(calculatieId),
  ]);
  const offerte = offRows?.[0] || null;
  return { offerte, calculatie: calc.calculatie, chapters: calc.chapters, rows: calc.rows, totalen: calc.totalen };
}

export async function saveOfferteVelden(id, patch) {
  const { error } = await supabase.from('sterkcalc_offertes').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// ---- Klantportaal ----
export async function loadOfferteByToken(token) {
  const { data: offerte } = await supabase.from('sterkcalc_offertes').select('*').eq('portal_token', token).maybeSingle();
  if (!offerte) return null;
  const calc = await calcData(offerte.calculatie_id).catch(() => ({}));
  return { offerte, calculatie: calc.calculatie || null, chapters: calc.chapters || [], rows: calc.rows || [], totalen: calc.totalen || null };
}

export async function logEvent(offerteId, type, { bericht = null, ip = null, meta = {} } = {}) {
  const { error } = await supabase.from('sterkcalc_offerte_events').insert({ offerte_id: offerteId, type, bericht, ip, meta });
  if (error) throw error;
}

export async function loadEvents(offerteId) {
  const { data } = await supabase.from('sterkcalc_offerte_events').select('*').eq('offerte_id', offerteId).order('created_at', { ascending: false });
  return data || [];
}

// Klant kiest opties in het portaal → opslaan op de offerte (geen status-wijziging).
export async function bewaarOptieKeuze(offerteId, opties) {
  const { error } = await supabase.from('sterkcalc_offertes').update({ opties, updated_at: new Date().toISOString() }).eq('id', offerteId);
  if (error) throw error;
}

// Beste-effort IP voor audittrail (client-side).
export async function clientIp() {
  try {
    const r = await fetch('https://api.ipify.org?format=json');
    const j = await r.json();
    return j.ip || null;
  } catch {
    return null;
  }
}
