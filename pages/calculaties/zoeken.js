// pages/calculaties/zoeken.js — Zoekcentrum (universeel)
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { zoek, projectNaam } from '@/services/projecten';

export default function Zoeken() {
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (q.length < 2) { setRes(null); return; }
    const t = setTimeout(async () => { setBusy(true); try { setRes(await zoek(q)); } finally { setBusy(false); } }, 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><Search size={20} className="text-sterkcalc-blue" /> Zoekcentrum</h1>
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek projecten, calculaties, combi's, STABU…" className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-sterkcalc-blue" />
      {busy && <div className="mt-2 text-xs text-gray-400">zoeken…</div>}
      {res && (
        <div className="mt-4 space-y-4">
          <Sectie titel="Projecten">{res.projecten.map((p) => <Link key={p.id} href={`/calculaties/project/${p.id}`} className="block rounded px-2 py-1 text-sm hover:bg-gray-50">{projectNaam(p)} <span className="text-xs text-gray-400">{p.plaats || ''}</span></Link>)}</Sectie>
          <Sectie titel="Calculaties">{res.calculaties.map((c) => <Link key={c.id} href={`/calculaties/${c.id}/werktafel`} className="block rounded px-2 py-1 text-sm hover:bg-gray-50">{c.naam || c.id}</Link>)}</Sectie>
          <Sectie titel="Combi's">{res.combis.map((c) => <Link key={c.id} href={`/calculaties/combi/${c.id}`} className="block rounded px-2 py-1 text-sm hover:bg-gray-50"><span className="font-mono text-xs text-gray-400">{c.code}</span> {c.naam}</Link>)}</Sectie>
          <Sectie titel="STABU">{res.stabu.map((s) => <div key={s.code} className="px-2 py-1 text-sm"><span className="font-mono text-xs text-gray-400">{s.code}</span> {s.omschrijving}</div>)}</Sectie>
        </div>
      )}
    </div>
  );
}
function Sectie({ titel, children }) {
  const arr = Array.isArray(children) ? children : [children];
  return <div><div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{titel}</div>{arr.length ? arr : <p className="px-2 py-1 text-xs text-gray-400">geen resultaten</p>}</div>;
}
