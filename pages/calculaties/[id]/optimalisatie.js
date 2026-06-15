// pages/calculaties/[id]/optimalisatie.js — P7.5 Scenario-vergelijker + AI-optimalisatie.
// Scenario's (Budget/Standaard/Premium): kostprijs/verkoop/winst/marge vergelijken + winst-opslag
// toepassen. AI-optimalisatie: goedkopere combi-alternatieven per regel + besparing + toepassen.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Loader2, BarChart3, Sparkles, Check, ArrowRight, Table2, TrendingDown } from 'lucide-react';
import { loadWerktafel, saveOpslagen } from '@/services/werktafel';
import { alleScenarios } from '@/lib/calc/scenarios';
import { loadOptimalisaties, pasAlternatiefToe } from '@/services/optimalisatie';
import { fmtEUR, fmtNum } from '@/lib/calc/werktafelTotals';

export default function OptimalisatiePagina() {
  const router = useRouter();
  const { id } = router.query;
  const [tab, setTab] = useState('scenario');
  const [wt, setWt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opts, setOpts] = useState(null);
  const [busy, setBusy] = useState('');
  const [toegepast, setToegepast] = useState(null);

  const herlaad = async () => {
    const d = await loadWerktafel(id);
    setWt(d);
    setOpts(await loadOptimalisaties(d.rows).catch(() => []));
  };
  useEffect(() => { if (!id) return; herlaad().catch(console.error).finally(() => setLoading(false)); }, [id]);

  const scenarios = useMemo(() => (wt ? alleScenarios(wt.rows, wt.opslagen) : []), [wt]);
  const maxVerkoop = Math.max(1, ...scenarios.map((s) => s.verkoop_excl));
  const totaalBesparing = (opts || []).reduce((s, o) => s + o.besparing, 0);

  const pasScenarioToe = async (s) => {
    setBusy('scenario-' + s.key);
    try {
      await saveOpslagen(id, { ...wt.opslagen, winst: s.winstPct });
      setToegepast(`Winst-opslag ${fmtNum(s.winstPct)}% (${s.label}) toegepast op de calculatie.`);
      await herlaad();
    } finally { setBusy(''); }
  };

  const pasAltToe = async (o) => {
    setBusy('alt-' + o.rowId);
    try {
      await pasAlternatiefToe(o.rowId, o.alt);
      await herlaad();
    } finally { setBusy(''); }
  };

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><Sparkles size={20} className="text-sterkcalc-accent" /> Optimalisatie</h1>
          <p className="text-sm text-gray-500">Vergelijk scenario&apos;s en laat AI goedkopere alternatieven voorstellen — jij beslist.</p>
        </div>
        <Link href={`/calculaties/${id}/werktafel`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"><Table2 size={14} /> Werktafel</Link>
      </div>

      <div className="mt-4 flex gap-1 border-b border-gray-200">
        {[['scenario', 'Scenario-vergelijker', BarChart3], ['ai', 'AI-optimalisatie', Sparkles]].map(([k, l, Ic]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium ${tab === k ? 'border-sterkcalc-navy text-sterkcalc-navy' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            <Ic size={14} /> {l}
          </button>
        ))}
      </div>

      {toegepast && <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"><Check size={14} className="mr-1 inline" /> {toegepast}</div>}

      {/* SCENARIO */}
      {tab === 'scenario' && (
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {scenarios.map((s) => (
              <div key={s.key} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{s.label}</span>
                  <span className="text-[11px] text-gray-400">materiaal ×{fmtNum(s.materiaal / (scenarios[1]?.materiaal || s.materiaal || 1), 2)}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-sterkcalc-blue" style={{ width: `${(s.verkoop_excl / maxVerkoop) * 100}%` }} />
                </div>
                <dl className="mt-3 space-y-1 text-xs">
                  <Rij label="Kostprijs" v={fmtEUR(s.kostprijs)} />
                  <Rij label="Verkoop (excl.)" v={fmtEUR(s.verkoop_excl)} sterk />
                  <Rij label="Winst" v={fmtEUR(s.winst)} />
                  <Rij label="Marge" v={`${fmtNum(s.margePct, 1)}%`} />
                </dl>
                <button onClick={() => pasScenarioToe(s)} disabled={busy === 'scenario-' + s.key} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-sterkcalc-navy px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60">
                  {busy === 'scenario-' + s.key ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Winst-opslag toepassen
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-gray-400">Scenario past de <strong>winst-opslag</strong> toe op de calculatie (user-controlled). Materiaalkeuze (kwaliteit) pas je per regel aan via AI-optimalisatie.</p>
        </div>
      )}

      {/* AI-OPTIMALISATIE */}
      {tab === 'ai' && (
        <div className="mt-4">
          <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
            <span className="text-sm text-gray-600">{(opts || []).length} optimalisatie(s) gevonden</span>
            {totaalBesparing > 0 && <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700"><TrendingDown size={15} /> Potentiële besparing {fmtEUR(totaalBesparing)}</span>}
          </div>
          {(opts || []).length === 0 ? (
            <p className="rounded-lg bg-gray-50 px-3 py-8 text-center text-sm text-gray-400">Geen goedkopere alternatieven gevonden — of de werktafel bevat nog geen combi-regels.</p>
          ) : (
            <div className="space-y-2">
              {opts.map((o) => (
                <div key={o.rowId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-gray-800">{o.omschrijving}</div>
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      <span className="line-through">{fmtEUR(o.huidigUnit)}/e</span> → <span className="font-medium text-emerald-700">{fmtEUR(o.altUnit)}/e</span> · {o.alt.naam}
                      <span className="ml-1 rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">{fmtNum(o.deltaPct, 0)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-emerald-700">−{fmtEUR(o.besparing)}</span>
                    <button onClick={() => pasAltToe(o)} disabled={busy === 'alt-' + o.rowId} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60">
                      {busy === 'alt-' + o.rowId ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />} Toepassen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[11px] text-gray-400">Alternatieven komen uit dezelfde subcategorie. Toepassen wisselt de combi om (incl. componenten + STABU). De marge/winst raakt AI nooit zelf aan.</p>
        </div>
      )}
    </div>
  );
}

function Rij({ label, v, sterk }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`tabular-nums ${sterk ? 'font-semibold text-sterkcalc-navy' : 'text-gray-700'}`}>{v}</dd>
    </div>
  );
}
