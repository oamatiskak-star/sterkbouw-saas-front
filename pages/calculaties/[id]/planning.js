// pages/calculaties/[id]/planning.js — Sprint 7 Planning Engine: planning uit de werktafel.
// Dashboard: projectinfo · gantt · resources/materiaal · waarschuwingen + AI-assist · versies · export.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, CalendarDays, Save, FileDown, Sheet, AlertTriangle, Sparkles, Layers, History, Check } from 'lucide-react';
import { calcData } from '@/services/calcModules';
import { berekenPlanning, STANDAARD_CONFIG, PROJECTTYPE_TEMPLATES } from '@/lib/calc/planningEngine';
import { loadPlanningVersies, laatsteConfig, bewaarPlanningVersie, activeerVersie } from '@/services/planning';
import { planningNaarPdf, planningNaarCsv } from '@/lib/planning/exportPlanning';

const datNL = (d) => (d ? new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' }) : '—');
const PTYPES = Object.keys(PROJECTTYPE_TEMPLATES);

export default function PlanningPagina() {
  const router = useRouter();
  const { id } = router.query;
  const [base, setBase] = useState(null); // {chapters, rows, calculatie}
  const [config, setConfig] = useState(STANDAARD_CONFIG);
  const [versies, setVersies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [openFase, setOpenFase] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const d = await calcData(id);
        setBase({ chapters: d.chapters, rows: d.rows, calculatie: d.calculatie });
        const cfg = await laatsteConfig(id).catch(() => null);
        setConfig({ ...STANDAARD_CONFIG, projecttype: d.calculatie?.project_type || STANDAARD_CONFIG.projecttype, ...(cfg || {}) });
        setVersies(await loadPlanningVersies(id).catch(() => []));
      } finally { setLoading(false); }
    })();
  }, [id]);

  const planning = useMemo(() => (base ? berekenPlanning(base.chapters, base.rows, config) : null), [base, config]);

  const set = (k, v) => setConfig((c) => ({ ...c, [k]: v }));
  const bewaren = async () => { setBusy(true); try { await bewaarPlanningVersie(id, config, planning, null); setVersies(await loadPlanningVersies(id)); window.alert('Planningversie opgeslagen.'); } catch (e) { window.alert(e.message || e); } finally { setBusy(false); } };
  const herstel = async (v) => { setConfig({ ...STANDAARD_CONFIG, ...(v.config || {}) }); await activeerVersie(v.id, id); setVersies(await loadPlanningVersies(id)); };

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;

  const s = planning?.samenvatting || {};
  const totDagen = Math.max(1, s.totaal_dagen || 1);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <Link href={`/calculaties/${id}/werktafel`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ChevronLeft size={15} /> Werktafel</Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><CalendarDays size={20} className="text-sterkcalc-blue" /> Planning</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={bewaren} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-sterkcalc-navy2 disabled:opacity-60">{busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Versie opslaan</button>
          <button onClick={() => planningNaarPdf({ planning, calculatie: base.calculatie })} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"><FileDown size={14} /> PDF</button>
          <button onClick={() => planningNaarCsv({ planning, calculatie: base.calculatie })} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"><Sheet size={14} /> Excel</button>
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-500">Automatisch afgeleid uit de werktafel — geen dubbele invoer. Pas capaciteit/type aan; planning rekent direct mee.</p>

      {/* Projectinfo + config */}
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-3 lg:grid-cols-6">
        <Sel label="Projecttype" value={config.projecttype} onChange={(v) => set('projecttype', v)} options={PTYPES} />
        <Inp label="Startdatum" type="date" value={config.start_datum || ''} onChange={(v) => set('start_datum', v || null)} />
        <Inp label="Monteurs" type="number" value={config.monteurs} onChange={(v) => set('monteurs', Number(v) || 0)} />
        <Inp label="Uren/dag" type="number" value={config.uren_per_dag} onChange={(v) => set('uren_per_dag', Number(v) || 0)} />
        <Inp label="Uurtarief (€)" type="number" value={config.uurtarief} onChange={(v) => set('uurtarief', Number(v) || 0)} />
        <Inp label="Oplevering (dagen)" type="number" value={config.oplevering_dagen} onChange={(v) => set('oplevering_dagen', Number(v) || 0)} />
      </div>

      {/* Samenvatting KPI */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {[['Doorlooptijd', `${s.totaal_weken || 0} wk`], ['Werkdagen', s.totaal_dagen || 0], ['Manuren', `${s.totaal_uren || 0} u`], ['Start', datNL(s.start_datum)], ['Oplevering', datNL(s.eind_datum)], ['Bottleneck', s.bottleneck || '—']].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-gray-200 bg-white p-2.5"><div className="text-[10px] uppercase tracking-wide text-gray-400">{l}</div><div className="truncate text-sm font-semibold text-gray-900">{v}</div></div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Gantt + resources */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Gantt — fasering</h2>
            {planning.fases.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">Nog geen werkuren in de werktafel.</p>
            ) : (
              <div className="space-y-2">
                {planning.fases.map((f) => (
                  <div key={f.key}>
                    <button onClick={() => setOpenFase(openFase === f.key ? null : f.key)} className="flex w-full items-center gap-3 text-left">
                      <div className="w-36 shrink-0 truncate text-sm text-gray-700">{f.label}</div>
                      <div className="relative h-6 flex-1 rounded bg-gray-100">
                        <div className={`absolute top-0 h-6 rounded ${f.kritiek ? 'bg-sterkcalc-accent' : 'bg-sterkcalc-blue/80'}`} style={{ left: `${(f.start_dag / totDagen) * 100}%`, width: `${(f.duur_dagen / totDagen) * 100}%` }} title={`${datNL(f.start_datum)} – ${datNL(f.eind_datum)}`} />
                      </div>
                      <div className="w-24 shrink-0 text-right text-xs text-gray-400">{f.duur_dagen}d · {f.uren}u</div>
                    </button>
                    {openFase === f.key && (
                      <div className="ml-36 mt-1 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                        <div className="mb-1">{datNL(f.start_datum)} – {datNL(f.eind_datum)} · onderdelen: {f.chapters.map((c) => `${c.naam} (${c.uren}u)`).join(', ') || '—'}</div>
                        {f.materialen.length > 0 && <div><span className="font-medium text-gray-700">Materiaal (lever ~{datNL(f.start_datum)}):</span> {f.materialen.slice(0, 8).map((m) => `${m.omschrijving} ${m.hoeveelheid}${m.eenheid}`).join(', ')}{f.materialen.length > 8 ? ` +${f.materialen.length - 8}` : ''}</div>}
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-400"><span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-3 rounded bg-sterkcalc-accent" /> kritiek pad</span></div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><Layers size={15} /> Resources & duurberekening</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-gray-400"><th className="py-1 text-left">Fase</th><th className="py-1 text-right">Uren</th><th className="py-1 text-right">Capaciteit</th><th className="py-1 text-right">Werkdagen</th><th className="py-1 text-right">Materialen</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {planning.fases.map((f) => (
                  <tr key={f.key}><td className="py-1.5 text-gray-800">{f.label}</td><td className="py-1.5 text-right tabular-nums">{f.uren}</td><td className="py-1.5 text-right tabular-nums text-gray-400">{s.capaciteit_per_dag} u/dag</td><td className="py-1.5 text-right tabular-nums font-medium">{f.duur_dagen}</td><td className="py-1.5 text-right tabular-nums text-gray-500">{f.materialen.length}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-400">Duur = uren ÷ ({config.monteurs} monteurs × {config.uren_per_dag} u/dag), naar boven afgerond op werkdagen.</p>
          </div>
        </div>

        {/* Waarschuwingen + AI */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><AlertTriangle size={15} className="text-amber-500" /> Waarschuwingen</h2>
            {planning.waarschuwingen.length === 0 ? <p className="text-sm text-gray-400">Geen knelpunten.</p> : (
              <ul className="space-y-1.5 text-sm">
                {planning.waarschuwingen.map((w, i) => <li key={i} className={`rounded-lg px-2.5 py-1.5 ${w.niveau === 'fout' ? 'bg-red-50 text-red-700' : w.niveau === 'risico' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-600'}`}>{w.tekst}</li>)}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><Sparkles size={15} className="text-sterkcalc-accent" /> AI-assist (advies)</h2>
            <p className="mb-2 text-[11px] text-gray-400">AI signaleert alleen — wijzigt nooit zelf planning of capaciteit.</p>
            <ul className="space-y-1.5 text-sm text-gray-700">
              {planning.ai_signalen.map((a, i) => <li key={i} className="rounded-lg bg-sterkcalc-navy/5 px-2.5 py-1.5">{a.tekst}</li>)}
              {planning.ai_signalen.length === 0 && <li className="text-gray-400">Geen signalen.</li>}
            </ul>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><History size={15} /> Versies</h2>
            {versies.length === 0 ? <p className="text-sm text-gray-400">Nog geen opgeslagen versies.</p> : (
              <ul className="space-y-1.5 text-sm">
                {versies.map((v) => (
                  <li key={v.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5">
                    <span className="flex items-center gap-1.5">{v.is_actief && <Check size={13} className="text-sterkcalc-accent" />}{v.naam} <span className="text-xs text-gray-400">· {v.snapshot?.samenvatting?.totaal_weken || '?'} wk</span></span>
                    <button onClick={() => herstel(v)} className="text-xs text-sterkcalc-blue hover:underline">Herstel</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Inp({ label, type = 'text', value, onChange }) {
  return <label className="block"><span className="mb-1 block text-[11px] font-medium text-gray-500">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm" /></label>;
}
function Sel({ label, value, onChange, options }) {
  return <label className="block"><span className="mb-1 block text-[11px] font-medium text-gray-500">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm capitalize">{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></label>;
}
