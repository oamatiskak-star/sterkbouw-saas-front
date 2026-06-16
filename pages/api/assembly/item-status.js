// pages/api/assembly/item-status.js — Approve/Reject één generated_item (POST).
// body: { item_id, status }  (status: approved | rejected | staged)
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Alleen POST' });
  const { item_id, status } = req.body || {};
  if (!item_id || !status) return res.status(400).json({ error: 'item_id en status verplicht' });
  try {
    const { data, error } = await supabaseAdmin().rpc('ifc_review_item_status', { p_item: item_id, p_status: status });
    if (error) throw error;
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
