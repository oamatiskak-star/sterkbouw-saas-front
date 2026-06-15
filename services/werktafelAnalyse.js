// services/werktafelAnalyse.js — P4-C contextuele AI-analyse (advies, geen mutatie).
// Vergelijkt het projecttype-template met de aanwezige hoofdstukken/subhoofdstukken/regels en
// meldt ontbrekende of lege onderdelen. AI mag alleen adviseren; nooit automatisch invoegen.
import supabase from '@/lib/supabase';
import { templateVoor, PROJECTTYPE_LABELS } from '@/lib/calc/projecttypeTemplates';

export async function analyseerDekking(projecttype, chapters = [], rows = []) {
  const tpl = templateVoor(projecttype);
  const cats = tpl.map((t) => t.cat);
  const [{ data: catRows }, { data: subRows }] = await Promise.all([
    supabase.from('sterkcalc_visual_categories').select('code, title').in('code', cats),
    supabase.from('sterkcalc_visual_subcategories').select('category_code, code, title').in('category_code', cats),
  ]);
  const catN = Object.fromEntries((catRows || []).map((c) => [c.code, c.title]));
  const subN = {};
  for (const s of subRows || []) subN[`${s.category_code}.${s.code}`] = s.title;

  const hoofd = chapters.filter((c) => !c.parent_id);
  const sub = chapters.filter((c) => c.parent_id);
  const hoofdAanwezig = new Set(hoofd.map((c) => c.code));
  const subAanwezig = new Map(sub.map((c) => [`${c.code}.${c.sub_code}`, c.id]));
  const rowsPerChapter = {};
  for (const r of rows) rowsPerChapter[r.chapter_id] = (rowsPerChapter[r.chapter_id] || 0) + 1;

  const ontbrekendeHoofd = [];
  const ontbrekendeSub = [];
  const legeSub = [];
  for (const { cat, subs } of tpl) {
    if (!hoofdAanwezig.has(cat)) {
      ontbrekendeHoofd.push({ cat, naam: catN[cat] || `Hoofdstuk ${cat}` });
      continue;
    }
    for (const s of subs) {
      const key = `${cat}.${s}`;
      const chId = subAanwezig.get(key);
      if (!chId) ontbrekendeSub.push({ cat, sub: s, naam: subN[key] || key });
      else if (!(rowsPerChapter[chId] > 0)) legeSub.push({ cat, sub: s, naam: subN[key] || key, chapterId: chId });
    }
  }
  return {
    projecttype: PROJECTTYPE_LABELS[projecttype] || projecttype,
    ontbrekendeHoofd,
    ontbrekendeSub,
    legeSub,
    compleet: ontbrekendeHoofd.length === 0 && ontbrekendeSub.length === 0,
  };
}
