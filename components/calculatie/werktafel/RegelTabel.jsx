// components/calculatie/werktafel/RegelTabel.jsx
// P5 — calculatie-grid: hoofdstukken en regels in één tabel (geen kaarten, geen knopgevoel).
// Kolomvolgorde commercieel-eerst (P5-I): Omschrijving · Aantal · Eenheid · Opslag · Verkoop · Marge
// daarna technisch: Materiaal · Arbeid · Materieel · Norm · Uren · STABU.
// Hoofdstuk = grid-rij (P5-B); subhoofdstuk zichtbaar + tellingen (P5-C); auto combi-voorstel
// voor het actieve subhoofdstuk (P5-G); 2Jours-visual (P5-K).
import { Fragment, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Trash2, ArrowUp, ArrowDown, Plus, Boxes, Loader2, Tag, Check } from 'lucide-react';
import { computeRow, fmtEUR, fmtNum } from '@/lib/calc/werktafelTotals';
import { loadCombisVoorSubcat } from '@/services/combis';
import BouwmaatZoeker from './BouwmaatZoeker';

const TYPES = ['arbeid', 'materiaal', 'materieel', 'combi', 'stelpost'];
const STATUSSEN = ['concept', 'definitief', 'optie', 'vervallen'];
const COLS = 16; // totaal aantal kolommen (voor colSpan)

