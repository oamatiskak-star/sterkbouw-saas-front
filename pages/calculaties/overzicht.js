// pages/calculaties/overzicht.js — Sprint 10 DEEL 9: multi-project managementoverzicht.
// Toont alle calculaties met status/fase/waarde/marge/planning/health. Read-only.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, LayoutDashboard, ArrowRight } from 'lucide-react';
import { loadProjectenOverzicht } from '@/services/projectCommand';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

const HEALTH_BG = { groen: 'bg-sterkcalc-accent', oranje: 'bg-amber-500', rood: 'bg-red-500' };

export default function ManagementOverzicht() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { loadProjectenOverzicht(40).then(setItems).catch(console.error).finally(() => setLoading(false)); }, []);

  const zicht = useMemo(() => items.filter((i) => !filter || i.fase?.key === filter), [items, filter]);
  const totaal = useMemo(() => ({
    waarde: items.reduce((s, i) => s + (i.verkoop || 0), 0),
    marge: items.reduce((s, i) => s + (i.marge || 0), 0),
  }), [items]);
  const fases = [...new Set(items.map((i) => i.fase?.key).filter(Boolean))];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><LayoutDashboard size={20} className="text-sterkcalc-blue" /> Management — projectenoverzicht</h1>
      <p className="text-sm text-gray-500">Alle projecten in één overzicht: status, fase, waarde, marge, planning en health. Klik door naar het command center.</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[['Projecten', items.length], ['Totale verkoopwaarde', fmtEUR(totaal.waarde)], ['Totale marge', fmtEUR(totaal.marge)], ['Gem. marge', items.length ? `${Math.round(items.reduce((s, i) => s + (i.margePct || 0), 0) / items.length)}%` : '—']].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-gray-200 bg-white p-2.5"><div className="text-[10px] uppercase tracking-wide text-gray-400">{l}</div><div className="text-sm font-semibold text-gray-900">{v}</div></div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        <button onClick={() => setFilter('')} className={`rounded-full px-3 py-1 text-xs font-medium ${!filter ? 'bg-sterkcalc-navy text-white' : 'bg-gray-100 text-gray-500'}`}>Alle</button>
        {fases.map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${filter === f ? 'bg-sterkcalc-navy text-white' : 'bg-gray-100 text-gray-500'}`}>{f}</button>)}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Projecten laden…</div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500"><tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:text-left"><th>Project</th><th>Fase</th><th className="text-right">Verkoopwaarde</th><th className="text-right">Marge</th><th>Offerte</th><th>Planning</th><th>Health</th><th></th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {zicht.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2"><Link href={`/calculaties/${p.id}/dashboard`} className="font-medium text-gray-900 hover:text-sterkcalc-blue">{p.naam || 'Naamloos'}</Link></td>
                  <td className="px-4 py-2"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{p.fase?.label || p.status || '—'}</span></td>
                  <td className="px-4 py-2 text-right tabular-nums text-gray-800">{p.fout ? '—' : fmtEUR(p.verkoop)}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-gray-600">{p.fout ? '—' : `${fmtEUR(p.marge)} (${p.margePct}%)`}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 capitalize">{p.offerte_status || '—'}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{p.planning ? 'ja' : '—'}</td>
                  <td className="px-4 py-2">{p.health ? <span className="inline-flex items-center gap-1.5"><span className={`inline-block h-2 w-2 rounded-full ${HEALTH_BG[p.health.kleur]}`} /><span className="text-xs tabular-nums text-gray-600">{p.health.score}</span></span> : '—'}</td>
                  <td className="px-4 py-2 text-right"><Link href={`/calculaties/${p.id}/dashboard`} className="text-sterkcalc-blue hover:text-sterkcalc-navy"><ArrowRight size={15} /></Link></td>
                </tr>
              ))}
              {zicht.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">Geen projecten.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
