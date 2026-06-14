// pages/calculaties/projecten.js — Projectoverzicht (projectmap)
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, FolderKanban } from 'lucide-react';
import { loadProjecten, projectNaam } from '@/services/projecten';

export default function Projecten() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadProjecten().then(setItems).catch(console.error).finally(() => setLoading(false)); }, []);
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><FolderKanban size={20} className="text-sterkcalc-blue" /> Projecten</h1>
      <p className="text-sm text-gray-500">Elke calculatie hoort bij een project (NAW, documenten, tekeningen, calculaties).</p>
      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500"><tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:text-left"><th>Project</th><th>Opdrachtgever</th><th>Plaats</th><th>Status</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2"><Link href={`/calculaties/project/${p.id}`} className="font-medium text-gray-900 hover:text-sterkcalc-blue">{projectNaam(p)}</Link></td>
                  <td className="px-4 py-2 text-gray-600">{p.naam_opdrachtgever || '—'}</td>
                  <td className="px-4 py-2 text-gray-600">{p.plaats || p.plaatsnaam || '—'}</td>
                  <td className="px-4 py-2 text-xs text-gray-400">{p.status || 'concept'}</td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Nog geen projecten.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
