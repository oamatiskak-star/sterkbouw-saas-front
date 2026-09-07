// pages/api/offerte/verstuur.js — verstuurt de premium offerte-mail naar de klant en zet
// de offerte op status 'verzonden' (portal_token + verzonden_at + audit-event). Server-side
// omdat de mail-provider-key (MAILTRAP_API_TOKEN/RESEND_API_KEY) nooit naar de client mag.
import { createClient } from '@supabase/supabase-js';
import { buildOfferteEmail } from '@/lib/offerte/emailTemplate';
import { verstuurOfferteMail } from '@/lib/offerte/verstuurOfferteMail';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { offerte_id } = req.body || {};
  if (!offerte_id || !UUID_RE.test(offerte_id)) return res.status(400).json({ error: 'offerte_id ontbreekt of ongeldig' });

  const { data: offerte, error: loadError } = await supabase
    .from('sterkcalc_offertes')
    .select('*')
    .eq('id', offerte_id)
    .maybeSingle();
  if (loadError) return res.status(500).json({ error: loadError.message });
  if (!offerte) return res.status(404).json({ error: 'Offerte niet gevonden' });
  if (!offerte.klant_email) return res.status(400).json({ error: 'Geen e-mailadres bij deze offerte (vul dit in op het tabblad Cover)' });

  const { data: settingsRow } = await supabase.from('sterkcalc_settings').select('bedrijf').eq('id', 1).maybeSingle();
  const bedrijf = settingsRow?.bedrijf || {};

  const portal_token = offerte.portal_token || (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `tok_${Date.now()}_${Math.round(Math.random() * 1e6)}`);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;
  const portalUrl = `${origin}/portaal/${portal_token}`;

  const cover = offerte.cover || {};
  const content = offerte.content || {};
  const { subject, html, text } = buildOfferteEmail({
    klantNaam: offerte.klant_naam,
    projectnaam: cover.projectnaam || null,
    portalUrl,
    afzenderNaam: bedrijf.contactpersoon || null,
    bedrijfNaam: bedrijf.naam || 'STRKBOUW',
    reviewUrl: content.reviewUrl || null,
  });

  const mailResult = await verstuurOfferteMail({ to: offerte.klant_email, replyTo: bedrijf.email || undefined, subject, html, text });

  const patch = { portal_token, status: 'verzonden', verzonden_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  const { error: updateError } = await supabase.from('sterkcalc_offertes').update(patch).eq('id', offerte_id);
  if (updateError) return res.status(500).json({ error: updateError.message });

  await supabase.from('sterkcalc_offerte_events').insert({
    offerte_id,
    type: 'verzonden',
    bericht: mailResult.sent ? `E-mail verzonden via ${mailResult.provider}` : `E-mail NIET verzonden (${mailResult.reason || mailResult.status})`,
    meta: { kanaal: 'e-mail', mailResult },
  });

  return res.status(200).json({ ok: true, portalUrl, mailSent: !!mailResult.sent, mailProvider: mailResult.provider || null, mailReason: mailResult.reason || null });
}
