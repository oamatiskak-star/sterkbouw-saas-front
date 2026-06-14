// services/visualLibrary.js — consumeert L2 sterkcalc_visual_* (read-only).
import supabase from '@/lib/supabase';

const BUCKET = 'sterkcalc-visual-assets';
function publicUrl(path) {
  if (!path) return null;
  try {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch {
    return null;
  }
}

export async function loadCategories() {
  const [catRes, assetRes] = await Promise.all([
    supabase.from('sterkcalc_visual_categories').select('*').eq('active', true).order('sort_order'),
    supabase.from('sterkcalc_visual_assets').select('category_code, subcategory_code, storage_path').eq('active', true),
  ]);
  if (catRes.error) throw catRes.error;
  const amap = {};
  for (const a of assetRes.data || []) {
    if (a.category_code && !a.subcategory_code && !amap[a.category_code]) amap[a.category_code] = publicUrl(a.storage_path);
  }
  return (catRes.data || []).map((c) => ({ ...c, image: amap[c.code] || null }));
}

export async function loadCategory(code) {
  const { data } = await supabase.from('sterkcalc_visual_categories').select('*').eq('code', code).maybeSingle();
  return data || null;
}

export async function loadSubcategories(categoryCode) {
  const { data, error } = await supabase
    .from('sterkcalc_visual_subcategories')
    .select('*')
    .eq('category_code', categoryCode)
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return data || [];
}

export function hoofdstukkenVan(mapping) {
  try {
    const m = typeof mapping === 'string' ? JSON.parse(mapping) : mapping;
    return Array.isArray(m?.hoofdstukken) ? m.hoofdstukken : [];
  } catch {
    return [];
  }
}
