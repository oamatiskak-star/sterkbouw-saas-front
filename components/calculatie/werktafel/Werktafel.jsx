// components/calculatie/werktafel/Werktafel.jsx
// P5 — de werktafel is het hoofdsysteem (één bron van waarheid). De linkerboom is uitsluitend een
// navigator die scrollt naar hetzelfde grid. Bouwdeel = primaire invoer (P5-H). Volledigheidscheck
// als verplichte poort vóór de offerte (P5-J).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layers, Save, History, Loader2, LayoutGrid, SlidersHorizontal, Wand2, Sparkles, AlertTriangle, Boxes, ClipboardCheck } from 'lucide-react';
import { useWerktafel } from '@/hooks/useWerktafel';
import { analyseerDekking } from '@/services/werktafelAnalyse';
import { loadCategorieen, indexByCode } from '@/lib/calc/werktafelCategorieMap';
import HoofdstukBoom from './HoofdstukBoom';
import RegelTabel from './RegelTabel';
import EigenschappenPaneel from './EigenschappenPaneel';
import LiveTotalen from './LiveTotalen';
import CategorieKiezer from './CategorieKiezer';
import CalculatieInstellingen from './CalculatieInstellingen';
import BouwdeelKiezer from './BouwdeelKiezer';
import VolledigheidsCheck from './VolledigheidsCheck';

