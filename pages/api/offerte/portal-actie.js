// pages/api/offerte/portal-actie.js — server-side gevalideerde schrijfacties vanaf het publieke
// klantportaal (/portaal/[token]). Nodig omdat sterkcalc_offertes.update RLS `auth.uid() IS NOT
// NULL` vereist: een anonieme klant (geen login, per ontwerp) kan dus NOOIT rechtstreeks via de
// anon-client schrijven. De token is hier de autorisatie — nooit een oplopend/publiek ID, en na
// 'getekend' is de offerte immutable (server weigert elke verdere mutatie, ongeacht client-state).
import { createClient } from '@supabase/supabase-js';
import { heeftToegangCookie, internGebruiker, isVerlopen } from '@/lib/portaal/toegang';
import { ondertekenVisualUrls, canoniekeVisualUrls, vasteVisualUrl } from '@/lib/storage/visualUrls';

export const config = { api: { bodyParser: { sizeLimit: '12mb' } } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim() || req.socket?.remoteAddress || null;
}

async function laadViaToken(token) {
  if (!token || typeof token !== 'string') return null;
  const { data } = await supabase.from('sterkcalc_offertes').select('*').eq('portal_token', token).maybeSingle();
  return data || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { type, token } = req.body || {};
  const offerte = await laadViaToken(token);
  if (!offerte) return res.status(404).json({ error: 'Offerte niet gevonden' });

  // Alleen de geverifieerde klant (toegangscookie) of een ingelogde dashboardgebruiker.
  const intern = await internGebruiker(req);
  if (!intern && !heeftToegangCookie(req, offerte)) return res.status(401).json({ error: 'Geen toegang tot deze offerte' });
  // Interne voorbeeldweergave telt niet als klantactie.
  if (intern && type === 'bekeken') return res.status(200).json({ ok: true, voorbeeld: true });
  // Verlopen offerte: geen wijzigingen of ondertekening meer mogelijk.
  if (isVerlopen(offerte) && ['optie', 'onderteken'].includes(type)) {
    return res.status(410).json({ error: 'Deze offerte is verlopen en kan niet meer worden geaccepteerd.' });
  }

  if (type === 'bekeken') {
    const patch = { updated_at: new Date().toISOString() };
    if (!offerte.bekeken_at) patch.bekeken_at = new Date().toISOString();
    if (offerte.status === 'verzonden') patch.status = 'bekeken';
    await supabase.from('sterkcalc_offertes').update(patch).eq('id', offerte.id);
    await supabase.from('sterkcalc_offerte_events').insert({ offerte_id: offerte.id, type: 'bekeken', ip: clientIp(req) });
    return res.status(200).json({ ok: true });
  }

  if (type === 'optie') {
    if (offerte.status === 'getekend') return res.status(409).json({ error: 'Offerte is al ondertekend en kan niet meer gewijzigd worden' });
    const { index } = req.body || {};
    const opties = Array.isArray(offerte.opties) ? offerte.opties : [];
    if (!Number.isInteger(index) || index < 0 || index >= opties.length) return res.status(400).json({ error: 'Ongeldige optie-index' });
    const gewijzigd = { ...opties[index], geselecteerd: !opties[index].geselecteerd };
    const nextOpties = opties.map((o, i) => (i === index ? gewijzigd : o));
    await supabase.from('sterkcalc_offertes').update({ opties: nextOpties, updated_at: new Date().toISOString() }).eq('id', offerte.id);
    const teken = gewijzigd.geselecteerd ? '+' : '−';
    const werkwoord = gewijzigd.geselecteerd ? 'aangezet' : 'uitgezet';
    await supabase.from('sterkcalc_offerte_events').insert({
      offerte_id: offerte.id,
      type: 'optie_gewijzigd',
      bericht: `Klant heeft optie '${gewijzigd.naam}' ${werkwoord} (${teken} ${Number(gewijzigd.bedrag || 0).toLocaleString('nl-NL')})`,
      ip: clientIp(req),
      meta: { optie: gewijzigd.naam, geselecteerd: gewijzigd.geselecteerd, bedrag: gewijzigd.bedrag },
    });
    return res.status(200).json({ ok: true, opties: nextOpties });
  }

  if (type === 'onderteken') {
    if (offerte.status === 'getekend') return res.status(409).json({ error: 'Offerte is al ondertekend' });
    const { naam, handtekeningDataUrl, voorwaardenVersie, totaalInclBtw } = req.body || {};
    if (!naam || !String(naam).trim()) return res.status(400).json({ error: 'Naam ontbreekt' });
    if (!handtekeningDataUrl) return res.status(400).json({ error: 'Handtekening ontbreekt' });
    if (!voorwaardenVersie) return res.status(400).json({ error: 'Voorwaardenversie ontbreekt' });

    const nu = new Date();
    const ip = clientIp(req);
    const ondertekening = {
      naam: String(naam).trim(),
      datum: nu.toLocaleDateString('nl-NL'),
      tijd: nu.toLocaleTimeString('nl-NL'),
      ip,
      handtekeningDataUrl,
      voorwaardenAccepted: true,
      voorwaardenVersie,
      offerteVersie: offerte.versie || 1,
      geselecteerdeOpties: (offerte.opties || []).filter((o) => o.geselecteerd).map((o) => ({ naam: o.naam, bedrag: o.bedrag })),
      totaalInclBtw: totaalInclBtw ?? null,
      audittrail: `Digitaal ondertekend via klantportaal op ${nu.toISOString()} vanaf IP ${ip || 'onbekend'}`,
    };

    const { error: updErr } = await supabase.from('sterkcalc_offertes').update({
      status: 'getekend',
      getekend_at: nu.toISOString(),
      ondertekening,
      updated_at: nu.toISOString(),
    }).eq('id', offerte.id);
    if (updErr) return res.status(500).json({ error: updErr.message });

    await supabase.from('sterkcalc_offerte_events').insert({
      offerte_id: offerte.id,
      type: 'getekend',
      bericht: `Offerte geaccepteerd en ondertekend door ${ondertekening.naam}`,
      ip,
      meta: ondertekening,
    });

    return res.status(200).json({ ok: true, offerte_id: offerte.id });
  }

  if (type === 'pdf_upload') {
    // Definitieve PDF na ondertekening: upload server-side (storage is niet meer anoniem beschrijfbaar).
    const { pdfBase64, bestandsnaam } = req.body || {};
    if (offerte.status !== 'getekend') return res.status(409).json({ error: 'Offerte is nog niet ondertekend' });
    if (!pdfBase64 || typeof pdfBase64 !== 'string') return res.status(400).json({ error: 'PDF ontbreekt' });
    const naam = String(bestandsnaam || 'offerte.pdf').replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 120);
    const buffer = Buffer.from(pdfBase64.replace(/^data:application\/pdf;base64,/, ''), 'base64');
    if (buffer.length < 1000 || buffer.slice(0, 4).toString() !== '%PDF') return res.status(400).json({ error: 'Ongeldige PDF' });
    const path = `${offerte.id}/${naam}`;
    const { error: upErr } = await supabase.storage.from('sterkcalc-visual-assets').upload(path, buffer, { contentType: 'application/pdf', upsert: true });
    if (upErr) return res.status(500).json({ error: upErr.message });
    const vast = vasteVisualUrl(path);
    await supabase.from('sterkcalc_offertes').update({ pdf_url: vast, updated_at: new Date().toISOString() }).eq('id', offerte.id);
    return res.status(200).json({ ok: true, pdf_url: await ondertekenVisualUrls(supabase, vast, 4 * 3600) });
  }

  if (type === 'conversie') {
    // Vraag / terugbelverzoek / afspraak vanuit het portaal.
    const { conversieType, bericht } = req.body || {};
    const toegestaan = ['vraag', 'alternatief', 'meerwerk', 'afspraak'];
    const t = toegestaan.includes(conversieType) ? conversieType : 'vraag';
    await supabase.from('sterkcalc_offerte_events').insert({
      offerte_id: offerte.id, type: t, bericht: bericht ? String(bericht).slice(0, 2000) : null, ip: clientIp(req),
    });
    return res.status(200).json({ ok: true });
  }

  if (type === 'pdf_url') {
    const { pdf_url } = req.body || {};
    if (!pdf_url) return res.status(400).json({ error: 'pdf_url ontbreekt' });
    await supabase.from('sterkcalc_offertes').update({ pdf_url: canoniekeVisualUrls(pdf_url), updated_at: new Date().toISOString() }).eq('id', offerte.id);
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Onbekend actietype' });
}
