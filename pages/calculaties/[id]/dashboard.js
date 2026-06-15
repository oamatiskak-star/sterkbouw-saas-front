// pages/calculaties/[id]/dashboard.js — Sprint 10 Project Command Center (Bouw OS orkestratie).
// Verbindt alle bestaande modules in één scherm. Read-only + oplevering-statuswijziging.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Loader2, LayoutDashboard, Table2, Wand2, FileText, CalendarDays, ShoppingCart, BarChart3, CheckCircle2, Circle, AlertTriangle, Sparkles, History, Flag, ArrowRight } from 'lucide-react';
import { buildCommand, zetCalculatieStatus } from '@/services/projectCommand';
import { FASES, FASE_LABEL } from '@/lib/calc/projectStatus';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

const MODULES = [
  { key: 'werktafel', label: 'Werktafel', icon: Table2 },
  { key: 'ai', label: 'AI-analyse', icon: Wand2 },
  { key: 'offerte', label: 'Offerte', icon: FileText },
  { key: 'planning', label: 'Planning', icon: CalendarDays },
  { key: 'bestellen', label: 'Bestellen', icon: ShoppingCart },
  { key: 'rapportages', label: 'Rapportage', icon: BarChart3 },
];
const HEALTH_KLEUR = { groen: 'text-sterkcalc-accent', oranje: 'text-amber-500', rood: 'text-red-500' };
const HEALTH_BG = { groen: 'bg-sterkcalc-accent', oranje: 'bg-amber-500', rood: 'bg-red-500' };
const PRIO_BG = { hoog: 'bg-red-50 text-red-700', midden: 'bg-amber-50 text-amber-700', laag: 'bg-gray-50 text-gray-600' };

