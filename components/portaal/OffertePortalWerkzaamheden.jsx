// components/portaal/OffertePortalWerkzaamheden.jsx — referentie scherm "4. Werkzaamheden & prijzen".
// Werkzaamheden als uitklapbare kaarten (bedragen uit de calculatie, nooit hardcoded) +
// optionele werkzaamheden als toggle-switches die live het totaal herberekenen en server-side
// persistent worden opgeslagen (bewaarOptieKeuze schrijft naar de DB, geen fake client-state).
import { useMemo, useState } from 'react';
import { ChevronDown, Layers } from 'lucide-react';
import { computeRow, fmtEUR } from '@/lib/calc/werktafelTotals';

function hoofdstukWerk(chapters, rows, bouwsom) {
  const perCh = new Map();
  const rowsPerCh = new Map();
  for (const r of rows || []) {
    const cr = computeRow(r);
    const key = r.chapter_id || '__overig';
    perCh.set(key, (perCh.get(key) || 0) + (Number(cr.kostprijs) || 0));
    if (!rowsPerCh.has(key)) rowsPerCh.set(key, []);
    rowsPerCh.get(key).push(r);
  }
  const items = (chapters || []).map((c) => ({ id: c.id, naam: c.naam || c.code || 'Hoofdstuk', dk: perCh.get(c.id) || 0, rows: rowsPerCh.get(c.id) || [] }));
  const totaalDk = items.reduce((s, i) => s + i.dk, 0) || 1;
  return items.filter((i) => i.dk > 0).map((i) => ({ ...i, bedrag: (i.dk / totaalDk) * bouwsom }));
}

export default function OffertePortalWerkzaamheden({ chapters, rows, kpi, offerte, getekend, onToggleOptie }) {
  const [open, setOpen] = useState(null);
  const hoofdstukken = useMemo(() => hoofdstukWerk(chapters, rows, kpi.bouwsom), [chapters, rows, kpi.bouwsom]);
  const opties = offerte.opties || [];

  return (
    <section className="mx-auto max-w-5xl px-6 py-4 sm:px-8" id="werkzaamheden">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-gray-900">Werkzaamheden</h2>
        <p className="mt-1 text-sm text-gray-500">Een duidelijk overzicht, geen verrassingen.</p>

        <div className="mt-5 divide-y divide-gray-100">
          {hoofdstukken.map((h) => (
            <div key={h.id}>
              <button onClick={() => setOpen(open === h.id ? null : h.id)} className="flex w-full items-start gap-3 bg-white py-3 text-left [color-scheme:light]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sterkcalc-navy/5 text-sterkcalc-navy"><Layers size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-snug text-gray-900">{h.naam}</span>
                  <span className="block text-xs text-gray-400">{h.rows.length} werkregel{h.rows.length === 1 ? '' : 's'}</span>
                </span>
                <span className="mt-2.5 shrink-0 whitespace-nowrap text-sm font-semibold text-gray-900">{fmtEUR(h.bedrag)}</span>
                <ChevronDown size={16} className={`mt-3 shrink-0 text-gray-400 transition-transform ${open === h.id ? 'rotate-180' : ''}`} />
              </button>
              {open === h.id && (
                <div className="mb-3 ml-14 space-y-1 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                  {h.rows.map((r) => (
                    <div key={r.id} className="flex justify-between gap-3">
                      <span className="truncate">{r.omschrijving || r.naam || 'Werkregel'}</span>
                      <span className="shrink-0 text-gray-400">{r.hoeveelheid ? `${r.hoeveelheid} ${r.eenheid || ''}`.trim() : ''}</span>
                    </div>
                  ))}
                  {h.rows.length === 0 && <span className="text-gray-400">Geen detailregels beschikbaar.</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        {opties.length > 0 && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-900">Optionele werkzaamheden</h3>
            <p className="mt-1 text-sm text-gray-500">Maak jullie offerte compleet.</p>
            <div className="mt-4 space-y-2">
              {opties.map((o, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sterkcalc-gold/10 text-sterkcalc-gold"><Layers size={15} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-800">{o.naam}</span>
                    {o.impact && <span className="block text-xs text-gray-400">{o.impact}</span>}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{o.soort === 'min' ? '−' : '+'} {fmtEUR(o.bedrag)}</span>
                  <button
                    type="button"
                    disabled={getekend}
                    onClick={() => onToggleOptie(i)}
                    aria-pressed={!!o.geselecteerd}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${o.geselecteerd ? 'bg-sterkcalc-navy' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform ${o.geselecteerd ? 'translate-x-6' : 'translate-x-1'}`} style={{ height: 18, width: 18 }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
          <span className="text-sm font-semibold text-gray-700">Totaal (excl. btw)</span>
          <span className="text-xl font-bold text-gray-900">{fmtEUR(kpi.bouwsom)}</span>
        </div>
      </div>
    </section>
  );
}
