// pages/api/normuren/review.js — Normuren review-state (GET ?batch=&status=&limit=).
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Alleen GET' });
  const { batch, status, limit } = req.query;
  try {
    const { data, error } = await supabaseAdmin().rpc('normuren_review_state', {
      p_batch: batch || null,
      p_status: status || null,
      p_limit: limit ? Number(limit) : 200,
    });
    if (error) throw error;
    res.status(200).json(data || { kpis: {}, batches: [], regels: [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
