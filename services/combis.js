// services/combis.js
// Combi-bibliotheek: categorieën, combis + componenten, en invoegen in de Werktafel.
import supabase from '@/lib/supabase';
import { insertRow, replaceRowComponents } from '@/services/werktafel';

export async function loadCombiBibliotheek() {
  const [catRes, combiRes] = await Promise.all([
    supabase.from('combi_categories').select('*').order('volgorde'),
    supabase.from('combis').select('*').eq('actief', true).order('naam'),
  ]);
  if (catRes.error) throw catRes.error;
  if (combiRes.error) throw combiRes.error;
  return { categories: catRes.data || [], combis: combiRes.data || [] };
}

export async function loadCombiComponents(combiId) {
  const { data, error } = await supabase
    .from('combi_components')
    .select('*')
    .eq('combi_id', combiId)
    .order('volgorde');
  if (error) throw error;
  return data || [];
}

// Voegt een combi toe als één openklapbare combi-regel met onderliggende componenten.
// Totaal van de regel = som componenten × hoeveelheid (zie werktafelTotals).
export async function voegCombiToe({ calculatieId, chapterId, combi, hoeveelheid = 1 }) {
  const components = await loadCombiComponents(combi.id);
  const row = await insertRow(calculatieId, {
    chapter_id: chapterId || null,
    stabu_code: combi.code || combi.stabu_hoofdstuk || null,
    omschrijving: combi.naam,
    type: 'combi',
    is_combi: true,
    combi_id: combi.id,
    hoeveelheid,
    eenheid: combi.eenheid || 'st',
    status: 'concept',
    volgorde: Date.now() % 100000,
  });
  const saved = await replaceRowComponents(
    row.id,
    components.map((c) => ({
      type: c.type,
      stabu_code: c.stabu_code,
      omschrijving: c.omschrijving,
      hoeveelheid: c.hoeveelheid_per_eenheid,
      eenheid: c.eenheid,
      norm: c.norm,
      materiaalprijs: c.materiaalprijs,
      arbeidsprijs: c.arbeidsprijs,
      materieelprijs: c.materieelprijs,
    }))
  );
  row._components = saved;
  return row;
}
