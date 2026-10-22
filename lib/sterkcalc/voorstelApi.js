// lib/sterkcalc/voorstelApi.js — client voor de bestaande SterkCalc-voorstel-API (edge function sterkcalc-voorstel,
// project orlando-core-os). Eén bron van waarheid voor inhoud, prijs, akkoord en Mollie-betaling: dit portaal toont en
// verstuurt alleen; bedragen en akkoord worden server-side vastgelegd en gecontroleerd (inhoud_hash, voorwaarden-hash).
// De publishable key is publiek (dezelfde als strkbouw.nl/voorstel.js); de autorisatie is het voorsteltoken.
const API = process.env.NEXT_PUBLIC_STERKCALC_VOORSTEL_API || 'https://shaunumewswpxhmgbtvv.supabase.co/functions/v1/sterkcalc-voorstel';
const KEY = process.env.NEXT_PUBLIC_STERKCALC_PUBLISHABLE_KEY || 'sb_publishable_hU81pMxo04uxessWETnS7w_dOAlJNOf';

export const geldigToken = (t) => typeof t === 'string' && /^[0-9a-f]{64}$/.test(t);

export async function haalVoorstel(token, optie) {
  const extra = optie === 'regulier' || optie === 'spoed' ? `&optie=${optie}` : '';
  const r = await fetch(`${API}?t=${encodeURIComponent(token)}${extra}`, { headers: { apikey: KEY } });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, ...j };
}

async function post(body) {
  const r = await fetch(API, { method: 'POST', headers: { apikey: KEY, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  return r.json().catch(() => ({ ok: false, reden: 'verbinding' }));
}

// Akkoord + betaling (bestaande Mollie-route): geeft { ok, checkout_url } of { ok, betaald } of { ok:false, reden, fouten }.
export function akkoordEnBetalen({ token, inhoudHash, naam, factuur }) {
  return post({ t: token, actie: 'akkoord_betalen', akkoord: true, inhoud_hash: inhoudHash, naam, factuur,
    klanttype: 'zakelijk', voorwaarden_akkoord: true });
}

export function spoedAanvragen(token) {
  return post({ t: token, actie: 'spoed_aanvragen' });
}
