// pages/api/offerte/test-mail.js — stuurt een kopie van een BESTAANDE offerte-mail naar een
// opgegeven testadres, voor deliverability-diagnose (bijv. "komt hij wel aan bij Hotmail").
// Mutateert NIETS aan de offerte (geen status/verzonden_at/portal_token/events) — puur een
// verzend-test los van de echte audittrail. Retourneert de volledige SMTP-diagnostiek.
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

  const { offerte_id, to } = req.body || {};
  if (!offerte_id || !UUID_RE.test(offerte_id)) return res.status(400).json({ error: 'offerte_id ontbreekt of ongeldig' });
  if (!to || typeof to !== 'string' || !to.includes('@')) return res.status(400).json({ error: 'to (testadres) ontbreekt of ongeldig' });

  const { data: offerte, error: loadError } = await supabase
    .from('sterkcalc_offertes')
    .select('*')
    .eq('id', offerte_id)
    .maybeSingle();
  if (loadError) return res.status(500).json({ error: loadError.message });
  if (!offerte) return res.status(404).json({ error: 'Offerte niet gevonden' });
  if (!offerte.portal_token) return res.status(400).json({ error: 'Offerte heeft nog geen portal_token (nog niet verzonden)' });

  const { data: settingsRow } = await supabase.from('sterkcalc_settings').select('bedrijf').eq('id', 1).maybeSingle();
  const bedrijf = settingsRow?.bedrijf || {};

  const origin = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;
  const portalUrl = `${origin}/portaal/${offerte.portal_token}`;
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

  const mailResult = await verstuurOfferteMail({
    to,
    replyTo: bedrijf.email || undefined,
    subject: `[TEST kopie] ${subject}`,
    html,
    text,
  });

  return res.status(200).json({ ok: true, sentTo: to, portalUrl, mailResult });
}
