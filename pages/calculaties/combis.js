// pages/calculaties/combis.js — Combi's: browse via categorieën (zelfde ingang als Overzicht)
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { loadCategories } from '@/services/visualLibrary';
import Tegel from '@/components/sterkcalc/Tegel';

export default function CombisBrowse() {
  const router = useRouter();
  const calc = router.query.calc || null;
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadCategories().then(setCats).catch(console.error).finally(() => setLoading(false));
  }, []);
  const qs = calc ? `?calc=${calc}` : '';
  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-xl font-semibold text-gray-900">Combi&apos;s</h1>
      <p className="text-sm text-gray-500">Kies een categorie → subcategorie → bouwdeel → combi.</p>
      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cats.map((c) => (
            <Tegel key={c.code} href={`/calculaties/categorie/${c.code}${qs}`} code={c.code} title={c.title} subtitle={c.subtitle} image={c.image} />
          ))}
        </div>
      )}
    </div>
  );
}
