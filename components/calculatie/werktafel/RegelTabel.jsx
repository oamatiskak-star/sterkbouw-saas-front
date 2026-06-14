// components/calculatie/werktafel/RegelTabel.jsx
import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Trash2, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { computeRow, fmtEUR, fmtNum } from '@/lib/calc/werktafelTotals';

const TYPES = ['arbeid', 'materiaal', 'materieel', 'combi', 'stelpost'];
const STATUSSEN = ['concept', 'definitief', 'optie', 'vervallen'];

export default function RegelTabel({
  chapters,
  rows,
  activeRowId,
  onSelectRow,
  onPatchRow,
  onRemoveRow,
  onDuplicateRow,
  onMoveRow,
  onAddRow,
}) {
  const [open, setOpen] = useState({}); // expanded combi rows
  const collapsed = new Set(chapters.filter((c) => c.collapsed).map((c) => c.id));

  const groups = [{ id: null, naam: 'Losse regels', code: '' }, ...chapters];

  return (
    <div className="h-full overflow-auto">
      <table className="w-full min-w-[1180px] border-collapse text-xs">
        <thead className="sticky top-0 z-10 bg-gray-50 text-gray-500">
          <tr className="[&>th]:whitespace-nowrap [&>th]:px-2 [&>th]:py-2 [&>th]:text-left [&>th]:font-medium">
            <th className="w-8"></th>
            <th className="w-10">#</th>
            <th className="w-20">STABU</th>
            <th className="min-w-[220px]">Omschrijving</th>
            <th className="w-24">Type</th>
            <th className="w-20 text-right">Hoev.</th>
            <th className="w-16">Eenh.</th>
            <th className="w-16 text-right">Norm</th>
            <th className="w-16 text-right">Uren</th>
            <th className="w-24 text-right">Mat. €/e</th>
            <th className="w-24 text-right">Arb. €/e</th>
            <th className="w-24 text-right">Matl. €/e</th>
            <th className="w-28 text-right">Kostprijs</th>
            <th className="w-16 text-right">Opslag</th>
            <th className="w-28 text-right">Verkoop</th>
            <th className="w-24">Status</th>
            <th className="w-24"></th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const grp = rows.filter((r) => (g.id === null ? !r.chapter_id : r.chapter_id === g.id));
            const isCollapsed = collapsed.has(g.id);
            const subtot = grp.reduce((s, r) => s + computeRow(r).kostprijs, 0);
            return (
              <ChapterBlock
                key={g.id || 'losse'}
                group={g}
                rows={grp}
                subtot={subtot}
                collapsed={isCollapsed}
                open={open}
                setOpen={setOpen}
                activeRowId={activeRowId}
                onSelectRow={onSelectRow}
                onPatchRow={onPatchRow}
                onRemoveRow={onRemoveRow}
                onDuplicateRow={onDuplicateRow}
                onMoveRow={onMoveRow}
                onAddRow={onAddRow}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ChapterBlock({
  group,
  rows,
  subtot,
  collapsed,
  open,
  setOpen,
  activeRowId,
  onSelectRow,
  onPatchRow,
  onRemoveRow,
  onDuplicateRow,
  onMoveRow,
  onAddRow,
}) {
  return (
    <>
      <tr className="bg-gray-100/80 text-[11px] font-semibold uppercase tracking-wide text-gray-600">
        <td colSpan={12} className="px-2 py-1.5">
          {group.code ? `§ ${group.code} — ` : ''}
          {group.naam}
        </td>
        <td className="px-2 py-1.5 text-right tabular-nums">{fmtEUR(subtot)}</td>
        <td colSpan={3}></td>
        <td className="px-2 py-1.5 text-right">
          <button
            onClick={() => onAddRow(group.id)}
            className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[11px] font-medium text-indigo-600 ring-1 ring-gray-200 hover:bg-indigo-50"
          >
            <Plus size={11} /> regel
          </button>
        </td>
      </tr>
      {!collapsed &&
        rows.map((r, i) => {
          const c = computeRow(r);
          const isCombi = r.type === 'combi' || r.is_combi;
          const expanded = open[r.id];
          return (
            <RegelRij
              key={r.id}
              r={r}
              i={i}
              c={c}
              isCombi={isCombi}
              expanded={expanded}
              active={activeRowId === r.id}
              toggle={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
              onSelectRow={onSelectRow}
              onPatchRow={onPatchRow}
              onRemoveRow={onRemoveRow}
              onDuplicateRow={onDuplicateRow}
              onMoveRow={onMoveRow}
            />
          );
        })}
    </>
  );
}

function RegelRij({ r, i, c, isCombi, expanded, active, toggle, onSelectRow, onPatchRow, onRemoveRow, onDuplicateRow, onMoveRow }) {
  const num = (field, val) => onPatchRow(r.id, { [field]: val === '' ? 0 : Number(val) });
  return (
    <>
      <tr
        onClick={() => onSelectRow(r.id)}
        className={`cursor-pointer border-b border-gray-100 [&>td]:px-2 [&>td]:py-1 ${
          active ? 'bg-indigo-50/60' : 'hover:bg-gray-50'
        }`}
      >
        <td>
          {isCombi ? (
            <button onClick={(e) => { e.stopPropagation(); toggle(); }} className="text-gray-400 hover:text-gray-700">
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : null}
        </td>
        <td className="text-gray-400">{i + 1}</td>
        <td className="font-mono text-[11px] text-gray-500">{r.stabu_code || '—'}</td>
        <td>
          <input
            value={r.omschrijving || ''}
            onChange={(e) => onPatchRow(r.id, { omschrijving: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            placeholder="omschrijving…"
            className="w-full bg-transparent outline-none focus:rounded focus:bg-white focus:px-1 focus:ring-1 focus:ring-indigo-300"
          />
        </td>
        <td>
          <select
            value={r.type}
            onChange={(e) => onPatchRow(r.id, { type: e.target.value, is_combi: e.target.value === 'combi' })}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-xs outline-none"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
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
          <Num value={r.norm ?? ''} onChange={(v) => onPatchRow(r.id, { norm: v === '' ? null : Number(v) })} />
        </td>
        <td className="text-right tabular-nums text-gray-500">{fmtNum(c.uren, 1)}</td>
        <td className="text-right">
          {isCombi ? (
            <span className="tabular-nums text-gray-500">{fmtNum(c.unit.materiaalprijs)}</span>
          ) : (
            <Num value={r.materiaalprijs} onChange={(v) => num('materiaalprijs', v)} />
          )}
        </td>
        <td className="text-right">
          {isCombi ? (
            <span className="tabular-nums text-gray-500">{fmtNum(c.unit.arbeidsprijs)}</span>
          ) : (
            <Num value={r.arbeidsprijs} onChange={(v) => num('arbeidsprijs', v)} />
          )}
        </td>
        <td className="text-right">
          {isCombi ? (
            <span className="tabular-nums text-gray-500">{fmtNum(c.unit.materieelprijs)}</span>
          ) : (
            <Num value={r.materieelprijs} onChange={(v) => num('materieelprijs', v)} />
          )}
        </td>
        <td className="text-right font-medium tabular-nums">{fmtEUR(c.kostprijs)}</td>
        <td className="text-right">
          <Num value={r.opslag_perc} onChange={(v) => num('opslag_perc', v)} />
        </td>
        <td className="text-right tabular-nums text-gray-700">{fmtEUR(c.verkoopprijs)}</td>
        <td>
          <select
            value={r.status}
            onChange={(e) => onPatchRow(r.id, { status: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-xs outline-none"
          >
            {STATUSSEN.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
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
        <tr className="bg-gray-50/60">
          <td></td>
          <td colSpan={16} className="px-2 py-1.5">
            <div className="rounded border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500">
                Opbouw (per {r.eenheid || 'eenheid'}) — {(r._components || []).length} componenten
              </div>
              <table className="w-full text-[11px]">
                <tbody>
                  {(r._components || []).map((cp) => (
                    <tr key={cp.id} className="border-b border-gray-50 [&>td]:px-2 [&>td]:py-0.5">
                      <td className="w-20 capitalize text-gray-500">{cp.type}</td>
                      <td className="font-mono text-gray-400">{cp.stabu_code || ''}</td>
                      <td>{cp.omschrijving}</td>
                      <td className="w-24 text-right tabular-nums">
                        {fmtNum(cp.hoeveelheid, 3)} {cp.eenheid}
                      </td>
                      <td className="w-28 text-right tabular-nums text-gray-500">
                        mat {fmtNum(cp.materiaalprijs)} · arb {fmtNum(cp.arbeidsprijs)}
                        {Number(cp.materieelprijs) ? ` · matl ${fmtNum(cp.materieelprijs)}` : ''}
                      </td>
                    </tr>
                  ))}
                  {(r._components || []).length === 0 && (
                    <tr>
                      <td className="px-2 py-1 text-gray-400" colSpan={5}>
                        geen componenten
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Num({ value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className="w-full bg-transparent text-right tabular-nums outline-none focus:rounded focus:bg-white focus:px-1 focus:ring-1 focus:ring-indigo-300"
    />
  );
}

function Icon({ children, onClick, title, danger }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`rounded p-1 hover:bg-gray-100 ${danger ? 'hover:text-red-600' : 'hover:text-gray-700'}`}
    >
      {children}
    </button>
  );
}
