// services/aiAnalyse.js — AI-laag: ruimtes/openingen + groepering→werktafel (generiek).
import supabase from '@/lib/supabase';
import { voegCombiToe } from '@/services/combis';

const VISION_BUCKET = 'sterkcalc-vision-uploads';
const VISION_MIME = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// ---- Visions: upload tekening + AI-ruimteherkenning ----
export function isOndersteundeTekening(file) {
  return !!file && VISION_MIME.includes(file.type);
}

export async function analyseTekening(calculatieId, file, { signal } = {}) {
  if (!isOndersteundeTekening(file)) {
    const dwgIfc = /\.(dwg|dxf|ifc)$/i.test(file?.name || '');
    throw new Error(
      dwgIfc
        ? 'DWG/DXF/IFC wordt nog niet direct gelezen — exporteer eerst naar PDF of afbeelding.'
        : 'Niet-ondersteund bestandstype. Gebruik PDF, PNG, JPG of WEBP.'
    );
  }
  // 1) Upload naar private storage-bucket (browser → storage, geen Vercel-bodylimiet).
  const safe = (file.name || 'tekening').replace(/[^\w.\-]+/g, '_');
  const path = `${calculatieId}/${Date.now()}-${safe}`;
  const up = await supabase.storage.from(VISION_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (up.error) throw new Error('Upload mislukt: ' + up.error.message);

  // 2) Korte signed-URL zodat de server het bestand kan ophalen voor de vision-call.
  const signed = await supabase.storage.from(VISION_BUCKET).createSignedUrl(path, 600);
  if (signed.error || !signed.data?.signedUrl) {
    throw new Error('Kon bestand niet delen met vision: ' + (signed.error?.message || 'onbekend'));
  }

  // 3) Vision-proxy: Claude herkent ruimtes/maten/openingen (geen DB-write server-side).
  const res = await fetch('/api/calculaties/vision', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal,
    body: JSON.stringify({ fileUrl: signed.data.signedUrl, mediaType: file.type }),
  });
  const extract = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extract.error || `Vision-analyse mislukt (${res.status}).`);

  // 4-7) Extract verwerken: loggen + ruimtes/openingen/objecten wegschrijven.
  return verwerkVisionExtract(calculatieId, extract, { bestandsnaam: file.name, storage_path: path, media_type: file.type });
}

