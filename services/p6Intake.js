// services/p6Intake.js — P6-G/H/I: AI-bouwdelenvoorstel + projecttype-validatie + toepassen.
// AI calculeert niet zelf; ze stelt bouwdelen voor. De calculator vinkt aan/uit. Bij afronden
// worden de gekozen bouwdelen (combi's → componenten → STABU) in de werktafel geplaatst.
import { loadAlleBouwdelen, loadBouwdeelCombisMetHoeveelheid } from '@/services/bouwdelen';
import { loadRuimtes, loadObjecten } from '@/services/aiAnalyse';
import { voegCombiToe } from '@/services/combis';
import { kritiekeDomeinen, CAT_TITLES } from '@/lib/calc/projecttypeTemplates';

const norm = (s) => (s || '').toString().toLowerCase().trim();

// Vind het best passende bouwdeel voor een AI-klasse (op naam-token).
function matchBouwdeel(klasse, bouwdelen) {
  const k = norm(klasse);
  if (!k) return null;
  const token = k.split(/\s+/)[0];
  // exacte naam eerst, dan bevat-token
  return (
    bouwdelen.find((b) => norm(b.naam) === k) ||
    bouwdelen.find((b) => norm(b.naam).includes(token)) ||
    bouwdelen.find((b) => token.length > 3 && norm(b.naam).includes(token.slice(0, token.length - 1))) ||
    null
  );
}

// Genereert het bouwdelenvoorstel: AI-vondsten (ruimtes + objecten) → bouwdelen, aangevuld met
// kritieke projecttype-domeinen. Geeft een aanvinkbare lijst terug (default geselecteerd).
export async function genereerBouwdeelVoorstel(calculatieId, projecttypeRaw) {
  const projecttype = norm(projecttypeRaw) || 'nieuwbouw';
  const [ruimtes, objecten, bouwdelenAll] = await Promise.all([
    loadRuimtes(calculatieId).catch(() => []),
    loadObjecten(calculatieId).catch(() => []),
    loadAlleBouwdelen().catch(() => []),
  ]);
  const bouwdelen = (bouwdelenAll || []).filter((b) => b.combis > 0);

  // 1) Tellen per AI-klasse (ruimtes + objecten).
  const tel = {};
  for (const r of ruimtes) { const k = r.klasse || r.naam; if (!k) continue; tel[k] = (tel[k] || 0) + 1; }
  for (const o of objecten) { const k = o.klasse || o.naam; if (!k) continue; tel[k] = (tel[k] || 0) + (Number(o.aantal) || 1); }

  const voorstel = [];
  const gebruikteBouwdelen = new Set();
  const gedekteCats = new Set();

  // 2) AI-vondsten → bouwdelen.
  for (const [klasse, count] of Object.entries(tel)) {
    const bd = matchBouwdeel(klasse, bouwdelen);
    if (bd && !gebruikteBouwdelen.has(bd.id)) {
      gebruikteBouwdelen.add(bd.id);
      if (bd.category_code) gedekteCats.add(bd.category_code);
      voorstel.push({ key: `ai-${bd.id}`, bouwdeelId: bd.id, naam: bd.naam, klasse, count, bron: 'ai', categoryCode: bd.category_code, selected: true });
    } else if (!bd) {
      // Geen bouwdeel-match — toch tonen als AI-signaal (niet toepasbaar, advies).
      voorstel.push({ key: `sig-${norm(klasse)}`, bouwdeelId: null, naam: klasse, klasse, count, bron: 'ai-signaal', categoryCode: null, selected: false });
    }
  }

  // 3) Kritieke projecttype-domeinen aanvullen die nog niet gedekt zijn.
  for (const cat of kritiekeDomeinen(projecttype)) {
    if (gedekteCats.has(cat)) continue;
    const bd = bouwdelen.find((b) => b.category_code === cat);
    const naam = CAT_TITLES[cat] || `Hoofdstuk ${cat}`;
    if (bd && !gebruikteBouwdelen.has(bd.id)) {
      gebruikteBouwdelen.add(bd.id);
      gedekteCats.add(cat);
      voorstel.push({ key: `pt-${cat}`, bouwdeelId: bd.id, naam: bd.naam, klasse: naam, count: 1, bron: 'projecttype', categoryCode: cat, selected: true });
    }
  }

  return voorstel;
}

// P6-H: projecttype-validatie — welke kritieke domeinen worden NIET gedekt door de selectie.
export function valideerProjecttype(projecttypeRaw, voorstel) {
  const projecttype = norm(projecttypeRaw) || 'nieuwbouw';
  const gedekt = new Set(voorstel.filter((v) => v.selected && v.categoryCode).map((v) => v.categoryCode));
  return kritiekeDomeinen(projecttype)
    .filter((cat) => !gedekt.has(cat))
    .map((cat) => ({ cat, naam: CAT_TITLES[cat] || `Hoofdstuk ${cat}` }));
}

// P6-I: gekozen bouwdelen toepassen op de werktafel (combi's → componenten → STABU).
// Geeft het aantal toegevoegde regels terug.
export async function pasVoorstelToe(calculatieId, voorstel) {
  let toegevoegd = 0;
  for (const v of voorstel) {
    if (!v.selected || !v.bouwdeelId) continue;
    const items = await loadBouwdeelCombisMetHoeveelheid(v.bouwdeelId).catch(() => []);
    for (const { combi, hoeveelheid } of items) {
      const row = await voegCombiToe({ calculatieId, chapterId: null, combi, hoeveelheid }).catch(() => null);
      if (row) toegevoegd += 1;
    }
  }
  return toegevoegd;
}
