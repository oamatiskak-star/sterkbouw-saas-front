// services/documenten.js — P6-C/D: documentcenter + projectdossier.
// Uploadt projectdocumenten naar de (anon-schrijfbare) vision-bucket en registreert ze in
// document_sources met type, grootte, mime en analysestatus. Signed-URLs voor weergave/analyse.
import supabase from '@/lib/supabase';

const DOC_BUCKET = 'sterkcalc-vision-uploads';

// Documentcategorieën (P6-C).
export const DOC_TYPES = ['Tekeningen', 'Vergunning', 'Bestek', 'Constructie', 'Installaties', "Foto's", 'Rapporten', 'Overig'];

// Toegestane extensies (P6-C). DWG/DXF/IFC worden geaccepteerd als dossierstuk,
// maar (nog) niet door de AI gelezen — exporteer naar PDF/afbeelding voor analyse.
export const DOC_ACCEPT = '.pdf,.dwg,.dxf,.ifc,.jpg,.jpeg,.png,.webp,.docx,.xlsx';
const VISION_MIME = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export function isAnalyseerbaar(doc) {
  return VISION_MIME.includes((doc?.mime_type || '').toLowerCase());
}

export function leesbareGrootte(bytes) {
  const b = Number(bytes) || 0;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// Eén document uploaden + registreren in het dossier.
export async function uploadDocument({ projectId, calculatieId, file, documentType = 'Overig' }) {
  const safe = (file.name || 'document').replace(/[^\w.\-]+/g, '_');
  const path = `${calculatieId}/docs/${Date.now()}-${safe}`;
  const up = await supabase.storage.from(DOC_BUCKET).upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
  if (up.error) throw new Error('Upload mislukt: ' + up.error.message);

  const { data, error } = await supabase
    .from('document_sources')
    .insert({
      project_id: projectId,
      calculatie_id: calculatieId,
      document_type: documentType,
      file_name: file.name,
      mime_type: file.type || null,
      file_size: file.size || null,
      storage_path: path,
      analyse_status: 'niet_geanalyseerd',
    })
    .select('*')
    .single();
  if (error) throw new Error('Registreren mislukt: ' + error.message);
  return data;
}

export async function loadDossier(calculatieId) {
  const { data, error } = await supabase
    .from('document_sources')
    .select('id, document_type, file_name, mime_type, file_size, page_count, analyse_status, storage_path, created_at')
    .eq('calculatie_id', calculatieId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteDocument(doc) {
  if (doc.storage_path) await supabase.storage.from(DOC_BUCKET).remove([doc.storage_path]).catch(() => {});
  const { error } = await supabase.from('document_sources').delete().eq('id', doc.id);
  if (error) throw error;
}

export async function markAnalyseStatus(id, status) {
  await supabase.from('document_sources').update({ analyse_status: status }).eq('id', id).then(() => {}, () => {});
}

// Korte signed-URL voor weergave/download of voor de vision-call.
export async function signedUrl(storagePath, seconds = 600) {
  if (!storagePath) return null;
  const { data } = await supabase.storage.from(DOC_BUCKET).createSignedUrl(storagePath, seconds);
  return data?.signedUrl || null;
}
