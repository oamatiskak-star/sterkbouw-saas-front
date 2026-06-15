// components/calculatie/werktafel/Werktafel.jsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Save, History, Loader2, Plus, LayoutGrid, SlidersHorizontal, Wand2, Sparkles, AlertTriangle } from 'lucide-react';
import { useWerktafel } from '@/hooks/useWerktafel';
import { analyseerDekking } from '@/services/werktafelAnalyse';
import { loadCategorieen, indexByCode } from '@/lib/calc/werktafelCategorieMap';
import HoofdstukBoom from './HoofdstukBoom';
import RegelTabel from './RegelTabel';
import EigenschappenPaneel from './EigenschappenPaneel';
import LiveTotalen from './LiveTotalen';
import CategorieKiezer from './CategorieKiezer';
import CalculatieInstellingen from './CalculatieInstellingen';

export default function Werktafel({ calculatieId }) {
  const wt = useWerktafel(calculatieId);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [kiezerOpen, setKiezerOpen] = useState(false);
  const [instOpen, setInstOpen] = useState(false);
  const [catIndex, setCatIndex] = useState({});
  const [analyse, setAnalyse] = useState(null);
  const [analyseBusy, setAnalyseBusy] = useState(false);

  const doAnalyse = async () => {
    if (analyse) { setAnalyse(null); return; }
    setAnalyseBusy(true);
    try {
      setAnalyse(await analyseerDekking(wt.calculatie?.project_type, wt.chapters, wt.rows));
    } catch (e) {
      window.alert('Analyse mislukt: ' + (e.message || e));
    } finally {
      setAnalyseBusy(false);
    }
  };

  useEffect(() => {
    loadCategorieen()
      .then((list) => setCatIndex(indexByCode(list)))
      .catch(() => {});
  }, []);

  const activeRow = wt.rows.find((r) => r.id === activeRowId) || null;
  const activeRowChapter = activeRow ? wt.chapters.find((c) => c.id === activeRow.chapter_id) : null;
  const paneelStabuFilter = activeRowChapter?.stabu_hoofdstuk ? [activeRowChapter.stabu_hoofdstuk] : null;

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
          <button
            onClick={doAnalyse}
            className={`inline-flex items-center gap-1 rounded border px-3 py-1.5 text-xs font-medium ${analyse ? 'border-sterkcalc-accent bg-sterkcalc-accent/10 text-sterkcalc-accent' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            {analyseBusy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} AI-analyse
          </button>
          <Link
            href={`/calculaties/${calculatieId}/ai`}
            className="inline-flex items-center gap-1 rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Wand2 size={13} /> AI-tekening
          </Link>
          <button
            onClick={() => setKiezerOpen(true)}
            className="inline-flex items-center gap-1 rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <LayoutGrid size={13} /> Hoofdstuk (categorie)
          </button>
          <Link
            href={`/calculaties/${calculatieId}/combis`}
            className="inline-flex items-center gap-1 rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus size={13} /> Combi invoegen
          </Link>
          <button
            onClick={() => setInstOpen(true)}
            className="inline-flex items-center gap-1 rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal size={13} /> Calculatie-instellingen
          </button>
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

      {/* Contextuele AI-analyse (advies, geen automatische invoeging) */}
      {analyse && (
        <div className="border-b border-gray-200 bg-sterkcalc-navy/[0.03] px-4 py-2.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-sterkcalc-navy">
            <Sparkles size={13} className="text-sterkcalc-accent" /> AI-analyse — {analyse.projecttype}
            {analyse.compleet && <span className="font-normal text-sterkcalc-accent">· structuur compleet</span>}
            <button onClick={() => setAnalyse(null)} className="ml-auto rounded px-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">✕</button>
          </div>
          <p className="mb-2 text-[11px] text-gray-400">AI adviseert alleen — er wordt niets automatisch ingevoegd.</p>
          <div className="flex flex-wrap gap-1.5">
            {analyse.ontbrekendeHoofd.map((m) => (
              <span key={`h${m.cat}`} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] text-red-700"><AlertTriangle size={11} /> Hoofdstuk ontbreekt: {m.naam}</span>
            ))}
            {analyse.ontbrekendeSub.map((m) => (
              <span key={`s${m.cat}.${m.sub}`} className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] text-amber-700">Ontbreekt: {m.naam}</span>
            ))}
            {analyse.legeSub.slice(0, 12).map((m) => (
              <span key={`l${m.cat}.${m.sub}`} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-500">Nog niet ingevuld: {m.naam}</span>
            ))}
            {analyse.compleet && analyse.legeSub.length === 0 && <span className="text-[11px] text-gray-400">Alle template-onderdelen aanwezig en ingevuld.</span>}
          </div>
        </div>
      )}

      {/* 3 panelen */}
      <div className="flex min-h-0 flex-1">
        <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50/50">
          <HoofdstukBoom
            chapters={wt.chapters}
            rows={wt.rows}
            catIndex={catIndex}
            activeChapterId={activeChapterId}
            onSelect={setActiveChapterId}
            onAdd={() => setKiezerOpen(true)}
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
            onAddCombi={(combi, chapterId) => wt.insertCombi(combi, chapterId)}
          />
        </main>

        {/* Eigenschappenpaneel schuift alleen in bij selectie; anders volledige breedte voor de werktafel. */}
        {activeRow && (
          <aside className="w-72 shrink-0 border-l border-gray-200 bg-gray-50/40">
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Eigenschappen</span>
              <button onClick={() => setActiveRowId(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="Sluiten">✕</button>
            </div>
            <EigenschappenPaneel
              row={activeRow}
              stabuFilter={paneelStabuFilter}
              onPatchRow={wt.patchRow}
              onApplyStabu={wt.applyStabu}
            />
          </aside>
        )}
      </div>

      <LiveTotalen totalen={wt.totalen} opslagen={wt.opslagen} onOpslag={wt.setOpslag} />

      <CalculatieInstellingen
        open={instOpen}
        onClose={() => setInstOpen(false)}
        instellingen={wt.opslagen}
        onChange={wt.setOpslag}
      />

      <CategorieKiezer
        open={kiezerOpen}
        onClose={() => setKiezerOpen(false)}
        onPick={async (cat) => {
          setKiezerOpen(false);
          const created = await wt.addChapterFromCat(cat);
          if (created) setActiveChapterId(created.id);
        }}
      />
    </div>
  );
}
