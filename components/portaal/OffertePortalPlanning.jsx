// components/portaal/OffertePortalPlanning.jsx — referentie scherm "5. Planning, voorwaarden,
// akkoord" (linkerkolom: Planning + Betalingstermijnen). Verwachte start/oplevering worden
// afgeleid uit de planning-fasen (weken vanaf vandaag) — later aanpasbaar via de Planning-tab
// in het interne dashboard, geen hardcoded datums.
// Optioneel: offerte.content.verwachteStart ('YYYY-MM' of 'YYYY-MM-DD') zet een vaste startdatum;
// oplevering = start + uitvoeringsweken (fasen met `aanloop: true` tellen dan niet mee).
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

const WEEK_MS = 7 * 24 * 3600 * 1000;

function parseStart(waarde) {
  if (typeof waarde !== 'string') return null;
  const m = waarde.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, m[3] ? Number(m[3]) : 1);
  return Number.isNaN(d.getTime()) ? null : d;
}

function verwachteData(planning, verwachteStart) {
  const fasen = planning || [];
  const totaalWeken = fasen.reduce((s, f) => s + (Number(f.weken) || 0), 0);
  if (!totaalWeken) return null;
  const fmt = (d) => d.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
  const vasteStart = parseStart(verwachteStart);
  if (vasteStart) {
    const uitvoeringWeken = fasen.filter((f) => !f.aanloop).reduce((s, f) => s + (Number(f.weken) || 0), 0);
    const oplevering = new Date(vasteStart.getTime() + uitvoeringWeken * WEEK_MS);
    return { start: fmt(vasteStart), oplevering: fmt(oplevering), weken: uitvoeringWeken, wekenLabel: 'Uitvoering' };
  }
  const start = new Date();
  const oplevering = new Date(start.getTime() + totaalWeken * WEEK_MS);
  return { start: fmt(start), oplevering: fmt(oplevering), weken: totaalWeken, wekenLabel: 'Totaal' };
}

export default function OffertePortalPlanning({ planning, termijnen, kpi, verwachteStart }) {
  let cumulatief = 0;
  const fasen = (planning || []).map((f) => {
    const vanaf = cumulatief + 1;
    cumulatief += Number(f.weken) || 0;
    return { ...f, label: Number(f.weken) === 1 ? `Week ${vanaf}` : `Week ${vanaf}-${cumulatief}` };
  });
  const verwacht = verwachteData(planning, verwachteStart);

  return (
    <section className="mx-auto max-w-5xl px-3 py-3 sm:px-8 sm:py-4">
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
            <div className="mt-3 text-xs text-gray-400">{verwacht.wekenLabel} {verwacht.weken} weken</div>
          </div>
        )}
      </div>
    </section>
  );
}
