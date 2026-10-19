// lib/portaal/toegang.js — server-only toegangslaag voor het klantportaal (/portaal/[token]).
//
// Doel: een offerte is alleen te openen door de klant zelf. De portaallink alleen is niet genoeg
// (doorgestuurde mail): de bezoeker moet een eenmalige code invoeren die naar het e-mailadres van
// de klant (sterkcalc_offertes.klant_email) is gestuurd. Daarna krijgt deze browser een
// ondertekende, httpOnly toegangscookie per offerte. Ingelogde dashboardgebruikers (Supabase
// Auth) mogen altijd meekijken (voorbeeld). Verlopen offertes worden geblokkeerd.
//
// NOOIT importeren in client-code (gebruikt de service-role-key).
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { loadWerktafelMet } from '@/lib/portaal/werktafelServer';
import { ondertekenVisualUrls } from '@/lib/storage/visualUrls';
import { computeTotalen } from '@/lib/calc/werktafelTotals';

const COOKIE_PREFIX = 'sc_portaal_';
const TOEGANG_DAGEN = 30;

function geheim() {
  const s = process.env.PORTAAL_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error('Geen geheim beschikbaar voor portaaltoegang.');
  return s;
}

function hmac(waarde) {
  return crypto.createHmac('sha256', geheim()).update(waarde).digest('base64url');
}

export function hashCode(offerteId, code) {
  return hmac(`code|${offerteId}|${code}`);
}

function cookieNaam(offerteId) {
  return `${COOKIE_PREFIX}${String(offerteId).replace(/[^a-f0-9]/gi, '')}`;
}

function veiligGelijk(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export function normEmail(e) {
  return String(e || '').trim().toLowerCase();
}

export function maskEmail(e) {
  const [naam, domein] = normEmail(e).split('@');
  if (!naam || !domein) return null;
  const zichtbaar = naam.length <= 2 ? naam[0] : naam.slice(0, 2);
  return `${zichtbaar}${'•'.repeat(Math.max(3, naam.length - zichtbaar.length))}@${domein}`;
}

// Zet de toegangscookie (gebonden aan offerte-id + klant-e-mail + vervaldatum).
export function zetToegangCookie(res, offerte) {
  const exp = Date.now() + TOEGANG_DAGEN * 24 * 3600 * 1000;
  const sig = hmac(`toegang|${offerte.id}|${normEmail(offerte.klant_email)}|${exp}`);
  const waarde = `${exp}.${sig}`;
  const bestaand = res.getHeader('Set-Cookie');
  const cookie = `${cookieNaam(offerte.id)}=${waarde}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TOEGANG_DAGEN * 24 * 3600}`;
  res.setHeader('Set-Cookie', bestaand ? [].concat(bestaand, cookie) : cookie);
}

export function heeftToegangCookie(req, offerte) {
  const waarde = req.cookies?.[cookieNaam(offerte.id)];
  if (!waarde || !offerte.klant_email) return false;
  const [expStr, sig] = String(waarde).split('.');
  const exp = Number(expStr);
  if (!exp || exp < Date.now() || !sig) return false;
  const verwacht = hmac(`toegang|${offerte.id}|${normEmail(offerte.klant_email)}|${exp}`);
  return veiligGelijk(sig, verwacht);
}

// Ingelogde dashboardgebruiker? (Authorization: Bearer <supabase access token>)
export async function internGebruiker(req) {
  const h = req.headers?.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return null;
  try {
    const { data, error } = await supabaseAdmin().auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

// Geldig-tot: content.geldigTot ('YYYY-MM-DD'). Verlopen = na die dag én niet ondertekend.
export function geldigTot(offerte) {
  const g = offerte?.content?.geldigTot;
  if (typeof g !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(g)) return null;
  return g;
}

export function isVerlopen(offerte) {
  if (!offerte || offerte.status === 'getekend') return false;
  const g = geldigTot(offerte);
  if (!g) return false;
  const vandaagNL = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' });
  return vandaagNL > g;
}

export async function laadOfferteViaToken(token) {
  if (!token || typeof token !== 'string' || token.length < 16) return null;
  const { data } = await supabaseAdmin().from('sterkcalc_offertes').select('*').eq('portal_token', token).maybeSingle();
  return data || null;
}

// Volledige portaaldata (offerte + calculatie + bedrijfsinstellingen), server-side via service role.
export async function laadPortaalData(offerte) {
  const db = supabaseAdmin();
  const [calc, settingsRes] = await Promise.all([
    loadWerktafelMet(db, offerte.calculatie_id).catch(() => null),
    db.from('sterkcalc_settings').select('bedrijf, branding').eq('id', 1).maybeSingle(),
  ]);
  const totalen = calc ? computeTotalen(calc.rows, calc.opslagen) : null;
  return {
    // Klantbestanden staan in een privé-bucket: tijdelijke ondertekende URL's (incident D1).
    offerte: await ondertekenVisualUrls(db, offerte, 4 * 3600),
    calculatie: calc?.calculatie || null,
    chapters: calc?.chapters || [],
    rows: calc?.rows || [],
    opslagen: calc?.opslagen || null,
    totalen,
    settings: { bedrijf: settingsRes?.data?.bedrijf || {}, branding: settingsRes?.data?.branding || {} },
  };
}
