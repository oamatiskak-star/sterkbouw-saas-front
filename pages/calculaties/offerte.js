// pages/calculaties/offerte.js — offerte-dashboard
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, FileText, Plus } from 'lucide-react';
import { loadOffertes } from '@/services/calcModules';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

const LABEL = { concept: 'Concept', verzonden: 'Verzonden', getekend: 'Getekend', afgewezen: 'Afgewezen' };

export default function OfferteDashboard() {
  const [offertes, setOffertes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadOffertes().then(setOffertes).finally(() => setLoading(false)); }, []);
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><FileText size={20} className="text-sterkcalc-blue" /> Offertes</h1>
        <Link href="/calculaties/werktafel" className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-sterkcalc-navy2"><Plus size={14} /> Nieuwe offerte (kies calculatie)</Link>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : offertes.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">Nog geen offertes — maak er één vanuit een calculatie.</p>
      ) : (
        <div className="mt-4 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {offertes.map((o) => (
            <Link key={o.id} href={o.calculatie_id ? `/calculaties/${o.calculatie_id}/offerte` : '#'} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <span className="text-sm font-medium text-gray-900">{o.nummer || o.id}</span>
              <span className="flex items-center gap-4 text-sm"><span className="tabular-nums text-gray-600">{fmtEUR(o.totaal_incl)}</span><span className="text-xs text-gray-400">{LABEL[o.status] || o.status}</span></span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
