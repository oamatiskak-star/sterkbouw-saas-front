// services/projecten.js — Project-/documentlaag (Project = basis).
import supabase from '@/lib/supabase';
import { loadGlobalCalcDefaults, instantiateerTemplate } from '@/services/werktafel';
import { normalizeInstellingen } from '@/lib/calc/calculatieDefaults';

// Canonieke entry: maak project + calculatie + eerste werktafelrecord + eerste versie en
// geef de calculatie-id terug zodat de gebruiker direct in de werktafel landt.
// PRODUCTREGEL: een nieuwe calculatie is NOOIT afhankelijk van oppervlakte/inhoud/ruimtes/
// bouwdelen/bouwsom/hoeveelheden — die ontstaan later in de keten (AI/maatvoering/werktafel).
export async function maakProjectEnCalculatie({ projectnaam, opdrachtgever, plaats, projecttype = 'nieuwbouw', werkadres = null, omschrijving = null, referentie = null, startdatum = null, einddatum = null, contactpersoon = null, telefoon = null, email = null }) {
  const naam = (projectnaam || 'Nieuw project').trim();
  // optionele context bundelen in opmerking (geen schemawijziging)
  const notities = [
    omschrijving,
    referentie ? `Referentie: ${referentie}` : null,
    startdatum ? `Startdatum: ${startdatum}` : null,
    einddatum ? `Einddatum: ${einddatum}` : null,
    contactpersoon ? `Contact: ${contactpersoon}` : null,
    telefoon ? `Tel: ${telefoon}` : null,
    email ? `E-mail: ${email}` : null,
  ].filter(Boolean).join(' · ') || null;
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .insert({ projectnaam: naam, naam_opdrachtgever: opdrachtgever || null, plaatsnaam: plaats || null, project_type: projecttype, straatnaam_en_huisnummer: werkadres || null, opmerking: notities, status: 'concept' })
    .select('id')
    .single();
  if (pErr) throw new Error('Project aanmaken mislukt: ' + pErr.message);

  const defaults = normalizeInstellingen((await loadGlobalCalcDefaults().catch(() => null)) || {});
  const { data: calc, error: cErr } = await supabase
    .from('calculaties')
    .insert({ project_id: project.id, naam, project_type: projecttype, status: 'concept', werktafel_opslagen: defaults })
    .select('id')
    .single();
  if (cErr) throw new Error('Calculatie aanmaken mislukt: ' + cErr.message);

  // Projecttype-template: hoofdstukken + subhoofdstukken klaarzetten (werktafel start niet leeg).
  await instantiateerTemplate(calc.id, projecttype).catch(() => {});
  await supabase.from('calculation_versions').insert({ calculatie_id: calc.id, version_no: 1, label: 'Versie 1', snapshot: { opslagen: defaults, chapters: [], rows: [] } }).then(() => {}, () => {});

  return { calculatieId: calc.id, projectId: project.id };
}

export const projectNaam = (p) =>
  p?.projectnaam || p?.project_name || p?.naam_opdrachtgever || `Project ${String(p?.id || '').slice(0, 8)}`;

export async function loadProjecten() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, projectnaam, project_name, naam_opdrachtgever, plaats, plaatsnaam, status, project_type, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data || [];
}

export async function loadProject(id) {
  const { data } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  return data || null;
}

export async function loadDocumenten(projectId) {
  const { data } = await supabase
    .from('document_sources')
    .select('id, document_type, file_name, storage_path, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function loadCalculatiesVanProject(projectId) {
  const { data } = await supabase
    .from('calculaties')
    .select('id, naam, status, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function zoek(term) {
  if (!term || term.length < 2) return { projecten: [], calculaties: [], combis: [], stabu: [] };
  const like = `%${term}%`;
  const [pr, ca, co, st] = await Promise.all([
    supabase.from('projects').select('id, projectnaam, project_name, naam_opdrachtgever, plaats').or(`projectnaam.ilike.${like},naam_opdrachtgever.ilike.${like}`).limit(10),
    supabase.from('calculaties').select('id, naam, status').ilike('naam', like).limit(10),
    supabase.from('combis').select('id, code, naam').or(`naam.ilike.${like},code.ilike.${like}`).limit(10),
    supabase.from('stabu_posten').select('code, omschrijving').or(`code.ilike.${like},omschrijving.ilike.${like}`).limit(10),
  ]);
  return { projecten: pr.data || [], calculaties: ca.data || [], combis: co.data || [], stabu: st.data || [] };
}
