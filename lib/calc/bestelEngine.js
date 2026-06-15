// lib/calc/bestelEngine.js
// Sprint 8 — Bestellen & Inkoop. Materiaal-aggregatie uit de werktafel → leverancier-koppeling →
// bestelvoorstellen met leverdatums uit de planning → tekorten-detectie. Pure functies.
// Werktafel/planning leidend; AI mag alleen signaleren/voorstellen (nooit plaatsen/kiezen/prijzen wijzigen).
import { faseVanCategorie, FASE_LABEL, berekenPlanning } from '@/lib/calc/planningEngine';

const n = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0);
const minDatum = (a, b) => (!a ? b : !b ? a : (a < b ? a : b));

function minDagen(dateStr, dagen) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setDate(d.getDate() - Math.max(0, Math.round(dagen)));
  return d.toISOString().slice(0, 10);
}

// Materiaal aggregeren per (categorie + materiaal). Combi's → componenten × regelhoeveelheid.
export function aggregeerMaterialen(chapters, rows) {
  const chById = new Map((chapters || []).map((c) => [c.id, c]));
  const agg = new Map();
  for (const r of rows || []) {
    const ch = chById.get(r.chapter_id);
    const cat = ch?.code || 'algemeen';
    const isCombi = r.type === 'combi' || r.is_combi;
    const items = isCombi
      ? (r._components || []).map((c) => ({ ...c, hoeveelheid: n(c.hoeveelheid) * n(r.hoeveelheid) }))
      : [{ ...r, hoeveelheid: n(r.hoeveelheid) }];
    for (const it of items) {
      if (n(it.materiaalprijs) <= 0) continue;
      const key = `${cat}::${it.stabu_code || it.omschrijving || 'materiaal'}`;
      if (!agg.has(key)) agg.set(key, { key, category_code: cat, omschrijving: it.omschrijving || it.stabu_code || 'Materiaal', eenheid: it.eenheid || '', hoeveelheid: 0, prijs: n(it.materiaalprijs) });
      agg.get(key).hoeveelheid += n(it.hoeveelheid);
    }
  }
  return [...agg.values()].map((m) => ({ ...m, hoeveelheid: Math.round(m.hoeveelheid * 100) / 100, totaal: Math.round(m.hoeveelheid * m.prijs * 100) / 100 }));
}

export function matchLeverancier(categoryCode, leveranciers) {
  const act = (leveranciers || []).filter((l) => l.actief !== false);
  return act.find((l) => (l.categorieen || []).includes(categoryCode)) || act.find((l) => (l.categorieen || []).includes('algemeen')) || null;
}

// Bestelvoorstellen: één pakket per leverancier, met fase + gewenste leverdatum (fa.start − levertijd).
export function bestelvoorstellen(chapters, rows, leveranciers, config = {}) {
  const planning = berekenPlanning(chapters, rows, config);
  const faseStart = {};
  for (const f of planning.fases) faseStart[f.key] = f.start_datum;

  const materialen = aggregeerMaterialen(chapters, rows);
  const perLev = new Map();
  for (const m of materialen) {
    const fkey = faseVanCategorie(m.category_code);
    const lev = matchLeverancier(m.category_code, leveranciers);
    const levId = lev?.id || '__onbekend';
    const leverdatum = minDagen(faseStart[fkey], lev?.levertijd_dagen || 7);
    if (!perLev.has(levId)) perLev.set(levId, { leverancier: lev, leverancier_naam: lev?.naam || 'Nog toe te wijzen', regels: [], totaal: 0, gewenste_leverdatum: null, fases: new Set() });
    const g = perLev.get(levId);
    g.regels.push({ ...m, fase: fkey, fase_label: FASE_LABEL[fkey] || fkey, leverdatum });
    g.totaal += m.totaal;
    g.gewenste_leverdatum = minDatum(g.gewenste_leverdatum, leverdatum);
    g.fases.add(FASE_LABEL[fkey] || fkey);
  }
  return [...perLev.values()].map((g) => ({ ...g, totaal: Math.round(g.totaal * 100) / 100, fases: [...g.fases] })).sort((a, b) => b.totaal - a.totaal);
}

// KPI's voor het dashboard (Sprint 9-velden alvast).
export function bestelKpi(voorstellen, bestellingen) {
  const inkoopVoorstel = voorstellen.reduce((s, v) => s + v.totaal, 0);
  const besteld = bestellingen.filter((b) => b.status !== 'concept').reduce((s, b) => s + n(b.totaal), 0);
  const ontvangen = bestellingen.filter((b) => b.status === 'geleverd').reduce((s, b) => s + n(b.totaal), 0);
  const leveranciers = new Set(bestellingen.map((b) => b.leverancier_id).filter(Boolean));
  const openLeveringen = bestellingen.filter((b) => b.status === 'geplaatst').length;
  const vandaag = new Date().toISOString().slice(0, 10);
  const vertraagd = bestellingen.filter((b) => b.status === 'geplaatst' && b.verwacht_at && b.verwacht_at < vandaag).length;
  return {
    inkoop_voorstel: Math.round(inkoopVoorstel),
    besteld_bedrag: Math.round(besteld),
    ontvangen_bedrag: Math.round(ontvangen),
    openstaand_bedrag: Math.round(besteld - ontvangen),
    aantal_leveranciers: leveranciers.size,
    aantal_bestellingen: bestellingen.length,
    open_leveringen: openLeveringen,
    vertraagde_leveringen: vertraagd,
  };
}

// Tekorten/vertragingen: planning-behoefte vs geplaatste/geleverde bestellingen.
export function tekorten(chapters, rows, leveranciers, bestellingen, config = {}) {
  const voorstellen = bestelvoorstellen(chapters, rows, leveranciers, config);
  const out = [];
  const vandaag = new Date().toISOString().slice(0, 10);
  for (const v of voorstellen) {
    const gedekt = (bestellingen || []).some((b) => b.leverancier_id && v.leverancier?.id && b.leverancier_id === v.leverancier.id && b.status !== 'concept');
    if (!v.leverancier) out.push({ niveau: 'risico', tekst: `Materiaal zonder leverancier (${v.regels.length} regels) — wijs een leverancier toe.` });
    else if (!gedekt) out.push({ niveau: 'tekort', tekst: `${v.leverancier_naam}: nog geen geplaatste bestelling (gewenst ~${v.gewenste_leverdatum || 'n.t.b.'}).` });
  }
  for (const b of bestellingen || []) {
    if (b.status === 'geplaatst' && b.verwacht_at && b.verwacht_at < vandaag) out.push({ niveau: 'vertraging', tekst: `${b.leverancier_naam || 'Bestelling'}: levering verwacht ${b.verwacht_at} (verstreken).` });
  }
  return out;
}
