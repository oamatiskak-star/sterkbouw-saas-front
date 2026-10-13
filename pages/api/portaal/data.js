// pages/api/portaal/data.js — levert de portaaldata van één offerte, alleen aan:
//   1. de klant (geldige toegangscookie na e-mailverificatie, zie /api/portaal/verificatie), of
//   2. een ingelogde dashboardgebruiker (Authorization: Bearer <supabase access token>) — voorbeeld.
// Verlopen offertes (content.geldigTot < vandaag, niet getekend) → 410, ook voor de klant.
import {
  laadOfferteViaToken, heeftToegangCookie, internGebruiker, isVerlopen, geldigTot, maskEmail, laadPortaalData,
} from '@/lib/portaal/toegang';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store');
  const token = String(req.query.token || '');
  const offerte = await laadOfferteViaToken(token);
  if (!offerte) return res.status(404).json({ error: 'Offerte niet gevonden' });

  const intern = await internGebruiker(req);
  const verlopen = isVerlopen(offerte);

  let bedrijf = {};
  if (verlopen || !intern) {
    const { data } = await supabaseAdmin().from('sterkcalc_settings').select('bedrijf').eq('id', 1).maybeSingle();
    bedrijf = data?.bedrijf || {};
  }
  const contact = { naam: bedrijf.naam || 'STRKBOUW', email: bedrijf.email || null, telefoon: bedrijf.telefoon || null };

  if (verlopen && !intern) {
    return res.status(410).json({ verlopen: true, geldigTot: geldigTot(offerte), nummer: offerte.nummer, contact });
  }

  if (!intern && !heeftToegangCookie(req, offerte)) {
    return res.status(401).json({
      verificatieNodig: true,
      emailHint: maskEmail(offerte.klant_email),
      nummer: offerte.nummer,
      contact,
    });
  }

  const data = await laadPortaalData(offerte);
  return res.status(200).json({ ...data, voorbeeld: !!intern, verlopen });
}
