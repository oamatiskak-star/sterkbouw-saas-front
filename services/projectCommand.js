// services/projectCommand.js — Sprint 10 Bouw OS orkestratie.
// Verbindt ALLE bestaande modules (werktafel/offerte/planning/bestellen/rapportage) tot één
// command center. Uitsluitend lezen + samenstellen; geen nieuwe engines, geen mutaties (behalve
// expliciete oplevering-statuswijziging). AI adviserend.
import supabase from '@/lib/supabase';
import { calcData } from '@/services/calcModules';
import { derivePlanning, loadPlanningVersies } from '@/services/planning';
import { loadBestellingen, loadLeveranciers } from '@/services/bestellen';
import { bestelvoorstellen } from '@/lib/calc/bestelEngine';
import { bouwRapportage } from '@/lib/calc/rapportageEngine';
import { bepaalFase, healthScore, openActies, opleverChecklist } from '@/lib/calc/projectStatus';

async function veiligCount(tabel, kolom, waarde) {
  try { const { count } = await supabase.from(tabel).select('id', { count: 'exact', head: true }).eq(kolom, waarde); return count || 0; } catch { return 0; }
}

function bouwTimeline({ calculatie, versies, offerte, events, bestellingen, planningVersies }) {
  const t = [];
  if (calculatie?.created_at) t.push({ at: calculatie.created_at, type: 'project', tekst: 'Project/calculatie aangemaakt' });
  for (const v of versies || []) t.push({ at: v.created_at, type: 'calculatie', tekst: `Calculatie opgeslagen (${v.label || 'V' + v.version_no})` });
  if (offerte?.created_at) t.push({ at: offerte.created_at, type: 'offerte', tekst: `Offerte ${offerte.nummer || ''} aangemaakt` });
  for (const e of events || []) t.push({ at: e.created_at, type: 'offerte', tekst: `Offerte: ${e.type}${e.bericht ? ' — ' + e.bericht : ''}` });
  for (const p of planningVersies || []) t.push({ at: p.created_at, type: 'planning', tekst: `Planning opgeslagen (${p.naam || 'V' + p.versie})` });
  for (const b of bestellingen || []) {
    if (b.besteld_at) t.push({ at: b.besteld_at, type: 'inkoop', tekst: `Bestelling geplaatst — ${b.leverancier_naam || ''}` });
    if (b.geleverd_at) t.push({ at: b.geleverd_at, type: 'inkoop', tekst: `Materiaal geleverd — ${b.leverancier_naam || ''}` });
  }
  return t.filter((x) => x.at).sort((a, b) => (a.at < b.at ? 1 : -1));
}

export async function buildCommand(calculatieId) {
  const calc = await calcData(calculatieId);
  const [offRows, leveranciers, bestellingen, planningVersies, ruimtesCount] = await Promise.all([
    supabase.from('sterkcalc_offertes').select('*').eq('calculatie_id', calculatieId).order('created_at', { ascending: false }).limit(1),
    loadLeveranciers().catch(() => []),
    loadBestellingen(calculatieId).catch(() => []),
    loadPlanningVersies(calculatieId).catch(() => []),
    veiligCount('calculatie_ruimtes', 'calculatie_id', calculatieId),
  ]);
  const offerte = offRows.data?.[0] || null;
  const documentenCount = calc.calculatie?.project_id ? await veiligCount('document_sources', 'project_id', calc.calculatie.project_id) : 0;
  const [events, versies, planning] = await Promise.all([
    offerte ? supabase.from('sterkcalc_offerte_events').select('*').eq('offerte_id', offerte.id).order('created_at', { ascending: false }).then((r) => r.data || []) : Promise.resolve([]),
    supabase.from('calculation_versions').select('version_no, label, snapshot, created_at').eq('calculatie_id', calculatieId).order('version_no', { ascending: false }).limit(10).then((r) => r.data || []).catch(() => []),
    derivePlanning(calculatieId).catch(() => null),
  ]);

  const config = { ...((planningVersies[0]?.config) || {}), projecttype: planningVersies[0]?.config?.projecttype || calc.calculatie?.project_type };
  const voorstellen = bestelvoorstellen(calc.chapters, calc.rows, leveranciers, config);
  const rapport = bouwRapportage({ totalen: calc.totalen, chapters: calc.chapters, rows: calc.rows, offerte, planning, bestellingen, versieSnapshots: versies });

  const ctx = {
    calculatie: calc.calculatie, totalen: calc.totalen, rowsCount: (calc.rows || []).length,
    offerte, planningVersies: planningVersies.length, bestellingen,
    voorstellenCount: voorstellen.length, ruimtesCount, documentenCount,
    risicoKaarten: rapport.risico_kaarten,
  };
  const fase = bepaalFase(ctx);

  return {
    calculatie: calc.calculatie,
    fase,
    health: healthScore(ctx),
    acties: openActies({ ...ctx, fase }),
    checklist: opleverChecklist(ctx),
    timeline: bouwTimeline({ calculatie: calc.calculatie, versies, offerte, events, bestellingen, planningVersies }),
    kpi: rapport.kpi,
    cashflow: rapport.cashflow,
    ai_signalen: rapport.ai_signalen,
    risico_kaarten: rapport.risico_kaarten,
    planning_rapport: rapport.planning_rapport,
    inkoop_rapport: rapport.inkoop_rapport,
    offerte, planning, voorstellenCount: voorstellen.length, bestellingen,
    counts: { ruimtes: ruimtesCount, documenten: documentenCount, versies: versies.length, planningVersies: planningVersies.length },
  };
}

// Oplevering (enige mutatie van Sprint 10): projectstatus zetten.
export async function zetCalculatieStatus(calculatieId, status) {
  const { error } = await supabase.from('calculaties').update({ status }).eq('id', calculatieId);
  if (error) throw error;
}

// Multi-projectoverzicht: lichte samenvatting per calculatie.
export async function loadProjectenOverzicht(limit = 40) {
  const { data: calcs } = await supabase.from('calculaties').select('id, naam, status, project_id, created_at').order('created_at', { ascending: false }).limit(limit);
  const out = [];
  for (const c of calcs || []) {
    try {
      const d = await calcData(c.id);
      const { data: offRows } = await supabase.from('sterkcalc_offertes').select('status').eq('calculatie_id', c.id).order('created_at', { ascending: false }).limit(1);
      const planningVersies = await loadPlanningVersies(c.id).catch(() => []);
      const bestellingen = await loadBestellingen(c.id).catch(() => []);
      const offerte = offRows?.[0] || null;
      const ctx = { calculatie: c, totalen: d.totalen, rowsCount: (d.rows || []).length, offerte, planningVersies: planningVersies.length, bestellingen, risicoKaarten: [] };
      out.push({
        id: c.id, naam: c.naam, status: c.status,
        fase: bepaalFase(ctx), health: healthScore({ ...ctx, voorstellenCount: 0 }),
        verkoop: Math.round(d.totalen.verkoopprijs_excl), marge: Math.round(d.totalen.marge), margePct: Math.round(d.totalen.margePct),
        offerte_status: offerte?.status || null, planning: planningVersies.length > 0,
      });
    } catch { out.push({ id: c.id, naam: c.naam, status: c.status, fout: true }); }
  }
  return out;
}
