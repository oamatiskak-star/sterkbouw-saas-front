// components/portaal/OffertePortalPlanning.jsx — referentie scherm "5. Planning, voorwaarden,
// akkoord" (linkerkolom: Planning + Betalingstermijnen). Verwachte start/oplevering worden
// afgeleid uit de planning-fasen (weken vanaf vandaag) — later aanpasbaar via de Planning-tab
// in het interne dashboard, geen hardcoded datums.
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

function verwachteData(planning) {
  const totaalWeken = (planning || []).reduce((s, f) => s + (Number(f.weken) || 0), 0);
  if (!totaalWeken) return null;
  const start = new Date();
  const oplevering = new Date(start.getTime() + totaalWeken * 7 * 24 * 3600 * 1000);
  const fmt = (d) => d.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
  return { start: fmt(start), oplevering: fmt(oplevering) };
}

export default function OffertePortalPlanning({ planning, termijnen, kpi }) {
  let cumulatief = 0;
  const fasen = (planning || []).map((f) => {
    const vanaf = cumulatief + 1;
    cumulatief += Number(f.weken) || 0;
    return { ...f, label: Number(f.weken) === 1 ? `Week ${vanaf}` : `Week ${vanaf}-${cumulatief}` };
  });
  const verwacht = verwachteData(planning);

  return (
    <section className="mx-auto max-w-5xl px-6 py-4 sm:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="text-lg font-bold text-gray-900">Planning</h2>
          <p className="mt-1 text-sm text-gray-500">Een realistische planning, stap voor stap.</p>
          <ol className="mt-5 space-y-5 border-l-2 border-gray-100 pl-5">
            {fasen.map((f, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-sterkcalc-gold ring-2 ring-sterkcalc-gold/20" />
                <span className="block text-xs font-semibold uppercase tracking-wide text-sterkcalc-gold">{f.label}</span>
                <span className="block text-sm text-gray-700">{f.fase}</span>
              </li>
            ))}
          </ol>

          <h3 className="mt-8 text-sm font-bold text-gray-900">Betalingstermijnen</h3>
          <p className="mt-1 text-sm text-gray-500">Transparant en duidelijk.</p>
          <ul className="mt-4 space-y-2.5">
            {(termijnen || []).map((t, i) => (
              <li key={i} className="flex items-center justify-between text-sm text-gray-700">
                <span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-sterkcalc-navy" /> {t.pct}% {t.label.toLowerCase().startsWith('bij') || t.label.toLowerCase().startsWith('oplevering') ? t.label.charAt(0).toLowerCase() + t.label.slice(1) : t.label}</span>
                <span className="tabular-nums text-gray-500">{fmtEUR(t.bedrag)}</span>
              </li>
            ))}
          </ul>
        </div>

        {verwacht && (
          <div className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900"><CalendarDays size={16} className="text-sterkcalc-gold" /> Doorlooptijd</div>
            <div className="mt-4 text-xs font-medium uppercase tracking-wide text-gray-400">Verwachte start</div>
            <div className="text-base font-semibold text-gray-900">{verwacht.start}</div>
            <div className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">Verwachte oplevering</div>
            <div className="text-base font-semibold text-gray-900">{verwacht.oplevering}</div>
            <div className="mt-3 text-xs text-gray-400">Totaal {(planning || []).reduce((s, f) => s + (Number(f.weken) || 0), 0)} weken</div>
          </div>
        )}
      </div>
    </section>
  );
}