export default function RegelTabel({
  chapters,
  rows,
  priceFactor = 1,
  activeRowId,
  activeChapterId,
  onSelectRow,
  onPatchRow,
  onRemoveRow,
  onDuplicateRow,
  onMoveRow,
  onAddRow,
  onAddCombi,
  onPatchComponent,
}) {
  const [open, setOpen] = useState({}); // uitgeklapte combi-regels
  const collapsed = new Set(chapters.filter((c) => c.collapsed).map((c) => c.id));

  // Hiërarchie: hoofdstuk → subhoofdstukken → (overige) → Losse regels als uitzondering.
  const hoofd = chapters.filter((c) => !c.parent_id);
  const subsBy = {};
  for (const c of chapters.filter((c) => c.parent_id)) (subsBy[c.parent_id] = subsBy[c.parent_id] || []).push(c);
  const ordered = [];
  for (const h of hoofd) {
    ordered.push({ ...h, niveau: 'hoofd' });
    if (!collapsed.has(h.id)) for (const s of subsBy[h.id] || []) ordered.push({ ...s, niveau: 'sub' });
  }
  for (const c of chapters.filter((c) => c.parent_id && !hoofd.find((h) => h.id === c.parent_id))) ordered.push({ ...c, niveau: 'sub' });
  const losseCount = rows.filter((r) => !r.chapter_id).length;
  const groups = [...ordered];
  if (losseCount > 0) groups.push({ id: null, naam: 'Losse regels', code: '', niveau: 'losse' });

  // Verkoop-subtotaal per hoofdstuk = eigen regels + regels van zijn subhoofdstukken.
  const verkoopVan = (cid) => rows.filter((r) => r.chapter_id === cid).reduce((s, r) => s + computeRow(r, priceFactor).verkoopprijs, 0);
  const hoofdSubtot = (h) => verkoopVan(h.id) + (subsBy[h.id] || []).reduce((s, sub) => s + verkoopVan(sub.id), 0);

  return (
    <div className="h-full overflow-auto">
      <table className="w-full min-w-[1240px] border-collapse text-xs">
        <thead className="sticky top-0 z-10 bg-sterkcalc-navy text-white">
          <tr className="[&>th]:whitespace-nowrap [&>th]:border-r [&>th]:border-white/10 [&>th]:px-2 [&>th]:py-2 [&>th]:text-left [&>th]:font-semibold">
            <th className="w-7"></th>
            <th className="w-8 text-right">#</th>
            <th className="min-w-[260px]">Omschrijving</th>
            <th className="w-24 text-right">Aantal</th>
            <th className="w-14">Eenheid</th>
            <th className="w-16 text-right">Opslag %</th>
            <th className="w-28 text-right">Verkoop</th>
            <th className="w-24 text-right">Marge</th>
            <th className="w-20 text-right text-white/70">Mat. €/e</th>
            <th className="w-20 text-right text-white/70">Arb. €/e</th>
            <th className="w-20 text-right text-white/70">Matl. €/e</th>
            <th className="w-14 text-right text-white/70">Norm</th>
            <th className="w-14 text-right text-white/70">Uren</th>
            <th className="w-20 text-white/70">STABU</th>
            <th className="w-24">Status</th>
            <th className="w-24"></th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const grp = rows.filter((r) => (g.id === null ? !r.chapter_id : r.chapter_id === g.id));
            const subtot = g.niveau === 'hoofd' ? hoofdSubtot(g) : grp.reduce((s, r) => s + computeRow(r, priceFactor).verkoopprijs, 0);
            const groupCollapsed = g.niveau === 'hoofd' && collapsed.has(g.id);
            return (
              <ChapterBlock
                key={g.id || 'losse'}
                group={g}
                rows={groupCollapsed ? [] : grp}
                rowCount={grp.length}
                subtot={subtot}
                isActive={activeChapterId === g.id}
                open={open}
                setOpen={setOpen}
                activeRowId={activeRowId}
                onSelectRow={onSelectRow}
                onPatchRow={onPatchRow}
                onRemoveRow={onRemoveRow}
                onDuplicateRow={onDuplicateRow}
                onMoveRow={onMoveRow}
                onAddRow={onAddRow}
                onAddCombi={onAddCombi}
                onPatchComponent={onPatchComponent}
                priceFactor={priceFactor}
              />
            );
          })}
          {groups.length === 0 && (
            <tr><td colSpan={COLS} className="px-4 py-8 text-center text-gray-400">Nog geen hoofdstukken. Kies een projecttype of voeg een hoofdstuk toe.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ChapterBlock({
  group, rows, rowCount, subtot, isActive, open, setOpen, activeRowId,
  onSelectRow, onPatchRow, onRemoveRow, onDuplicateRow, onMoveRow, onAddRow, onAddCombi, onPatchComponent, priceFactor = 1,
}) {
  const [voorstel, setVoorstel] = useState({ open: false, loading: false, list: null });
  const niveau = group.niveau || (group.id === null ? 'losse' : 'hoofd');
  const isSub = niveau === 'sub';

  const loadVoorstel = async () => {
    setVoorstel({ open: true, loading: true, list: null });
    const list = await loadCombisVoorSubcat(group.code, group.sub_code).catch(() => []);
    setVoorstel({ open: true, loading: false, list });
  };
  const toggleVoorstel = () => {
    if (voorstel.open) { setVoorstel({ open: false, loading: false, list: null }); return; }
    loadVoorstel();
  };

  // P5-G: actief & leeg subhoofdstuk → toon direct relevante combi-voorstellen (zonder zoeken).
  useEffect(() => {
    if (isSub && isActive && rows.length === 0 && !voorstel.open) loadVoorstel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isSub, rows.length]);

  const headCls = niveau === 'hoofd'
    ? `border-y border-sterkcalc-navy/20 bg-sterkcalc-navy/[0.07] text-[11px] font-bold uppercase tracking-wide text-sterkcalc-navy ${isActive ? 'ring-1 ring-inset ring-sterkcalc-navy/40' : ''}`
    : isSub
    ? `border-b border-gray-200 bg-gray-100/70 text-[11px] font-semibold text-gray-700 ${isActive ? 'bg-sterkcalc-blue/10 ring-1 ring-inset ring-sterkcalc-blue/30' : ''}`
    : 'border-y border-amber-200 bg-amber-50 text-[11px] font-semibold uppercase tracking-wide text-amber-700';

  const label = isSub
    ? `${group.code ? group.code + (group.sub_code ? '.' + group.sub_code : '') + ' — ' : ''}${group.naam}`
    : niveau === 'hoofd'
    ? `§ ${group.code ? group.code + ' — ' : ''}${group.naam}`
    : group.naam;

  const count = rowCount != null ? rowCount : rows.length;

  return (
    <>
      <tr id={group.id ? `wt-ch-${group.id}` : undefined} className={`cursor-pointer ${headCls}`} onClick={() => onSelectRow(null)}>
        <td colSpan={6} className={`py-1.5 ${isSub ? 'pl-7 pr-2' : 'px-2'}`}>
          <span className="inline-flex items-center gap-2">
            {label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${count ? 'bg-sterkcalc-navy/10 text-sterkcalc-navy' : 'bg-gray-200 text-gray-500'}`}>
              {count} {count === 1 ? 'regel' : 'regels'}
            </span>
          </span>
        </td>
        <td className="px-2 py-1.5 text-right tabular-nums font-semibold">{subtot > 0 ? fmtEUR(subtot) : ''}</td>
        <td colSpan={6}></td>
        <td colSpan={3} className="px-2 py-1.5 text-right">
          <span className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {isSub && onAddCombi && (
              <button
                onClick={toggleVoorstel}
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ${voorstel.open ? 'bg-sterkcalc-accent text-white' : 'bg-sterkcalc-accent/10 text-sterkcalc-accent ring-1 ring-sterkcalc-accent/20 hover:bg-sterkcalc-accent/20'}`}
              >
                <Boxes size={11} /> combi
              </button>
            )}
            <button
              onClick={() => onAddRow(group.id)}
              className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[11px] font-medium text-indigo-600 ring-1 ring-gray-200 hover:bg-indigo-50"
            >
              <Plus size={11} /> regel
            </button>
          </span>
        </td>
      </tr>

      {voorstel.open && (
        <tr className="bg-sterkcalc-accent/[0.06]">
          <td colSpan={COLS} className="px-2 py-2 pl-7">
            {voorstel.loading ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400"><Loader2 size={12} className="animate-spin" /> combi-voorstellen laden…</span>
            ) : (voorstel.list || []).length === 0 ? (
              <span className="text-[11px] text-gray-400">Geen combi-voorstellen voor dit subhoofdstuk.</span>
            ) : (
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-sterkcalc-accent">Voeg direct toe:</span>
                {(voorstel.list || []).map((cb) => (
                  <button
                    key={cb.id}
                    onClick={async () => { await onAddCombi(cb, group.id); setVoorstel({ open: false, loading: false, list: null }); }}
                    className="inline-flex items-center gap-1 rounded-full border border-sterkcalc-accent/30 bg-white px-2.5 py-1 text-[11px] text-gray-700 hover:bg-sterkcalc-accent/10"
                    title={`${cb.naam} (per ${cb.eenheid})`}
                  >
                    <Plus size={10} className="text-sterkcalc-accent" /> {cb.naam}
                    <span className="text-gray-400">/ {cb.eenheid}</span>
                  </button>
                ))}
              </span>
            )}
          </td>
        </tr>
      )}

      {rows.map((r, i) => {
        const c = computeRow(r, priceFactor);
        const isCombi = r.type === 'combi' || r.is_combi;
        return (
          <RegelRij
            key={r.id}
            r={r}
            i={i}
            c={c}
            isCombi={isCombi}
            expanded={open[r.id]}
            active={activeRowId === r.id}
            toggle={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
            onSelectRow={onSelectRow}
            onPatchRow={onPatchRow}
            onRemoveRow={onRemoveRow}
            onDuplicateRow={onDuplicateRow}
            onMoveRow={onMoveRow}
            onPatchComponent={onPatchComponent}
          />
        );
      })}
    </>
  );
}

