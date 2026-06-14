// services/aiAnalyse.js — AI-laag: ruimtes/openingen + groepering→werktafel (generiek).
import supabase from '@/lib/supabase';
import { voegCombiToe } from '@/services/combis';

// ---- Ruimtes ----
export async function loadRuimtes(calculatieId) {
  const { data, error } = await supabase
    .from('calculatie_ruimtes')
    .select('*')
    .eq('calculatie_id', calculatieId)
    .order('created_at');
  if (error) throw error;
  return data || [];
}

export async function insertRuimte(calculatieId, ruimte) {
  const { data, error } = await supabase
    .from('calculatie_ruimtes')
    .insert({ calculatie_id: calculatieId, source: 'manual', ...ruimte })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRuimte(id, patch) {
  const { error } = await supabase.from('calculatie_ruimtes').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteRuimte(id) {
  const { error } = await supabase.from('calculatie_ruimtes').delete().eq('id', id);
  if (error) throw error;
}

// ---- Ruimte-types (groepering persisteren als snapshot) ----
export async function bewaarRuimteTypes(calculatieId, types) {
  // vervang bestaande groepering
  await supabase.from('calculatie_ruimte_types').delete().eq('calculatie_id', calculatieId);
  if (!types?.length) return [];
  const payload = types.map((t) => ({
    calculatie_id: calculatieId,
    naam: t.naam,
    aantal: t.aantal,
    gem_lengte: t.gem?.lengte ?? null,
    gem_breedte: t.gem?.breedte ?? null,
    gem_hoogte: t.gem?.hoogte ?? null,
    afwijking: { pct: t.afwijkingPct, gelijkheid: t.gelijkheidPct, leden: t.leden },
    confidence: t.gelijkheidPct,
    source: 'ai',
  }));
  const { data, error } = await supabase.from('calculatie_ruimte_types').insert(payload).select();
  if (error) throw error;
  return data || [];
}

// ---- Combi-suggesties per ruimteklasse (generiek, op trefwoord) ----
export async function suggereerCombis(klasse) {
  if (!klasse) return [];
  const term = klasse.toLowerCase().split(/\s+/)[0];
  const { data } = await supabase
    .from('combis')
    .select('id, code, naam, eenheid, omschrijving, subcategory_code, category_code')
    .ilike('naam', `%${term}%`)
    .limit(8);
  return data || [];
}

// ---- Eén akkoord per type → combi × aantal → werktafel ----
export async function pasTypeToe({ calculatieId, type, combi, perRuimteHoeveelheid }) {
  const aantal = Number(type?.aantal) || 1;
  const totaal = (Number(perRuimteHoeveelheid) || 1) * aantal;
  return voegCombiToe({ calculatieId, combi, hoeveelheid: totaal });
}
