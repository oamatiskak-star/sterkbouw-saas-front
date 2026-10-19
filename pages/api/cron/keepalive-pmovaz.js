// pages/api/cron/keepalive-pmovaz.js — voorkomt dat Supabase-project pmovazftwoxjopqkuuhp
// (gratis plan) na 7 dagen inactiviteit automatisch pauzeert. Vercel Cron (zie vercel.json)
// roept dit periodiek aan; een lichte REST-request telt als activiteit voor de auto-pauze-klok.
// Leest tabel `keepalive` (geen gegevens): anon heeft sinds D1 (19-10-2026) geen toegang meer tot klantdata.
export default async function handler(req, res) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resp = await fetch(`${url}/rest/v1/keepalive?select=id&limit=1`, {
      headers: { apikey: key, authorization: `Bearer ${key}` },
    });
    res.status(200).json({ ok: resp.ok, status: resp.status, checked_at: new Date().toISOString() });
  } catch (err) {
    res.status(200).json({ ok: false, error: err.message });
  }
}
