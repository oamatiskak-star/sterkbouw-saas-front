// services/calcModules.js — offerte / planning / bestellen / rapportages / settings.
import supabase from '@/lib/supabase';
import { loadWerktafel } from '@/services/werktafel';
import { computeTotalen, computeRow } from '@/lib/calc/werktafelTotals';

// Totalen + regels van een calculatie (hergebruikt werktafel-rekenkern).
export async function calcData(calculatieId) {
  const d = await loadWerktafel(calculatieId);
  const totalen = computeTotalen(d.rows, d.opslagen);
  return { ...d, totalen };
}

// ---- Calculatie-kiezer ----
export async function loadCalculaties() {
  const { data } = await supabase.from('calculaties').select('id, naam, status, created_at').order('created_at', { ascending: false }).limit(50);
  return data || [];
}

// ---- Offertes ----
export async function loadOffertes() {
  const { data } = await supabase.from('sterkcalc_offertes').select('*').order('created_at', { ascending: false }).limit(100);
  return data || [];
}
export async function loadOfferte(id) {
  const { data } = await supabase.from('sterkcalc_offertes').select('*').eq('id', id).maybeSingle();
  return data || null;
}
export async function maakOfferte(calculatieId) {
  const { calculatie, totalen } = await calcData(calculatieId);
  const nummer = 'OFF-' + String(calculatieId).slice(0, 8).toUpperCase();
  const { data, error } = await supabase
    .from('sterkcalc_offertes')
    .insert({
      calculatie_id: calculatieId,
      project_id: calculatie?.project_id || null,
      nummer,
      status: 'concept',
      totaal_excl: Math.round(totalen.verkoopprijs_excl),
      totaal_incl: Math.round(totalen.verkoopprijs_incl),
      modules: { voorblad: true, samenvatting: true, calculatie: true, voorwaarden: true },
      payload: { totalen },
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function updateOfferte(id, patch) {
  const { error } = await supabase.from('sterkcalc_offertes').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// ---- Planning (uren → taken) ----
export async function genereerPlanning(calculatieId) {
  const { chapters, rows } = await calcData(calculatieId);
  await supabase.from('planning_tasks').delete().eq('calculatie_id', calculatieId);
  let dag = 0, vol = 0;
  const taken = [];
  for (const ch of chapters) {
    const uren = rows.filter((r) => r.chapter_id === ch.id).reduce((s, r) => s + computeRow(r).uren, 0);
    if (uren <= 0) continue;
    const duur = Math.max(1, Math.ceil(uren / 8));
    taken.push({ calculatie_id: calculatieId, fase_key: ch.code || ch.naam, naam: ch.naam, uren: Math.round(uren), duur_dagen: duur, start_dag: dag, volgorde: vol++ });
    dag += duur;
  }
  if (taken.length) await supabase.from('planning_tasks').insert(taken);
  return taken;
}
export async function loadPlanning(calculatieId) {
  const { data } = await supabase.from('planning_tasks').select('*').eq('calculatie_id', calculatieId).order('volgorde');
  return data || [];
}

// ---- Bestellen (materiaal-aggregatie) ----
export async function genereerBestelling(calculatieId) {
  const { rows } = await calcData(calculatieId);
  const agg = {};
  for (const r of rows) {
    const isCombi = r.type === 'combi' || r.is_combi;
    const items = isCombi ? (r._components || []).map((c) => ({ ...c, hoeveelheid: Number(c.hoeveelheid) * Number(r.hoeveelheid) })) : [{ ...r, hoeveelheid: Number(r.hoeveelheid) }];
    for (const it of items) {
      if (Number(it.materiaalprijs) <= 0) continue;
      const key = it.stabu_code || it.omschrijving;
      if (!agg[key]) agg[key] = { stabu_code: it.stabu_code, omschrijving: it.omschrijving, eenheid: it.eenheid, hoeveelheid: 0, prijs: Number(it.materiaalprijs) };
      agg[key].hoeveelheid += Number(it.hoeveelheid) || 0;
    }
  }
  const regels = Object.values(agg).map((x) => ({ ...x, hoeveelheid: Math.round(x.hoeveelheid * 100) / 100, totaal: Math.round(x.hoeveelheid * x.prijs * 100) / 100 }));
  const totaal = regels.reduce((s, x) => s + x.totaal, 0);
  await supabase.from('material_orders').delete().eq('calculatie_id', calculatieId);
  const { data } = await supabase.from('material_orders').insert({ calculatie_id: calculatieId, leverancier: 'Algemeen', status: 'concept', regels, totaal: Math.round(totaal) }).select().single();
  return data;
}
export async function loadBestellingen(calculatieId) {
  const { data } = await supabase.from('material_orders').select('*').eq('calculatie_id', calculatieId).order('created_at');
  return data || [];
}

// ---- Settings ----
export async function loadSettings() {
  const { data } = await supabase.from('sterkcalc_settings').select('*').eq('id', 1).maybeSingle();
  return data || null;
}
export async function saveSettings(patch) {
  const { error } = await supabase.from('sterkcalc_settings').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', 1);
  if (error) throw error;
}