// Schrijft een vision-extract weg (analyse-log + ruimtes/openingen/objecten). Gedeeld door
// analyseTekening (eigen upload) en analyseDocument (bestaand dossierdocument). Anon-client.
async function verwerkVisionExtract(calculatieId, extract, { bestandsnaam, storage_path, media_type } = {}) {
  const herkend = Array.isArray(extract.ruimtes) ? extract.ruimtes : [];
  const confs = herkend.map((r) => r.confidence).filter((v) => v != null);
  const gemConf = confs.length ? Math.round((confs.reduce((s, v) => s + v, 0) / confs.length) * 100) / 100 : null;

  let analysisId = null;
  try {
    const { data: log } = await supabase
      .from('calculatie_vision_analyses')
      .insert({
        calculatie_id: calculatieId,
        bestandsnaam: bestandsnaam || null,
        storage_path: storage_path || null,
        media_type: media_type || null,
        model: extract.model || null,
        status: 'done',
        plan_schaal: extract.plan_schaal || null,
        opmerkingen: extract.opmerkingen || null,
        gem_confidence: gemConf,
        raw_response: extract,
      })
      .select('id')
      .single();
    analysisId = log?.id || null;
  } catch { /* log is best-effort */ }

  let openingenTotal = 0;
  const inserted = [];
  for (const r of herkend) {
    const { data: row, error: rErr } = await supabase
      .from('calculatie_ruimtes')
      .insert({ calculatie_id: calculatieId, naam: r.naam, klasse: r.klasse, lengte: r.lengte, breedte: r.breedte, hoogte: r.hoogte, confidence: r.confidence, source: 'ai', vision_analysis_id: analysisId })
      .select('*')
      .single();
    if (rErr) throw new Error('Opslaan ruimte mislukt: ' + rErr.message);
    inserted.push(row);
    const ops = Array.isArray(r.openingen) ? r.openingen : [];
    if (ops.length) {
      const payload = ops.map((o) => ({ ruimte_id: row.id, type: o.type, breedte: o.breedte, hoogte: o.hoogte, aantal: o.aantal }));
      const { error: oErr } = await supabase.from('calculatie_openingen').insert(payload);
      if (!oErr) openingenTotal += payload.reduce((s, p) => s + (p.aantal || 1), 0);
    }
  }

  const objectenHerkend = Array.isArray(extract.objecten) ? extract.objecten : [];
  let objectenTotal = 0;
  if (objectenHerkend.length) {
    const payload = objectenHerkend.map((o) => ({ calculatie_id: calculatieId, naam: o.naam, klasse: o.klasse, lengte: o.lengte, breedte: o.breedte, hoogte: o.hoogte, aantal: o.aantal || 1, materiaal: o.materiaal || null, confidence: o.confidence, source: 'ai', vision_analysis_id: analysisId }));
    const { error: objErr } = await supabase.from('calculatie_objecten').insert(payload);
    if (!objErr) objectenTotal = payload.reduce((s, p) => s + (p.aantal || 1), 0);
  }

  if (analysisId) {
    supabase.from('calculatie_vision_analyses').update({ ruimtes_gevonden: inserted.length, openingen_gevonden: openingenTotal }).eq('id', analysisId).then(() => {}, () => {});
  }

  return {
    analysisId,
    ruimtes: inserted,
    meta: {
      ruimtes_gevonden: inserted.length,
      openingen_gevonden: openingenTotal,
      objecten_gevonden: objectenTotal,
      gem_confidence: gemConf,
      plan_schaal: extract.plan_schaal || null,
      opmerkingen: extract.opmerkingen || null,
      model: extract.model || null,
    },
  };
}

// P6-E: AI-analyse op een bestaand dossierdocument (signed-URL → vision → wegschrijven).
// `doc` = rij uit document_sources (met storage_path + mime_type). Alleen PDF/afbeeldingen.
export async function analyseDocument(calculatieId, doc, { signal } = {}) {
  const mime = (doc?.mime_type || '').toLowerCase();
  const visionMime = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!visionMime.includes(mime)) throw new Error('Dit documenttype kan AI nog niet lezen (alleen PDF/afbeeldingen).');

  const signed = await supabase.storage.from('sterkcalc-vision-uploads').createSignedUrl(doc.storage_path, 600);
  if (signed.error || !signed.data?.signedUrl) throw new Error('Kon document niet delen met vision.');

  const res = await fetch('/api/calculaties/vision', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal,
    body: JSON.stringify({ fileUrl: signed.data.signedUrl, mediaType: mime }),
  });
  const extract = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extract.error || `Vision-analyse mislukt (${res.status}).`);

  return verwerkVisionExtract(calculatieId, extract, { bestandsnaam: doc.file_name, storage_path: doc.storage_path, media_type: mime });
}

// ---- Objecten / bouwdelen (Visions+) ----
export async function loadObjecten(calculatieId) {
  const { data, error } = await supabase
    .from('calculatie_objecten')
    .select('*')
    .eq('calculatie_id', calculatieId)
    .order('created_at');
  if (error) throw error;
  return data || [];
}

