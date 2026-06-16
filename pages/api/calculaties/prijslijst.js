// pages/api/calculaties/prijslijst.js
// Leveranciersprijs-zoek-API (increment 1c+ — echte Bouwmaat-catalogus).
// Laadt de prijslijst-JSON eenmalig uit de Supabase Storage-bucket
// `sterkcalc-prijslijsten` (privaat; anon-SELECT-policy) en cachet hem in-memory.
// Zoekt op omschrijving/code/groep en geeft de top-N terug. Geen DB-write, geen mock:
// zonder bron-JSON → lege resultaten met duidelijke melding.
const BUCKET = 'sterkcalc-prijslijsten';
const BESTAND = process.env.PRIJSLIJST_BESTAND || 'bouwmaat_2025-11.json';
const CATALOGUS = { leverancier: 'Bouwmaat', catalogusnummer: '202543', peildatum: '2025-11-02' };
const TTL_MS = 60 * 60 * 1000; // 1 uur cache

let CACHE = null;
let CACHE_TS = 0;

async function laadPrijslijst() {
  if (CACHE && Date.now() - CACHE_TS < TTL_MS) return CACHE;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !key) throw new Error('Supabase-config ontbreekt op de server.');
  const url = `${base}/storage/v1/object/authenticated/${BUCKET}/${BESTAND}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${key}`, apikey: key } });
  if (!res.ok) throw new Error(`Prijslijst niet gevonden in storage (${res.status}).`);
  const data = await res.json();
  CACHE = Array.isArray(data) ? data : [];
  CACHE_TS = Date.now();
  return CACHE;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  const q = String(req.query.q || '').trim().toLowerCase();
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 25));
  let lijst;
  try {
    lijst = await laadPrijslijst();
  } catch (e) {
    return res.status(502).json({ error: e.message || 'Kon prijslijst niet laden.', catalogus: CATALOGUS });
  }
  if (!q) return res.status(200).json({ catalogus: CATALOGUS, totaal: lijst.length, resultaten: [] });

  // Alle zoektermen moeten voorkomen (in omschrijving/code/groep).
  const termen = q.split(/\s+/).filter(Boolean);
  const hits = [];
  for (const a of lijst) {
    const hay = `${a.omschrijving || ''} ${a.code || ''} ${a.groep || ''}`.toLowerCase();
    if (termen.every((t) => hay.includes(t))) {
      hits.push(a);
      if (hits.length >= limit * 4) break; // ruwe cap vóór sortering
    }
  }
  // Lichte relevantie: exacte code-match en omschrijving-prefix eerst.
  hits.sort((a, b) => {
    const am = (a.omschrijving || '').toLowerCase();
    const bm = (b.omschrijving || '').toLowerCase();
    const ap = am.startsWith(termen[0]) ? 0 : 1;
    const bp = bm.startsWith(termen[0]) ? 0 : 1;
    if (ap !== bp) return ap - bp;
    return am.length - bm.length;
  });
  return res.status(200).json({
    catalogus: CATALOGUS,
    totaal: lijst.length,
    resultaten: hits.slice(0, limit).map((a) => ({
      code: a.code, omschrijving: a.omschrijving, groep: a.groep,
      netto: a.netto, eenheid: a.eenheid || 'PCE', btw: a.btw,
    })),
  });
}
