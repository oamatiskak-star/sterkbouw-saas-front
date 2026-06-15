// components/calculatie/werktafel/BouwdeelKiezer.jsx
// P5-H — bouwdeel als primaire invoerlaag. De calculator denkt in Badkamer/Keuken/Kozijn/Dak/Gevel.
// Bouwdeel kiezen → alle gekoppelde combi's worden in één actie aan de werktafel toegevoegd
// (elke combi routeert naar zijn eigen subhoofdstuk → componenten → STABU).
import { useEffect, useMemo, useState } from 'react';
import { Boxes, Loader2, Search, X, Plus } from 'lucide-react';
import { loadAlleBouwdelen } from '@/services/bouwdelen';

export default function BouwdeelKiezer({ open, onClose, onPick }) {
  const [delen, setDelen] = useState(null);
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!open || delen) return;
    loadAlleBouwdelen()
      .then((list) => setDelen((list || []).filter((b) => b.combis > 0)))
      .catch(() => setDelen([]));
  }, [open, delen]);

  const groepen = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = (delen || []).filter((b) => !term || b.naam.toLowerCase().includes(term) || (b.omschrijving || '').toLowerCase().includes(term));
    const by = {};
    for (const b of filtered) (by[b.category_code || '–'] = by[b.category_code || '–'] || []).push(b);
    return Object.entries(by).sort(([a], [b]) => a.localeCompare(b));
  }, [delen, q]);

  if (!open) return null;

  const pick = async (b) => {
    setBusyId(b.id);
    try { await onPick(b); } finally { setBusyId(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-16" onClick={onClose}>
      <div className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-sterkcalc-navy">
            <Boxes size={16} className="text-sterkcalc-blue" /> Bouwdeel toevoegen
          </span>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X size={16} /></button>
        </div>
        <div className="border-b border-gray-100 px-4 py-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5">
            <Search size={14} className="text-gray-400" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek bouwdeel (badkamer, keuken, kozijn, dak…)" className="w-full bg-transparent text-sm outline-none" />
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">Eén keer kiezen voegt het hele bouwdeel toe: combi's → componenten → STABU. Hoeveelheden pas je daarna aan in de werktafel.</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          {delen === null ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-400"><Loader2 size={16} className="animate-spin" /> bouwdelen laden…</div>
          ) : groepen.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">Geen bouwdelen gevonden.</div>
          ) : (
            groepen.map(([cat, list]) => (
              <div key={cat} className="mb-3">
                <div className="px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">§ {cat}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {list.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => pick(b)}
                      disabled={busyId === b.id}
                      className="group flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-left hover:border-sterkcalc-blue/40 hover:bg-sterkcalc-blue/[0.04] disabled:opacity-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-800">{b.naam}</span>
                        <span className="text-[11px] text-gray-400">{b.combis} combi{b.combis === 1 ? '' : "'s"}</span>
                      </span>
                      {busyId === b.id ? <Loader2 size={15} className="animate-spin text-sterkcalc-blue" /> : <Plus size={15} className="text-gray-300 group-hover:text-sterkcalc-blue" />}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
