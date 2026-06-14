// components/calculatie/werktafel/CalculatieInstellingen.jsx
// Per-calculatie instellingen (gekopieerd uit globale defaults, hier user-bewerkbaar).
// AI mag deze waarden NOOIT wijzigen. Wordt mee opgeslagen per versie (snapshot).
import { X, Lock } from 'lucide-react';

const PCT = [
  { k: 'ak', l: 'AK %' },
  { k: 'abk', l: 'ABK %' },
  { k: 'risico', l: 'Risico %' },
  { k: 'winst', l: 'Winst %' },
  { k: 'btw', l: 'BTW %' },
];

export default function CalculatieInstellingen({ open, onClose, instellingen, onChange }) {
  if (!open) return null;
  const i = instellingen || {};
  const setNum = (k) => (e) => onChange(k, e.target.value === '' ? 0 : Number(e.target.value));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Calculatie-instellingen</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X size={18} /></button>
        </div>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-3 gap-3">
            {PCT.map((f) => (
              <label key={f.k} className="block">
                <span className="mb-0.5 block text-[11px] text-gray-500">{f.l}</span>
                <input type="number" step="0.5" value={i[f.k] ?? 0} onChange={setNum(f.k)} className={inp} />
              </label>
            ))}
            <label className="block">
              <span className="mb-0.5 block text-[11px] text-gray-500">Regiofactor</span>
              <input type="number" step="0.01" value={i.regiofactor ?? 1} onChange={setNum('regiofactor')} className={inp} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-0.5 block text-[11px] text-gray-500">Prijspeildatum</span>
              <input type="date" value={i.prijspeildatum || ''} onChange={(e) => onChange('prijspeildatum', e.target.value || null)} className={inp} />
            </label>
            <label className="block">
              <span className="mb-0.5 block text-[11px] text-gray-500">Afronding (decimalen)</span>
              <select value={i.afronding ?? 2} onChange={(e) => onChange('afronding', Number(e.target.value))} className={inp}>
                <option value={0}>0</option><option value={1}>1</option><option value={2}>2</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-0.5 block text-[11px] text-gray-500">Calculatietype</span>
              <select value={i.calculatietype || 'nieuwbouw'} onChange={(e) => onChange('calculatietype', e.target.value)} className={inp}>
                <option value="nieuwbouw">Nieuwbouw</option>
                <option value="transformatie">Transformatie</option>
                <option value="renovatie">Renovatie</option>
                <option value="utiliteit">Utiliteit</option>
              </select>
            </label>
            <label className="flex items-center gap-2 pt-5">
              <input type="checkbox" checked={!!i.fixed_price} onChange={(e) => onChange('fixed_price', e.target.checked)} />
              <span className="text-sm text-gray-700">Fixed price</span>
            </label>
          </div>
          <p className="flex items-center gap-1.5 rounded bg-gray-50 px-2 py-1.5 text-[11px] text-gray-500">
            <Lock size={12} /> Deze waarden zijn per calculatie en per versie; AI/optimalisatie wijzigt ze nooit.
          </p>
        </div>
        <div className="flex justify-end border-t border-gray-200 px-4 py-3">
          <button onClick={onClose} className="rounded-lg bg-sterkcalc-navy px-4 py-2 text-sm font-medium text-white hover:bg-sterkcalc-navy2">Klaar</button>
        </div>
      </div>
    </div>
  );
}

const inp = 'w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-sterkcalc-blue';
