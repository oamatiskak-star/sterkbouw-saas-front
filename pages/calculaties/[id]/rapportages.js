// pages/calculaties/[id]/rapportages.js — kosten-/marge-analyse
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, BarChart3 } from 'lucide-react';
import { calcData } from '@/services/calcModules';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

export default function Rapportages() {
  const router = useRouter();
  const { id } = router.query;
  const [t, setT] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (!id) return; calcData(id).then((d) => setT(d.totalen)).finally(() => setLoading(false)); }, [id]);
  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;
  if (!t) return <div className="p-8 text-sm text-gray-400">Geen data.</div>;
  const balken = [
    { l: 'Materiaal', v: t.materiaal, c: 'bg-sterkcalc-blue' },
    { l: 'Arbeid', v: t.arbeid, c: 'bg-sterkcalc-accent' },
    { l: 'Materieel', v: t.materieel, c: 'bg-gray-400' },
    { l: 'AK', v: t.akBedrag, c: 'bg-amber-400' },
    { l: 'ABK', v: t.abkBedrag, c: 'bg-amber-500' },
    { l: 'Risico', v: t.risicoBedrag, c: 'bg-orange-400' },
    { l: 'Winst', v: t.winstBedrag, c: 'bg-sterkcalc-warning' },
  ];
  const max = Math.max(1, ...balken.map((b) => b.v));
  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link href={`/calculaties/${id}/werktafel`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ChevronLeft size={15} /> Werktafel</Link>
      <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><BarChart3 size={20} className="text-sterkcalc-blue" /> Rapportages</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi l="Kostprijs" v={fmtEUR(t.kostprijs)} /><Kpi l="Verkoop (excl)" v={fmtEUR(t.verkoopprijs_excl)} /><Kpi l="Marge" v={fmtEUR(t.marge)} sub={`${t.margePct.toFixed(1)}%`} /><Kpi l="Incl. btw" v={fmtEUR(t.verkoopprijs_incl)} />
      </div>
      <div className="mt-6 space-y-2 rounded-xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-semibold text-gray-900">Kostenopbouw</div>
        {balken.map((b) => (
          <div key={b.l} className="flex items-center gap-3">
            <div className="w-20 shrink-0 text-xs text-gray-500">{b.l}</div>
            <div className="h-5 flex-1 rounded bg-gray-100"><div className={`h-5 rounded ${b.c}`} style={{ width: `${(b.v / max) * 100}%` }} /></div>
            <div className="w-24 shrink-0 text-right text-xs tabular-nums text-gray-700">{fmtEUR(b.v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function Kpi({ l, v, sub }) { return <div className="rounded-xl border border-gray-200 bg-white p-3"><div className="text-[11px] uppercase tracking-wide text-gray-400">{l}</div><div className="text-sm font-semibold text-gray-900">{v}</div>{sub ? <div className="text-[11px] text-gray-400">{sub}</div> : null}</div>; }
