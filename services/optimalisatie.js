// services/optimalisatie.js — P7.5 AI-optimalisatie: alternatieve combi's per werktafelregel.
// Voor elke combi-regel zoekt SterkCalc goedkopere alternatieven in DEZELFDE subcategorie en
// berekent de besparing. De calculator beslist (toepassen/laten). Geen automatische wijziging.
import supabase from '@/lib/supabase';
import { loadCombiComponents } from '@/services/combis';
import { replaceRowComponents, updateRow } from '@/services/werktafel';

const n = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };
// Eenheidsprijs van een set componenten (per 1 eenheid combi).
const unitVan = (comps) => (comps || []).reduce((s, c) => {
  const q = n(c.hoeveelheid != null ? c.hoeveelheid : c.hoeveelheid_per_eenheid);
  return s + q * (n(c.materiaalprijs) + n(c.arbeidsprijs) + n(c.materieelprijs));
}, 0);

export async function loadOptimalisaties(rows = []) {
  const combiRows = rows.filter((r) => r.combi_id && (r.is_combi || r.type === 'combi'));
  if (!combiRows.length) return [];

  const combiIds = [...new Set(combiRows.map((r) => r.combi_id))];
  const { data: huidige } = await supabase.from('combis').select('id, code, naam, eenheid, category_code, subcategory_code').in('id', combiIds);
  const combiById = Object.fromEntries((huidige || []).map((c) => [c.id, c]));
  const cats = [...new Set((huidige || []).map((c) => c.category_code).filter(Boolean))];
  if (!cats.length) return [];

  const { data: siblings } = await supabase.from('combis').select('id, code, naam, eenheid, category_code, subcategory_code').eq('actief', true).in('category_code', cats);
  const sibIds = (siblings || []).map((s) => s.id);
  const { data: comps } = await supabase.from('combi_components').select('combi_id, hoeveelheid_per_eenheid, materiaalprijs, arbeidsprijs, materieelprijs').in('combi_id', sibIds.length ? sibIds : ['00000000-0000-0000-0000-000000000000']);
  const compsBy = {};
  for (const c of comps || []) (compsBy[c.combi_id] = compsBy[c.combi_id] || []).push(c);
  const unitOf = (id) => unitVan(compsBy[id]);

  const out = [];
  for (const r of combiRows) {
    const cur = combiById[r.combi_id];
    if (!cur || !cur.subcategory_code) continue;
    const huidigUnit = unitVan(r._components) || unitOf(r.combi_id);
    if (!(huidigUnit > 0)) continue;
    const hv = n(r.hoeveelheid);
    const broers = (siblings || []).filter((s) => s.id !== r.combi_id && s.category_code === cur.category_code && s.subcategory_code === cur.subcategory_code)
      .map((s) => ({ combi: s, unit: unitOf(s.id) })).filter((x) => x.unit > 0);
    const goedkoper = broers.filter((x) => x.unit < huidigUnit).sort((a, b) => a.unit - b.unit)[0];
    if (!goedkoper) continue;
    out.push({
      rowId: r.id,
      omschrijving: r.omschrijving || cur.naam,
      huidig: cur,
      huidigUnit,
      hoeveelheid: hv,
      alt: goedkoper.combi,
      altUnit: goedkoper.unit,
      deltaPct: huidigUnit > 0 ? ((goedkoper.unit - huidigUnit) / huidigUnit) * 100 : 0,
      besparing: (huidigUnit - goedkoper.unit) * hv,
    });
  }
  return out.sort((a, b) => b.besparing - a.besparing);
}

// Wisselt de combi van een regel om naar het alternatief (componenten + STABU mee). Expliciete actie.
export async function pasAlternatiefToe(rowId, altCombi) {
  const comps = await loadCombiComponents(altCombi.id);
  await updateRow(rowId, { combi_id: altCombi.id, omschrijving: altCombi.naam, eenheid: altCombi.eenheid || 'st' });
  return replaceRowComponents(rowId, (comps || []).map((c) => ({
    type: c.type, stabu_code: c.stabu_code, omschrijving: c.omschrijving,
    hoeveelheid: c.hoeveelheid_per_eenheid, eenheid: c.eenheid, norm: c.norm,
    materiaalprijs: c.materiaalprijs, arbeidsprijs: c.arbeidsprijs, materieelprijs: c.materieelprijs,
  })));
}