export default function Werktafel({ calculatieId }) {
  const wt = useWerktafel(calculatieId);
  const router = useRouter();
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [kiezerOpen, setKiezerOpen] = useState(false);
  const [bouwdeelOpen, setBouwdeelOpen] = useState(false);
  const [instOpen, setInstOpen] = useState(false);
  const [catIndex, setCatIndex] = useState({});
  const [analyse, setAnalyse] = useState(null);
  const [analyseBusy, setAnalyseBusy] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false);
  const [checkBusy, setCheckBusy] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  // Navigator: selecteer hoofdstuk/subhoofdstuk én scroll naar het grid (P5-A).
  const selectChapter = (id) => {
    setActiveChapterId(id);
    if (id) requestAnimationFrame(() => document.getElementById(`wt-ch-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

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

  // P5-J: verplichte volledigheidscheck vóór de offerte.
  const openCheck = async () => {
    setCheckOpen(true);
    setCheckBusy(true);
    setCheckResult(null);
    try {
      setCheckResult(await analyseerDekking(wt.calculatie?.project_type, wt.chapters, wt.rows));
    } catch (e) {
      window.alert('Controle mislukt: ' + (e.message || e));
      setCheckOpen(false);
    } finally {
      setCheckBusy(false);
    }
  };

  useEffect(() => {
    loadCategorieen().then((list) => setCatIndex(indexByCode(list))).catch(() => {});
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

  const tbBtn = 'inline-flex items-center gap-1 rounded border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50';

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-sterkcalc-navy" />
          <h1 className="text-sm font-semibold text-gray-900">
            Werktafel{wt.calculatie?.naam ? ` — ${wt.calculatie.naam}` : ''}
          </h1>
          <span className="text-xs text-gray-400">
            {wt.rows.length} regels · {wt.chapters.filter((c) => !c.parent_id).length} hoofdstukken
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 pr-1 text-xs text-gray-400">
            {wt.saving ? (<><Loader2 size={12} className="animate-spin" /> opslaan…</>) : 'opgeslagen'}
          </span>
          <button
            onClick={() => setBouwdeelOpen(true)}
            className="inline-flex items-center gap-1 rounded bg-sterkcalc-blue px-2.5 py-1.5 text-xs font-medium text-white hover:bg-sterkcalc-blue/90"
          >
            <Boxes size={13} /> Bouwdeel
          </button>
          <button onClick={() => setKiezerOpen(true)} className={tbBtn}><LayoutGrid size={13} /> Hoofdstuk</button>
          <button onClick={doAnalyse} className={`${analyse ? 'border-sterkcalc-accent bg-sterkcalc-accent/10 text-sterkcalc-accent' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-xs font-medium`}>
            {analyseBusy ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} AI-analyse
          </button>
          <Link href={`/calculaties/${calculatieId}/ai`} className={tbBtn}><Wand2 size={13} /> AI-tekening</Link>
          <button onClick={() => setInstOpen(true)} className={tbBtn}><SlidersHorizontal size={13} /> Instellingen</button>
          <button onClick={onSaveVersion} className={tbBtn}><History size={13} /> Versie</button>
          <button
            onClick={openCheck}
            className="inline-flex items-center gap-1 rounded bg-sterkcalc-navy px-2.5 py-1.5 text-xs font-medium text-white hover:bg-sterkcalc-navy/90"
          >
            <ClipboardCheck size={13} /> Controle &amp; offerte
          </button>
        </div>
      </div>

      {/* Contextuele AI-analyse (advies, geen automatische invoeging) */}
      {analyse && (
        <div className="border-b border-gray-200 bg-sterkcalc-navy/[0.03] px-4 py-2.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-sterkcalc-navy">
            <Sparkles size={13} className="text-sterkcalc-accent" /> AI-analyse — {analyse.projecttype}
            {analyse.compleet && <span className="font-normal text-emerald-600">· compleet</span>}
            <button onClick={() => setAnalyse(null)} className="ml-auto rounded px-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">✕</button>
          </div>
          <p className="mb-2 text-[11px] text-gray-400">AI adviseert alleen — er wordt niets automatisch ingevoegd.</p>
          <div className="flex flex-wrap gap-1.5">
            {analyse.ontbrekendeHoofd.map((m) => (
              <span key={`h${m.cat}`} className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] ${m.kritiek ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                <AlertTriangle size={11} /> Ontbreekt: {m.naam}
              </span>
            ))}
            {analyse.legeHoofd.map((m) => (
              <span key={`e${m.cat}`} className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] ${m.kritiek ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                Leeg: {m.naam}
              </span>
            ))}
            {analyse.legeSub.slice(0, 12).map((m) => (
              <span key={`l${m.cat}.${m.sub}`} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-500">Nog niet ingevuld: {m.naam}</span>
            ))}
            {analyse.compleet && <span className="text-[11px] text-gray-400">Alle template-onderdelen aanwezig en gevuld.</span>}
          </div>
        </div>
      )}

      {/* 3 panelen */}
      <div className="flex min-h-0 flex-1">
        <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50/50">
          <HoofdstukBoom
            chapters={wt.chapters}
            rows={wt.rows}
            activeChapterId={activeChapterId}
            onSelect={selectChapter}
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
            activeChapterId={activeChapterId}
            onSelectRow={setActiveRowId}
            onPatchRow={wt.patchRow}
            onRemoveRow={(id) => { wt.removeRow(id); if (activeRowId === id) setActiveRowId(null); }}
            onDuplicateRow={wt.duplicateRow}
            onMoveRow={wt.moveRow}
            onAddRow={(cid) => wt.addRow(cid)}
            onAddCombi={(combi, chapterId) => wt.insertCombi(combi, chapterId)}
          />
        </main>

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

      <CalculatieInstellingen open={instOpen} onClose={() => setInstOpen(false)} instellingen={wt.opslagen} onChange={wt.setOpslag} />

      <CategorieKiezer
        open={kiezerOpen}
        onClose={() => setKiezerOpen(false)}
        onPick={async (cat) => {
          setKiezerOpen(false);
          const created = await wt.addChapterFromCat(cat);
          if (created) selectChapter(created.id);
        }}
      />

      <BouwdeelKiezer
        open={bouwdeelOpen}
        onClose={() => setBouwdeelOpen(false)}
        onPick={async (b) => {
          const n = await wt.insertBouwdeel(b.id);
          setBouwdeelOpen(false);
          if (!n) window.alert('Dit bouwdeel heeft geen actieve combi’s.');
        }}
      />

      <VolledigheidsCheck
        open={checkOpen}
        busy={checkBusy}
        result={checkResult}
        onClose={() => setCheckOpen(false)}
        onDoorgaan={() => { setCheckOpen(false); router.push(`/calculaties/${calculatieId}/offerte`); }}
      />
    </div>
  );
}
