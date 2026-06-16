// pages/api/assembly/rollback-object.js — Rollback alle promoties uit één IFC-object (POST).
// body: { ifc_object_id }
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Alleen POST' });
  const { ifc_object_id } = req.body || {};
  if (!ifc_object_id) return res.status(400).json({ error: 'ifc_object_id verplicht' });
  try {
    const { data, error } = await supabaseAdmin().rpc('ifc_review_rollback_object', { p_object_id: ifc_object_id });
    if (error) throw error;
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
