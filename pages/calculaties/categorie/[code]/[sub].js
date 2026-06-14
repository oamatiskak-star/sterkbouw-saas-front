// pages/calculaties/categorie/[code]/[sub].js — Layer 2b: bouwdelen
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { loadBouwdelen } from '@/services/bouwdelen';
import Tegel from '@/components/sterkcalc/Tegel';

export default function BouwdelenPagina() {
  const router = useRouter();
  const { code, sub, calc } = router.query;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code || !sub) return;
    (async () => {
      setLoading(true);
      try {
        setItems(await loadBouwdelen(code, sub));
      } finally {
        setLoading(false);
      }
    })();
  }, [code, sub]);

  const qs = calc ? `?calc=${calc}` : '';

  return (
    <div className="mx-auto max-w-7xl p-6">
      <Link href={`/calculaties/categorie/${code}${qs}`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft size={15} /> Terug naar subcategorieën
      </Link>
      <h1 className="text-xl font-semibold text-gray-900">Bouwdelen</h1>
      <p className="text-sm text-gray-500">Kies een bouwdeel om beschikbare combi&apos;s te zien.</p>

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : items.length === 0 ? (
        <p className="p-8 text-sm text-gray-400">Geen bouwdelen voor deze subcategorie.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((b) => (
            <Tegel key={b.id} href={`/calculaties/bouwdeel/${b.id}${qs}`} code={b.code} title={b.naam} subtitle={b.omschrijving} image={b.afbeelding_url} />
          ))}
        </div>
      )}
    </div>
  );
}
