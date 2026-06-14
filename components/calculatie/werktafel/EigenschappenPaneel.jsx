// components/calculatie/werktafel/EigenschappenPaneel.jsx
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { zoekStabu } from '@/services/werktafel';
import { computeRow, fmtEUR } from '@/lib/calc/werktafelTotals';

export default function EigenschappenPaneel({ row, onPatchRow, onApplyStabu }) {
  const [term, setTerm] = useState('');
  const [hits, setHits] = useState([]);
  const [busy, setBusy] = useState(false);
  const deb = useRef();

  useEffect(() => {
    if (!term) {
      setHits([]);
      return;
    }
    clearTimeout(deb.current);
    deb.current = setTimeout(async () => {
      setBusy(true);
      try {
        setHits(await zoekStabu(term));
      } catch {
        setHits([]);
      } finally {
        setBusy(false);
      }
    }, 250);
    return () => clearTimeout(deb.current);
  }, [term]);

  if (!row) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-gray-400">
        Selecteer een regel om eigenschappen te bewerken.
      </div>
    );
  }

  const c = computeRow(row);
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

      <div className="mt-3 border-t border-gray-100 pt-2">
        <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Search size={13} /> STABU-post zoeken
        </div>
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
