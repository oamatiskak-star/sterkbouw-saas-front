// pages/calculaties/opnames/index.js — overzicht van alle opnames, met bewerken.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ClipboardList, Plus } from 'lucide-react';
import { listOpnames } from '@/services/opnames';

const STATUS_LABEL = { nieuw: 'Nieuw', in_behandeling: 'In behandeling', omgezet_naar_calculatie: 'Omgezet naar calculatie', afgerond: 'Afgerond' };

function datNL(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function OpnamesOverzicht() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    listOpnames()
      .then(setItems)
      .catch((e) => setErrorMsg(e.message || 'Laden mislukt'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><ClipboardList size={20} className="text-sterkcalc-blue" /> Opnames</h1>
          <p className="text-sm text-gray-500">Opnames bij particuliere klanten — vastgelegd op locatie, hier altijd de nieuwste versie en te bewerken.</p>
        </div>
        <Link href="/calculaties/opnames/nieuw" className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-4 py-2 text-sm font-medium text-white hover:bg-sterkcalc-navy2">
          <Plus size={15} /> Nieuwe opname
        </Link>
      </div>

      {errorMsg && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>}

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:text-left">
                <th>Klant</th><th>Calc-nr.</th><th>Plaats</th><th>Type</th><th>Datum opname</th><th>Opgenomen door</th><th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link href={`/calculaties/opnames/${o.id}`} className="font-medium text-gray-900 hover:text-sterkcalc-blue">{o.klant_naam}</Link>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-600">
                    {o.calculatie_id
                      ? <Link href={`/calculaties/${o.calculatie_id}/werktafel`} className="hover:text-sterkcalc-blue">{o.calculaties?.projectnummer || o.calculatie_id.slice(0, 8)}</Link>
                      : '—'}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{o.plaats || '—'}</td>
                  <td className="px-4 py-2 text-gray-600">{o.type_aanvraag || '—'}</td>
                  <td className="px-4 py-2 text-gray-600">{datNL(o.datum_opname)}</td>
                  <td className="px-4 py-2 text-gray-600">{o.opgenomen_door || '—'}</td>
                  <td className="px-4 py-2 text-xs text-gray-400">{STATUS_LABEL[o.status] || o.status || 'nieuw'}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">Nog geen opnames.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
