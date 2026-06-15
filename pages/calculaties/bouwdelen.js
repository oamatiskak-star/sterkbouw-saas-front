// pages/calculaties/bouwdelen.js — Bouwdelenbibliotheek (recovery P3): toont de bestaande 660
// bouwdelen, gegroepeerd per categorie. Geen nieuwe data; alleen bestaande data zichtbaar maken.
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader2, Layers, Search } from 'lucide-react';
import { loadAlleBouwdelen } from '@/services/bouwdelen';
import { loadCategories } from '@/services/visualLibrary';
import Tegel from '@/components/sterkcalc/Tegel';

export default function Bouwdelenbibliotheek() {
  const router = useRouter();
  const { calc } = router.query;
  const [bouwdelen, setBouwdelen] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoek, setZoek] = useState('');
  const [alleenMetCombi, setAlleenMetCombi] = useState(false);

  useEffect(() => {
    Promise.all([loadAlleBouwdelen(), loadCategories()])
      .then(([b, c]) => { setBouwdelen(b); setCats(c); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const qs = calc ? `?calc=${calc}` : '';
  const catMap = useMemo(() => Object.fromEntries(cats.map((c) => [c.code, c])), [cats]);

  const groepen = useMemo(() => {
    const q = zoek.trim().toLowerCase();
    const filtered = bouwdelen.filter((b) =>
      (!alleenMetCombi || b.combis > 0) &&
      (!q || (b.naam || '').toLowerCase().includes(q) || (catMap[b.category_code]?.title || '').toLowerCase().includes(q))
    );
    const map = {};
    for (const b of filtered) (map[b.category_code] = map[b.category_code] || []).push(b);
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [bouwdelen, zoek, alleenMetCombi, catMap]);

  const totaalMetCombi = bouwdelen.filter((b) => b.combis > 0).length;

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><Layers size={20} className="text-sterkcalc-blue" /> Bouwdelenbibliotheek</h1>
      <p className="text-sm text-gray-500">{bouwdelen.length} bouwdelen over {cats.length} categorieën · {totaalMetCombi} met directe combi-dekking. Klik een bouwdeel voor de combi's.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input value={zoek} onChange={(e) => setZoek(e.target.value)} placeholder="Zoek bouwdeel of categorie…" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={alleenMetCombi} onChange={(e) => setAlleenMetCombi(e.target.checked)} /> Alleen met combi's</label>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Bibliotheek laden…</div>
      ) : groepen.length === 0 ? (
        <p className="p-8 text-sm text-gray-400">Geen bouwdelen gevonden.</p>
      ) : (
        <div className="mt-4 space-y-6">
          {groepen.map(([code, items]) => {
            const cat = catMap[code];
            return (
              <section key={code}>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <span className="rounded bg-sterkcalc-navy/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">{code}</span>
                  {cat?.title || 'Categorie'} <span className="text-xs font-normal text-gray-400">({items.length})</span>
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {items.map((b) => (
                    <Tegel key={b.id} href={`/calculaties/bouwdeel/${b.id}${qs}`} code={b.combis > 0 ? `${b.combis} combi` : null} title={b.naam} subtitle={cat?.title} image={cat?.image} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
