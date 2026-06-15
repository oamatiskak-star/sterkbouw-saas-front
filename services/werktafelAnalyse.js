// services/werktafelAnalyse.js — P5-J volledigheidscheck + P4-C contextuele AI-analyse (advies, geen mutatie).
// Vergelijkt het projecttype-template met de aanwezige hoofdstukken/subhoofdstukken/regels en
// meldt ontbrekende, lege of kritieke onderdelen. AI/check adviseert alleen; voegt nooit zelf in.
import supabase from '@/lib/supabase';
import { templateVoor, kritiekeDomeinen, PROJECTTYPE_LABELS, CAT_TITLES } from '@/lib/calc/projecttypeTemplates';
import { evalueerObjectRegels } from '@/lib/calc/volledigheidsRegels';
import { ruimteType } from '@/lib/calc/objectEngine';

export async function analyseerDekking(projecttypeRaw, chapters = [], rows = [], calculatieId = null) {
  const projecttype = (projecttypeRaw || 'nieuwbouw').toString().trim().toLowerCase();
  const cats = templateVoor(projecttype);
  const kritiek = new Set(kritiekeDomeinen(projecttype));
  const [{ data: catRows }, { data: subRows }, { data: combiRows }] = await Promise.all([
    supabase.from('sterkcalc_visual_categories').select('code, title').in('code', cats),
    supabase.from('sterkcalc_visual_subcategories').select('category_code, code, title').in('category_code', cats),
    supabase.from('combis').select('category_code, subcategory_code').eq('actief', true).in('category_code', cats),
  ]);
  const catN = { ...CAT_TITLES, ...Object.fromEntries((catRows || []).map((c) => [c.code, c.title])) };
  const subN = {};
  for (const s of subRows || []) subN[`${s.category_code}.${s.code}`] = s.title;

  const subsMetCombi = {};
  for (const c of combiRows || []) {
    if (!c.subcategory_code) continue;
    (subsMetCombi[c.category_code] = subsMetCombi[c.category_code] || new Set()).add(c.subcategory_code);
  }

  const hoofd = chapters.filter((c) => !c.parent_id);
  const sub = chapters.filter((c) => c.parent_id);
  const hoofdByCode = new Map(hoofd.map((c) => [c.code, c]));
  const subByKey = new Map(sub.map((c) => [`${c.code}.${c.sub_code}`, c]));

  // Aantal regels per chapter (incl. subhoofdstukken) — telt zowel op hoofdstuk als sub.
  const rowsPerChapter = {};
  for (const r of rows) if (r.chapter_id) rowsPerChapter[r.chapter_id] = (rowsPerChapter[r.chapter_id] || 0) + 1;
  // Regels onder een hoofdstuk = directe regels + regels onder zijn subhoofdstukken.
  const subsByParent = {};
  for (const s of sub) (subsByParent[s.parent_id] = subsByParent[s.parent_id] || []).push(s);
  const totRows = (h) => (rowsPerChapter[h.id] || 0) + (subsByParent[h.id] || []).reduce((n, s) => n + (rowsPerChapter[s.id] || 0), 0);

  const ontbrekendeHoofd = []; // template-hoofdstuk niet aanwezig
  const legeHoofd = [];        // aanwezig maar 0 regels
  const legeSub = [];          // subhoofdstuk met combi-dekking maar 0 regels
  const kritiekOpen = [];      // kritiek domein ontbreekt of is leeg

  for (const cat of cats) {
    const h = hoofdByCode.get(cat);
    const naam = catN[cat] || `Hoofdstuk ${cat}`;
    if (!h) {
      ontbrekendeHoofd.push({ cat, naam, kritiek: kritiek.has(cat) });
      if (kritiek.has(cat)) kritiekOpen.push({ cat, naam, reden: 'ontbreekt' });
      continue;
    }
    const n = totRows(h);
    if (n === 0) {
      legeHoofd.push({ cat, naam, kritiek: kritiek.has(cat) });
      if (kritiek.has(cat)) kritiekOpen.push({ cat, naam, reden: 'leeg' });
    }
    // Lege subhoofdstukken met combi-dekking (advies-niveau).
    for (const sc of Array.from(subsMetCombi[cat] || []).sort()) {
      const key = `${cat}.${sc}`;
      const sch = subByKey.get(key);
      if (sch && !(rowsPerChapter[sch.id] > 0)) legeSub.push({ cat, sub: sc, naam: subN[key] || key });
    }
  }

  // P7.3 — object-volledigheidsregels (badkamer zonder ventilatie, keuken zonder apparatuur, …).
  // Aanwezige objecten uit AI-ruimtes + projecttype; aanwezige categorieën/subs uit gevulde rijen.
  const objecten = new Set();
  if (['badkamer', 'keuken', 'toilet'].includes(projecttype)) objecten.add(projecttype);
  if (calculatieId) {
    const { data: ruimtes } = await supabase.from('calculatie_ruimtes').select('klasse, naam').eq('calculatie_id', calculatieId);
    for (const r of ruimtes || []) objecten.add(ruimteType(r.klasse || r.naam));
  }
  const catsMetRegels = new Set();
  const subsMetRegels = new Set();
  for (const c of chapters) {
    if ((rowsPerChapter[c.id] || 0) > 0) {
      if (c.code) catsMetRegels.add(c.code);
      if (c.code && c.sub_code) subsMetRegels.add(`${c.code}.${c.sub_code}`);
    }
  }
  const objectWaarschuwingen = evalueerObjectRegels({ projecttype, objecten, cats: catsMetRegels, subs: subsMetRegels });

  const openCount = ontbrekendeHoofd.length + legeHoofd.length;
  return {
    projecttype: PROJECTTYPE_LABELS[projecttype] || projecttype,
    ontbrekendeHoofd,
    legeHoofd,
    legeSub,
    kritiekOpen,
    objectWaarschuwingen,
    openCount,
    compleet: openCount === 0 && kritiekOpen.length === 0 && objectWaarschuwingen.length === 0,
  };
}
