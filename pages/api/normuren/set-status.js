// pages/api/normuren/set-status.js — Approve/Reject één normuren-regel (POST).
// body: { item_id, status, accept_combi }  (status: approved | rejected | staged)
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Alleen POST' });
  const { item_id, status, accept_combi } = req.body || {};
  if (!item_id || !status) return res.status(400).json({ error: 'item_id en status verplicht' });
  try {
    const { data, error } = await supabaseAdmin().rpc('normuren_set_status', {
      p_item: item_id, p_status: status, p_accept_combi: !!accept_combi,
    });
    if (error) throw error;
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
