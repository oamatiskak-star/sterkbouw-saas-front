// pages/calculaties/stabu.js — STABU-browser (motor): hoofdstukken → posten → eigenschappen
import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import supabase from '@/lib/supabase';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

export default function StabuBrowser() {
  const [posten, setPosten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hk, setHk] = useState(null);
  const [sel, setSel] = useState(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('stabu_posten')
        .select('code, omschrijving, eenheid, hoofdstuk_code, materiaalprijs, arbeidsprijs, normuren')
        .order('code')
        .limit(2000);
      setPosten(data || []);
      setLoading(false);
    })();
  }, []);

  const hoofdstukken = useMemo(() => {
    const m = {};
    for (const p of posten) {
      const h = p.hoofdstuk_code || '–';
      m[h] = (m[h] || 0) + 1;
    }
    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]));
  }, [posten]);

  const zichtbaar = useMemo(() => {
    return posten.filter(
      (p) => (!hk || p.hoofdstuk_code === hk) && (!q || (p.code + ' ' + p.omschrijving).toLowerCase().includes(q.toLowerCase()))
    );
  }, [posten, hk, q]);

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="border-b border-gray-200 bg-white px-5 py-3">
        <h1 className="text-base font-semibold text-gray-900">STABU-browser</h1>
        <p className="text-xs text-gray-500">De rekenkern: {posten.length} posten in {hoofdstukken.length} hoofdstukken.</p>
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="w-44 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50/50 p-2">
          <button onClick={() => setHk(null)} className={`mb-0.5 flex w-full justify-between rounded px-2 py-1.5 text-sm ${!hk ? 'bg-sterkcalc-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Alle <span className="text-xs opacity-70">{posten.length}</span></button>
          {hoofdstukken.map(([code, count]) => (
            <button key={code} onClick={() => setHk(code)} className={`mb-0.5 flex w-full justify-between rounded px-2 py-1.5 text-sm ${hk === code ? 'bg-sterkcalc-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              § {code} <span className="text-xs opacity-70">{count}</span>
            </button>
          ))}
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="sticky top-0 flex items-center gap-2 border-b border-gray-100 bg-white px-3 py-2">
            <Search size={14} className="text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="zoek STABU-post…" className="w-full text-sm outline-none" />
          </div>
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500"><tr className="[&>th]:px-3 [&>th]:py-1.5 [&>th]:text-left"><th>Code</th><th>Omschrijving</th><th>Eenh.</th><th className="text-right">Mat.</th><th className="text-right">Arb.</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {zichtbaar.map((p) => (
                <tr key={p.code} onClick={() => setSel(p)} className={`cursor-pointer ${sel?.code === p.code ? 'bg-sterkcalc-blue/10' : 'hover:bg-gray-50'} [&>td]:px-3 [&>td]:py-1`}>
                  <td className="font-mono text-gray-500">{p.code}</td><td className="text-gray-800">{p.omschrijving}</td><td className="text-gray-500">{p.eenheid}</td>
                  <td className="text-right tabular-nums">{fmtEUR(p.materiaalprijs)}</td><td className="text-right tabular-nums">{fmtEUR(p.arbeidsprijs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
        <aside className="w-64 shrink-0 border-l border-gray-200 bg-gray-50/40 p-4">
          {sel ? (
            <div className="space-y-2 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Eigenschappen</div>
              <Row l="Code" v={sel.code} /><Row l="Hoofdstuk" v={sel.hoofdstuk_code} /><Row l="Eenheid" v={sel.eenheid} />
              <Row l="Materiaal" v={fmtEUR(sel.materiaalprijs)} /><Row l="Arbeid" v={fmtEUR(sel.arbeidsprijs)} />
              <Row l="Kostprijs" v={fmtEUR(Number(sel.materiaalprijs) + Number(sel.arbeidsprijs))} />
              {sel.normuren != null ? <Row l="Normuren" v={sel.normuren} /> : null}
              <p className="pt-2 text-xs text-gray-600">{sel.omschrijving}</p>
            </div>
          ) : (
            <p className="p-4 text-center text-xs text-gray-400">Selecteer een post.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
function Row({ l, v }) { return <div className="flex justify-between"><span className="text-gray-500">{l}</span><span className="font-medium text-gray-900">{v}</span></div>; }
