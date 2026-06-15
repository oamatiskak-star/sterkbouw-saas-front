// pages/calculaties/[id]/rapportages.js — Sprint 9 Rapportage & Management dashboard.
// Leest werktafel/offerte/planning/bestellingen/versies. AI adviserend. Geen mutaties.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, BarChart3, FileDown, Sheet, Sparkles, AlertTriangle, TrendingUp, GitCompare } from 'lucide-react';
import { buildRapportage } from '@/services/rapportage';
import { directierapportPdf, rapportageCsv } from '@/lib/rapportage/exportRapportage';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

export default function Rapportages() {
  const router = useRouter();
  const { id } = router.query;
  const [r, setR] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!id) return; buildRapportage(id).then(setR).catch(console.error).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Rapportage opbouwen…</div>;
  if (!r) return <div className="p-8 text-gray-500">Geen data.</div>;

  const k = r.kpi;
  const maxMarge = Math.max(...r.marge_hoofdstuk.map((m) => m.kostprijs), 1);
  const cfMax = Math.max(1, ...r.cashflow.rijen.map((c) => Math.abs(c.cumulatief)));

  return (
    <div className="mx-auto max-w-6xl p-6">
      <Link href={`/calculaties/${id}/bestellen`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ChevronLeft size={15} /> Bestellen</Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><BarChart3 size={20} className="text-sterkcalc-blue" /> Managementrapportage</h1>
        <div className="flex gap-2">
          <button onClick={() => directierapportPdf({ rapport: r, calculatie: r.calculatie })} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-sterkcalc-navy2"><FileDown size={14} /> Directierapport PDF</button>
          <button onClick={() => rapportageCsv({ rapport: r, calculatie: r.calculatie })} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"><Sheet size={14} /> Excel</button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {[['Verkoopwaarde', fmtEUR(k.verkoopwaarde)], ['Kostprijs', fmtEUR(k.kostprijs)], ['Brutomarge', fmtEUR(k.brutomarge)], ['Marge', `${k.marge_pct}%`], ['Risico', fmtEUR(k.risico)], ['AK', fmtEUR(k.ak)], ['ABK', fmtEUR(k.abk)], ['Winst', fmtEUR(k.winst)], ['Besteld', fmtEUR(k.besteld)], ['Openstaand inkoop', fmtEUR(k.openstaand_inkoop)], ['Doorlooptijd', `${k.planning_weken} wk`], ['Oplevering', k.planning_eind || '—']].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-gray-200 bg-white p-2.5"><div className="text-[10px] uppercase tracking-wide text-gray-400">{l}</div><div className="truncate text-sm font-semibold text-gray-900">{v}</div></div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Begroot/Actueel/Prognose */}
          <Card titel="Begroot · Actueel · Prognose">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-400"><th className="py-1 text-left">Kostensoort</th><th className="py-1 text-right">Begroot</th><th className="py-1 text-right">Actueel</th><th className="py-1 text-right">Prognose</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {r.begroot_actueel_prognose.map((row) => (
                  <tr key={row.label}><td className="py-1.5 text-gray-800">{row.label}</td><td className="py-1.5 text-right tabular-nums">{fmtEUR(row.begroot)}</td><td className="py-1.5 text-right tabular-nums text-gray-500">{row.actueel == null ? '—' : fmtEUR(row.actueel)}</td><td className={`py-1.5 text-right tabular-nums font-medium ${row.prognose > row.begroot ? 'text-amber-600' : 'text-gray-800'}`}>{fmtEUR(row.prognose)}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] text-gray-400">Actueel materiaal = geleverde bestellingen. Arbeid/materieel worden (nog) niet als realisatie bijgehouden.</p>
          </Card>

          {/* Marge per hoofdstuk (bar) */}
          <Card titel="Marge per hoofdstuk">
            <div className="space-y-1.5">
              {r.marge_hoofdstuk.map((m) => (
                <div key={m.naam} className="flex items-center gap-2 text-sm">
                  <span className="w-40 truncate text-gray-700">{m.naam}</span>
                  <div className="h-3 flex-1 rounded bg-gray-100"><div className={`h-3 rounded ${m.vlag ? 'bg-amber-400' : 'bg-sterkcalc-accent'}`} style={{ width: `${(m.kostprijs / maxMarge) * 100}%` }} /></div>
                  <span className={`w-28 text-right text-xs tabular-nums ${m.vlag ? 'text-amber-600' : 'text-gray-500'}`}>{fmtEUR(m.marge)} ({m.margePct}%)</span>
                </div>
              ))}
              {r.marge_hoofdstuk.length === 0 && <p className="text-sm text-gray-400">Geen werkregels.</p>}
            </div>
          </Card>

          {/* Cashflow */}
          <Card titel="Cashflow per fase">
            <div className="space-y-1.5">
              {r.cashflow.rijen.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-36 truncate text-gray-700">{c.fase}</span>
                  <div className="relative h-4 flex-1">
                    <div className="absolute left-1/2 top-0 h-4 w-px bg-gray-300" />
                    <div className={`absolute top-0.5 h-3 rounded ${c.cumulatief < 0 ? 'bg-red-400' : 'bg-sterkcalc-blue'}`} style={c.cumulatief < 0 ? { right: '50%', width: `${(Math.abs(c.cumulatief) / cfMax) * 50}%` } : { left: '50%', width: `${(c.cumulatief / cfMax) * 50}%` }} />
                  </div>
                  <span className={`w-28 text-right text-xs tabular-nums ${c.cumulatief < 0 ? 'text-red-600' : 'text-gray-600'}`}>{fmtEUR(c.cumulatief)}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">Piekfinanciering: <span className="font-semibold text-red-600">{fmtEUR(r.cashflow.piekfinanciering)}</span> (laagste cumulatieve cashflow).</p>
          </Card>

          {/* Versievergelijking */}
          <Card titel="Versievergelijking">
            {!r.versievergelijking.beschikbaar ? <p className="text-sm text-gray-400">Minimaal 2 opgeslagen calculatieversies nodig.</p> : (
              <table className="w-full text-sm">
                <thead><tr className="text-xs text-gray-400"><th className="py-1 text-left">Onderdeel</th><th className="py-1 text-right">{r.versievergelijking.oud.label}</th><th className="py-1 text-right">{r.versievergelijking.nieuw.label}</th><th className="py-1 text-right">Verschil</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {[['Verkoop excl.', 'verkoopprijs_excl', 'verkoop'], ['Kostprijs', 'directe_kosten', 'kostprijs'], ['Marge', 'marge', 'marge'], ['AK', 'akBedrag', 'ak'], ['Winst', 'winstBedrag', 'winst']].map(([lbl, key, dkey]) => (
                    <tr key={lbl}><td className="py-1.5 text-gray-800">{lbl}</td><td className="py-1.5 text-right tabular-nums text-gray-500">{fmtEUR(r.versievergelijking.oud[key])}</td><td className="py-1.5 text-right tabular-nums">{fmtEUR(r.versievergelijking.nieuw[key])}</td><td className={`py-1.5 text-right tabular-nums font-medium ${r.versievergelijking.verschil[dkey] < 0 ? 'text-red-600' : 'text-sterkcalc-accent'}`}>{r.versievergelijking.verschil[dkey] > 0 ? '+' : ''}{fmtEUR(r.versievergelijking.verschil[dkey])}</td></tr>
                  ))}
                  <tr><td className="py-1.5 text-gray-800">Marge %</td><td className="py-1.5 text-right tabular-nums text-gray-500">{Math.round(r.versievergelijking.oud.margePct)}%</td><td className="py-1.5 text-right tabular-nums">{Math.round(r.versievergelijking.nieuw.margePct)}%</td><td className={`py-1.5 text-right tabular-nums font-medium ${r.versievergelijking.verschil.margePct < 0 ? 'text-red-600' : 'text-sterkcalc-accent'}`}>{r.versievergelijking.verschil.margePct > 0 ? '+' : ''}{r.versievergelijking.verschil.margePct}%</td></tr>
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* Rechts: risico, planning/inkoop, AI */}
        <div className="space-y-4">
          <Card titel={<span className="flex items-center gap-1.5"><AlertTriangle size={15} className="text-amber-500" /> Risicoanalyse</span>}>
            {r.risico_kaarten.length === 0 ? <p className="text-sm text-gray-400">Geen openstaande risico's.</p> : (
              <ul className="space-y-1.5 text-sm">
                {r.risico_kaarten.map((c, i) => <li key={i} className={`rounded-lg px-2.5 py-1.5 ${c.niveau === 'hoog' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}><span className="text-[10px] uppercase tracking-wide opacity-70">{c.soort}</span><br />{c.tekst}</li>)}
              </ul>
            )}
          </Card>
          <Card titel={<span className="flex items-center gap-1.5"><TrendingUp size={15} /> Planning & inkoop</span>}>
            <dl className="space-y-1 text-sm">
              <Rij l="Doorlooptijd" v={`${k.planning_weken} weken`} />
              <Rij l="Oplevering" v={k.planning_eind || '—'} />
              <Rij l="Vertraagde fases" v={(r.planning_rapport?.vertraagde_fases || []).join(', ') || 'geen'} />
              <Rij l="Besteld / ontvangen" v={`${fmtEUR(r.inkoop_rapport.besteld)} / ${fmtEUR(r.inkoop_rapport.ontvangen)}`} />
              <Rij l="Leverbetrouwbaarheid" v={r.inkoop_rapport.leverbetrouwbaarheid == null ? '—' : `${r.inkoop_rapport.leverbetrouwbaarheid}%`} />
              <Rij l="Vertraagde leveringen" v={r.inkoop_rapport.vertraagde_leveringen} />
            </dl>
          </Card>
          <Card titel={<span className="flex items-center gap-1.5"><Sparkles size={15} className="text-sterkcalc-accent" /> AI-managementsignalen</span>}>
            <p className="mb-2 text-[11px] text-gray-400">AI adviseert — wijzigt nooit zelf de calculatie.</p>
            <ul className="space-y-1.5 text-sm text-gray-700">
              {r.ai_signalen.map((a, i) => <li key={i} className="rounded-lg bg-sterkcalc-navy/5 px-2.5 py-1.5"><span className="text-[10px] uppercase tracking-wide text-gray-400">{a.type}</span><br />{a.advies}</li>)}
              {r.ai_signalen.length === 0 && <li className="text-gray-400">Geen signalen — project op koers.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ titel, children }) { return <div className="rounded-xl border border-gray-200 bg-white p-4"><h2 className="mb-2 text-sm font-semibold text-gray-900">{titel}</h2>{children}</div>; }
function Rij({ l, v }) { return <div className="flex justify-between gap-2"><dt className="text-gray-500">{l}</dt><dd className="text-right font-medium text-gray-800">{v}</dd></div>; }
