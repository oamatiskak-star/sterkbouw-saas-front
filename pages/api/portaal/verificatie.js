// pages/api/portaal/verificatie.js — e-mailverificatie voor het klantportaal.
//   POST { token, stap: 'aanvragen', email }   → stuurt een 6-cijferige code naar het e-mailadres,
//                                                 ALLEEN als het gelijk is aan sterkcalc_offertes.klant_email.
//   POST { token, stap: 'controleren', code }  → bij juiste code: httpOnly toegangscookie voor deze offerte.
// Codes staan gehasht in sterkcalc_portaal_codes (geen RLS-policies → alleen service role).
// Beperkingen: code 15 min geldig, max 5 pogingen per code, max 5 aanvragen per uur per offerte.
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verstuurOfferteMail } from '@/lib/offerte/verstuurOfferteMail';
import {
  laadOfferteViaToken, normEmail, hashCode, zetToegangCookie, isVerlopen, geldigTot,
} from '@/lib/portaal/toegang';

const CODE_GELDIG_MIN = 15;
const MAX_POGINGEN = 5;
const MAX_AANVRAGEN_PER_UUR = 5;

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
}

function codeMail({ code, nummer, bedrijfNaam }) {
  const subject = `Uw toegangscode voor offerte ${nummer || ''}`.trim();
  const text = `Uw toegangscode is ${code}.\n\nVoer deze code in op de offertepagina. De code is ${CODE_GELDIG_MIN} minuten geldig en alleen bedoeld voor u.\n\nHeeft u deze code niet aangevraagd? Dan kunt u deze e-mail negeren.\n\nMet vriendelijke groet,\n${bedrijfNaam}`;
  const html = `<div style="font-family:Arial,sans-serif;color:#111;max-width:480px">
<p>Uw toegangscode voor offerte ${nummer || ''} is:</p>
<p style="font-size:28px;font-weight:800;letter-spacing:6px;margin:16px 0">${code}</p>
<p>Voer deze code in op de offertepagina. De code is ${CODE_GELDIG_MIN} minuten geldig en alleen bedoeld voor u.</p>
<p style="color:#6b7280;font-size:13px">Heeft u deze code niet aangevraagd? Dan kunt u deze e-mail negeren.</p>
<p>Met vriendelijke groet,<br>${bedrijfNaam}</p></div>`;
  return { subject, text, html };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store');
  const { token, stap, email, code } = req.body || {};
  const offerte = await laadOfferteViaToken(token);
  if (!offerte) return res.status(404).json({ error: 'Offerte niet gevonden' });
  if (isVerlopen(offerte)) return res.status(410).json({ verlopen: true, geldigTot: geldigTot(offerte) });
  if (!offerte.klant_email) return res.status(409).json({ error: 'Deze offerte heeft geen klant-e-mailadres. Neem contact op met STRKBOUW.' });

  const db = supabaseAdmin();

  if (stap === 'aanvragen') {
    const sinds = new Date(Date.now() - 3600 * 1000).toISOString();
    const { count } = await db.from('sterkcalc_portaal_codes').select('id', { count: 'exact', head: true })
      .eq('offerte_id', offerte.id).gte('created_at', sinds);
    if ((count || 0) >= MAX_AANVRAGEN_PER_UUR) {
      return res.status(429).json({ error: 'Te veel aanvragen. Probeer het over een uur opnieuw.' });
    }
    // Geen onderscheid in het antwoord tussen juist/onjuist e-mailadres (geen adresvalidatie voor derden).
    if (normEmail(email) === normEmail(offerte.klant_email)) {
      const nieuweCode = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
      await db.from('sterkcalc_portaal_codes').insert({
        offerte_id: offerte.id,
        code_hash: hashCode(offerte.id, nieuweCode),
        expires_at: new Date(Date.now() + CODE_GELDIG_MIN * 60 * 1000).toISOString(),
        ip: clientIp(req),
      });
      const { data: s } = await db.from('sterkcalc_settings').select('bedrijf').eq('id', 1).maybeSingle();
      const bedrijfNaam = s?.bedrijf?.naam || 'STRKBOUW';
      const m = codeMail({ code: nieuweCode, nummer: offerte.nummer, bedrijfNaam });
      const r = await verstuurOfferteMail({ to: offerte.klant_email, subject: m.subject, html: m.html, text: m.text });
      await db.from('sterkcalc_offerte_events').insert({
        offerte_id: offerte.id, type: 'toegangscode', ip: clientIp(req),
        bericht: r?.sent ? 'Toegangscode verstuurd naar klant-e-mail' : `Toegangscode NIET verstuurd (${r?.reason || r?.status || 'onbekend'})`,
      });
    } else {
      await db.from('sterkcalc_portaal_codes').insert({
        offerte_id: offerte.id, code_hash: 'onjuist-email', expires_at: new Date().toISOString(), ip: clientIp(req),
      });
      await db.from('sterkcalc_offerte_events').insert({
        offerte_id: offerte.id, type: 'toegang_geweigerd', ip: clientIp(req),
        bericht: 'Toegangscode aangevraagd met een ander e-mailadres dan de klant (link mogelijk doorgestuurd)',
      });
    }
    return res.status(200).json({ ok: true });
  }

  if (stap === 'controleren') {
    const schoon = String(code || '').replace(/\D/g, '');
    if (schoon.length !== 6) return res.status(400).json({ error: 'Voer de 6-cijferige code in.' });
    const { data: laatste } = await db.from('sterkcalc_portaal_codes').select('*')
      .eq('offerte_id', offerte.id).neq('code_hash', 'onjuist-email').is('gebruikt_at', null)
      .gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!laatste) return res.status(400).json({ error: 'De code is verlopen. Vraag een nieuwe code aan.' });
    if ((laatste.pogingen || 0) >= MAX_POGINGEN) return res.status(429).json({ error: 'Te veel pogingen. Vraag een nieuwe code aan.' });
    if (laatste.code_hash !== hashCode(offerte.id, schoon)) {
      await db.from('sterkcalc_portaal_codes').update({ pogingen: (laatste.pogingen || 0) + 1 }).eq('id', laatste.id);
      return res.status(400).json({ error: 'Onjuiste code.' });
    }
    await db.from('sterkcalc_portaal_codes').update({ gebruikt_at: new Date().toISOString() }).eq('id', laatste.id);
    zetToegangCookie(res, offerte);
    await db.from('sterkcalc_offerte_events').insert({
      offerte_id: offerte.id, type: 'toegang_geverifieerd', ip: clientIp(req), bericht: 'Klant heeft toegang geverifieerd via e-mailcode',
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Onbekende stap' });
}
