// pages/api/quickscan/kpi.js
// KPI-aggregatie voor het Quickscan-dashboard. Leest v_quickscan_kpi + recente leads
// + per-bron en per-projecttype breakdowns. Service-role only. GET.
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  try {
    const admin = supabaseAdmin();
    const [
      { data: kpi, error: kErr },
      { data: leads, error: lErr },
      { data: perBron, error: bErr },
      { data: perProjecttype, error: pErr },
    ] = await Promise.all([
      admin.from('v_quickscan_kpi').select('*').maybeSingle(),
      admin.from('quickscan_leads')
        .select('id,created_at,naam,email,telefoon,projectadres,status,waarde_eur,bron,projecttype')
        .order('created_at', { ascending: false }).limit(25),
      admin.from('v_quickscan_bron').select('*').order('leads', { ascending: false }),
      admin.from('v_quickscan_projecttype').select('*'),
    ]);
    if (kErr) return res.status(500).json({ error: kErr.message });
    if (lErr) return res.status(500).json({ error: lErr.message });
    if (bErr) return res.status(500).json({ error: bErr.message });
    if (pErr) return res.status(500).json({ error: pErr.message });
    return res.status(200).json({
      kpi: kpi || {}, leads: leads || [], perBron: perBron || [], perProjecttype: perProjecttype || [],
    });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e).slice(0, 200) });
  }
}
