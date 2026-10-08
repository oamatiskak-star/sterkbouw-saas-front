// components/portaal/OffertePortalPrijsoverzicht.jsx — referentie-spec item 6: basissom,
// geselecteerde opties, subtotaal, btw, totaal incl. btw. Correcte, niet-afgeronde waarden uit
// dezelfde totalen als PDF/dashboard (geen aparte berekening, geen afrondingsverschillen).
// Btw per tarief (totalen.btwVerdeling) wanneer regels een afwijkend tarief dragen, bijv.
// 21% over de bouwposten en 0% over zonnepanelen bij een woning.
import { fmtEUR, fmtNum } from '@/lib/calc/werktafelTotals';
import { optiesNetto } from '@/services/offerteExcellence';

export default function OffertePortalPrijsoverzicht({ totalen, kpi, offerte }) {
  const netto = optiesNetto(offerte.opties);
  const basissom = kpi.bouwsom - netto;
  const calcPct = totalen?.opslagen?.btw !== undefined && totalen?.opslagen?.btw !== null ? Number(totalen.opslagen.btw) : 21;
  const verdeling = Array.isArray(totalen?.btwVerdeling) ? totalen.btwVerdeling : [];

  let btwRegels;
  if (verdeling.length > 1) {
    // Opties vallen onder het calculatietarief en tellen mee in die grondslag.
    btwRegels = verdeling.map((v) => {
      const grondslag = v.grondslag + (v.pct === calcPct ? netto : 0);
      return [`Btw ${fmtNum(v.pct)}% over ${fmtEUR(grondslag)}`, fmtEUR(grondslag * (v.pct / 100))];
    });
  } else {
    const pct = verdeling.length ? verdeling[0].pct : (Number(totalen?.opslagen?.btw) || 21);
    btwRegels = [[`Btw (${fmtNum(pct)}%)`, fmtEUR(kpi.btw ?? kpi.bouwsom * (pct / 100))]];
  }

  const regels = [
    ['Basissom (excl. btw)', fmtEUR(basissom)],
    ...(netto ? [['Geselecteerde opties', `${netto < 0 ? '−' : '+'} ${fmtEUR(Math.abs(netto))}`]] : []),
    ['Subtotaal (excl. btw)', fmtEUR(kpi.bouwsom)],
    ...btwRegels,
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-4 sm:px-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-gray-900">Prijsoverzicht</h2>
        <div className="mt-4 space-y-2 text-sm">
          {regels.map(([l, v]) => (
            <div key={l} className="flex justify-between text-gray-600"><span>{l}</span><span className="tabular-nums text-gray-800">{v}</span></div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm font-semibold text-gray-900">Totaal incl. btw</span>
          <span className="text-2xl font-bold text-sterkcalc-navy">{fmtEUR(kpi.investering)}</span>
        </div>
      </div>
    </section>
  );
}
