// components/calculatie/werktafel/LiveTotalen.jsx
import { fmtEUR } from '@/lib/calc/werktafelTotals';

const OPSLAG_VELDEN = [
  { key: 'ak', label: 'AK' },
  { key: 'abk', label: 'ABK' },
  { key: 'risico', label: 'Risico' },
  { key: 'winst', label: 'Winst' },
  { key: 'btw', label: 'BTW' },
];

export default function LiveTotalen({ totalen, opslagen, onOpslag }) {
  const t = totalen;
  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <Cell label="Materiaal" value={fmtEUR(t.materiaal)} />
        <Cell label="Arbeid" value={fmtEUR(t.arbeid)} sub={`${Math.round(t.uren)} uur`} />
        <Cell label="Materieel" value={fmtEUR(t.materieel)} />
        <Cell label="Directe kosten" value={fmtEUR(t.directe_kosten)} />
        <Cell label="Kostprijs" value={fmtEUR(t.kostprijs)} strong />
        <Cell
          label="Verkoop (excl. btw)"
          value={fmtEUR(t.verkoopprijs_excl)}
          strong
          sub={`marge ${t.margePct.toFixed(1)}%`}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-gray-100 pt-3">
        <span className="text-xs font-medium text-gray-500">Opslagen (handmatig):</span>
        {OPSLAG_VELDEN.map((v) => (
          <label key={v.key} className="flex items-center gap-1 text-xs text-gray-600">
            {v.label}
            <input
              type="number"
              step="0.5"
              value={opslagen?.[v.key] ?? 0}
              onChange={(e) => onOpslag(v.key, e.target.value)}
              className="w-16 rounded border border-gray-300 px-1.5 py-0.5 text-right text-xs"
            />
            %
          </label>
        ))}
        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="text-gray-500">
            AK {fmtEUR(t.akBedrag)} · ABK {fmtEUR(t.abkBedrag)} · Risico {fmtEUR(t.risicoBedrag)} · Winst{' '}
            {fmtEUR(t.winstBedrag)}
          </span>
          <span className="font-semibold text-gray-900">Incl. btw: {fmtEUR(t.verkoopprijs_incl)}</span>
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value, sub, strong }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-gray-400">{label}</div>
      <div className={`tabular-nums ${strong ? 'text-base font-semibold text-gray-900' : 'text-sm text-gray-700'}`}>
        {value}
      </div>
      {sub ? <div className="text-[11px] text-gray-400">{sub}</div> : null}
    </div>
  );
}
