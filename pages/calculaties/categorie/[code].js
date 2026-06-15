// pages/calculaties/categorie/[code].js — Layer 2: subtegels
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { loadCategory, loadSubcategories, loadCategoryImage } from '@/services/visualLibrary';
import Tegel from '@/components/sterkcalc/Tegel';

export default function CategoriePagina() {
  const router = useRouter();
  const { code, calc } = router.query;
  const [cat, setCat] = useState(null);
  const [subs, setSubs] = useState([]);
  const [catImg, setCatImg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    (async () => {
      setLoading(true);
      try {
        const [c, s, img] = await Promise.all([loadCategory(code), loadSubcategories(code), loadCategoryImage(code).catch(() => null)]);
        setCat(c);
        setSubs(s);
        setCatImg(img);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  const qs = calc ? `?calc=${calc}` : '';

  return (
    <div className="mx-auto max-w-7xl p-6">
      <Link href={`/calculaties${qs}`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft size={15} /> Terug naar categorieën
      </Link>
      <h1 className="text-xl font-semibold text-gray-900">{cat ? `${cat.code} ${cat.title}` : code}</h1>
      {cat?.subtitle ? <p className="text-sm text-gray-500">{cat.subtitle}</p> : null}

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : subs.length === 0 ? (
        <p className="p-8 text-sm text-gray-400">Geen subcategorieën.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {subs.map((s) => (
            <Tegel key={s.code} href={`/calculaties/categorie/${code}/${s.code}${qs}`} code={`${code}.${s.code}`} title={s.title} subtitle={s.subtitle} image={catImg} />
          ))}
        </div>
      )}
    </div>
  );
}
