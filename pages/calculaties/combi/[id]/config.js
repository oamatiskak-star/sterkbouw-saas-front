// pages/calculaties/combi/[id]/config.js — combi-configurator (5-staps wizard)
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, Plus, Check } from 'lucide-react';
import { loadCombi, loadCombiComponents, voegCombiToe } from '@/services/combis';
import { berekenRuimte, combiUnitKost, combiHoeveelheid, configureerRegels, DRIVERS } from '@/lib/calc/combiConfigurator';
import { fmtEUR, fmtNum } from '@/lib/calc/werktafelTotals';

const STAPPEN = ['Details', 'Maten', 'Controle', 'Berekenen', 'Resultaat'];

export default function CombiConfigurator() {
  const router = useRouter();
  const { id, calc } = router.query;
  const [combi, setCombi] = useState(null);
  const [comps, setComps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [stap, setStap] = useState(0);

  const [details, setDetails] = useState({ afwerking: 'standaard', kwaliteit: 'midden' });
  const [maten, setMaten] = useState({ lengte: 2.5, breedte: 2.6, hoogte: 2.6 });
  const [driver, setDriver] = useState('wand');

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const [c, k] = await Promise.all([loadCombi(id), loadCombiComponents(id)]);
        setCombi(c);
        setComps(k);
        if ((c?.eenheid || '').match(/st|set/i)) setDriver('stuk');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const opp = useMemo(() => berekenRuimte(maten), [maten]);
  const hoeveelheid = useMemo(() => combiHoeveelheid(combi, opp, driver), [combi, opp, driver]);
  const unitKost = useMemo(() => combiUnitKost(comps), [comps]);
  const regels = useMemo(() => configureerRegels(comps, hoeveelheid), [comps, hoeveelheid]);
  const kostprijs = useMemo(() => regels.reduce((s, r) => s + r.totaal, 0), [regels]);

  const toevoegen = async () => {
    if (!calc) {
      window.alert('Open eerst een calculatie (via Werktafel) om toe te voegen.');
      return;
    }
    setBusy(true);
    try {
      await voegCombiToe({ calculatieId: calc, combi, hoeveelheid });
      router.push(`/calculaties/${calc}/werktafel`);
    } catch (e) {
      window.alert('Toevoegen mislukt: ' + (e.message || e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;
  if (!combi) return <div className="p-8 text-sm text-gray-400">Combi niet gevonden.</div>;
  const qs = calc ? `?calc=${calc}` : '';

  return (
    <div className="mx-auto max-w-6xl p-6">
      <Link href={`/calculaties/combi/${id}${qs}`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft size={15} /> Terug naar combi
      </Link>

      {/* Stappen */}
      <div className="mb-5 flex items-center gap-2">
        {STAPPEN.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button onClick={() => setStap(i)} className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${i === stap ? 'bg-sterkcalc-navy text-white' : i < stap ? 'bg-sterkcalc-accent/15 text-sterkcalc-accent' : 'bg-gray-100 text-gray-500'}`}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">{i < stap ? <Check size={11} /> : i + 1}</span>{s}
            </button>
            {i < STAPPEN.length - 1 ? <span className="h-px w-6 bg-gray-200" /> : null}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Hoofd */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h1 className="text-lg font-semibold text-gray-900">{combi.code} {combi.naam}</h1>
            {combi.omschrijving ? <p className="text-sm text-gray-500">{combi.omschrijving}</p> : null}

            {stap === 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Veld label="Afwerking"><select value={details.afwerking} onChange={(e) => setDetails({ ...details, afwerking: e.target.value })} className={inp}><option value="basis">Basis</option><option value="standaard">Standaard</option><option value="luxe">Luxe</option></select></Veld>
                <Veld label="Kwaliteitsniveau"><select value={details.kwaliteit} onChange={(e) => setDetails({ ...details, kwaliteit: e.target.value })} className={inp}><option value="laag">Laag</option><option value="midden">Midden</option><option value="hoog">Hoog</option></select></Veld>
                <Veld label="Rekenbasis (driver)"><select value={driver} onChange={(e) => setDriver(e.target.value)} className={inp}>{DRIVERS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}</select></Veld>
              </div>
            )}
            {stap === 1 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Veld label="Lengte (m)"><input type="number" step="0.01" value={maten.lengte} onChange={(e) => setMaten({ ...maten, lengte: e.target.value })} className={inp} /></Veld>
                <Veld label="Breedte (m)"><input type="number" step="0.01" value={maten.breedte} onChange={(e) => setMaten({ ...maten, breedte: e.target.value })} className={inp} /></Veld>
                <Veld label="Hoogte (m)"><input type="number" step="0.01" value={maten.hoogte} onChange={(e) => setMaten({ ...maten, hoogte: e.target.value })} className={inp} /></Veld>
                <div className="col-span-3 mt-1 grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                  <Kpi l="Vloer" v={`${fmtNum(opp.vloer)} m²`} /><Kpi l="Plafond" v={`${fmtNum(opp.plafond)} m²`} /><Kpi l="Wand (netto)" v={`${fmtNum(opp.wand_netto)} m²`} />
                </div>
              </div>
            )}
            {stap === 2 && (
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <Row l="Afwerking" v={details.afwerking} /><Row l="Kwaliteit" v={details.kwaliteit} />
                <Row l="Maten (l×b×h)" v={`${maten.lengte} × ${maten.breedte} × ${maten.hoogte} m`} />
                <Row l="Rekenbasis" v={DRIVERS.find((d) => d.key === driver)?.label} />
                <Row l="Hoeveelheid combi" v={`${fmtNum(hoeveelheid)} ${combi.eenheid}`} />
                <p className="rounded bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700">Controleer de gegevens; pas zo nodig aan in stap Maten.</p>
              </div>
            )}
            {(stap === 3 || stap === 4) && (
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500"><tr className="[&>th]:px-2 [&>th]:py-1.5 [&>th]:text-left"><th>Component</th><th>STABU</th><th className="text-right">Hoev.</th><th>Eenh.</th><th className="text-right">Totaal</th></tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {regels.map((r) => (
                      <tr key={r.id} className="[&>td]:px-2 [&>td]:py-1">
                        <td className="text-gray-800">{r.omschrijving}</td><td className="font-mono text-gray-400">{r.stabu_code}</td>
                        <td className="text-right tabular-nums">{fmtNum(r.hoeveelheid_totaal)}</td><td className="text-gray-500">{r.eenheid}</td>
                        <td className="text-right tabular-nums font-medium">{fmtEUR(r.totaal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button disabled={stap === 0} onClick={() => setStap((s) => Math.max(0, s - 1))} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 disabled:opacity-40">← Vorige</button>
            {stap < 4 ? (
              <button onClick={() => setStap((s) => Math.min(4, s + 1))} className="rounded-lg bg-sterkcalc-navy px-4 py-2 text-sm font-medium text-white hover:bg-sterkcalc-navy2">Volgende →</button>
            ) : (
              <button onClick={toevoegen} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Toevoegen aan werktafel</button>
            )}
          </div>
        </div>

        {/* Samenvatting */}
        <aside className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Combi-overzicht</div>
          <div className="mt-2 space-y-1.5 text-sm">
            <Row l="Eenheid" v={combi.eenheid} /><Row l="Hoeveelheid" v={fmtNum(hoeveelheid)} />
            <Row l="Kostprijs/eenheid" v={fmtEUR(unitKost)} /><Row l="Componenten" v={comps.length} />
          </div>
          <div className="mt-3 rounded-lg bg-gray-50 p-3">
            <div className="text-[11px] uppercase tracking-wide text-gray-400">Indicatie (excl. btw)</div>
            <div className="text-xl font-semibold text-gray-900">{fmtEUR(kostprijs)}</div>
            <div className="text-[11px] text-gray-400">o.b.v. huidige prijzen</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inp = 'w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-sterkcalc-blue';
function Veld({ label, children }) { return <label className="block"><span className="mb-0.5 block text-[11px] text-gray-500">{label}</span>{children}</label>; }
function Row({ l, v }) { return <div className="flex justify-between"><span className="text-gray-500">{l}</span><span className="font-medium text-gray-900">{v}</span></div>; }
function Kpi({ l, v }) { return <div><div className="text-[11px] text-gray-400">{l}</div><div className="font-semibold tabular-nums text-gray-800">{v}</div></div>; }
