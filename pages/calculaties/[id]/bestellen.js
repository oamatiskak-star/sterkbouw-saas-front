// pages/calculaties/[id]/bestellen.js — materiaal-/inkooplijst uit de werktafel
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, ShoppingCart, Wand2 } from 'lucide-react';
import { loadBestellingen, genereerBestelling } from '@/services/calcModules';
import { fmtEUR, fmtNum } from '@/lib/calc/werktafelTotals';

export default function Bestellen() {
  const router = useRouter();
  const { id } = router.query;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!id) return; loadBestellingen(id).then(setOrders).finally(() => setLoading(false)); }, [id]);
  const genereer = async () => { setBusy(true); try { const o = await genereerBestelling(id); setOrders([o]); } catch (e) { window.alert(e.message || e); } finally { setBusy(false); } };
  return (
    <div className="mx-auto max-w-4xl p-6">
      <Link href={`/calculaties/${id}/werktafel`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ChevronLeft size={15} /> Werktafel</Link>
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><ShoppingCart size={20} className="text-sterkcalc-blue" /> Bestellen</h1>
        <button onClick={genereer} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-sterkcalc-navy2 disabled:opacity-60">{busy ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} Genereren uit werktafel</button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : orders.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">Nog geen bestellijst — genereer uit de materiaalregels.</p>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 text-sm"><span className="font-medium">{o.leverancier}</span><span className="text-gray-400">{(o.regels || []).length} regels · {o.status}</span></div>
            <table className="w-full text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr className="[&>th]:px-3 [&>th]:py-1.5 [&>th]:text-left"><th>STABU</th><th>Materiaal</th><th className="text-right">Hoev.</th><th>Eenh.</th><th className="text-right">Prijs</th><th className="text-right">Totaal</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {(o.regels || []).map((r, i) => (
                  <tr key={i} className="[&>td]:px-3 [&>td]:py-1"><td className="font-mono text-xs text-gray-400">{r.stabu_code}</td><td>{r.omschrijving}</td><td className="text-right tabular-nums">{fmtNum(r.hoeveelheid)}</td><td className="text-gray-500">{r.eenheid}</td><td className="text-right tabular-nums">{fmtEUR(r.prijs)}</td><td className="text-right tabular-nums font-medium">{fmtEUR(r.totaal)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between border-t border-gray-200 px-3 py-2 text-sm"><span className="text-gray-500">Materiaaltotaal</span><span className="font-semibold">{fmtEUR(o.totaal)}</span></div>
          </div>
        ))
      )}
    </div>
  );
}
