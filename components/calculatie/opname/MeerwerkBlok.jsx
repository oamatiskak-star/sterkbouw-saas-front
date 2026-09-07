// components/calculatie/opname/MeerwerkBlok.jsx — knop "Meerwerk" die een uitklapblok toont:
// koppeling aan een BESTAAND project/calculatie + reden + checklist met veelvoorkomende
// meerwerk-posten. Losse rij (geen typen nodig): calculaties laden pas bij openklappen.
import { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { listCalculatiesVoorKoppeling } from '@/services/opnames';

export const MEERWERK_POSTEN = [
  'Extra sloopwerk',
  'Extra grondwerk',
  'Extra funderingswerk',
  'Extra leidingwerk (water/riool)',
  'Extra elektra',
  'Extra stucwerk',
  'Extra tegelwerk (wand/vloer)',
  'Extra schilderwerk',
  'Extra isolatie',
  'Extra kozijnen/ramen',
  'Extra dakwerk',
  'Extra afvoer/putten',
  'Anders',
];

function datNL(d) {
  return d ? new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
}

export default function MeerwerkBlok({ waarde, onChange }) {
  const { actief, calculatie_id, reden, items, toelichting } = waarde;
  const [calcs, setCalcs] = useState([]);
  const [laden, setLaden] = useState(false);
  const [fout, setFout] = useState(null);

  useEffect(() => {
    if (!actief || calcs.length || laden) return;
    setLaden(true);
    listCalculatiesVoorKoppeling()
      .then(setCalcs)
      .catch((e) => setFout(e.message || 'Laden mislukt'))
      .finally(() => setLaden(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actief]);

  function toggleItem(post) {
    const set = new Set(items);
    if (set.has(post)) set.delete(post);
    else set.add(post);
    onChange({ ...waarde, items: Array.from(set) });
  }

  const inputCls = 'w-full rounded border-[1.5px] border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 [color-scheme:light] focus:border-sterkcalc-blue focus:outline-none focus:ring-2 focus:ring-sterkcalc-blue/20';
  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-700';

  if (!actief) {
    return (
      <button
        type="button"
        onClick={() => onChange({ ...waarde, actief: true })}
        className="inline-flex items-center gap-2 rounded border-2 border-dashed border-gray-400 bg-white px-4 py-3 text-sm font-bold uppercase tracking-wide text-gray-900"
      >
        <Plus size={16} /> Meerwerk
      </button>
    );
  }

  return (
    <div className="rounded-lg border-2 border-[#e8c84b] bg-[#fdf6e0] p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-900">Meerwerk</span>
        <button type="button" onClick={() => onChange({ ...waarde, actief: false })} className="text-xs font-semibold text-gray-600 underline">
          Verwijderen
        </button>
      </div>

      <div className="mb-4">
        <label className={labelCls} htmlFor="mw-calc">Bij welk project/klant hoort dit meerwerk?</label>
        {laden ? (
          <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 size={14} className="animate-spin" /> Calculaties laden…</div>
        ) : (
          <select
            id="mw-calc"
            className={inputCls}
            value={calculatie_id || ''}
            onChange={(e) => onChange({ ...waarde, calculatie_id: e.target.value || null })}
          >
            <option value="">— Kies een calculatie —</option>
            {calcs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.projectnummer || c.id.slice(0, 8)} · {c.opdrachtgever_naam || c.naam} ({datNL(c.created_at)})
              </option>
            ))}
          </select>
        )}
        {fout && <p className="mt-1 text-xs text-red-600">{fout}</p>}
      </div>

      <div className="mb-4">
        <label className={labelCls} htmlFor="mw-reden">Reden meerwerk</label>
        <input
          id="mw-reden"
          className={inputCls}
          placeholder="Bijv. klant wil extra stopcontacten tijdens verbouwing"
          value={reden}
          onChange={(e) => onChange({ ...waarde, reden: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <span className={labelCls}>Om welke posten gaat het?</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MEERWERK_POSTEN.map((post) => (
            <label key={post} className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900">
              <input type="checkbox" className="h-4 w-4 [color-scheme:light]" checked={items.includes(post)} onChange={() => toggleItem(post)} />
              {post}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="mw-toelichting">Toelichting</label>
        <textarea
          id="mw-toelichting"
          rows={2}
          className={inputCls}
          placeholder="Extra details bij de aangevinkte posten"
          value={toelichting}
          onChange={(e) => onChange({ ...waarde, toelichting: e.target.value })}
        />
      </div>
    </div>
  );
}

export function initieleMeerwerkWaarde(initial) {
  return {
    actief: !!initial?.is_meerwerk,
    calculatie_id: initial?.meerwerk_calculatie_id || null,
    reden: initial?.meerwerk_reden || '',
    items: initial?.meerwerk_items || [],
    toelichting: initial?.meerwerk_toelichting || '',
  };
}
