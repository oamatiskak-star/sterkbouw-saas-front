// services/bouwdelen.js — bouwdelen-laag tussen subtegel en combi.
import supabase from '@/lib/supabase';

export async function loadBouwdelen(categoryCode, subCode) {
  const { data, error } = await supabase
    .from('bouwdelen')
    .select('*')
    .eq('category_code', categoryCode)
    .eq('subcategory_code', subCode)
    .order('naam');
  if (error) throw error;
  return data || [];
}

// Volledige bouwdelenbibliotheek (alle 660), met aantal actieve combi's per bouwdeel.
export async function loadAlleBouwdelen() {
  const [{ data: bd }, { data: links }] = await Promise.all([
    supabase.from('bouwdelen').select('id, naam, omschrijving, category_code, subcategory_code').order('category_code').order('subcategory_code'),
    supabase.from('bouwdeel_combis').select('bouwdeel_id, combi:combis!inner(id)').eq('combi.actief', true),
  ]);
  const telPerBouwdeel = {};
  for (const l of links || []) telPerBouwdeel[l.bouwdeel_id] = (telPerBouwdeel[l.bouwdeel_id] || 0) + 1;
  return (bd || []).map((b) => ({ ...b, combis: telPerBouwdeel[b.id] || 0 }));
}

export async function loadBouwdeel(id) {
  const { data } = await supabase.from('bouwdelen').select('*').eq('id', id).maybeSingle();
  return data || null;
}

export async function loadCombisVoorBouwdeel(bouwdeelId) {
  const { data, error } = await supabase
    .from('bouwdeel_combis')
    .select('volgorde, combi:combis!inner(*)')
    .eq('bouwdeel_id', bouwdeelId)
    .eq('combi.actief', true) // verborgen base-dumps niet tonen; alleen gecureerde combi's
    .order('volgorde');
  if (error) throw error;
  return (data || []).map((r) => r.combi).filter(Boolean);
}

// P5-H: combi's van een bouwdeel mét standaardhoeveelheid, klaar om als werktafelregels in te voegen.
export async function loadBouwdeelCombisMetHoeveelheid(bouwdeelId) {
  const { data, error } = await supabase
    .from('bouwdeel_combis')
    .select('volgorde, standaard_hoeveelheid, combi:combis!inner(id, code, naam, eenheid, category_code, subcategory_code)')
    .eq('bouwdeel_id', bouwdeelId)
    .eq('combi.actief', true)
    .order('volgorde');
  if (error) throw error;
  return (data || [])
    .filter((r) => r.combi)
    .map((r) => ({ combi: r.combi, hoeveelheid: Number(r.standaard_hoeveelheid) || 1 }));
}
