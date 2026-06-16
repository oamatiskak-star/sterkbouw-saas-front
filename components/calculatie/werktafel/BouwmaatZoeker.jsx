// components/calculatie/werktafel/BouwmaatZoeker.jsx
// Herbruikbaar zoekveld voor de Bouwmaat-prijscatalogus (increment 1c+ / combi-component).
// Zoekt via de prijslijst-API en roept onKies(artikel) aan bij een keuze.
import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { zoekLeveranciersPrijzen } from '@/services/leveranciersprijzen';

export default function BouwmaatZoeker({ onKies, placeholder = "artikel of code… (bv. 'glaslat hardhout')", autoFocus = true }) {
  const [term, setTerm] = useState('');
  const [hits, setHits] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const deb = useRef();

  useEffect(() => {
    if (!term.trim()) { setHits([]); return; }
    clearTimeout(deb.current);
    deb.current = setTimeout(async () => {
      setBusy(true); setErr(null);
      try {
        const d = await zoekLeveranciersPrijzen(term);
        setHits(d.resultaten || []);
      } catch (e) { setErr(e.message || 'Zoeken mislukt'); setHits([]); }
      finally { setBusy(false); }
    }, 300);
    return () => clearTimeout(deb.current);
  }, [term]);

  return (
    <div>
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        placeholder={placeholder}
        className="w-full rounded border border-gray-300 px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-emerald-400"
        autoFocus={autoFocus}
      />
      {busy && <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400"><Loader2 size={11} className="animate-spin" /> zoeken in catalogus…</div>}
      {err && <div className="mt-1 text-[10px] text-red-600">{err}</div>}
      <div className="mt-1 max-h-56 overflow-y-auto">
        {hits.map((a) => (
          <button
            key={a.code}
            onClick={(e) => { e.stopPropagation(); onKies(a); setTerm(''); setHits([]); }}
            className="block w-full rounded px-2 py-1 text-left text-[11px] hover:bg-emerald-100/60"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="truncate">{a.omschrijving}</span>
              <span className="shrink-0 font-semibold tabular-nums text-emerald-800">€{Number(a.netto).toFixed(2)}</span>
            </span>
            <span className="block text-[10px] text-gray-400">{a.code} · {a.groep} · per {a.eenheid} · btw {a.btw}%</span>
          </button>
        ))}
        {!busy && term.trim() && hits.length === 0 && !err && <div className="px-2 py-1 text-[10px] text-gray-400">Geen artikelen gevonden.</div>}
      </div>
    </div>
  );
}
