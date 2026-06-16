// services/combis.js
// Combi-bibliotheek: categorieën, combis + componenten, en invoegen in de Werktafel.
import supabase from '@/lib/supabase';
import { insertRow, replaceRowComponents, vindOfMaakSubhoofdstuk } from '@/services/werktafel';

export async function loadCombi(id) {
  const { data } = await supabase.from('combis').select('*').eq('id', id).maybeSingle();
  return data || null;
}

// Combi's op code laden (voor de Object Engine: keuze → combiCode → combi-object).
export async function loadCombisByCodes(codes = []) {
  const uniek = [...new Set((codes || []).filter(Boolean))];
  if (!uniek.length) return {};
  const { data } = await supabase
    .from('combis')
    .select('id, code, naam, eenheid, category_code, subcategory_code')
    .in('code', uniek)
    .eq('actief', true);
  return Object.fromEntries((data || []).map((c) => [c.code, c]));
}

// Combi-voorstellen voor een specifiek (categorie, subcategorie) — voor inline keuze in de werktafel.
export async function loadCombisVoorSubcat(categoryCode, subCode) {
  let q = supabase.from('combis').select('id, code, naam, eenheid, category_code, subcategory_code').eq('actief', true).eq('category_code', categoryCode);
  if (subCode) q = q.eq('subcategory_code', subCode);
  const { data } = await q.order('naam').limit(12);
  return data || [];
}

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
export async function voegCombiToe({ calculatieId, chapterId, combi, hoeveelheid = 1, meta = null }) {
  const components = await loadCombiComponents(combi.id);
  // Routeer naar het juiste subhoofdstuk op basis van category/subcategory; alleen "Losse regels"
  // (chapter_id null) als er echt geen mapping bestaat. (P4-productregel.)
  let doelChapter = chapterId || null;
  if (!doelChapter && combi.category_code && combi.subcategory_code) {
    doelChapter = await vindOfMaakSubhoofdstuk(calculatieId, combi.category_code, combi.subcategory_code).catch(() => null);
  }
  const row = await insertRow(calculatieId, {
    chapter_id: doelChapter || null,
    stabu_code: combi.code || combi.stabu_hoofdstuk || null,
    omschrijving: combi.naam,
    type: 'combi',
    is_combi: true,
    combi_id: combi.id,
    hoeveelheid,
    eenheid: combi.eenheid || 'st',
    status: 'concept',
    volgorde: Date.now() % 100000,
    // Increment 4 — herkomst/aannames van de regel (alleen meeschrijven als aanwezig).
    ...(meta ? { meta } : {}),
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
