// lib/storage/visualUrls.js — klantbestanden in bucket `sterkcalc-visual-assets` (privé sinds incident D1,
// 19-10-2026). In de database blijft de vaste vorm staan: <SUPABASE_URL>/storage/v1/object/public/sterkcalc-visual-assets/<pad>.
// Bij het tonen wordt die vervangen door een tijdelijke ondertekende URL; vóór het opslaan wordt een
// ondertekende URL weer teruggezet naar de vaste vorm, zodat er nooit een verlopende link in de database belandt.
// Bibliotheekafbeeldingen (categorieën, logo) staan in de publieke bucket `sterkcalc-bibliotheek`.

const BUCKET = 'sterkcalc-visual-assets';
const BASIS = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object`;
const VAST = `${BASIS}/public/${BUCKET}/`;
const ESC = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
const RE_VAST = new RegExp(`${ESC(VAST)}([^"'\\s?#)]+)`, 'g');
const RE_GETEKEND = new RegExp(`${ESC(`${BASIS}/sign/${BUCKET}/`)}([^"'\\s?#)]+)\\?token=[^"'\\s#)]+`, 'g');

// Vervangt alle vaste URL's in een waarde (object/array/string) door ondertekende URL's.
export async function ondertekenVisualUrls(client, waarde, seconden = 3600) {
  if (waarde == null) return waarde;
  const tekst = JSON.stringify(waarde);
  const paden = [...new Set([...tekst.matchAll(RE_VAST)].map((m) => decodeURIComponent(m[1])))];
  if (!paden.length) return waarde;
  const { data, error } = await client.storage.from(BUCKET).createSignedUrls(paden, seconden);
  if (error || !Array.isArray(data)) return waarde;
  const kaart = {};
  for (const d of data) if (d?.path && d?.signedUrl) kaart[d.path] = d.signedUrl;
  return JSON.parse(tekst.replace(RE_VAST, (heel, pad) => kaart[decodeURIComponent(pad)] || heel));
}

// Zet ondertekende URL's terug naar de vaste vorm (vóór opslaan in de database).
export function canoniekeVisualUrls(waarde) {
  if (waarde == null) return waarde;
  const tekst = JSON.stringify(waarde);
  if (!tekst.includes(`/sign/${BUCKET}/`)) return waarde;
  return JSON.parse(tekst.replace(RE_GETEKEND, (_, pad) => `${VAST}${pad}`));
}

export function vasteVisualUrl(pad) {
  return `${VAST}${pad.split('/').map(encodeURIComponent).join('/')}`;
}
