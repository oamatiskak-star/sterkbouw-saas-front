// services/leveranciersprijzen.js — client voor de leveranciersprijs-zoek-API (1c+).
// Zoekt in de echte Bouwmaat-catalogus (via /api/calculaties/prijslijst) en levert
// artikelen met nettoprijs, zodat de gebruiker een curated kengetal kan vervangen
// door een echte, traceerbare leveranciersprijs.
export async function zoekLeveranciersPrijzen(q, { signal } = {}) {
  const term = (q || '').trim();
  if (!term) return { catalogus: null, resultaten: [] };
  const res = await fetch(`/api/calculaties/prijslijst?q=${encodeURIComponent(term)}`, { signal });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Zoeken mislukt (${res.status}).`);
  return data;
}
