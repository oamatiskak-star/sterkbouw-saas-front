// components/calculatie/rekenmodel/RekenmodelConfigurator.jsx — P7.2
// De mini-calculator-UI: object + keuzes → live hoeveelheden → "Vul werktafel".
// Max 3 basiskeuzes zichtbaar; technische parameters onder "Afwijkingen / Geavanceerd".
// De gebruiker ziet GEEN STABU, GEEN componenten, GEEN combi-codes — alleen het object.
import { useMemo, useState } from 'react';
import { Loader2, SlidersHorizontal, Check, X, Calculator } from 'lucide-react';
import { berekenVoorbeeld, pasModelToe } from '@/services/rekenmodellen';

export default function RekenmodelConfigurator({ calculatieId, objectKey, onClose, onKlaar }) {
  const voorbeeld0 = useMemo(() => berekenVoorbeeld(objectKey, {}), [objectKey]);
  const model = voorbeeld0?.model;
  const [values, setValues] = useState(() => {
    const v = {};
    for (const i of [...(model?.inputs || []), ...(model?.advancedInputs || [])]) v[i.key] = i.default;
    return v;
  });
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resultaat, setResultaat] = useState(null);

  const set = (k, val) => setValues((s) => ({ ...s, [k]: val }));
  const live = useMemo(() => berekenVoorbeeld(objectKey, values), [objectKey, values]);

  if (!model) return null;

  const maatInputs = model.inputs.filter((i) => i.groep === 'maat');
  const basisKeuzes = model.inputs.filter((i) => i.groep === 'basis').slice(0, 3);

  const vul = async () => {
    setBusy(true);
    try {
      const res = await pasModelToe(calculatieId, objectKey, values, model.label);
      setResultaat(res);
      onKlaar && onKlaar(res);
    } catch (e) {
      window.alert('Mislukt: ' + (e.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-12" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-sterkcalc-navy"><Calculator size={16} className="text-sterkcalc-blue" /> {model.label} — rekenmodel</span>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X size={16} /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {/* Maatvoering */}
          {maatInputs.length > 0 && (
            <div className="mb-4">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Maatvoering</div>
              <div className="grid grid-cols-3 gap-2">
                {maatInputs.map((i) => (
                  <label key={i.key} className="block text-[11px] text-gray-500">{i.label}{i.eenheid ? ` (${i.eenheid})` : ''}
                    <input type="number" step="0.01" value={values[i.key]} onChange={(e) => set(i.key, e.target.value)} className="mt-0.5 block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Basiskeuzes (max 3) */}
          <div className="mb-3">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Keuzes</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {basisKeuzes.map((i) => (
                <Keuze key={i.key} input={i} waarde={values[i.key]} onChange={(val) => set(i.key, val)} />
              ))}
            </div>
          </div>

          {/* Afwijkingen / Geavanceerd */}
          {model.advancedInputs?.length > 0 && (
            <div className="mb-3 rounded-lg border border-gray-200">
              <button onClick={() => setAdvanced((a) => !a)} className="flex w-full items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
                <SlidersHorizontal size={13} /> Afwijkingen / geavanceerd {advanced ? '▾' : '▸'}
                <span className="ml-auto text-[11px] text-gray-400">basis blijft automatisch ingevuld</span>
              </button>
              {advanced && (
                <div className="grid grid-cols-1 gap-2 border-t border-gray-100 p-3 sm:grid-cols-2">
                  {model.advancedInputs.map((i) => (
                    <Keuze key={i.key} input={i} waarde={values[i.key]} onChange={(val) => set(i.key, val)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Live uitkomst */}
          <div className="rounded-lg bg-sterkcalc-navy/[0.03] p-3">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Berekening (live)</div>
            <div className="flex flex-wrap gap-2">
              {(live?.samenvatting || []).map((s) => (
                <span key={s.label} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700">
                  <span className="font-semibold text-sterkcalc-navy">{fmt(s.waarde)}</span> {s.eenheid} <span className="text-gray-400">{s.label}</span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-gray-400">{(live?.regels || []).length} werktafelregels worden geplaatst (combi → component → STABU). Je hoeft niets te zoeken.</p>
          </div>

          {resultaat && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              <Check size={14} className="mr-1 inline" /> {resultaat.toegevoegd} regels toegevoegd aan de werktafel.
              {resultaat.ontbrekend?.length > 0 && <span className="text-amber-700"> ({resultaat.ontbrekend.length} combi-code(s) niet gevonden)</span>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-3">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Sluiten</button>
          <button onClick={vul} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-sterkcalc-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Vul werktafel
          </button>
        </div>
      </div>
    </div>
  );
}

function Keuze({ input, waarde, onChange }) {
  if (input.type === 'number') {
    return (
      <label className="block text-[11px] text-gray-500">{input.label}{input.eenheid ? ` (${input.eenheid})` : ''}
        <input type="number" step="0.01" value={waarde} onChange={(e) => onChange(e.target.value)} className="mt-0.5 block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm" />
      </label>
    );
  }
  return (
    <label className="block text-[11px] text-gray-500">{input.label}
      <select value={waarde} onChange={(e) => onChange(e.target.value)} className="mt-0.5 block w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
        {(input.opties || []).map((o) => {
          const [val, lbl] = Array.isArray(o) ? o : [o, o];
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </label>
  );
}

const fmt = (v) => new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 2 }).format(Number(v) || 0);
