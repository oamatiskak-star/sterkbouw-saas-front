// pages/calculaties/index.js — SterkCalc Overzicht (Layer 1)
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Plus, Loader2, FileText } from 'lucide-react';
import supabase from '@/lib/supabase';
import { loadCategories } from '@/services/visualLibrary';
import Tegel from '@/components/sterkcalc/Tegel';

export default function Overzicht() {
  const router = useRouter();
  const calc = router.query.calc || null;
  const [cats, setCats] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, r] = await Promise.all([
          loadCategories(),
          supabase.from('calculaties').select('id, naam, status, created_at').order('created_at', { ascending: false }).limit(6),
        ]);
        setCats(c);
        setRecent(r.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const qs = calc ? `?calc=${calc}` : '';

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h1 className="text-lg font-semibold text-gray-900">Welkom bij SterkCalc</h1>
          <p className="mt-1 text-sm text-gray-500">Start een nieuwe calculatie of open een bestaande.</p>
          <div className="mt-4 flex gap-2">
            <Link href="/calculaties/nieuw" className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-4 py-2 text-sm font-medium text-white hover:bg-sterkcalc-navy2">
              <Plus size={15} /> Nieuwe calculatie
            </Link>
            <Link href="/calculaties/werktafel" className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Open bestaande
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recente calculaties</h2>
            <Link href="/calculaties/werktafel" className="text-xs text-sterkcalc-blue">Bekijk alle</Link>
          </div>
          <div className="space-y-1.5">
            {recent.map((r) => (
              <Link key={r.id} href={`/calculaties/${r.id}/werktafel`} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50">
                <span className="flex items-center gap-2 truncate text-gray-700"><FileText size={14} className="text-gray-400" />{r.naam || `Calculatie ${String(r.id).slice(0, 8)}`}</span>
                <span className="text-xs text-gray-400">{r.status || 'concept'}</span>
              </Link>
            ))}
            {recent.length === 0 && !loading && <p className="px-2 py-4 text-sm text-gray-400">Nog geen calculaties.</p>}
          </div>
        </div>
      </div>

      <h2 className="mb-3 mt-7 text-sm font-semibold uppercase tracking-wide text-gray-500">Kies een hoofdstuk (categorie)</h2>
      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cats.map((c) => (
            <Tegel key={c.code} href={`/calculaties/categorie/${c.code}${qs}`} code={c.code} title={c.title} subtitle={c.subtitle} image={c.image} />
          ))}
        </div>
      )}
    </div>
  );
}
