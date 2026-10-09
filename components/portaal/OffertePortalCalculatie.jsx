// components/portaal/OffertePortalCalculatie.jsx — Volledige STABU-calculatie in het klantportaal
// (particuliere klanten), na offerte en werkomschrijving. Regel-voor-regel per hoofdstuk met
// hoeveelheid, uren, arbeid, materiaal en totaal, plus de opslagen tot de basissom.
// HARDE REGEL: rekent met exact dezelfde functies + prijsfactoren als het prijsoverzicht
// (computeRow / priceFactors / computeTotalen), zodat calculatie en offerte altijd aansluiten.
import { useMemo, useState } from 'react';
import { ChevronDown, Calculator } from 'lucide-react';
import { computeRow, priceFactors, fmtEUR, fmtNum } from '@/lib/calc/werktafelTotals';

function perHoofdstuk(chapters, rows, factor) {
  const perCh = new Map();
  for (const r of rows || []) {
    const key = r.chapter_id || '__overig';
    if (!perCh.has(key)) perCh.set(key, []);
    perCh.get(key).push({ r, c: computeRow(r, factor) });
  }
  const somVan = (items) => items.reduce((s, { c }) => ({
    uren: s.uren + c.uren, arbeid: s.arbeid + c.arbeid, materiaal: s.materiaal + c.materiaal,
    materieel: s.materieel + c.materieel, kostprijs: s.kostprijs + c.kostprijs,
  }), { uren: 0, arbeid: 0, materiaal: 0, materieel: 0, kostprijs: 0 });
  const lijst = (chapters || [])
    .filter((ch) => (perCh.get(ch.id) || []).length)
    .map((ch) => {
      const items = perCh.get(ch.id);
      return { id: ch.id, code: ch.code || ch.stabu_hoofdstuk || '', naam: ch.naam || 'Hoofdstuk', items, som: somVan(items) };
    });
  const overig = perCh.get('__overig');
  if (overig?.length) lijst.push({ id: '__overig', code: '', naam: 'Overige posten', items: overig, som: somVan(overig) });
  return lijst;
}

const th = 'px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500';
const td = 'px-2 py-1.5 align-top text-xs text-gray-700';
const tdR = `${td} text-right tabular-nums whitespace-nowrap`;

