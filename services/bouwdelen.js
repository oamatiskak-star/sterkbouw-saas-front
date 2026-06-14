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

export async function loadBouwdeel(id) {
  const { data } = await supabase.from('bouwdelen').select('*').eq('id', id).maybeSingle();
  return data || null;
}

export async function loadCombisVoorBouwdeel(bouwdeelId) {
  const { data, error } = await supabase
    .from('bouwdeel_combis')
    .select('volgorde, combi:combis(*)')
    .eq('bouwdeel_id', bouwdeelId)
    .order('volgorde');
  if (error) throw error;
  return (data || []).map((r) => r.combi).filter(Boolean);
}
