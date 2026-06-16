// components/calculatie/werktafel/EigenschappenPaneel.jsx
import { useEffect, useRef, useState } from 'react';
import { Search, Tag, Loader2, Check } from 'lucide-react';
import { zoekStabu } from '@/services/werktafel';
import { computeRow, fmtEUR } from '@/lib/calc/werktafelTotals';
import { zoekLeveranciersPrijzen } from '@/services/leveranciersprijzen';

export default function EigenschappenPaneel({ row, priceFactor = 1, stabuFilter = null, onPatchRow, onApplyStabu }) {
  const [term, setTerm] = useState('');
  const [hits, setHits] = useState([]);
  const [busy, setBusy] = useState(false);
  const deb = useRef();
  const filterKey = stabuFilter ? stabuFilter.join(',') : '';

  useEffect(() => {
    if (!term && !stabuFilter) {
      setHits([]);
      return;
    }
    clearTimeout(deb.current);
    deb.current = setTimeout(async () => {
      setBusy(true);
      try {
        setHits(await zoekStabu(term, stabuFilter));
      } catch {
        setHits([]);
      } finally {
        setBusy(false);
      }
    }, 250);
    return () => clearTimeout(deb.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, filterKey]);

  if (!row) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-gray-400">
        Selecteer een regel om eigenschappen te bewerken.
      </div>
    );
  }

  const c = computeRow(row, priceFactor);
  const isCombi = row.type === 'combi' || row.is_combi;
  const set = (field) => (e) => onPatchRow(row.id, { [field]: e.target.value });
  const setNum = (field) => (e) => onPatchRow(row.id, { [field]: e.target.value === '' ? 0 : Number(e.target.value) });

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Regel-eigenschappen</div>

      <Field label="Omschrijving">
        <input value={row.omschrijving || ''} onChange={set('omschrijving')} className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="STABU-code">
          <input value={row.stabu_code || ''} onChange={set('stabu_code')} className={inputCls} />
        </Field>
        <Field label="Eenheid">
          <input value={row.eenheid || ''} onChange={set('eenheid')} className={inputCls} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Hoeveelheid">
          <input type="number" value={row.hoeveelheid} onChange={setNum('hoeveelheid')} className={inputCls} />
        </Field>
        <Field label="Normuren / eenheid">
          <input
            type="number"
            value={row.norm ?? ''}
            onChange={(e) => onPatchRow(row.id, { norm: e.target.value === '' ? null : Number(e.target.value) })}
            className={inputCls}
          />
        </Field>
      </div>

      {!isCombi ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Materiaal €/e">
              <input type="number" value={row.materiaalprijs} onChange={setNum('materiaalprijs')} className={inputCls} />
            </Field>
            <Field label="Arbeid €/e">
              <input type="number" value={row.arbeidsprijs} onChange={setNum('arbeidsprijs')} className={inputCls} />
            </Field>
            <Field label="Materieel €/e">
              <input type="number" value={row.materieelprijs} onChange={setNum('materieelprijs')} className={inputCls} />
            </Field>
          </div>
          <PrijsKoppelaar row={row} onPatchRow={onPatchRow} />
        </>
      ) : (
        <div className="rounded bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700">
          Combi-regel: prijzen komen uit {(row._components || []).length} onderliggende componenten.
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Field label="Opslag %">
          <input type="number" value={row.opslag_perc} onChange={setNum('opslag_perc')} className={inputCls} />
        </Field>
        <Field label="Status">
          <select value={row.status} onChange={set('status')} className={inputCls}>
            {['concept', 'definitief', 'optie', 'vervallen'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-1 rounded bg-gray-50 px-2 py-1.5 text-xs text-gray-600">
        Kostprijs <strong className="tabular-nums">{fmtEUR(c.kostprijs)}</strong> · Verkoop{' '}
        <strong className="tabular-nums">{fmtEUR(c.verkoopprijs)}</strong>
      </div>

      {/* Increment 4 — aannames: herkomst + gebruikte rekenmodel-inputs (reproduceerbaarheid). */}
      {Array.isArray(row.meta?.aannames) && row.meta.aannames.length > 0 && (
        <div className="mt-3 rounded border border-sterkcalc-blue/20 bg-sterkcalc-blue/[0.03] px-2 py-2">
          <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-sterkcalc-navy">
            Aannames
            {row.meta?.bron?.label && <span className="font-normal normal-case text-gray-400">— uit rekenmodel “{row.meta.bron.label}”</span>}
          </div>
          <dl className="space-y-0.5">
            {row.meta.aannames.map((a) => (
              <div key={a.key} className="flex items-baseline justify-between gap-2 text-[11px]">
                <dt className="text-gray-500">{a.label}</dt>
                <dd className="tabular-nums font-medium text-gray-700">{a.waarde}{a.eenheid ? ` ${a.eenheid}` : ''}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-1 text-[10px] text-gray-400">Vastgelegd bij het genereren — pas de regel handmatig aan als de aanname wijzigt.</p>
        </div>
      )}

      <div className="mt-3 border-t border-gray-100 pt-2">
        <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Search size={13} /> STABU-post zoeken
        </div>
        {stabuFilter ? (
          <div className="mb-1 text-[11px] text-indigo-600">Gefilterd op hoofdstuk {stabuFilter.join(', ')} (van dit hoofdstuk)</div>
        ) : null}
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="code of omschrijving…"
          className={inputCls}
        />
        {busy && <div className="mt-1 text-[11px] text-gray-400">zoeken…</div>}
        <div className="mt-1 max-h-60 overflow-y-auto">
          {hits.map((p) => (
            <button
              key={p.code}
              onClick={() => {
                onApplyStabu(row.id, p);
                setTerm('');
                setHits([]);
              }}
              className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-indigo-50"
            >
              <span className="font-mono text-gray-500">{p.code}</span> {p.omschrijving}
              <span className="block text-[10px] text-gray-400">
                {p.eenheid} · mat €{p.materiaalprijs} · arb €{p.arbeidsprijs}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-400';

function Field({ label, children }) {
  return (
    <label className="mt-2 block">
      <span className="mb-0.5 block text-[11px] text-gray-500">{label}</span>
      {children}
    </label>
  );
}

// Increment 1c+ — koppel een echte leveranciersprijs (Bouwmaat-catalogus) aan de regel:
// zoek artikel → klik → materiaalprijs wordt de nettoprijs, met herkomst in meta.prijsbron.
function PrijsKoppelaar({ row, onPatchRow }) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [hits, setHits] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const deb = useRef();
  const bron = row.meta?.prijsbron || null;

  useEffect(() => {
    if (!open || !term.trim()) { setHits([]); return; }
    clearTimeout(deb.current);
    deb.current = setTimeout(async () => {
      setBusy(true); setErr(null);
      try {
        const d = await zoekLeveranciersPrijzen(term);
        setHits(d.resultaten || []);
      } catch (e) { setErr(e.message || 'Zoeken mislukt'); setHits([]); }
      finally { setBusy(false); }
    }, 300);
    return () => clearTimeout(deb.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, open]);

  const koppel = (a) => {
    onPatchRow(row.id, {
      materiaalprijs: Number(a.netto) || 0,
      eenheid: row.eenheid || 'st',
      meta: {
        ...(row.meta || {}),
        prijsbron: { leverancier: 'Bouwmaat', catalogus: '202543', peildatum: '2025-11', code: a.code, omschrijving: a.omschrijving, netto: Number(a.netto) || 0, eenheid: a.eenheid || 'PCE' },
      },
    });
    setOpen(false); setTerm(''); setHits([]);
  };

  return (
    <div className="mt-2 rounded border border-emerald-200 bg-emerald-50/40 px-2 py-1.5">
      {bron ? (
        <div className="flex items-start gap-1 text-[11px] text-emerald-800">
          <Check size={12} className="mt-0.5 shrink-0" />
          <span>
            Materiaalprijs uit <strong>{bron.leverancier}</strong> {bron.code} — €{Number(bron.netto).toFixed(2)} / {bron.eenheid}
            <span className="block text-[10px] text-emerald-600/80">{bron.omschrijving} · catalogus {bron.catalogus} ({bron.peildatum})</span>
            <button onClick={() => setOpen((v) => !v)} className="mt-0.5 text-emerald-700 underline hover:text-emerald-900">wijzigen</button>
          </span>
        </div>
      ) : (
        <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900">
          <Tag size={12} /> Bouwmaat-prijs koppelen
        </button>
      )}
      {open && (
        <div className="mt-1.5">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="artikel of code… (bv. 'glaslat hardhout')"
            className={inputCls}
            autoFocus
          />
          {busy && <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400"><Loader2 size={11} className="animate-spin" /> zoeken in catalogus…</div>}
          {err && <div className="mt-1 text-[10px] text-red-600">{err}</div>}
          <div className="mt-1 max-h-56 overflow-y-auto">
            {hits.map((a) => (
              <button key={a.code} onClick={() => koppel(a)} className="block w-full rounded px-2 py-1 text-left text-[11px] hover:bg-emerald-100/60">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate">{a.omschrijving}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-emerald-800">€{Number(a.netto).toFixed(2)}</span>
                </span>
                <span className="block text-[10px] text-gray-400">{a.code} · {a.groep} · per {a.eenheid} · btw {a.btw}%</span>
              </button>
            ))}
            {!busy && term.trim() && hits.length === 0 && !err && <div className="px-2 py-1 text-[10px] text-gray-400">Geen artikelen gevonden.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