export default function OffertePortalCalculatie({ chapters, rows, opslagen, totalen }) {
  const factor = useMemo(() => priceFactors(opslagen), [opslagen]);
  const hoofdstukken = useMemo(() => perHoofdstuk(chapters, rows, factor), [chapters, rows, factor]);
  const [open, setOpen] = useState(null);
  if (!hoofdstukken.length || !totalen) return null;

  const op = totalen.opslagen || {};
  const winstNul = !(Number(op.winst) > 0);
  const opslagRegels = [
    ['Algemene kosten (AK)', op.ak, totalen.akBedrag],
    ['Algemene bedrijfskosten (ABK)', op.abk, totalen.abkBedrag],
    [winstNul ? 'Winst & risico' : 'Risico', op.risico, totalen.risicoBedrag],
    ...(winstNul ? [] : [['Winst', op.winst, totalen.winstBedrag]]),
  ].filter(([, pct, bedrag]) => Number(pct) > 0 || Number(bedrag) > 0);

  return (
    <section className="mx-auto max-w-5xl px-3 py-3 sm:px-8 sm:py-4" id="calculatie">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-gray-900">Volledige calculatie</h2>
        <p className="mt-1 text-sm text-gray-500">
          De complete onderbouwing van uw offerte volgens STABU: per post de hoeveelheid, uren, arbeid en materiaal. Klik op een hoofdstuk voor alle regels.
        </p>

        <div className="mt-5 divide-y divide-gray-100">
          {hoofdstukken.map((h) => (
            <div key={h.id}>
              <button onClick={() => setOpen(open === h.id ? null : h.id)} className="flex w-full items-start gap-3 bg-white py-3 text-left [color-scheme:light]">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sterkcalc-navy/5 text-sterkcalc-navy sm:h-9 sm:w-9"><Calculator size={16} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-sm font-semibold leading-snug text-gray-900">{h.code ? `${h.code} — ` : ''}{h.naam}</span>
                  <span className="mt-0.5 flex items-baseline justify-between gap-3">
                    <span className="text-xs text-gray-400">{h.items.length} regel{h.items.length === 1 ? '' : 's'} · {fmtNum(h.som.uren, 1)} uur</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900">{fmtEUR(h.som.kostprijs)}</span>
                  </span>
                </span>
                <ChevronDown size={16} className={`mt-1 shrink-0 text-gray-400 transition-transform ${open === h.id ? 'rotate-180' : ''}`} />
              </button>
              {open === h.id && (
                <div className="-mx-1 mb-3 overflow-x-auto rounded-lg border border-gray-100 sm:mx-0">
                  <table className="w-full min-w-[640px] border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className={th}>Code</th><th className={th}>Omschrijving</th>
                        <th className={`${th} text-right`}>Hoeveelh.</th><th className={th}>Eenh.</th>
                        <th className={`${th} text-right`}>Uren</th><th className={`${th} text-right`}>Arbeid</th>
                        <th className={`${th} text-right`}>Materiaal</th><th className={`${th} text-right`}>Overig</th>
                        <th className={`${th} text-right`}>Totaal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h.items.map(({ r, c }) => (
                        <tr key={r.id} className="border-t border-gray-100">
                          <td className={`${td} whitespace-nowrap font-mono text-[11px] text-gray-400`}>{r.stabu_code || r.regelnr || ''}</td>
                          <td className={td}>{r.omschrijving || 'Werkregel'}</td>
                          <td className={tdR}>{fmtNum(c.hoeveelheid)}</td>
                          <td className={`${td} whitespace-nowrap text-gray-400`}>{r.eenheid || ''}</td>
                          <td className={tdR}>{c.uren ? fmtNum(c.uren, 1) : '–'}</td>
                          <td className={tdR}>{c.arbeid ? fmtEUR(c.arbeid) : '–'}</td>
                          <td className={tdR}>{c.materiaal ? fmtEUR(c.materiaal) : '–'}</td>
                          <td className={tdR}>{c.materieel ? fmtEUR(c.materieel) : '–'}</td>
                          <td className={`${tdR} font-semibold text-gray-900`}>{fmtEUR(c.kostprijs)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                        <td className={td} colSpan={4}>Subtotaal {h.code || h.naam}</td>
                        <td className={tdR}>{fmtNum(h.som.uren, 1)}</td>
                        <td className={tdR}>{fmtEUR(h.som.arbeid)}</td>
                        <td className={tdR}>{fmtEUR(h.som.materiaal)}</td>
                        <td className={tdR}>{fmtEUR(h.som.materieel)}</td>
                        <td className={`${tdR} text-gray-900`}>{fmtEUR(h.som.kostprijs)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between text-gray-600"><span className="pr-3">Directe kosten ({fmtNum(totalen.uren, 1)} uur)</span><span className="tabular-nums text-gray-800">{fmtEUR(totalen.directe_kosten)}</span></div>
          {opslagRegels.map(([label, pct, bedrag]) => (
            <div key={label} className="flex justify-between text-gray-600"><span className="pr-3">{label} ({fmtNum(pct, 1)}%)</span><span className="tabular-nums text-gray-800">{fmtEUR(bedrag)}</span></div>
          ))}
          <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold text-gray-900"><span>Basissom (excl. btw)</span><span className="tabular-nums">{fmtEUR(totalen.verkoopprijs_excl)}</span></div>
          <p className="text-xs text-gray-400">De basissom sluit aan op het prijsoverzicht hierboven; eventueel gekozen opties en btw staan daar.</p>
        </div>
      </div>
    </section>
  );
}
