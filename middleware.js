// middleware.js — toegangspoort voor alle /api-routes (incident D1, 19-10-2026).
// Veel API-routes werken server-side met de service-role-sleutel en controleerden zelf geen sessie.
// Hier wordt per verzoek afgedwongen: geldige Supabase-sessie (Bearer) én intern account
// (public.is_intern(), allowlist public.intern_toegang). Alleen klantportaal en health-checks zijn
// publiek; die routes doen hun eigen toegangscontrole of geven geen gegevens terug.
import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Publiek: klantportaal (eigen e-mailcode/cookie-controle), health-checks en de keepalive-cron.
const PUBLIEK = [
  /^\/api\/portaal\//,
  /^\/api\/offerte\/portal-actie$/,
  /^\/api\/health(\/.*)?$/,
  /^\/api\/ping$/,
  /^\/api\/cron\/keepalive-pmovaz$/,
];

function weiger(status, fout) {
  return NextResponse.json({ error: fout }, { status });
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (req.method === 'OPTIONS') return NextResponse.next();
  if (PUBLIEK.some((r) => r.test(pathname))) return NextResponse.next();

  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token || token === ANON_KEY) return weiger(401, 'Niet ingelogd');

  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) return weiger(401, 'Sessie ongeldig of verlopen');

    const internRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_intern`, {
      method: 'POST',
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: '{}',
    });
    if (!internRes.ok) return weiger(403, 'Geen toegang');
    const intern = await internRes.json();
    if (intern !== true) return weiger(403, 'Geen toegang');
  } catch {
    return weiger(503, 'Toegangscontrole niet beschikbaar');
  }
  return NextResponse.next();
}

export const config = { matcher: ['/api/:path*'] };
