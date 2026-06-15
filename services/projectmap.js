// services/projectmap.js — P7.4 Projectmap: de project-hub (scherm 1.1).
// Aggregeert status, documenten, analyses, calculaties en offertes van één project rond een
// calculatie. Uitsluitend lezen; geen mutaties. Anon-client (zelfde pad als de rest).
import supabase from '@/lib/supabase';

const count = async (tabel, kolom, waarde) => {
  try { const { count: n } = await supabase.from(tabel).select('id', { count: 'exact', head: true }).eq(kolom, waarde); return n || 0; } catch { return 0; }
};

export async function loadProjectmap(calculatieId) {
  const { data: calc } = await supabase
    .from('calculaties').select('id, naam, project_id, project_type, status, created_at').eq('id', calculatieId).maybeSingle();
  const projectId = calc?.project_id || null;

  const [project, documenten, analyses, offertes, calcsVanProject, tellingen] = await Promise.all([
    projectId ? supabase.from('projects').select('*').eq('id', projectId).maybeSingle().then((r) => r.data) : Promise.resolve(null),
    supabase.from('document_sources').select('id, file_name, document_type, analyse_status, created_at').eq('calculatie_id', calculatieId).order('created_at', { ascending: false }).then((r) => r.data || []),
    supabase.from('calculatie_vision_analyses').select('id, bestandsnaam, status, ruimtes_gevonden, created_at').eq('calculatie_id', calculatieId).order('created_at', { ascending: false }).then((r) => r.data || []),
    supabase.from('sterkcalc_offertes').select('id, nummer, status, totaal_incl, created_at, verzonden_at, getekend_at').eq('calculatie_id', calculatieId).order('created_at', { ascending: false }).then((r) => r.data || []),
    projectId ? supabase.from('calculaties').select('id, naam, status, created_at').eq('project_id', projectId).order('created_at', { ascending: false }).then((r) => r.data || []) : Promise.resolve([]),
    Promise.all([
      count('werktafel_rows', 'calculatie_id', calculatieId),
      count('calculatie_ruimtes', 'calculatie_id', calculatieId),
      count('calculatie_objecten', 'calculatie_id', calculatieId),
    ]),
  ]);

  const [werktafelRegels, ruimtes, objecten] = tellingen;
  const documentenGeanalyseerd = documenten.filter((d) => d.analyse_status === 'geanalyseerd').length;
  const offerte = offertes[0] || null;

  // Voortgang (heuristisch over de canonieke fasen).
  let voortgang = 0;
  if (documenten.length) voortgang += 15;
  if (analyses.length) voortgang += 15;
  if (ruimtes + objecten > 0) voortgang += 10;
  if (werktafelRegels > 0) voortgang += 30;
  if (offerte) voortgang += 20;
  if (offerte && (offerte.verzonden_at || offerte.getekend_at)) voortgang += 10;
  voortgang = Math.min(100, voortgang);

  // Recente activiteit (samengevoegde tijdlijn).
  const activiteit = [];
  if (calc?.created_at) activiteit.push({ at: calc.created_at, type: 'project', tekst: 'Calculatie aangemaakt' });
  for (const d of documenten.slice(0, 6)) activiteit.push({ at: d.created_at, type: 'document', tekst: `Document: ${d.file_name}` });
  for (const a of analyses.slice(0, 6)) activiteit.push({ at: a.created_at, type: 'analyse', tekst: `AI-analyse: ${a.bestandsnaam || 'tekening'}${a.ruimtes_gevonden != null ? ` (${a.ruimtes_gevonden} ruimtes)` : ''}` });
  for (const o of offertes) {
    if (o.created_at) activiteit.push({ at: o.created_at, type: 'offerte', tekst: `Offerte ${o.nummer || ''} aangemaakt` });
    if (o.verzonden_at) activiteit.push({ at: o.verzonden_at, type: 'offerte', tekst: `Offerte ${o.nummer || ''} verzonden` });
    if (o.getekend_at) activiteit.push({ at: o.getekend_at, type: 'offerte', tekst: `Offerte ${o.nummer || ''} getekend` });
  }
  activiteit.sort((a, b) => (a.at < b.at ? 1 : -1));

  return {
    calculatie: calc,
    project,
    tellingen: { documenten: documenten.length, documentenGeanalyseerd, analyses: analyses.length, ruimtes, objecten, werktafelRegels, offertes: offertes.length, calculaties: calcsVanProject.length },
    documenten: documenten.slice(0, 5),
    offertes,
    calculaties: calcsVanProject,
    activiteit: activiteit.slice(0, 8),
    voortgang,
  };
}
