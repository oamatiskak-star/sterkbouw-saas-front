// pages/api/quickscan/track.js
// Lichtgewicht visit-tracker voor de Quickscan-funnel (KPI: visitors).
// Eén insert per paginabezoek; geen PII. Service-role only.
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  try {
    let utm = {};
    try { utm = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {}); } catch { utm = {}; }
    await supabaseAdmin().from('quickscan_events').insert({
      event_type: 'visit',
      meta: { path: (utm?.path || '/bouwkosten-quickscan'), utm: utm?.utm || {}, ref: utm?.ref || null },
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(200).json({ ok: false }); // tracking mag nooit de UX breken
  }
}
