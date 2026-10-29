// components/sterkcalc/SchaduwPlanning.js — I-6 schaduwweergave van de centrale SterkCalc-planner. NIET leidend: de bestaande
// planning hierboven blijft de basis voor bestellen, rapportage en export. Alleen zichtbaar met NEXT_PUBLIC_STERKCALC_SCHADUWPLANNING=1.
import { useMemo, useState } from 'react';
import { schaduwPlanning } from '@/lib/calc/sterkcalc/portaalAdapter';

const wd = (u) => (u / 2).toLocaleString('nl-NL', { maximumFractionDigits: 1 });
const uur = (e4) => (e4 / 1e4).toLocaleString('nl-NL', { maximumFractionDigits: 2 });

export default function SchaduwPlanning({ chapters, rows, config, urenPortaal }) {
  const [open, setOpen] = useState(false);
  const s = useMemo(() => {
    try { return schaduwPlanning(chapters, rows, config); } catch (e) { return { fout: String(e.message || e) }; }
  }, [chapters, rows, config]);
  if (s.fout) return <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Schaduwplanning niet berekend: {s.fout}</div>;
  const c = s.canoniek;
  const urenSchaduw = c.fout.length ? null : c.uren_e4 / 1e4;
  const gelijk = urenSchaduw !== null && Math.abs(urenSchaduw - (urenPortaal || 0)) < 0.5;
  return (
    <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left">
        <span className="font-semibold text-gray-800">
          Schaduwplanning SterkCalc-methodiek{' '}
          <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-[11px] font-medium text-gray-600">niet leidend</span>
        </span>
        <span className="text-xs text-gray-500">{open ? 'verbergen' : 'tonen'}</span>
      </button>
      {open && (c.fout.length ? (
        <p className="mt-2 text-xs text-red-700">Fout in invoer: {c.fout.join(', ')}</p>
      ) : (
        <div className="mt-3 space-y-2 text-xs text-gray-700">
          <p>
            Kennisbasis {s.bron.commit.slice(0, 7)} · actieve regels:{' '}
            {c.regels_gebruikt.length ? c.regels_gebruikt.join(', ') : 'geen (alle regels nog kandidaat)'} · mapping: {s.mappingStatus}
          </p>
          <p>
            Uren schaduw {uur(c.uren_e4)} u {gelijk ? '= portaal' : `≠ portaal (${Math.round(urenPortaal || 0)} u)`} · waarvan norm{' '}
            {s.herkomst.norm.toLocaleString('nl-NL', { maximumFractionDigits: 1 })} u, afgeleid via € {s.uurtarief}/u{' '}
            {s.herkomst.afgeleid.toLocaleString('nl-NL', { maximumFractionDigits: 1 })} u
          </p>
          <p>
            Doorlooptijd: {wd(c.eind_cpm_u)} wd (kritieke pad) · {wd(c.eind_cap_u)} wd (capaciteit)
            {c.invoer_vereist.length ? ` · invoer vereist: ${c.invoer_vereist.join(', ')}` : ''}
          </p>
          {Object.keys(s.ongemapt).length > 0 && (
            <p className="text-amber-800">
              Ongemapte categorieën (geen STABU-hoofdstuk):{' '}
              {Object.entries(s.ongemapt).map(([g, u]) => `${g.replace('ONGEMAPT-', '')} (${Math.round(u)} u)`).join(', ')}
            </p>
          )}
          <table className="mt-1 w-full text-left">
            <thead><tr className="text-gray-500"><th>Activiteit</th><th className="text-right">Uren</th><th className="text-right">Duur wd</th><th className="text-right">Start wd</th></tr></thead>
            <tbody>
              {c.activiteiten.filter((a) => a.u > 0).map((a) => (
                <tr key={a.id} className={a.kritiek ? 'font-semibold' : ''}>
                  <td>{a.naam}</td><td className="text-right">{uur(a.uren_e4)}</td><td className="text-right">{wd(a.u)}</td><td className="text-right">{wd(a.cs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
