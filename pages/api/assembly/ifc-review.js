// pages/api/assembly/ifc-review.js — IFC Review Workbench state (GET).
// Leest de canonieke workbench-state (objecten + items + KPI's) via public.ifc_review_state().
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Alleen GET' });
  try {
    const { data, error } = await supabaseAdmin().rpc('ifc_review_state');
    if (error) throw error;
    res.status(200).json(data || { kpis: {}, objecten: [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
