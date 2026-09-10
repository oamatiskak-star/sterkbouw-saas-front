// pages/api/afspraak/verstuur.js — verstuurt de afspraak-bevestigingsmail (info@strkbouw.nl)
// voor een opname/afspraak. Server-side omdat de mail-provider-credentials nooit naar de
// client mogen.
import { createClient } from '@supabase/supabase-js';
import { buildAfspraakEmail } from '@/lib/afspraken/afspraakEmailTemplate';
import { verstuurAfspraakMail } from '@/lib/afspraken/verstuurAfspraakMail';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { opname_id } = req.body || {};
  if (!opname_id || !UUID_RE.test(opname_id)) return res.status(400).json({ error: 'opname_id ontbreekt of ongeldig' });

  const { data: opname, error: loadError } = await supabase
    .from('opnames')
    .select('*')
    .eq('id', opname_id)
    .maybeSingle();
  if (loadError) return res.status(500).json({ error: loadError.message });
  if (!opname) return res.status(404).json({ error: 'Opname niet gevonden' });
  if (!opname.email) return res.status(400).json({ error: 'Geen e-mailadres bij deze afspraak' });

  const { data: settingsRow } = await supabase.from('sterkcalc_settings').select('bedrijf').eq('id', 1).maybeSingle();
  const bedrijf = settingsRow?.bedrijf || {};

  const { subject, html, text } = buildAfspraakEmail({
    klantNaam: opname.klant_naam,
    adres: opname.adres,
    postcode: opname.postcode,
    plaats: opname.plaats,
    datumOpname: opname.datum_opname,
    tijdOpname: opname.tijd_opname,
    bron: opname.bron,
    opgenomenDoor: opname.opgenomen_door,
    bedrijfNaam: bedrijf.naam || 'STRKBOUW',
  });

  const mailResult = await verstuurAfspraakMail({ to: opname.email, subject, html, text });

  if (mailResult.sent) {
    await supabase.from('opnames').update({ bevestiging_verzonden_at: new Date().toISOString() }).eq('id', opname_id);
  }

  return res.status(200).json({ ok: true, mailSent: !!mailResult.sent, mailResult });
}
