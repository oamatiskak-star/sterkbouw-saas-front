// components/calculatie/werktafel/HoofdstukBoom.jsx
import { ChevronDown, ChevronRight, Plus, Trash2, FolderTree } from 'lucide-react';

export default function HoofdstukBoom({
  chapters,
  rows,
  activeChapterId,
  onSelect,
  onAdd,
  onRename,
  onRemove,
  onToggleCollapse,
}) {
  const countFor = (cid) => rows.filter((r) => r.chapter_id === cid).length;
  const losse = rows.filter((r) => !r.chapter_id).length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <FolderTree size={14} /> Hoofdstukken
        </span>
        <button
          onClick={onAdd}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          title="Hoofdstuk toevoegen"
        >
          <Plus size={15} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 pb-2">
        <button
          onClick={() => onSelect(null)}
          className={`mb-0.5 flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm ${
            activeChapterId === null ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span>Losse regels</span>
          <span className="text-xs text-gray-400">{losse}</span>
        </button>
        {chapters.map((c) => (
          <div key={c.id} className="group mb-0.5 flex items-center gap-1">
            <button
              onClick={() => onToggleCollapse(c.id)}
              className="rounded p-0.5 text-gray-400 hover:text-gray-700"
              title={c.collapsed ? 'Uitklappen' : 'Inklappen'}
            >
              {c.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              onClick={() => onSelect(c.id)}
              onDoubleClick={() => {
                const naam = window.prompt('Hoofdstuknaam', c.naam);
                if (naam != null) onRename(c.id, { naam });
              }}
              className={`flex flex-1 items-center justify-between rounded px-2 py-1.5 text-left text-sm ${
                activeChapterId === c.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
              title="Dubbelklik om te hernoemen"
            >
              <span className="truncate">
                {c.code ? <span className="mr-1 text-xs text-gray-400">{c.code}</span> : null}
                {c.naam}
              </span>
              <span className="text-xs text-gray-400">{countFor(c.id)}</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Hoofdstuk "${c.naam}" verwijderen? Regels worden losse regels.`)) onRemove(c.id);
              }}
              className="rounded p-1 text-gray-300 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              title="Verwijderen"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
