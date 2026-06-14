// components/sterkcalc/KiesCalculatie.jsx — kies een calculatie om een module te openen.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Table2 } from 'lucide-react';
import { loadCalculaties } from '@/services/calcModules';

export default function KiesCalculatie({ titel, basePath, subtitel }) {
  const [calcs, setCalcs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadCalculaties().then(setCalcs).finally(() => setLoading(false)); }, []);
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold text-gray-900">{titel}</h1>
      <p className="text-sm text-gray-500">{subtitel || 'Kies een calculatie.'}</p>
      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : (
        <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {calcs.map((c) => (
            <Link key={c.id} href={`/calculaties/${c.id}/${basePath}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <span className="flex items-center gap-2 text-sm text-gray-800"><Table2 size={15} className="text-gray-400" />{c.naam || `Calculatie ${String(c.id).slice(0, 8)}`}</span>
              <span className="text-xs text-gray-400">{c.status || 'concept'}</span>
            </Link>
          ))}
          {calcs.length === 0 && <p className="px-4 py-6 text-sm text-gray-400">Nog geen calculaties.</p>}
        </div>
      )}
    </div>
  );
}
