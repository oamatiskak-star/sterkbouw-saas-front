// services/werktafel.js
// Data-laag voor de Calculatie Werktafel (primaire calculatiebron).
// Directe Supabase-toegang (anon, RLS-scoped). werktafel_* tabellen.
import supabase from '@/lib/supabase';

// ---------- LADEN ----------
export async function loadWerktafel(calculatieId) {
  const [calcRes, chRes, rowRes] = await Promise.all([
    supabase.from('calculaties').select('id, naam, werktafel_opslagen').eq('id', calculatieId).single(),
    supabase.from('werktafel_chapters').select('*').eq('calculatie_id', calculatieId).order('volgorde'),
    supabase.from('werktafel_rows').select('*').eq('calculatie_id', calculatieId).order('volgorde'),
  ]);
  if (calcRes.error) throw calcRes.error;
  if (chRes.error) throw chRes.error;
  if (rowRes.error) throw rowRes.error;

  const rows = rowRes.data || [];
  const rowIds = rows.map((r) => r.id);
  let components = [];
  if (rowIds.length) {
    const compRes = await supabase
      .from('werktafel_row_components')
      .select('*')
      .in('row_id', rowIds)
      .order('volgorde');
    if (compRes.error) throw compRes.error;
    components = compRes.data || [];
  }
  const byRow = {};
  for (const c of components) (byRow[c.row_id] = byRow[c.row_id] || []).push(c);
  for (const r of rows) r._components = byRow[r.id] || [];

  return {
    calculatie: calcRes.data,
    opslagen: calcRes.data?.werktafel_opslagen || null,
    chapters: chRes.data || [],
    rows,
  };
}

// ---------- OPSLAGEN (user-controlled) ----------
export async function saveOpslagen(calculatieId, opslagen) {
  const { error } = await supabase
    .from('calculaties')
    .update({ werktafel_opslagen: opslagen })
    .eq('id', calculatieId);
  if (error) throw error;
}

// ---------- HOOFDSTUKKEN ----------
export async function insertChapter(calculatieId, chapter) {
  const { data, error } = await supabase
    .from('werktafel_chapters')
    .insert({ calculatie_id: calculatieId, ...chapter })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function updateChapter(id, patch) {
  const { error } = await supabase.from('werktafel_chapters').update(patch).eq('id', id);
  if (error) throw error;
}
export async function deleteChapter(id) {
  const { error } = await supabase.from('werktafel_chapters').delete().eq('id', id);
  if (error) throw error;
}

// ---------- REGELS ----------
export async function insertRow(calculatieId, row) {
  const { _components, id, ...clean } = row || {};
  const { data, error } = await supabase
    .from('werktafel_rows')
    .insert({ calculatie_id: calculatieId, ...clean })
    .select()
    .single();
  if (error) throw error;
  data._components = [];
  return data;
}
export async function updateRow(id, patch) {
  const { _components, id: _ignore, ...clean } = patch || {};
  const { error } = await supabase.from('werktafel_rows').update(clean).eq('id', id);
  if (error) throw error;
}
export async function deleteRow(id) {
  const { error } = await supabase.from('werktafel_rows').delete().eq('id', id);
  if (error) throw error;
}
export async function reorderRows(rows) {
  // rows: [{id, volgorde, chapter_id}]
  await Promise.all(
    rows.map((r) =>
      supabase.from('werktafel_rows').update({ volgorde: r.volgorde, chapter_id: r.chapter_id }).eq('id', r.id)
    )
  );
}

// Vervang alle componenten van een regel (gebruikt bij combi-invoegen/bewerken).
export async function replaceRowComponents(rowId, components) {
  const del = await supabase.from('werktafel_row_components').delete().eq('row_id', rowId);
  if (del.error) throw del.error;
  if (!components || !components.length) return [];
  const payload = components.map((c, i) => ({
    row_id: rowId,
    type: c.type,
    stabu_code: c.stabu_code || null,
    omschrijving: c.omschrijving || null,
    hoeveelheid: c.hoeveelheid || 0,
    eenheid: c.eenheid || null,
    norm: c.norm ?? null,
    materiaalprijs: c.materiaalprijs || 0,
    arbeidsprijs: c.arbeidsprijs || 0,
    materieelprijs: c.materieelprijs || 0,
    volgorde: i,
  }));
  const { data, error } = await supabase.from('werktafel_row_components').insert(payload).select();
  if (error) throw error;
  return data || [];
}

// ---------- STABU-zoeken (voor prefill) ----------
export async function zoekStabu(term, hoofdstukken = null) {
  let qb = supabase
    .from('stabu_posten')
    .select('code, omschrijving, eenheid, materiaalprijs, arbeidsprijs, normuren, hoofdstuk_code');
  if (Array.isArray(hoofdstukken) && hoofdstukken.length) {
    qb = qb.in('hoofdstuk_code', hoofdstukken);
  }
  if (term && term.length >= 1) {
    qb = qb.or(`code.ilike.%${term}%,omschrijving.ilike.%${term}%`);
  } else if (!hoofdstukken) {
    return [];
  }
  const { data, error } = await qb.order('code').limit(40);
  if (error) throw error;
  return data || [];
}

// ---------- VERSIEHISTORIE ----------
export async function saveVersion(calculatieId, snapshot, label) {
  const { data: existing } = await supabase
    .from('calculation_versions')
    .select('version_no')
    .eq('calculatie_id', calculatieId)
    .order('version_no', { ascending: false })
    .limit(1);
  const next = (existing && existing[0]?.version_no ? existing[0].version_no : 0) + 1;
  const { data, error } = await supabase
    .from('calculation_versions')
    .insert({ calculatie_id: calculatieId, version_no: next, label: label || `Versie ${next}`, snapshot })
    .select()
    .single();
  if (error) throw error;
  return data;
}
