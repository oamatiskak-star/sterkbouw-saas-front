// components/calculatie/werktafel/HoofdstukBoom.jsx — genest: hoofdstuk → subhoofdstuk (P4-C).
import { ChevronDown, ChevronRight, Plus, Trash2, FolderTree } from 'lucide-react';

export default function HoofdstukBoom({
  chapters,
  rows,
  catIndex = {},
  activeChapterId,
  onSelect,
  onAdd,
  onRename,
  onRemove,
  onToggleCollapse,
}) {
  const countFor = (cid) => rows.filter((r) => r.chapter_id === cid).length;
  const losse = rows.filter((r) => !r.chapter_id).length;
  const hoofd = chapters.filter((c) => !c.parent_id);
  const subsBy = {};
  for (const c of chapters.filter((c) => c.parent_id)) (subsBy[c.parent_id] = subsBy[c.parent_id] || []).push(c);
  const totFor = (h) => countFor(h.id) + (subsBy[h.id] || []).reduce((s, sub) => s + countFor(sub.id), 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <FolderTree size={14} /> Hoofdstukken
        </span>
        <button onClick={onAdd} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Hoofdstuk toevoegen">
          <Plus size={15} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 pb-2">
        {hoofd.map((c) => {
          const subs = subsBy[c.id] || [];
          return (
            <div key={c.id} className="mb-0.5">
              <div className={`group flex items-center gap-1 rounded ${activeChapterId === c.id ? 'bg-sterkcalc-navy/10' : ''}`}>
                <button onClick={() => onToggleCollapse(c.id)} className="rounded p-0.5 text-gray-400 hover:text-gray-700" title={c.collapsed ? 'Uitklappen' : 'Inklappen'}>
                  {subs.length ? (c.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />) : <span className="inline-block w-[14px]" />}
                </button>
                <button
                  onClick={() => onSelect(c.id)}
                  onDoubleClick={() => { const naam = window.prompt('Hoofdstuknaam', c.naam); if (naam != null) onRename(c.id, { naam }); }}
                  className={`flex flex-1 items-center justify-between rounded px-1.5 py-1.5 text-left text-sm font-semibold ${activeChapterId === c.id ? 'text-sterkcalc-navy' : 'text-gray-800 hover:bg-gray-50'}`}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    {c.code ? <span className="font-mono text-[10px] text-gray-400">{c.code}</span> : null}
                    <span className="truncate">{c.naam}</span>
                  </span>
                  <span className="text-xs text-gray-400">{totFor(c)}</span>
                </button>
                <button onClick={() => { if (window.confirm(`Hoofdstuk "${c.naam}" verwijderen?`)) onRemove(c.id); }} className="rounded p-1 text-gray-300 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100" title="Verwijderen">
                  <Trash2 size={13} />
                </button>
              </div>
              {!c.collapsed && subs.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => onSelect(sub.id)}
                  className={`ml-5 flex w-[calc(100%-1.25rem)] items-center justify-between rounded border-l border-gray-200 px-2 py-1 text-left text-[13px] ${activeChapterId === sub.id ? 'bg-sterkcalc-navy/10 text-sterkcalc-navy' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    {sub.sub_code ? <span className="font-mono text-[10px] text-gray-400">{sub.code}.{sub.sub_code}</span> : null}
                    <span className="truncate">{sub.naam}</span>
                  </span>
                  <span className="text-[11px] text-gray-400">{countFor(sub.id)}</span>
                </button>
              ))}
            </div>
          );
        })}
        <button
          onClick={() => onSelect(null)}
          className={`mt-1 flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm ${activeChapterId === null ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span>Losse regels</span>
          <span className="text-xs text-gray-400">{losse}</span>
        </button>
      </div>
    </div>
  );
}
