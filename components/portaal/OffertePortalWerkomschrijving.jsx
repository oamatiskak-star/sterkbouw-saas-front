// components/portaal/OffertePortalWerkomschrijving.jsx — Werkomschrijving direct na de
// gepresenteerde offerte (particuliere klanten): per onderdeel in gewone taal wat er wordt
// uitgevoerd. Bron (in volgorde):
//   1. offerte.content.werkomschrijving — handmatig/geïmporteerd: [{ titel, toelichting?, regels: [string] }]
//   2. fallback: afgeleid uit de calculatieregels per hoofdstuk (omschrijving + hoeveelheid),
//      zodat er nooit een lege of afwijkende werkomschrijving staat.
import { useMemo, useState } from 'react';
import { ChevronDown, ClipboardList } from 'lucide-react';
import { fmtNum } from '@/lib/calc/werktafelTotals';

function uitRegels(chapters, rows) {
  const perCh = new Map();
  for (const r of rows || []) {
    const key = r.chapter_id || '__overig';
    if (!perCh.has(key)) perCh.set(key, []);
    perCh.get(key).push(r);
  }
  const lijst = (chapters || [])
    .map((c) => ({
      titel: [c.code, c.naam].filter(Boolean).join(' — ') || 'Onderdeel',
      regels: (perCh.get(c.id) || []).map((r) => {
        const q = Number(r.hoeveelheid);
        const hoeveel = Number.isFinite(q) && q > 0 ? ` (${fmtNum(q)} ${r.eenheid || ''})`.replace(/\s+\)/, ')') : '';
        return `${r.omschrijving || 'Werkzaamheid'}${hoeveel}`;
      }),
    }))
    .filter((o) => o.regels.length);
  const overig = perCh.get('__overig');
  if (overig?.length) lijst.push({ titel: 'Overige werkzaamheden', regels: overig.map((r) => r.omschrijving || 'Werkzaamheid') });
  return lijst;
}

export default function OffertePortalWerkomschrijving({ werkomschrijving, chapters, rows }) {
  const onderdelen = useMemo(() => {
    const handmatig = Array.isArray(werkomschrijving) ? werkomschrijving.filter((o) => o?.titel && Array.isArray(o.regels) && o.regels.length) : [];
    return handmatig.length ? handmatig : uitRegels(chapters, rows);
  }, [werkomschrijving, chapters, rows]);
  const [open, setOpen] = useState(0);
  if (!onderdelen.length) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-4 sm:px-8" id="werkomschrijving">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-gray-900">Werkomschrijving</h2>
        <p className="mt-1 text-sm text-gray-500">Per onderdeel wat wij voor u uitvoeren — precies wat in de offerte is meegerekend.</p>
        <div className="mt-5 divide-y divide-gray-100">
          {onderdelen.map((o, i) => (
            <div key={i}>
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center gap-3 bg-white py-3 text-left [color-scheme:light]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sterkcalc-navy/5 text-sterkcalc-navy"><ClipboardList size={16} /></span>
                <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-gray-900">{o.titel}</span>
                <ChevronDown size={16} className={`shrink-0 text-gray-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="mb-3 ml-12 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  {o.toelichting && <p className="mb-2 text-xs italic text-gray-500">{o.toelichting}</p>}
                  <ul className="list-disc space-y-1 pl-4">
                    {o.regels.map((r, j) => <li key={j}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
