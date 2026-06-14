// pages/calculaties/bouwdeel/[id].js — Layer 3: combi's voor een bouwdeel
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, ArrowRight } from 'lucide-react';
import { loadBouwdeel, loadCombisVoorBouwdeel } from '@/services/bouwdelen';

export default function BouwdeelCombis() {
  const router = useRouter();
  const { id, calc } = router.query;
  const [bouwdeel, setBouwdeel] = useState(null);
  const [combis, setCombis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const [b, c] = await Promise.all([loadBouwdeel(id), loadCombisVoorBouwdeel(id)]);
        setBouwdeel(b);
        setCombis(c);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const qs = calc ? `?calc=${calc}` : '';
  const backHref = bouwdeel ? `/calculaties/categorie/${bouwdeel.category_code}/${bouwdeel.subcategory_code}${qs}` : `/calculaties${qs}`;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Link href={backHref} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft size={15} /> Terug naar bouwdelen
      </Link>
      <h1 className="text-xl font-semibold text-gray-900">{bouwdeel?.naam || 'Combi’s'}</h1>
      <p className="text-sm text-gray-500">Selecteer een combi of stel zelf samen.</p>

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : combis.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          Nog geen combi&apos;s voor dit bouwdeel.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {combis.map((c) => (
            <Link key={c.id} href={`/calculaties/combi/${c.id}${qs}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-400">{c.code}</span>
                  <span className="truncate text-sm font-medium text-gray-900">{c.naam}</span>
                  {c.status === 'generated_base' ? (
                    <span className="rounded-full bg-sterkcalc-accent/10 px-2 py-0.5 text-[10px] font-medium text-sterkcalc-accent">basis</span>
                  ) : null}
                </div>
                {c.omschrijving ? <p className="truncate text-xs text-gray-500">{c.omschrijving}</p> : null}
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-sterkcalc-blue px-3 py-1.5 text-xs font-medium text-white">
                Selecteer <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
