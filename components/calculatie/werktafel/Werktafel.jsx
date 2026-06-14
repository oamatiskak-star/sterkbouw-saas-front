// components/calculatie/werktafel/Werktafel.jsx
import { useState } from 'react';
import Link from 'next/link';
import { Layers, Save, History, Loader2, Plus } from 'lucide-react';
import { useWerktafel } from '@/hooks/useWerktafel';
import HoofdstukBoom from './HoofdstukBoom';
import RegelTabel from './RegelTabel';
import EigenschappenPaneel from './EigenschappenPaneel';
import LiveTotalen from './LiveTotalen';

export default function Werktafel({ calculatieId }) {
  const wt = useWerktafel(calculatieId);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);

  const activeRow = wt.rows.find((r) => r.id === activeRowId) || null;

  const onSaveVersion = async () => {
    const label = window.prompt('Naam voor deze versie (optioneel):', '');
    if (label === null) return;
    await wt.saveVersion(label || undefined);
    window.alert('Versie opgeslagen.');
  };

  if (wt.loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-gray-400">
        <Loader2 className="mr-2 animate-spin" size={18} /> Werktafel laden…
      </div>
    );
  }
  if (wt.error) {
    return <div className="m-4 rounded bg-red-50 p-4 text-sm text-red-700">Fout: {wt.error}</div>;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-indigo-600" />
          <h1 className="text-sm font-semibold text-gray-900">
            Calculatie Werktafel{wt.calculatie?.naam ? ` — ${wt.calculatie.naam}` : ''}
          </h1>
          <span className="text-xs text-gray-400">
            {wt.rows.length} regels · {wt.chapters.length} hoofdstukken
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            {wt.saving ? (
              <>
                <Loader2 size={12} className="animate-spin" /> opslaan…
              </>
            ) : (
              'opgeslagen'
            )}
          </span>
          <Link
            href={`/calculaties/${calculatieId}/combis`}
            className="inline-flex items-center gap-1 rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus size={13} /> Combi invoegen
          </Link>
          <button
            onClick={onSaveVersion}
            className="inline-flex items-center gap-1 rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <History size={13} /> Versie opslaan
          </button>
          <button
            onClick={() => wt.addRow(activeChapterId)}
            className="inline-flex items-center gap-1 rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
          >
            <Save size={13} /> Regel toevoegen
          </button>
        </div>
      </div>

      {/* 3 panelen */}
      <div className="flex min-h-0 flex-1">
        <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50/50">
          <HoofdstukBoom
            chapters={wt.chapters}
            rows={wt.rows}
            activeChapterId={activeChapterId}
            onSelect={setActiveChapterId}
            onAdd={() => wt.addChapter()}
            onRename={wt.patchChapter}
            onRemove={wt.removeChapter}
            onToggleCollapse={wt.toggleCollapse}
          />
        </aside>

        <main className="min-w-0 flex-1">
          <RegelTabel
            chapters={wt.chapters}
            rows={wt.rows}
            activeRowId={activeRowId}
            onSelectRow={setActiveRowId}
            onPatchRow={wt.patchRow}
            onRemoveRow={(id) => {
              wt.removeRow(id);
              if (activeRowId === id) setActiveRowId(null);
            }}
            onDuplicateRow={wt.duplicateRow}
            onMoveRow={wt.moveRow}
            onAddRow={(cid) => wt.addRow(cid)}
          />
        </main>

        <aside className="w-72 shrink-0 border-l border-gray-200 bg-gray-50/40">
          <EigenschappenPaneel row={activeRow} onPatchRow={wt.patchRow} onApplyStabu={wt.applyStabu} />
        </aside>
      </div>

      <LiveTotalen totalen={wt.totalen} opslagen={wt.opslagen} onOpslag={wt.setOpslag} />
    </div>
  );
}
