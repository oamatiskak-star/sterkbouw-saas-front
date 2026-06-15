// services/planning.js — Sprint 7 Planning Engine: afleiden uit werktafel + versiebeheer.
import supabase from '@/lib/supabase';
import { calcData } from '@/services/calcModules';
import { berekenPlanning, STANDAARD_CONFIG } from '@/lib/calc/planningEngine';

// Live-planning afleiden uit de werktafel (bron van waarheid) met de gegeven config.
export async function derivePlanning(calculatieId, config = {}) {
  const { chapters, rows, calculatie } = await calcData(calculatieId);
  const ptype = config.projecttype || calculatie?.project_type || STANDAARD_CONFIG.projecttype;
  const result = berekenPlanning(chapters, rows, { ...config, projecttype: ptype });
  return { ...result, calculatie };
}

export async function loadPlanningVersies(calculatieId) {
  const { data } = await supabase.from('sterkcalc_planningen').select('*').eq('calculatie_id', calculatieId).order('versie', { ascending: false });
  return data || [];
}

export async function laatsteConfig(calculatieId) {
  const { data } = await supabase.from('sterkcalc_planningen').select('config').eq('calculatie_id', calculatieId).order('versie', { ascending: false }).limit(1).maybeSingle();
  return data?.config || null;
}

export async function bewaarPlanningVersie(calculatieId, config, snapshot, naam) {
  const { data: laatste } = await supabase.from('sterkcalc_planningen').select('versie').eq('calculatie_id', calculatieId).order('versie', { ascending: false }).limit(1);
  const versie = ((laatste && laatste[0]?.versie) || 0) + 1;
  await supabase.from('sterkcalc_planningen').update({ is_actief: false }).eq('calculatie_id', calculatieId);
  const { data, error } = await supabase
    .from('sterkcalc_planningen')
    .insert({ calculatie_id: calculatieId, versie, naam: naam || `Planning V${versie}`, config, snapshot, is_actief: true })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function activeerVersie(id, calculatieId) {
  await supabase.from('sterkcalc_planningen').update({ is_actief: false }).eq('calculatie_id', calculatieId);
  const { error } = await supabase.from('sterkcalc_planningen').update({ is_actief: true }).eq('id', id);
  if (error) throw error;
}
