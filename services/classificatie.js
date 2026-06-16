// services/classificatie.js — read-only classificatie-overlay (open-data harvest-laag).
// Leest de publieke view v_combi_nlsfb (combi → NL-SfB). Puur lezen; muteert niets.
import supabase from '@/lib/supabase';

// NL-SfB-classificatie(s) voor een combi-code (kan 1:n zijn).
export async function loadCombiNlsfb(combiCode) {
  if (!combiCode) return [];
  const { data } = await supabase
    .from('v_combi_nlsfb')
    .select('nlsfb_code, nlsfb_naam')
    .eq('combi_code', combiCode);
  return data || [];
}
