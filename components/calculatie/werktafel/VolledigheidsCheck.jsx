// components/calculatie/werktafel/VolledigheidsCheck.jsx
// P5-J — verplichte volledigheidscheck vóór de offerte. Geen blinde offerte meer.
// Toont ontbrekende hoofdstukken, lege (kritieke) onderdelen en lege subhoofdstukken.
// De gebruiker kiest: terug naar de calculatie, of toch doorgaan naar de offerte.
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';

export default function VolledigheidsCheck({ open, busy, result, onClose, onDoorgaan }) {
  if (!open) return null;
  const r = result;
  const compleet = r && r.compleet;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-sterkcalc-navy">
            {compleet ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-amber-500" />}
            Volledigheidscheck{r ? ` — ${r.projecttype}` : ''}
          </span>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X size={16} /></button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
          {busy || !r ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-400"><Loader2 size={16} className="animate-spin" /> calculatie controleren…</div>
          ) : compleet ? (
            <div className="py-6 text-center">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-600" />
              <p className="text-sm font-medium text-gray-800">De calculatie is compleet.</p>
              <p className="mt-1 text-[12px] text-gray-500">Alle template-hoofdstukken zijn aanwezig en gevuld. Klaar voor de offerte.</p>
            </div>
          ) : (
            <>
              <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                Deze calculatie bevat nog {r.openCount} open onderdel{r.openCount === 1 ? '' : 'en'}.
              </p>

              {r.kritiekOpen.length > 0 && (
                <Section title="Kritieke onderdelen" tone="red">
                  {r.kritiekOpen.map((m) => (
                    <Item key={`k${m.cat}`} tone="red">{m.naam} <span className="text-[11px] opacity-70">({m.reden})</span></Item>
                  ))}
                </Section>
              )}

              {r.ontbrekendeHoofd.filter((m) => !m.kritiek).length > 0 && (
                <Section title="Ontbrekende hoofdstukken" tone="amber">
                  {r.ontbrekendeHoofd.filter((m) => !m.kritiek).map((m) => (
                    <Item key={`o${m.cat}`} tone="amber">{m.naam}</Item>
                  ))}
                </Section>
              )}

              {r.legeHoofd.filter((m) => !m.kritiek).length > 0 && (
                <Section title="Lege hoofdstukken" tone="amber">
                  {r.legeHoofd.filter((m) => !m.kritiek).map((m) => (
                    <Item key={`l${m.cat}`} tone="amber">{m.naam}</Item>
                  ))}
                </Section>
              )}

              {r.legeSub.length > 0 && (
                <Section title={`Lege subhoofdstukken (${r.legeSub.length})`} tone="gray">
                  {r.legeSub.slice(0, 14).map((m) => (
                    <Item key={`s${m.cat}.${m.sub}`} tone="gray">{m.naam}</Item>
                  ))}
                  {r.legeSub.length > 14 && <Item tone="gray">+{r.legeSub.length - 14} meer…</Item>}
                </Section>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-3">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Terug naar calculatie
          </button>
          <button
            onClick={onDoorgaan}
            disabled={busy || !r}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white ${compleet ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sterkcalc-navy hover:bg-sterkcalc-navy/90'} disabled:opacity-50`}
          >
            {compleet ? 'Naar offerte' : 'Toch doorgaan'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, tone, children }) {
  return (
    <div className="mb-3">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{title}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Item({ tone = 'gray', children }) {
  const cls = {
    red: 'border-red-200 bg-red-50 text-red-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    gray: 'border-gray-200 bg-white text-gray-500',
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] ${cls}`}>{children}</span>;
}
