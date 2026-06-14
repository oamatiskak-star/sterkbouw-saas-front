// components/calculatie/werktafel/CategorieKiezer.jsx
import { useEffect, useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { loadCategorieen } from '@/lib/calc/werktafelCategorieMap';

export default function CategorieKiezer({ open, onClose, onPick }) {
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (open && cats.length === 0) {
      loadCategorieen().then(setCats).catch(() => setCats([]));
    }
  }, [open, cats.length]);

  const filtered = useMemo(
    () =>
      cats.filter((c) => !q || (c.code + ' ' + c.titel + ' ' + (c.subtitel || '')).toLowerCase().includes(q.toLowerCase())),
    [cats, q]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Categorie kiezen — voegt hoofdstuk toe</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>
        <div className="border-b border-gray-100 px-4 py-2">
          <div className="flex items-center gap-2 rounded border border-gray-200 px-2">
            <Search size={15} className="text-gray-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="zoek categorie…"
              className="w-full py-1.5 text-sm outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((c) => (
            <button
              key={c.code}
              onClick={() => onPick(c)}
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white text-left transition hover:border-indigo-400 hover:shadow"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.foto}
                  alt={c.titel}
                  loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <span className="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {c.code}
                </span>
              </div>
              <div className="p-2">
                <div className="truncate text-xs font-semibold text-gray-900">{c.titel}</div>
                {c.subtitel ? <div className="truncate text-[11px] text-gray-500">{c.subtitel}</div> : null}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full p-6 text-center text-sm text-gray-400">Geen categorieën gevonden.</p>
          )}
        </div>
      </div>
    </div>
  );
}