export async function insertObject(calculatieId, object) {
  const { data, error } = await supabase
    .from('calculatie_objecten')
    .insert({ calculatie_id: calculatieId, source: 'manual', aantal: 1, ...object })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateObject(id, patch) {
  const { error } = await supabase.from('calculatie_objecten').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteObject(id) {
  const { error } = await supabase.from('calculatie_objecten').delete().eq('id', id);
  if (error) throw error;
}

// Persisteer een bouwdeel-type-groepering (snapshot). Vervangt bestaande AI-groepering.
export async function bewaarBouwdeelTypes(calculatieId, types) {
  await supabase.from('calculatie_bouwdeel_types').delete().eq('calculatie_id', calculatieId).eq('source', 'ai');
  if (!types?.length) return [];
  const payload = types.map((t) => ({
    calculatie_id: calculatieId,
    naam: t.naam,
    object_klasse: t.klasse,
    aantal: t.aantal,
    afmetingen: t.gem || {},
    afwijking: { pct: t.afwijkingPct, gelijkheid: t.gelijkheidPct, leden: t.leden },
    confidence: t.gelijkheidPct,
    source: 'ai',
  }));
  const { data, error } = await supabase.from('calculatie_bouwdeel_types').insert(payload).select();
  if (error) throw error;
  return data || [];
}

// Eén akkoord per bouwdeel-type → combi × aantal → werktafel.
export async function pasBouwdeelTypeToe({ calculatieId, type, combi, perStukHoeveelheid = 1 }) {
  const aantal = Number(type?.aantal) || 1;
  const totaal = (Number(perStukHoeveelheid) || 1) * aantal;
  return voegCombiToe({ calculatieId, combi, hoeveelheid: totaal });
}

export async function loadAnalyses(calculatieId) {
  const { data, error } = await supabase
    .from('calculatie_vision_analyses')
    .select('id, bestandsnaam, status, ruimtes_gevonden, openingen_gevonden, gem_confidence, plan_schaal, opmerkingen, model, created_at')
    .eq('calculatie_id', calculatieId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return data || [];
}

// ---- Ruimtes ----
export async function loadRuimtes(calculatieId) {
  const { data, error } = await supabase
    .from('calculatie_ruimtes')
    .select('*')
    .eq('calculatie_id', calculatieId)
    .order('created_at');
  if (error) throw error;
  return data || [];
}

export async function insertRuimte(calculatieId, ruimte) {
  const { data, error } = await supabase
    .from('calculatie_ruimtes')
    .insert({ calculatie_id: calculatieId, source: 'manual', ...ruimte })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRuimte(id, patch) {
  const { error } = await supabase.from('calculatie_ruimtes').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteRuimte(id) {
  const { error } = await supabase.from('calculatie_ruimtes').delete().eq('id', id);
  if (error) throw error;
}

// ---- Ruimte-types (groepering persisteren als snapshot) ----
export async function bewaarRuimteTypes(calculatieId, types) {
  // vervang bestaande groepering
  await supabase.from('calculatie_ruimte_types').delete().eq('calculatie_id', calculatieId);
  if (!types?.length) return [];
  const payload = types.map((t) => ({
    calculatie_id: calculatieId,
    naam: t.naam,
    aantal: t.aantal,
    gem_lengte: t.gem?.lengte ?? null,
    gem_breedte: t.gem?.breedte ?? null,
    gem_hoogte: t.gem?.hoogte ?? null,
    afwijking: { pct: t.afwijkingPct, gelijkheid: t.gelijkheidPct, leden: t.leden },
    confidence: t.gelijkheidPct,
    source: 'ai',
  }));
  const { data, error } = await supabase.from('calculatie_ruimte_types').insert(payload).select();
  if (error) throw error;
  return data || [];
}

// ---- Combi-suggesties per ruimteklasse (generiek, op trefwoord) ----
export async function suggereerCombis(klasse) {
  if (!klasse) return [];
  const term = klasse.toLowerCase().split(/\s+/)[0];
  const { data } = await supabase
    .from('combis')
    .select('id, code, naam, eenheid, omschrijving, subcategory_code, category_code')
    .eq('actief', true) // alleen gecureerde/actieve combi's voorstellen, geen verborgen dumps
    .ilike('naam', `%${term}%`)
    .limit(8);
  return data || [];
}

// ---- Eén akkoord per type → combi × aantal → werktafel ----
export async function pasTypeToe({ calculatieId, type, combi, perRuimteHoeveelheid }) {
  const aantal = Number(type?.aantal) || 1;
  const totaal = (Number(perRuimteHoeveelheid) || 1) * aantal;
  return voegCombiToe({ calculatieId, combi, hoeveelheid: totaal });
}
