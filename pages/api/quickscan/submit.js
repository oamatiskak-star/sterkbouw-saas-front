// pages/api/quickscan/submit.js
// STRKBOUW Bouwkosten Quickscan — intake. Verwerkt multipart-form (formidable):
// validatie → uploads naar private storage-bucket → lead + 'lead'-event in Supabase.
// Service-role only (supabaseAdmin). Geen externe verzending hier; CRM volgt apart.
import fs from 'fs';
import formidable from 'formidable';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const config = { api: { bodyParser: false } };

const MAX_FILE_BYTES = 15 * 1024 * 1024;      // 15 MB per bestand
const MAX_FILES = 8;
const ALLOWED = new Set([
  'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword', 'application/octet-stream',
]);

const first = (v) => (Array.isArray(v) ? v[0] : v);
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
const slug = (s) => String(s || 'bestand').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  let fields, files;
  try {
    const form = formidable({ multiples: true, maxFiles: MAX_FILES, maxFileSize: MAX_FILE_BYTES, keepExtensions: true });
    [fields, files] = await form.parse(req);
  } catch (e) {
    return res.status(400).json({ error: 'UPLOAD_PARSE_FAILED', detail: String(e?.message || e).slice(0, 200) });
  }

  const naam = String(first(fields.naam) || '').trim();
  const email = String(first(fields.email) || '').trim();
  const telefoon = String(first(fields.telefoon) || '').trim() || null;
  const projectadres = String(first(fields.projectadres) || '').trim() || null;
  const funda_url = String(first(fields.funda_url) || '').trim() || null;
  const bericht = String(first(fields.bericht) || '').trim() || null;
  const bron = String(first(fields.bron) || 'landing').trim().slice(0, 60);
  const projecttype = String(first(fields.projecttype) || '').trim().slice(0, 40) || null;
  let utm = {};
  try { utm = JSON.parse(first(fields.utm) || '{}'); } catch { utm = {}; }

  if (!naam) return res.status(422).json({ error: 'NAAM_REQUIRED' });
  if (!isEmail(email)) return res.status(422).json({ error: 'EMAIL_INVALID' });

  const admin = supabaseAdmin();
  const leadId = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.round(performance.now())}`);

  // Uploads → private bucket onder leads/<leadId>/
  const uploaded = [];
  const fileList = Object.values(files || {}).flat().filter(Boolean);
  for (const f of fileList.slice(0, MAX_FILES)) {
    try {
      if (!f?.filepath) continue;
      const type = f.mimetype || 'application/octet-stream';
      if (!ALLOWED.has(type)) continue;
      if ((f.size || 0) > MAX_FILE_BYTES) continue;
      const name = slug(f.originalFilename || 'bestand');
      const path = `leads/${leadId}/${Date.now()}_${name}`;
      const buffer = await fs.promises.readFile(f.filepath);
      const { error: upErr } = await admin.storage.from('quickscan-uploads')
        .upload(path, buffer, { contentType: type, upsert: false });
      if (!upErr) uploaded.push({ path, name, size: f.size || buffer.length, type });
    } catch {
      // één mislukte upload mag de lead niet blokkeren — lead is het waardevolle
    }
  }

  const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || null;
  const user_agent = (req.headers['user-agent'] || '').toString().slice(0, 400) || null;

  const { error: insErr } = await admin.from('quickscan_leads').insert({
    id: leadId, naam, email, telefoon, projectadres, funda_url, bericht, projecttype,
    bestanden: uploaded, bron, utm, ip, user_agent,
  });
  if (insErr) return res.status(500).json({ error: 'LEAD_INSERT_FAILED', detail: insErr.message });

  await admin.from('quickscan_events').insert({
    lead_id: leadId, event_type: 'lead', meta: { bron, projecttype, files: uploaded.length },
  });

  return res.status(200).json({ ok: true, lead_id: leadId, files: uploaded.length });
}