export default function CommandCenter() {
  const router = useRouter();
  const { id } = router.query;
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const herlaad = () => buildCommand(id).then(setC).catch(console.error);
  useEffect(() => { if (!id) return; herlaad().finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Command center laden…</div>;
  if (!c) return <div className="p-8 text-gray-500">Geen data.</div>;

  const opleveren = async () => {
    if (!window.confirm('Project markeren als opgeleverd?')) return;
    setBusy(true); try { await zetCalculatieStatus(id, 'opgeleverd'); await herlaad(); } finally { setBusy(false); }
  };
  const k = c.kpi;
  const checklistOk = c.checklist.filter((x) => x.ok).length;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><LayoutDashboard size={20} className="text-sterkcalc-blue" /> {c.calculatie?.naam || 'Project'} <span className="rounded-full bg-sterkcalc-navy px-2.5 py-0.5 text-xs font-medium text-white">{c.fase.label}</span></h1>
        <div className="flex items-center gap-3">
          <div className="text-right"><div className="text-[10px] uppercase tracking-wide text-gray-400">Health</div><div className={`text-lg font-bold ${HEALTH_KLEUR[c.health.kleur]}`}>{c.health.score}<span className="text-xs text-gray-400">/100</span></div></div>
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-500">Eén command center — alle modules verbonden. Geen losse pagina's nodig.</p>

      {/* Fase-stepper */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex min-w-max items-center gap-1">
          {FASES.map((f, i) => (
            <div key={f} className="flex items-center">
              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${i < c.fase.index ? 'bg-sterkcalc-accent/15 text-sterkcalc-accent' : i === c.fase.index ? 'bg-sterkcalc-navy text-white' : 'bg-gray-100 text-gray-400'}`}>
                {i < c.fase.index ? <CheckCircle2 size={12} /> : <Circle size={12} />} {FASE_LABEL[f]}
              </div>
              {i < FASES.length - 1 && <ArrowRight size={12} className="mx-0.5 text-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {[['Verkoopwaarde', fmtEUR(k.verkoopwaarde)], ['Kostprijs', fmtEUR(k.kostprijs)], ['Marge', `${fmtEUR(k.brutomarge)} · ${k.marge_pct}%`], ['Besteld', fmtEUR(k.besteld)], ['Openstaand', fmtEUR(k.openstaand_inkoop)], ['Oplevering', k.planning_eind || `${k.planning_weken} wk`]].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-gray-200 bg-white p-2.5"><div className="text-[10px] uppercase tracking-wide text-gray-400">{l}</div><div className="truncate text-sm font-semibold text-gray-900">{v}</div></div>
        ))}
      </div>

      {/* Module-snelkoppelingen */}
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {MODULES.map((m) => (
          <Link key={m.key} href={`/calculaties/${id}/${m.key}`} className="flex flex-col items-center gap-1 rounded-xl border border-gray-200 bg-white p-3 text-center hover:border-sterkcalc-accent hover:shadow-sm">
            <m.icon size={18} className="text-sterkcalc-navy" /><span className="text-xs font-medium text-gray-700">{m.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Uitvoeringsdashboard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Uitvoeringsdashboard</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Mini titel="Planning" rijen={[['Doorlooptijd', `${k.planning_weken} weken`], ['Oplevering', k.planning_eind || '—'], ['Vertraagde fases', (c.planning_rapport?.vertraagde_fases || []).join(', ') || 'geen']]} />
              <Mini titel="Inkoop & leveringen" rijen={[['Besteld', fmtEUR(c.inkoop_rapport.besteld)], ['Ontvangen', fmtEUR(c.inkoop_rapport.ontvangen)], ['Vertraagd', c.inkoop_rapport.vertraagde_leveringen]]} />
            </div>
            <div className="mt-3">
              <div className="mb-1 text-xs font-medium text-gray-500">Cashflow (cumulatief per fase)</div>
              <div className="flex items-end gap-1">
                {c.cashflow.rijen.map((cf, i) => {
                  const max = Math.max(1, ...c.cashflow.rijen.map((x) => Math.abs(x.cumulatief)));
                  return <div key={i} className="flex-1" title={`${cf.fase}: ${fmtEUR(cf.cumulatief)}`}><div className={`mx-auto w-full rounded-t ${cf.cumulatief < 0 ? 'bg-red-400' : 'bg-sterkcalc-blue'}`} style={{ height: `${(Math.abs(cf.cumulatief) / max) * 48 + 2}px` }} /></div>;
                })}
              </div>
              <div className="mt-1 text-[11px] text-gray-400">Piekfinanciering: <span className="font-semibold text-red-600">{fmtEUR(c.cashflow.piekfinanciering)}</span></div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><History size={15} /> Project-tijdlijn</h2>
            <ol className="space-y-1.5">
              {c.timeline.slice(0, 14).map((t, i) => (
                <li key={i} className="flex items-center justify-between border-l-2 border-gray-100 pl-3 text-sm">
                  <span className="text-gray-700">{t.tekst}</span><span className="text-xs text-gray-400">{new Date(t.at).toLocaleDateString('nl-NL')}</span>
                </li>
              ))}
              {c.timeline.length === 0 && <li className="text-sm text-gray-400">Nog geen activiteit.</li>}
            </ol>
          </div>
        </div>

        {/* Rechts: acties, AI, oplevering */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><Flag size={15} className="text-sterkcalc-accent" /> Open acties</h2>
            <ul className="space-y-1.5 text-sm">
              {c.acties.map((a, i) => (
                <li key={i} className={`rounded-lg px-2.5 py-1.5 ${PRIO_BG[a.prio]}`}>
                  {a.route ? <Link href={`/calculaties/${id}/${a.route}`} className="flex items-center justify-between gap-2 hover:underline">{a.tekst} <ArrowRight size={13} /></Link> : a.tekst}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><Sparkles size={15} className="text-sterkcalc-accent" /> AI project-assistent</h2>
            <p className="mb-2 text-[11px] text-gray-400">Adviseert — wijzigt nooit zelf.</p>
            <ul className="space-y-1.5 text-sm text-gray-700">
              {c.ai_signalen.map((a, i) => <li key={i} className="rounded-lg bg-sterkcalc-navy/5 px-2.5 py-1.5">{a.advies}</li>)}
              {c.ai_signalen.length === 0 && <li className="text-gray-400">Geen signalen.</li>}
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><CheckCircle2 size={15} /> Oplevering ({checklistOk}/{c.checklist.length})</h2>
            <ul className="space-y-1 text-sm">
              {c.checklist.map((x, i) => <li key={i} className="flex items-center gap-2">{x.ok ? <CheckCircle2 size={14} className="text-sterkcalc-accent" /> : <Circle size={14} className="text-gray-300" />}<span className={x.ok ? 'text-gray-700' : 'text-gray-400'}>{x.label}</span></li>)}
            </ul>
            {c.calculatie?.status === 'opgeleverd' ? (
              <div className="mt-3 rounded-lg bg-sterkcalc-accent/10 px-3 py-2 text-sm font-medium text-sterkcalc-accent">Project opgeleverd ✓</div>
            ) : (
              <button onClick={opleveren} disabled={busy || checklistOk < c.checklist.length} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-sterkcalc-navy px-3 py-2 text-sm font-medium text-white hover:bg-sterkcalc-navy2 disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />} Opleveren</button>
            )}
            {checklistOk < c.checklist.length && c.calculatie?.status !== 'opgeleverd' && <p className="mt-1 text-[11px] text-gray-400">Alle punten afronden om op te leveren.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ titel, rijen }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="mb-1 text-xs font-semibold text-gray-700">{titel}</div>
      <dl className="space-y-0.5 text-sm">
        {rijen.map(([l, v]) => <div key={l} className="flex justify-between gap-2"><dt className="text-gray-500">{l}</dt><dd className="text-right font-medium text-gray-800">{v}</dd></div>)}
      </dl>
    </div>
  );
}
