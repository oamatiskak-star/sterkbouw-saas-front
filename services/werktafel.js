// services/werktafel.js
// Data-laag voor de Calculatie Werktafel (primaire calculatiebron).
// Directe Supabase-toegang (anon, RLS-scoped). werktafel_* tabellen.
import supabase from '@/lib/supabase';
import { templateVoor } from '@/lib/calc/projecttypeTemplates';

// P5-D/E/F — projecttype-template 2.0 instantiëren: maakt een VOLLEDIGE geordende
// hoofdstukkenstructuur aan. Subhoofdstukken = uitsluitend subcategorieën mét combi-dekking,
// zodat élk subhoofdstuk direct calculeerbaar is (geen lege schermen, geen losse regels).
export async function instantiateerTemplate(calculatieId, projecttypeRaw) {
  const projecttype = (projecttypeRaw || 'nieuwbouw').toString().trim().toLowerCase();
  const cats = templateVoor(projecttype); // geordende array van categorie-codes
  const [{ data: catRows }, { data: subRows }, { data: combiRows }] = await Promise.all([
    supabase.from('sterkcalc_visual_categories').select('code, title').in('code', cats),
    supabase.from('sterkcalc_visual_subcategories').select('category_code, code, title').in('category_code', cats),
    supabase.from('combis').select('category_code, subcategory_code').eq('actief', true).in('category_code', cats),
  ]);
  const catNaam = Object.fromEntries((catRows || []).map((c) => [c.code, c.title]));
  const subNaam = {};
  for (const s of subRows || []) subNaam[`${s.category_code}.${s.code}`] = s.title;

  // Per categorie: de subcodes die combi-dekking hebben (uniek, gesorteerd).
  const subsMetCombi = {};
  for (const c of combiRows || []) {
    if (!c.subcategory_code) continue;
    (subsMetCombi[c.category_code] = subsMetCombi[c.category_code] || new Set()).add(c.subcategory_code);
  }

  let vol = 0;
  for (const cat of cats) {
    const { data: hoofd, error } = await supabase
      .from('werktafel_chapters')
      .insert({ calculatie_id: calculatieId, code: cat, naam: catNaam[cat] || `Hoofdstuk ${cat}`, volgorde: vol++, is_structuur: true })
      .select('id')
      .single();
    if (error || !hoofd) continue;
    const subs = Array.from(subsMetCombi[cat] || []).sort();
    if (subs.length) {
      const payload = subs.map((sc, i) => ({
        calculatie_id: calculatieId, parent_id: hoofd.id, code: cat, sub_code: sc,
        naam: subNaam[`${cat}.${sc}`] || `${cat}.${sc}`, volgorde: i, is_structuur: true,
      }));
      await supabase.from('werktafel_chapters').insert(payload);
    }
  }
}

// Zoekt (of maakt) het subhoofdstuk voor een (categorie, subcategorie) zodat een combi onder het
// juiste subhoofdstuk landt i.p.v. "Losse regels".
export async function vindOfMaakSubhoofdstuk(calculatieId, categoryCode, subCode) {
  if (!categoryCode || !subCode) return null;
  const { data: bestaand } = await supabase
    .from('werktafel_chapters').select('id')
    .eq('calculatie_id', calculatieId).eq('code', categoryCode).eq('sub_code', subCode).maybeSingle();
  if (bestaand) return bestaand.id;

  let { data: hoofd } = await supabase
    .from('werktafel_chapters').select('id')
    .eq('calculatie_id', calculatieId).eq('code', categoryCode).is('parent_id', null).maybeSingle();
  if (!hoofd) {
    const { data: cat } = await supabase.from('sterkcalc_visual_categories').select('title').eq('code', categoryCode).maybeSingle();
    const ins = await supabase.from('werktafel_chapters')
      .insert({ calculatie_id: calculatieId, code: categoryCode, naam: cat?.title || `Hoofdstuk ${categoryCode}`, volgorde: 999, is_structuur: true })
      .select('id').single();
    hoofd = ins.data;
  }
  if (!hoofd) return null;
  const { data: sub } = await supabase.from('sterkcalc_visual_subcategories').select('title').eq('category_code', categoryCode).eq('code', subCode).maybeSingle();
  const ins2 = await supabase.from('werktafel_chapters')
    .insert({ calculatie_id: calculatieId, parent_id: hoofd.id, code: categoryCode, sub_code: subCode, naam: sub?.title || `${categoryCode}.${subCode}`, volgorde: 999, is_structuur: true })
    .select('id').single();
  return ins2.data?.id || null;
}

// ---------- LADEN ----------
export async function loadWerktafel(calculatieId) {
  const [calcRes, chRes, rowRes] = await Promise.all([
    supabase.from('calculaties').select('id, naam, project_type, werktafel_opslagen').eq('id', calculatieId).single(),
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

// Globale calculatie-defaults (bron = sterkcalc_settings.calculatie_defaults).
// Nieuwe calculaties erven deze; AI raakt ze NOOIT aan.
export async function loadGlobalCalcDefaults() {
  const { data } = await supabase
    .from('sterkcalc_settings')
    .select('calculatie_defaults')
    .eq('id', 1)
    .maybeSingle();
  return data?.calculatie_defaults || null;
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

// P5.3 — één component van een regel bijwerken (inline bewerken in de werktafel).
export async function updateRowComponent(id, patch) {
  const clean = {};
  for (const k of ['hoeveelheid', 'materiaalprijs', 'arbeidsprijs', 'materieelprijs', 'norm', 'omschrijving', 'eenheid', 'stabu_code']) {
    if (patch[k] !== undefined) clean[k] = patch[k];
  }
  const { error } = await supabase.from('werktafel_row_components').update(clean).eq('id', id);
  if (error) throw error;
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
