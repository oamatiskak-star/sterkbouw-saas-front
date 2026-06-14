// pages/calculaties/combi/[id].js — Layer 4A: combi-detail + toevoegen aan werktafel
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, Plus } from 'lucide-react';
import { loadCombi, loadCombiComponents, voegCombiToe } from '@/services/combis';
import { fmtEUR, fmtNum } from '@/lib/calc/werktafelTotals';

export default function CombiDetail() {
  const router = useRouter();
  const { id, calc } = router.query;
  const [combi, setCombi] = useState(null);
  const [comps, setComps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const [c, k] = await Promise.all([loadCombi(id), loadCombiComponents(id)]);
        setCombi(c);
        setComps(k);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const totaal = comps.reduce(
    (s, c) => s + Number(c.hoeveelheid_per_eenheid) * (Number(c.materiaalprijs) + Number(c.arbeidsprijs) + Number(c.materieelprijs)),
    0
  );

  const toevoegen = async () => {
    if (!calc) {
      window.alert('Open eerst een calculatie (via Werktafel) om deze combi toe te voegen.');
      return;
    }
    setBusy(true);
    try {
      await voegCombiToe({ calculatieId: calc, combi, hoeveelheid: 1 });
      router.push(`/calculaties/${calc}/werktafel`);
    } catch (e) {
      window.alert('Toevoegen mislukt: ' + (e.message || e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;
  if (!combi) return <div className="p-8 text-sm text-gray-400">Combi niet gevonden.</div>;

  const qs = calc ? `?calc=${calc}` : '';

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Link href={combi.category_code && combi.subcategory_code ? `/calculaties/categorie/${combi.category_code}/${combi.subcategory_code}${qs}` : `/calculaties${qs}`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft size={15} /> Terug
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{combi.code} {combi.naam}</h1>
          {combi.omschrijving ? <p className="text-sm text-gray-500">{combi.omschrijving}</p> : null}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left">
              <th>Component</th><th>STABU</th><th className="text-right">Hoev.</th><th>Eenh.</th>
              <th className="text-right">Mat. €/e</th><th className="text-right">Arb. €/e</th><th className="text-right">Totaal/e</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {comps.map((c) => {
              const per = Number(c.hoeveelheid_per_eenheid) * (Number(c.materiaalprijs) + Number(c.arbeidsprijs) + Number(c.materieelprijs));
              return (
                <tr key={c.id} className="[&>td]:px-3 [&>td]:py-1.5">
                  <td className="text-gray-800">{c.omschrijving}</td>
                  <td className="font-mono text-xs text-gray-400">{c.stabu_code}</td>
                  <td className="text-right tabular-nums">{fmtNum(c.hoeveelheid_per_eenheid, 2)}</td>
                  <td className="text-gray-500">{c.eenheid}</td>
                  <td className="text-right tabular-nums text-gray-500">{fmtNum(c.materiaalprijs)}</td>
                  <td className="text-right tabular-nums text-gray-500">{fmtNum(c.arbeidsprijs)}</td>
                  <td className="text-right tabular-nums font-medium">{fmtEUR(per)}</td>
                </tr>
              );
            })}
            {comps.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">Geen componenten.</td></tr>}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2.5">
          <span className="text-sm text-gray-500">Kostprijs per {combi.eenheid || 'eenheid'}</span>
          <span className="text-base font-semibold text-gray-900">{fmtEUR(totaal)}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={toevoegen} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-4 py-2 text-sm font-medium text-white hover:bg-sterkcalc-navy2 disabled:opacity-60">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Toevoegen aan werktafel
        </button>
      </div>
    </div>
  );
}
