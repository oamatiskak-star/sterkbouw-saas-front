// components/calculatie/combis/CombiBibliotheek.jsx
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Boxes, Search, ChevronLeft, Plus, Loader2 } from 'lucide-react';
import { loadCombiBibliotheek, loadCombiComponents } from '@/services/combis';
import { voegCombiToe } from '@/services/combis';
import { fmtEUR, fmtNum } from '@/lib/calc/werktafelTotals';

export default function CombiBibliotheek({ calculatieId }) {
  const router = useRouter();
  const [data, setData] = useState({ categories: [], combis: [] });
  const [activeCat, setActiveCat] = useState(null);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [hoeveelheid, setHoeveelheid] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setData(await loadCombiBibliotheek());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) {
      setComponents([]);
      return;
    }
    loadCombiComponents(selected.id).then(setComponents).catch(() => setComponents([]));
  }, [selected]);

  const filtered = useMemo(() => {
    return data.combis.filter(
      (c) =>
        (!activeCat || c.category_id === activeCat) &&
        (!q || (c.naam + ' ' + (c.omschrijving || '') + ' ' + (c.code || '')).toLowerCase().includes(q.toLowerCase()))
    );
  }, [data.combis, activeCat, q]);

  const unit = components.reduce(
    (a, c) => {
      a.mat += Number(c.hoeveelheid_per_eenheid) * Number(c.materiaalprijs);
      a.arb += Number(c.hoeveelheid_per_eenheid) * Number(c.arbeidsprijs);
      a.mtl += Number(c.hoeveelheid_per_eenheid) * Number(c.materieelprijs);
      return a;
    },
    { mat: 0, arb: 0, mtl: 0 }
  );
  const unitKost = unit.mat + unit.arb + unit.mtl;

  const invoegen = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await voegCombiToe({ calculatieId, combi: selected, hoeveelheid: Number(hoeveelheid) || 1 });
      router.push(`/calculaties/${calculatieId}/werktafel`);
    } catch (e) {
      window.alert('Invoegen mislukt: ' + (e.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Boxes size={20} className="text-indigo-600" /> Combi-bibliotheek
        </h1>
        <Link
          href={`/calculaties/${calculatieId}/werktafel`}
          className="inline-flex items-center gap-1 rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          <ChevronLeft size={15} /> Terug naar werktafel
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400">
          <Loader2 className="animate-spin" size={16} /> Laden…
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4">
          {/* Categorieën */}
          <aside className="col-span-3">
            <div className="rounded-lg border border-gray-200 bg-white p-2">
              <button
                onClick={() => setActiveCat(null)}
                className={`block w-full rounded px-2 py-1.5 text-left text-sm ${
                  !activeCat ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Alle ({data.combis.length})
              </button>
              {data.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`block w-full rounded px-2 py-1.5 text-left text-sm ${
                    activeCat === cat.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.naam}
                </button>
              ))}
            </div>
          </aside>

          {/* Kaarten */}
          <div className="col-span-5">
            <div className="mb-2 flex items-center gap-2 rounded border border-gray-200 bg-white px-2">
              <Search size={15} className="text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="zoek combi…"
                className="w-full py-2 text-sm outline-none"
              />
            </div>
            <div className="space-y-2">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`block w-full rounded-lg border bg-white p-3 text-left transition ${
                    selected?.id === c.id ? 'border-indigo-400 ring-1 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{c.naam}</span>
                    <span className="text-xs text-gray-400">{c.eenheid}</span>
                  </div>
                  {c.omschrijving ? <p className="mt-0.5 text-xs text-gray-500">{c.omschrijving}</p> : null}
                </button>
              ))}
              {filtered.length === 0 && <p className="p-4 text-sm text-gray-400">Geen combi&apos;s gevonden.</p>}
            </div>
          </div>

          {/* Detail */}
          <aside className="col-span-4">
            <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-3">
              {selected ? (
                <>
                  <div className="text-sm font-semibold text-gray-900">{selected.naam}</div>
                  {selected.omschrijving ? (
                    <p className="mt-0.5 text-xs text-gray-500">{selected.omschrijving}</p>
                  ) : null}
                  <div className="mt-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    Opbouw per {selected.eenheid}
                  </div>
                  <div className="mt-1 max-h-72 divide-y divide-gray-50 overflow-y-auto">
                    {components.map((cp) => (
                      <div key={cp.id} className="py-1 text-xs">
                        <div className="flex justify-between">
                          <span className="capitalize text-gray-500">{cp.type}</span>
                          <span className="tabular-nums text-gray-500">
                            {fmtNum(cp.hoeveelheid_per_eenheid, 3)} {cp.eenheid}
                          </span>
                        </div>
                        <div className="text-gray-700">{cp.omschrijving}</div>
                      </div>
                    ))}
                    {components.length === 0 && <div className="py-2 text-xs text-gray-400">geen componenten</div>}
                  </div>
                  <div className="mt-2 rounded bg-gray-50 px-2 py-1.5 text-xs text-gray-600">
                    Kostprijs/eenheid <strong className="tabular-nums">{fmtEUR(unitKost)}</strong>
                    <span className="block text-[11px] text-gray-400">
                      mat {fmtEUR(unit.mat)} · arb {fmtEUR(unit.arb)}
                      {unit.mtl ? ` · matl ${fmtEUR(unit.mtl)}` : ''}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <label className="text-xs text-gray-500">Aantal</label>
                    <input
                      type="number"
                      value={hoeveelheid}
                      onChange={(e) => setHoeveelheid(e.target.value)}
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                    />
                    <span className="text-xs text-gray-400">{selected.eenheid}</span>
                  </div>
                  <button
                    onClick={invoegen}
                    disabled={busy}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                  >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Combi invoegen in calculatie
                  </button>
                </>
              ) : (
                <p className="p-4 text-center text-xs text-gray-400">Selecteer een combi voor details.</p>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
