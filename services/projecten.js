// services/projecten.js — Project-/documentlaag (Project = basis).
import supabase from '@/lib/supabase';

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
