// pages/calculaties/ifc-review.js — IFC Review Workbench V1.0
// Eén scherm: calculator beoordeelt een volledig IFC-object (assembly.generated_item, canoniek)
// en promoot daarna gecontroleerd naar de werktafel. Geen auto-promote; werktafel blijft SSOT.
import { useEffect, useState, useCallback } from 'react';
import supabase from '@/lib/supabase';
import {
  Loader2, Box, CheckCircle2, XCircle, AlertTriangle, ArrowUpRight,
  Undo2, RefreshCw, Layers, Hash, Ruler, Gauge, Wand2,
} from 'lucide-react';

const STATE_BADGE = {
  staged: 'bg-gray-100 text-gray-600',
  in_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  promoted: 'bg-blue-100 text-blue-700',
  rejected: 'bg-rose-100 text-rose-700',
  te_genereren: 'bg-violet-100 text-violet-700',
};
const ITEM_BADGE = {
  staged: 'bg-gray-100 text-gray-500',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};

function Kpi({ label, value, tone = 'text-gray-900' }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tone}`}>{value ?? 0}</div>
    </div>
  );
}

export default function IfcReviewWorkbench() {
  const [state, setState] = useState({ kpis: {}, objecten: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null); // id van item/object in actie
  const [calcs, setCalcs] = useState([]);
  const [calcId, setCalcId] = useState('');
  const [melding, setMelding] = useState(null);

  const laad = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/assembly/ifc-review');
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Laden mislukt');
      setState(d);
    } catch (e) {
      setMelding({ type: 'err', text: e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { laad(); }, [laad]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('calculaties').select('id, naam, created_at').order('created_at', { ascending: false }).limit(50);
      setCalcs(data || []);
    })();
  }, []);

  async function post(url, body, key) {
    setBusy(key); setMelding(null);
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok || d.ok === false) throw new Error(d.error || d.reason || 'Actie mislukt');
      await laad();
      return d;
    } catch (e) {
      setMelding({ type: 'err', text: e.message });
      return null;
    } finally {
      setBusy(null);
    }
  }

  const setItem = (item_id, status) => post('/api/assembly/item-status', { item_id, status }, item_id);
  const promote = async (o) => {
    if (!calcId) { setMelding({ type: 'err', text: 'Kies eerst een doel-calculatie.' }); return; }
    const d = await post('/api/assembly/promote-object', { ifc_object_id: o.ifc_object_id, calculatie_id: calcId }, o.ifc_object_id);
    if (d) setMelding({ type: 'ok', text: `${o.ifc_entity}: ${d.gepromoot} regel(s) gepromoot${d.geblokkeerd ? `, ${d.geblokkeerd} geblokkeerd` : ''}.` });
  };
  const rollback = async (o) => {
    const d = await post('/api/assembly/rollback-object', { ifc_object_id: o.ifc_object_id }, o.ifc_object_id);
    if (d) setMelding({ type: 'ok', text: `${o.ifc_entity}: ${d.teruggedraaid} promotie(s) teruggedraaid.` });
  };
  const genereer = async (o) => {
    const d = await post('/api/assembly/generate-window', { ifc_object_id: o.ifc_object_id }, o.ifc_object_id);
    if (d) setMelding({ type: 'ok', text: `${o.ifc_entity}: ${d.staged} rekenmodel-regel(s) gegenereerd (variant ${d.variant}).` });
  };

  const k = state.kpis || {};
  const objecten = state.objecten || [];

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><Box size={20} className="text-blue-600" /> IFC Review Workbench</h1>
          <p className="text-sm text-gray-500">Beoordeel een volledig IFC-object en promoot gecontroleerd naar de werktafel. Geen auto-promote — werktafel blijft de bron van waarheid.</p>
        </div>
        <button onClick={laad} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
          <RefreshCw size={14} /> Vernieuwen
        </button>
      </div>

      {/* KPI's */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Objecten staged" value={k.objecten_staged} />
        <Kpi label="In review" value={k.objecten_in_review} tone="text-amber-600" />
        <Kpi label="Approved" value={k.objecten_approved} tone="text-emerald-600" />
        <Kpi label="Promoted" value={k.objecten_promoted} tone="text-blue-600" />
        <Kpi label="Te genereren" value={k.objecten_te_genereren} tone="text-violet-600" />
        <Kpi label="Duplicate-warnings" value={k.duplicate_warnings} tone="text-rose-600" />
        <Kpi label="Rejected items" value={k.rejected_items} tone="text-rose-600" />
      </div>

      {/* Doel-calculatie */}
      <div className="mt-5 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <span className="text-sm text-gray-600">Doel-calculatie voor promotie:</span>
        <select value={calcId} onChange={(e) => setCalcId(e.target.value)} className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm">
          <option value="">— kies een calculatie —</option>
          {calcs.map((c) => <option key={c.id} value={c.id}>{c.naam || `Calculatie ${String(c.id).slice(0, 8)}`}</option>)}
        </select>
      </div>

      {melding && (
        <div className={`mt-4 rounded-lg px-4 py-2 text-sm ${melding.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{melding.text}</div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 p-10 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : objecten.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-400">Geen staged IFC-objecten met opbouw. Genereer eerst via de assembly-engine.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {objecten.map((o) => (
            <div key={o.ifc_object_id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              {/* object-header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{o.ifc_entity}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATE_BADGE[o.object_state] || 'bg-gray-100 text-gray-600'}`}>{o.object_state}</span>
                    {o.n_dup > 0 && <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700"><AlertTriangle size={11} /> {o.n_dup} duplicate</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Hash size={11} /> {o.ifc_guid}</span>
                    {o.nlsfb_code && <span>NL-SfB {o.nlsfb_code}</span>}
                    <span className="flex items-center gap-1"><Layers size={11} /> {o.template_code} · variant <b className="text-gray-700">{o.variant_code}</b></span>
                    <span className="flex items-center gap-1"><Gauge size={11} /> conf {o.confidence ?? '—'}</span>
                    <span className="flex items-center gap-1"><Ruler size={11} /> {o.quantity_source}</span>
                    {o.ranking_confidence != null && <span>ranking {o.ranking_confidence}{o.match_reason ? ` · ${o.match_reason}` : ''}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {o.needs_generation && (
                    <button onClick={() => genereer(o)} disabled={busy === o.ifc_object_id}
                      className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white enabled:hover:bg-violet-700 disabled:bg-gray-200">
                      {busy === o.ifc_object_id ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />} Genereer kozijn-opbouw
                    </button>
                  )}
                  {!o.needs_generation && (
                  <button
                    onClick={() => promote(o)}
                    disabled={!o.promotable || !calcId || busy === o.ifc_object_id}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                    title={!o.promotable ? 'Alle items moeten approved/rejected zijn (geen open review)' : !calcId ? 'Kies eerst een calculatie' : ''}>
                    {busy === o.ifc_object_id ? <Loader2 className="animate-spin" size={14} /> : <ArrowUpRight size={14} />} Promote object
                  </button>
                  )}
                  {o.n_promoted > 0 && (
                    <button onClick={() => rollback(o)} disabled={busy === o.ifc_object_id}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
                      <Undo2 size={14} /> Rollback
                    </button>
                  )}
                </div>
              </div>

              {/* items */}
              <div className="divide-y divide-gray-50">
                {o.needs_generation && (
                  <p className="px-4 py-3 text-sm text-violet-700">Rekenmodel-route ({o.quantity_source}) · variant <b>{o.variant_code}</b> — genereer eerst de opbouw om te beoordelen.</p>
                )}
                {(o.items || []).map((it) => (
                  <div key={it.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ITEM_BADGE[it.status] || 'bg-gray-100 text-gray-500'}`}>{it.status}</span>
                    <span className="w-36 shrink-0 text-sm font-medium text-gray-800">{it.functie}</span>
                    <span className="flex-1 truncate text-sm text-gray-600">{it.omschrijving || it.combi_code} <span className="text-gray-400">· {it.combi_code}</span></span>
                    <span className="text-sm tabular-nums text-gray-700">{it.hoeveelheid} {it.eenheid}</span>
                    <span className="w-12 text-right text-xs text-gray-400">{it.confidence}</span>
                    {it.duplicate && <span className="flex items-center gap-1 text-xs text-rose-600" title="Bestaat al als werktafelregel"><AlertTriangle size={12} /> dup</span>}
                    {it.promoted && <span className="text-xs text-blue-600">gepromoot</span>}
                    {!it.promoted && (
                      <span className="flex items-center gap-1">
                        <button onClick={() => setItem(it.id, 'approved')} disabled={busy === it.id || it.status === 'approved'}
                          className="rounded-md p-1 text-emerald-600 enabled:hover:bg-emerald-50 disabled:opacity-30" title="Approve">
                          <CheckCircle2 size={17} />
                        </button>
                        <button onClick={() => setItem(it.id, 'rejected')} disabled={busy === it.id || it.status === 'rejected'}
                          className="rounded-md p-1 text-rose-600 enabled:hover:bg-rose-50 disabled:opacity-30" title="Reject">
                          <XCircle size={17} />
                        </button>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
