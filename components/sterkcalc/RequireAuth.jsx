// components/sterkcalc/RequireAuth.jsx
// P0 — login afdwingen op de SterkCalc-keten. Geen sessie → redirect naar /login (geen anonymous
// sign-ins). Wel sessie → volledige keten beschikbaar. Schrijfacties (calc/werktafel) vereisen
// auth.uid() via RLS; deze gate zorgt dat de gebruiker altijd een sessie heeft.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import supabase from '@/lib/supabase';

export default function RequireAuth({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState('checking'); // checking | ok

  useEffect(() => {
    // Ontwikkel-bypass: alleen als expliciet uitgezet.
    if (process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true') { setStatus('ok'); return; }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data?.session) setStatus('ok');
      else router.replace(`/login?next=${encodeURIComponent(router.asPath || '/calculaties')}`);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setStatus('ok');
    });
    return () => { mounted = false; sub?.subscription?.unsubscribe?.(); };
  }, [router]);

  if (status !== 'ok') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        <Loader2 className="mr-2 animate-spin" size={16} /> Sessie controleren…
      </div>
    );
  }
  return children;
}
