// services/bestellen.js — Sprint 8 Bestellen & Inkoop: leveranciers + bestellingen + afleiden.
import supabase from '@/lib/supabase';
import { calcData } from '@/services/calcModules';
import { bestelvoorstellen, bestelKpi, tekorten } from '@/lib/calc/bestelEngine';
import { laatsteConfig } from '@/services/planning';

// ---- Leveranciers ----
export async function loadLeveranciers() {
  const { data } = await supabase.from('sterkcalc_leveranciers').select('*').order('naam');
  return data || [];
}
export async function saveLeverancier(lev) {
  if (lev.id) { const { error } = await supabase.from('sterkcalc_leveranciers').update(lev).eq('id', lev.id); if (error) throw error; return lev; }
  const { data, error } = await supabase.from('sterkcalc_leveranciers').insert(lev).select().single();
  if (error) throw error; return data;
}
export async function deleteLeverancier(id) {
  const { error } = await supabase.from('sterkcalc_leveranciers').delete().eq('id', id); if (error) throw error;
}

// ---- Bestellingen ----
export async function loadBestellingen(calculatieId) {
  const { data } = await supabase.from('sterkcalc_bestellingen').select('*').eq('calculatie_id', calculatieId).order('created_at');
  return data || [];
}
export async function plaatsVoorstelAlsConcept(calculatieId, voorstel) {
  const nummer = 'INK-' + String(calculatieId).slice(0, 6).toUpperCase() + '-' + (voorstel.leverancier?.naam || 'X').slice(0, 4).toUpperCase();
  const { data, error } = await supabase.from('sterkcalc_bestellingen').insert({
    calculatie_id: calculatieId,
    leverancier_id: voorstel.leverancier?.id || null,
    leverancier_naam: voorstel.leverancier_naam,
    nummer,
    status: 'concept',
    regels: voorstel.regels,
    totaal: voorstel.totaal,
    gewenste_leverdatum: voorstel.gewenste_leverdatum,
  }).select().single();
  if (error) throw error; return data;
}
export async function updateBestelling(id, patch) {
  const { error } = await supabase.from('sterkcalc_bestellingen').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
export async function deleteBestelling(id) {
  const { error } = await supabase.from('sterkcalc_bestellingen').delete().eq('id', id); if (error) throw error;
}

// Volledige afleiding: voorstellen + KPI + tekorten + planning-context.
export async function deriveBestellen(calculatieId) {
  const [{ chapters, rows, calculatie }, leveranciers, bestellingen, cfg] = await Promise.all([
    calcData(calculatieId), loadLeveranciers(), loadBestellingen(calculatieId), laatsteConfig(calculatieId).catch(() => null),
  ]);
  const config = { ...(cfg || {}), projecttype: (cfg?.projecttype) || calculatie?.project_type };
  const voorstellen = bestelvoorstellen(chapters, rows, leveranciers, config);
  return {
    calculatie, leveranciers, bestellingen, config,
    voorstellen,
    kpi: bestelKpi(voorstellen, bestellingen),
    tekorten: tekorten(chapters, rows, leveranciers, bestellingen, config),
  };
}