function RegelRij({ r, i, c, isCombi, expanded, active, toggle, onSelectRow, onPatchRow, onRemoveRow, onDuplicateRow, onMoveRow, onPatchComponent }) {
  const num = (field, val) => onPatchRow(r.id, { [field]: val === '' ? 0 : Number(val) });
  const marge = c.verkoopprijs - c.kostprijs;
  const [bronOpen, setBronOpen] = useState(null); // component-id waarvan de prijskoppelaar open is
  const componentBronnen = r.meta?.componentBronnen || {};
  // Koppelt een Bouwmaat-artikel aan één combi-component: zet de materiaalprijs +
  // legt de herkomst vast in de parent-row meta (componenten hebben geen eigen meta).
  const koppelComponent = (cp, a) => {
    onPatchComponent && onPatchComponent(r.id, cp.id, { materiaalprijs: Number(a.netto) || 0 });
    onPatchRow(r.id, {
      meta: {
        ...(r.meta || {}),
        componentBronnen: {
          ...componentBronnen,
          [cp.id]: { leverancier: 'Bouwmaat', catalogus: '202543', peildatum: '2025-11', code: a.code, omschrijving: a.omschrijving, netto: Number(a.netto) || 0, eenheid: a.eenheid || 'PCE' },
        },
      },
    });
    setBronOpen(null);
  };
  return (
    <>
      <tr
        onClick={() => onSelectRow(r.id)}
        className={`cursor-pointer border-b border-gray-100 [&>td]:border-r [&>td]:border-gray-100 [&>td]:px-2 [&>td]:py-1 ${
          active
            ? 'bg-sterkcalc-blue/10 ring-1 ring-inset ring-sterkcalc-blue/50'
            : isCombi
            ? 'bg-sterkcalc-blue/[0.035] hover:bg-sterkcalc-blue/[0.08]'
            : 'hover:bg-gray-50'
        }`}
      >
        <td className="text-center">
          {isCombi ? (
            <button onClick={(e) => { e.stopPropagation(); toggle(); }} className="text-gray-400 hover:text-gray-700">
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : null}
        </td>
        <td className="text-right text-gray-400">{i + 1}</td>
        <td>
          <span className="flex items-center gap-1.5">
            {isCombi && <Boxes size={12} className="shrink-0 text-sterkcalc-blue" />}
            <input
              value={r.omschrijving || ''}
              onChange={(e) => onPatchRow(r.id, { omschrijving: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="omschrijving…"
              className="w-full bg-transparent outline-none focus:rounded focus:bg-white focus:px-1 focus:ring-1 focus:ring-indigo-300"
            />
          </span>
        </td>
        <td className="text-right">
          <Num value={r.hoeveelheid} onChange={(v) => num('hoeveelheid', v)} />
        </td>
        <td>
          <input
            value={r.eenheid || ''}
            onChange={(e) => onPatchRow(r.id, { eenheid: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="w-12 bg-transparent outline-none focus:bg-white"
          />
        </td>
        <td className="text-right">
          <Num value={r.opslag_perc} onChange={(v) => num('opslag_perc', v)} />
        </td>
        <td className="text-right font-semibold tabular-nums text-sterkcalc-navy">{fmtEUR(c.verkoopprijs)}</td>
        <td className={`text-right tabular-nums ${marge < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{fmtEUR(marge)}</td>
        <td className="text-right text-gray-500">
          {isCombi ? <span className="tabular-nums">{fmtNum(c.unit.materiaalprijs)}</span> : <Num value={r.materiaalprijs} onChange={(v) => num('materiaalprijs', v)} muted />}
        </td>
        <td className="text-right text-gray-500">
          {isCombi ? <span className="tabular-nums">{fmtNum(c.unit.arbeidsprijs)}</span> : <Num value={r.arbeidsprijs} onChange={(v) => num('arbeidsprijs', v)} muted />}
        </td>
        <td className="text-right text-gray-500">
          {isCombi ? <span className="tabular-nums">{fmtNum(c.unit.materieelprijs)}</span> : <Num value={r.materieelprijs} onChange={(v) => num('materieelprijs', v)} muted />}
        </td>
        <td className="text-right text-gray-500">
          <Num value={r.norm ?? ''} onChange={(v) => onPatchRow(r.id, { norm: v === '' ? null : Number(v) })} muted />
        </td>
        <td className="text-right tabular-nums text-gray-400">{fmtNum(c.uren, 1)}</td>
        <td className="font-mono text-[11px] text-gray-400">{r.stabu_code || '—'}</td>
        <td>
          <select
            value={r.status}
            onChange={(e) => onPatchRow(r.id, { status: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-xs outline-none"
          >
            {STATUSSEN.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-0.5 text-gray-400">
            <Icon title="Omhoog" onClick={() => onMoveRow(r.id, -1)}><ArrowUp size={13} /></Icon>
            <Icon title="Omlaag" onClick={() => onMoveRow(r.id, 1)}><ArrowDown size={13} /></Icon>
            <Icon title="Dupliceren" onClick={() => onDuplicateRow(r.id)}><Copy size={13} /></Icon>
            <Icon title="Verwijderen" danger onClick={() => onRemoveRow(r.id)}><Trash2 size={13} /></Icon>
          </div>
        </td>
      </tr>
      {isCombi && expanded && (
        <tr className="bg-gray-50/70">
          <td className="border-r border-gray-100"></td>
          <td colSpan={COLS - 1} className="px-2 py-1.5">
            <div className="rounded border border-gray-200 bg-white">
              <div className="flex items-center gap-2 border-b border-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500">
                <Boxes size={12} className="text-sterkcalc-blue" />
                Opbouw (per {r.eenheid || 'eenheid'}) — {(r._components || []).length} componenten
              </div>
              <table className="w-full text-[11px]">
                <thead><tr className="border-b border-gray-100 text-[10px] uppercase tracking-wide text-gray-400 [&>th]:px-2 [&>th]:py-0.5 [&>th]:text-left"><th>Type</th><th>STABU</th><th>Omschrijving</th><th className="text-right">Hoev.</th><th className="text-right">Mat. €</th><th className="text-right">Arb. €</th><th className="text-right">Matl. €</th><th>Mat.bron</th></tr></thead>
                <tbody>
                  {(r._components || []).map((cp) => {
                    const cnum = (field, val) => onPatchComponent && onPatchComponent(r.id, cp.id, { [field]: val === '' ? 0 : Number(val) });
                    const edit = !!onPatchComponent;
                    const bron = componentBronnen[cp.id];
                    return (
                      <Fragment key={cp.id}>
                      <tr className="border-b border-gray-50 [&>td]:px-2 [&>td]:py-0.5">
                        <td className="w-20 capitalize text-gray-500">{cp.type}</td>
                        <td className="w-16 font-mono text-gray-400">{cp.stabu_code || ''}</td>
                        <td>{cp.omschrijving}</td>
                        <td className="w-24 text-right tabular-nums">
                          {edit ? <CompNum value={cp.hoeveelheid} onChange={(v) => cnum('hoeveelheid', v)} /> : fmtNum(cp.hoeveelheid, 3)} <span className="text-gray-400">{cp.eenheid}</span>
                        </td>
                        <td className="w-16 text-right tabular-nums text-gray-500">{edit ? <CompNum value={cp.materiaalprijs} onChange={(v) => cnum('materiaalprijs', v)} /> : fmtNum(cp.materiaalprijs)}</td>
                        <td className="w-16 text-right tabular-nums text-gray-500">{edit ? <CompNum value={cp.arbeidsprijs} onChange={(v) => cnum('arbeidsprijs', v)} /> : fmtNum(cp.arbeidsprijs)}</td>
                        <td className="w-16 text-right tabular-nums text-gray-500">{edit ? <CompNum value={cp.materieelprijs} onChange={(v) => cnum('materieelprijs', v)} /> : fmtNum(cp.materieelprijs)}</td>
                        <td className="w-28">
                          {edit && (cp.type === 'materiaal' || cp.type === 'materieel') ? (
                            bron ? (
                              <button onClick={(e) => { e.stopPropagation(); setBronOpen(bronOpen === cp.id ? null : cp.id); }} title={`${bron.leverancier} ${bron.code} — €${Number(bron.netto).toFixed(2)} (${bron.omschrijving})`} className="inline-flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-900">
                                <Check size={11} /> {bron.code}
                              </button>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); setBronOpen(bronOpen === cp.id ? null : cp.id); }} className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 hover:text-emerald-900">
                                <Tag size={11} /> koppel
                              </button>
                            )
                          ) : null}
                        </td>
                      </tr>
                      {bronOpen === cp.id && (
                        <tr className="bg-emerald-50/40">
                          <td colSpan={8} className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                            <div className="text-[10px] text-emerald-800 mb-1">Bouwmaat-prijs koppelen aan <strong>{cp.omschrijving}</strong> — vervangt de materiaalprijs van dit component.</div>
                            <BouwmaatZoeker onKies={(a) => koppelComponent(cp, a)} />
                          </td>
                        </tr>
                      )}
                      </Fragment>
                    );
                  })}
                  {(r._components || []).length === 0 && (
                    <tr><td className="px-2 py-1 text-gray-400" colSpan={8}>geen componenten</td></tr>
                  )}
                </tbody>
              </table>
              {onPatchComponent && (r._components || []).length > 0 && <div className="px-2 py-1 text-[10px] text-gray-400">Componenten zijn bewerkbaar — wijzigingen werken direct door in de combi-prijs. Materiaal-componenten kun je koppelen aan een echte Bouwmaat-prijs.</div>}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function CompNum({ value, onChange }) {
  return (
    <input
      type="number"
      value={value ?? 0}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="w-16 rounded bg-transparent px-1 text-right tabular-nums outline-none hover:bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-300"
    />
  );
}

function Num({ value, onChange, muted }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className={`w-full bg-transparent text-right tabular-nums outline-none focus:rounded focus:bg-white focus:px-1 focus:ring-1 focus:ring-indigo-300 ${muted ? 'text-gray-500' : ''}`}
    />
  );
}

function Icon({ children, onClick, title, danger }) {
  return (
    <button title={title} onClick={onClick} className={`rounded p-1 hover:bg-gray-100 ${danger ? 'hover:text-red-600' : 'hover:text-gray-700'}`}>
      {children}
    </button>
  );
}
