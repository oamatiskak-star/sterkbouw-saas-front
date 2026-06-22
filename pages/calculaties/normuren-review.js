// pages/calculaties/normuren-review.js — Normuren Review/Approve V1.0 (Fase 4)
// Beoordeelt geïmporteerde normuren (normuren.staging_regel) en bouwt na approval de
// consensuslaag (normuren.normuur) via normuren.build_normuren(). Geen auto-approval.
import { useEffect, useState, useCallback } from 'react';
import {
  Loader2, Ruler, CheckCircle2, XCircle, AlertTriangle, Hammer, RefreshCw, Link2, Layers3,
} from 'lucide-react';

const STATUS_BADGE = {
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

export default function NormurenReview() {
  const [data, setData] = useState({ kpis: {}, batches: [], regels: [], totaal_filter: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [batch, setBatch] = useState('');
  const [status, setStatus] = useState('staged');
  const [melding, setMelding] = useState(null);

  const laad = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (batch) qs.set('batch', batch);
      if (status) qs.set('status', status);
      qs.set('limit', '300');
      const r = await fetch(`/api/normuren/review?${qs.toString()}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Laden mislukt');
      setData(d);
    } catch (e) {
      setMelding({ type: 'err', text: e.message });
    } finally {
      setLoading(false);
    }
  }, [batch, status]);

  useEffect(() => { laad(); }, [laad]);

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

  const setItem = (item_id, st, accept_combi = false) => post('/api/normuren/set-status', { item_id, status: st, accept_combi }, item_id);
  const build = async () => {
    const d = await post('/api/normuren/build', {}, 'build');
    if (d) setMelding({ type: 'ok', text: `Normurenlaag gebouwd: ${d.verwerkt} regel(s) verwerkt · ${d.normuren_totaal} normuren totaal.` });
  };

  const k = data.kpis || {};
  const regels = data.regels || [];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><Ruler size={20} className="text-blue-600" /> Normuren Review</h1>
          <p className="text-sm text-gray-500">Beoordeel geïmporteerde normuren en bouw na akkoord de consensuslaag. Geen auto-approval — elke regel expliciet.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={laad} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"><RefreshCw size={14} /> Vernieuwen</button>
          <button onClick={build} disabled={busy === 'build'} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white enabled:hover:bg-blue-700 disabled:bg-gray-200">
            {busy === 'build' ? <Loader2 className="animate-spin" size={14} /> : <Layers3 size={14} />} Bouw normurenlaag
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Kpi label="Staged" value={k.staged} />
        <Kpi label="Approved" value={k.approved} tone="text-emerald-600" />
        <Kpi label="Rejected" value={k.rejected} tone="text-rose-600" />
        <Kpi label="Met suggestie" value={k.met_suggestie} tone="text-blue-600" />
        <Kpi label="High-confidence" value={k.high_confidence} tone="text-blue-600" />
        <Kpi label="Conflicten" value={k.conflicten} tone="text-amber-600" />
        <Kpi label="Normuren" value={k.normuren_approved} tone="text-emerald-600" />
      </div>

      {/* filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <span className="text-sm text-gray-600">Bron:</span>
        <select value={batch} onChange={(e) => setBatch(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm">
          <option value="">Alle bronnen</option>
          {(data.batches || []).map((b) => <option key={b.id} value={b.id}>{b.source_file} ({b.staged}/{b.approved}/{b.rejected})</option>)}
        </select>
        <span className="ml-2 text-sm text-gray-600">Status:</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm">
          <option value="staged">Staged</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">Alle</option>
        </select>
        <span className="ml-auto text-xs text-gray-400">{regels.length} van {data.totaal_filter} getoond</span>
      </div>

      {melding && <div className={`mt-4 rounded-lg px-4 py-2 text-sm ${melding.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{melding.text}</div>}

      {loading ? (
        <div className="flex items-center gap-2 p-10 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : regels.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-400">Geen regels voor dit filter.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Omschrijving</th>
                <th className="px-3 py-2">STABU</th>
                <th className="px-3 py-2 text-right">u/eenh.</th>
                <th className="px-3 py-2">Eenh.</th>
                <th className="px-3 py-2 text-right">n</th>
                <th className="px-3 py-2">Suggestie (combi)</th>
                <th className="px-3 py-2 text-right">match</th>
                <th className="px-3 py-2 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {regels.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/60">
                  <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status] || ''}`}>{r.status}</span></td>
                  <td className="px-3 py-2">
                    <div className="max-w-xs truncate text-gray-800" title={r.omschrijving}>{r.omschrijving || r.regelcode}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{r.regelcode}</span>
                      {r.is_correctie && <span className="text-amber-600">correctie</span>}
                      {r.review_note && r.review_note.toLowerCase().includes('conflict') && <span className="flex items-center gap-0.5 text-amber-600"><AlertTriangle size={11} /> conflict</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{r.stabu_code}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-800">{r.uren_per_eenheid}</td>
                  <td className="px-3 py-2 text-gray-600">{r.eenheid}</td>
                  <td className="px-3 py-2 text-right text-gray-500" title="aantal waarnemingen met zelfde STABU+regelcode+eenheid">{r.n_waarnemingen}</td>
                  <td className="px-3 py-2">
                    {r.suggested_combi_code ? (
                      <span className="flex items-center gap-1 text-gray-700"><Link2 size={12} className="text-blue-500" />{r.suggested_naam || r.suggested_combi_code} <span className="text-gray-400">· {r.suggested_combi_code}</span></span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-gray-500">{r.match_score ?? ''}{r.high_confidence ? ' ★' : ''}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      {r.status !== 'approved' && r.suggested_combi_code && (
                        <button onClick={() => setItem(r.id, 'approved', true)} disabled={busy === r.id}
                          className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40" title="Approve + combi koppelen">
                          ✓ + combi
                        </button>
                      )}
                      {r.status !== 'approved' && (
                        <button onClick={() => setItem(r.id, 'approved', false)} disabled={busy === r.id}
                          className="rounded-md p-1 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40" title="Approve (zonder combi)"><CheckCircle2 size={17} /></button>
                      )}
                      {r.status !== 'rejected' && (
                        <button onClick={() => setItem(r.id, 'rejected', false)} disabled={busy === r.id}
                          className="rounded-md p-1 text-rose-600 hover:bg-rose-50 disabled:opacity-40" title="Reject"><XCircle size={17} /></button>
                      )}
                      {r.status !== 'staged' && (
                        <button onClick={() => setItem(r.id, 'staged', false)} disabled={busy === r.id}
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-40" title="Terug naar staged"><Hammer size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
