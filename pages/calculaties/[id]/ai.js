// pages/calculaties/[id]/ai.js — AI-laag: tekening→ruimteherkenning (Visions) → groepering → voorstel → werktafel (generiek)
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Loader2, Plus, Trash2, Wand2, Check, Upload, FileSearch, AlertTriangle, Sparkles, Box } from 'lucide-react';
import * as ai from '@/services/aiAnalyse';
import { groepeerRuimtes, groepeerObjecten } from '@/lib/calc/ruimteGroepering';
import { berekenRuimte, combiHoeveelheid } from '@/lib/calc/combiConfigurator';
import { fmtNum } from '@/lib/calc/werktafelTotals';

export default function AiLaag() {
  const router = useRouter();
  const { id } = router.query;
  const fileRef = useRef(null);
  const [ruimtes, setRuimtes] = useState([]);
  const [objecten, setObjecten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tol, setTol] = useState(5); // tolerantie %
  const [keuze, setKeuze] = useState({}); // typeKey -> {combi, driver}
  const [suggesties, setSuggesties] = useState({}); // klasse -> combis
  const [busy, setBusy] = useState('');
  // Bouwdeel-/objectlaag
  const [objTol, setObjTol] = useState(5);
  const [objKeuze, setObjKeuze] = useState({}); // typeKey -> {combi}
  const [objSug, setObjSug] = useState({}); // klasse -> combis
  const [objBusy, setObjBusy] = useState('');

  // Visions-state
  const [scanning, setScanning] = useState(false);
  const [visionErr, setVisionErr] = useState('');
  const [lastMeta, setLastMeta] = useState(null);
  const [analyses, setAnalyses] = useState([]);

  const herlaadRuimtes = () => ai.loadRuimtes(id).then(setRuimtes).catch(console.error);
  const herlaadObjecten = () => ai.loadObjecten(id).then(setObjecten).catch(console.error);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      ai.loadRuimtes(id).then(setRuimtes).catch(console.error),
      ai.loadObjecten(id).then(setObjecten).catch(console.error),
      ai.loadAnalyses(id).then(setAnalyses).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [id]);

  const types = useMemo(() => groepeerRuimtes(ruimtes, tol / 100), [ruimtes, tol]);
  const objTypes = useMemo(() => groepeerObjecten(objecten, objTol / 100), [objecten, objTol]);

  // suggesties per klasse laden
  useEffect(() => {
    const klassen = [...new Set(types.map((t) => t.klasse))];
    klassen.forEach((k) => {
      if (suggesties[k]) return;
      ai.suggereerCombis(k).then((c) => setSuggesties((s) => ({ ...s, [k]: c })));
    });
  }, [types]); // eslint-disable-line

  // combi-suggesties per object-klasse
  useEffect(() => {
    const klassen = [...new Set(objTypes.map((t) => t.klasse))];
    klassen.forEach((k) => {
      if (objSug[k]) return;
      ai.suggereerCombis(k).then((c) => setObjSug((s) => ({ ...s, [k]: c })));
    });
  }, [objTypes]); // eslint-disable-line

  const onPickFile = () => fileRef.current?.click();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset zodat dezelfde file opnieuw kan
    if (!file || !id) return;
    setVisionErr('');
    setLastMeta(null);
    setScanning(true);
    try {
      const { meta } = await ai.analyseTekening(id, file);
      setLastMeta(meta);
      await Promise.all([herlaadRuimtes(), herlaadObjecten()]);
      ai.loadAnalyses(id).then(setAnalyses).catch(() => {});
    } catch (err) {
      setVisionErr(err.message || String(err));
    } finally {
      setScanning(false);
    }
  };

  const addRuimte = async () => {
    const r = await ai.insertRuimte(id, { naam: 'Nieuwe ruimte', klasse: 'Ruimte', lengte: 2.5, breedte: 2.5, hoogte: 2.6 });
    setRuimtes((rs) => [...rs, r]);
  };
  const patch = (rid, field, val) => {
    setRuimtes((rs) => rs.map((r) => (r.id === rid ? { ...r, [field]: val } : r)));
    ai.updateRuimte(rid, { [field]: field === 'naam' || field === 'klasse' ? val : Number(val) || 0 }).catch(() => {});
  };
  const remove = (rid) => { setRuimtes((rs) => rs.filter((r) => r.id !== rid)); ai.deleteRuimte(rid).catch(() => {}); };

  // ---- Objecten / bouwdelen ----
  const addObject = async () => {
    const o = await ai.insertObject(id, { naam: 'Nieuw object', klasse: 'Object', lengte: null, breedte: 1, hoogte: 1, aantal: 1 });
    setObjecten((os) => [...os, o]);
  };
  const patchObject = (oid, field, val) => {
    const txt = field === 'naam' || field === 'klasse' || field === 'materiaal';
    setObjecten((os) => os.map((o) => (o.id === oid ? { ...o, [field]: val } : o)));
    ai.updateObject(oid, { [field]: txt ? val : Number(val) || (field === 'aantal' ? 1 : 0) }).catch(() => {});
  };
  const removeObject = (oid) => { setObjecten((os) => os.filter((o) => o.id !== oid)); ai.deleteObject(oid).catch(() => {}); };

  const toepassenBouwdeel = async (type) => {
    const k = objKeuze[type.key];
    if (!k?.combi) { window.alert('Kies eerst een combi voor dit bouwdeel-type.'); return; }
    setObjBusy(type.key);
    try {
      await ai.pasBouwdeelTypeToe({ calculatieId: id, type, combi: k.combi, perStukHoeveelheid: 1 });
      await ai.bewaarBouwdeelTypes(id, objTypes).catch(() => {});
      window.alert(`${type.naam}: combi × ${type.aantal} toegevoegd aan werktafel.`);
    } catch (e) {
      window.alert('Mislukt: ' + (e.message || e));
    } finally {
      setObjBusy('');
    }
  };

  const toepassen = async (type) => {
    const k = keuze[type.key];
    if (!k?.combi) { window.alert('Kies eerst een combi voor dit type.'); return; }
    setBusy(type.key);
    try {
      const opp = berekenRuimte({ lengte: type.gem.lengte, breedte: type.gem.breedte, hoogte: type.gem.hoogte });
      const perRuimte = combiHoeveelheid(k.combi, opp, k.driver || 'wand');
      await ai.pasTypeToe({ calculatieId: id, type, combi: k.combi, perRuimteHoeveelheid: perRuimte });
      window.alert(`${type.naam}: combi × ${type.aantal} toegevoegd aan werktafel.`);
    } catch (e) {
      window.alert('Mislukt: ' + (e.message || e));
    } finally {
      setBusy('');
    }
  };

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><Wand2 size={20} className="text-sterkcalc-accent" /> AI-analyse &amp; ruimteherkenning</h1>
          <p className="text-sm text-gray-500">Upload een tekening → AI herkent ruimtes, maten en openingen → groepeer herhalingen → vul de werktafel met combi × aantal. Generiek voor alle ruimtes/bouwdelen.</p>
        </div>
        <Link href={`/calculaties/${id}/werktafel`} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Naar werktafel →</Link>
      </div>

      {/* Visions: upload + AI-extractie */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-sterkcalc-navy p-2 text-white"><FileSearch size={18} /></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Tekening analyseren met AI (Visions)</div>
              <div className="text-xs text-gray-500">PDF, PNG, JPG of WEBP. AI <strong>stelt voor en meet</strong> — jij blijft eigenaar en corrigeert. Kosten/marges raakt AI nooit aan.</div>
            </div>
          </div>
          <div>
            <input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={onFile} className="hidden" />
            <button onClick={onPickFile} disabled={scanning} className="inline-flex items-center gap-2 rounded-lg bg-sterkcalc-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60">
              {scanning ? <><Loader2 size={15} className="animate-spin" /> Analyseren…</> : <><Upload size={15} /> Tekening uploaden</>}
            </button>
          </div>
        </div>

        {scanning && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-sterkcalc-navy/5 px-3 py-2 text-xs text-gray-600">
            <Sparkles size={14} className="text-sterkcalc-accent" /> AI leest de tekening, herkent ruimtes en meet maten op… dit kan even duren bij grote PDF&apos;s.
          </div>
        )}
        {visionErr && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" /> <span>{visionErr}</span>
          </div>
        )}
        {lastMeta && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <span className="font-semibold">{lastMeta.ruimtes_gevonden}</span> ruimtes, <span className="font-semibold">{lastMeta.openingen_gevonden}</span> openingen{lastMeta.objecten_gevonden != null && <> en <span className="font-semibold">{lastMeta.objecten_gevonden}</span> objecten</>} herkend
            {lastMeta.gem_confidence != null && <> · gem. zekerheid <span className="font-semibold">{Math.round(lastMeta.gem_confidence)}%</span></>}
            {lastMeta.plan_schaal && <> · schaal {lastMeta.plan_schaal}</>}
            {lastMeta.opmerkingen && <div className="mt-1 text-emerald-700/90">{lastMeta.opmerkingen}</div>}
            <div className="mt-1 text-emerald-700/70">Controleer en corrigeer hieronder — dit is een AI-voorstel.</div>
          </div>
        )}
        {analyses.length > 0 && (
          <div className="mt-3 border-t border-gray-100 pt-2 text-[11px] text-gray-400">
            Eerdere analyses: {analyses.slice(0, 4).map((a) => `${a.bestandsnaam || 'tekening'} (${a.status === 'done' ? `${a.ruimtes_gevonden} ruimtes` : a.status})`).join(' · ')}
          </div>
        )}
      </div>

      {/* Ruimtes */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Ruimtes ({ruimtes.length})</h2>
          <button onClick={addRuimte} className="inline-flex items-center gap-1 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-sterkcalc-navy2"><Plus size={13} /> Ruimte toevoegen</button>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500"><tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left"><th>Naam</th><th>Klasse</th><th className="text-right">L (m)</th><th className="text-right">B (m)</th><th className="text-right">H (m)</th><th className="text-right">Vloer</th><th className="text-right">Wand-netto</th><th className="text-right">AI</th><th></th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {ruimtes.map((r) => {
                const opp = berekenRuimte({ lengte: r.lengte, breedte: r.breedte, hoogte: r.hoogte });
                return (
                  <tr key={r.id} className="[&>td]:px-3 [&>td]:py-1.5">
                    <td><input value={r.naam || ''} onChange={(e) => patch(r.id, 'naam', e.target.value)} className="w-full bg-transparent outline-none" /></td>
                    <td><input value={r.klasse || ''} onChange={(e) => patch(r.id, 'klasse', e.target.value)} placeholder="bv. Badkamer" className="w-full bg-transparent outline-none" /></td>
                    <td><input type="number" step="0.01" value={r.lengte ?? ''} onChange={(e) => patch(r.id, 'lengte', e.target.value)} className="w-16 bg-transparent text-right outline-none" /></td>
                    <td><input type="number" step="0.01" value={r.breedte ?? ''} onChange={(e) => patch(r.id, 'breedte', e.target.value)} className="w-16 bg-transparent text-right outline-none" /></td>
                    <td><input type="number" step="0.01" value={r.hoogte ?? ''} onChange={(e) => patch(r.id, 'hoogte', e.target.value)} className="w-16 bg-transparent text-right outline-none" /></td>
                    <td className="text-right tabular-nums text-gray-500">{fmtNum(opp.vloer)}</td>
                    <td className="text-right tabular-nums text-gray-500">{fmtNum(opp.wand_netto)}</td>
                    <td className="text-right tabular-nums">
                      {r.source === 'ai'
                        ? <span className="rounded bg-sterkcalc-navy/10 px-1.5 py-0.5 text-[10px] font-medium text-sterkcalc-navy">{r.confidence != null ? `${Math.round(r.confidence)}%` : 'AI'}</span>
                        : <span className="text-[10px] text-gray-300">—</span>}
                    </td>
                    <td><button onClick={() => remove(r.id)} className="text-gray-300 hover:text-red-600"><Trash2 size={14} /></button></td>
                  </tr>
                );
              })}
              {ruimtes.length === 0 && <tr><td colSpan={9} className="px-3 py-6 text-center text-gray-400">Nog geen ruimtes — upload een tekening of voeg handmatig toe.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Groepering */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Groepering &amp; herhaling ({types.length} types)</h2>
          <label className="flex items-center gap-2 text-xs text-gray-500">Tolerantie <input type="range" min="0" max="15" value={tol} onChange={(e) => setTol(Number(e.target.value))} /> {tol}%</label>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {types.map((t) => (
            <div key={t.key} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{t.naam}</div>
                <span className="rounded-full bg-sterkcalc-navy px-2 py-0.5 text-xs font-medium text-white">× {t.aantal}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Gem. {fmtNum(t.gem.lengte)} × {fmtNum(t.gem.breedte)} × {fmtNum(t.gem.hoogte)} m · afwijking {t.afwijkingPct}% · <span className="text-sterkcalc-accent">{t.gelijkheidPct}% gelijk</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <select value={keuze[t.key]?.combi?.id || ''} onChange={(e) => { const c = (suggesties[t.klasse] || []).find((x) => x.id === e.target.value); setKeuze((k) => ({ ...k, [t.key]: { ...k[t.key], combi: c } })); }} className="rounded border border-gray-300 px-2 py-1 text-xs">
                  <option value="">— kies combi —</option>
                  {(suggesties[t.klasse] || []).map((c) => <option key={c.id} value={c.id}>{c.naam}</option>)}
                </select>
                <select value={keuze[t.key]?.driver || 'wand'} onChange={(e) => setKeuze((k) => ({ ...k, [t.key]: { ...k[t.key], driver: e.target.value } }))} className="rounded border border-gray-300 px-2 py-1 text-xs">
                  <option value="wand">per wand-m²</option><option value="vloer">per vloer-m²</option><option value="stuk">per stuk</option>
                </select>
              </div>
              {(suggesties[t.klasse] || []).length === 0 ? <p className="mt-1 text-[11px] text-gray-400">Geen combi-suggestie voor &quot;{t.klasse}&quot; — kies via de browser.</p> : null}
              <button onClick={() => toepassen(t)} disabled={busy === t.key} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-sterkcalc-accent px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60">
                {busy === t.key ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Toepassen op werktafel (× {t.aantal})
              </button>
            </div>
          ))}
          {types.length === 0 && <p className="p-6 text-sm text-gray-400">Voeg ruimtes toe om groepering te zien.</p>}
        </div>
      </div>

      {/* Objecten / bouwdelen */}
      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500"><Box size={14} /> Objecten &amp; bouwdelen ({objecten.length})</h2>
          <button onClick={addObject} className="inline-flex items-center gap-1 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-sterkcalc-navy2"><Plus size={13} /> Object toevoegen</button>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500"><tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left"><th>Naam</th><th>Klasse</th><th className="text-right">L (m)</th><th className="text-right">B (m)</th><th className="text-right">H (m)</th><th className="text-right">Aantal</th><th>Materiaal</th><th className="text-right">AI</th><th></th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {objecten.map((o) => (
                <tr key={o.id} className="[&>td]:px-3 [&>td]:py-1.5">
                  <td><input value={o.naam || ''} onChange={(e) => patchObject(o.id, 'naam', e.target.value)} className="w-full bg-transparent outline-none" /></td>
                  <td><input value={o.klasse || ''} onChange={(e) => patchObject(o.id, 'klasse', e.target.value)} placeholder="bv. Kozijn" className="w-full bg-transparent outline-none" /></td>
                  <td><input type="number" step="0.01" value={o.lengte ?? ''} onChange={(e) => patchObject(o.id, 'lengte', e.target.value)} className="w-16 bg-transparent text-right outline-none" /></td>
                  <td><input type="number" step="0.01" value={o.breedte ?? ''} onChange={(e) => patchObject(o.id, 'breedte', e.target.value)} className="w-16 bg-transparent text-right outline-none" /></td>
                  <td><input type="number" step="0.01" value={o.hoogte ?? ''} onChange={(e) => patchObject(o.id, 'hoogte', e.target.value)} className="w-16 bg-transparent text-right outline-none" /></td>
                  <td><input type="number" step="1" value={o.aantal ?? 1} onChange={(e) => patchObject(o.id, 'aantal', e.target.value)} className="w-14 bg-transparent text-right outline-none" /></td>
                  <td><input value={o.materiaal || ''} onChange={(e) => patchObject(o.id, 'materiaal', e.target.value)} placeholder="—" className="w-full bg-transparent outline-none" /></td>
                  <td className="text-right tabular-nums">
                    {o.source === 'ai'
                      ? <span className="rounded bg-sterkcalc-navy/10 px-1.5 py-0.5 text-[10px] font-medium text-sterkcalc-navy">{o.confidence != null ? `${Math.round(o.confidence)}%` : 'AI'}</span>
                      : <span className="text-[10px] text-gray-300">—</span>}
                  </td>
                  <td><button onClick={() => removeObject(o.id)} className="text-gray-300 hover:text-red-600"><Trash2 size={14} /></button></td>
                </tr>
              ))}
              {objecten.length === 0 && <tr><td colSpan={9} className="px-3 py-6 text-center text-gray-400">Nog geen objecten — upload een tekening of voeg handmatig toe.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bouwdeel-types (groepering objecten) */}
      <div className="mt-6 mb-2">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Bouwdeel-types &amp; herhaling ({objTypes.length} types)</h2>
          <label className="flex items-center gap-2 text-xs text-gray-500">Tolerantie <input type="range" min="0" max="15" value={objTol} onChange={(e) => setObjTol(Number(e.target.value))} /> {objTol}%</label>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {objTypes.map((t) => (
            <div key={t.key} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{t.naam}</div>
                <span className="rounded-full bg-sterkcalc-navy px-2 py-0.5 text-xs font-medium text-white">× {t.aantal}</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Gem. {fmtNum(t.gem.lengte)} × {fmtNum(t.gem.breedte)} × {fmtNum(t.gem.hoogte)} m · afwijking {t.afwijkingPct}% · <span className="text-sterkcalc-accent">{t.gelijkheidPct}% gelijk</span>
              </div>
              <div className="mt-3">
                <select value={objKeuze[t.key]?.combi?.id || ''} onChange={(e) => { const c = (objSug[t.klasse] || []).find((x) => x.id === e.target.value); setObjKeuze((k) => ({ ...k, [t.key]: { combi: c } })); }} className="w-full rounded border border-gray-300 px-2 py-1 text-xs">
                  <option value="">— kies combi —</option>
                  {(objSug[t.klasse] || []).map((c) => <option key={c.id} value={c.id}>{c.naam}</option>)}
                </select>
              </div>
              {(objSug[t.klasse] || []).length === 0 ? <p className="mt-1 text-[11px] text-gray-400">Geen combi-suggestie voor &quot;{t.klasse}&quot; — kies via de browser.</p> : null}
              <button onClick={() => toepassenBouwdeel(t)} disabled={objBusy === t.key} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-sterkcalc-accent px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60">
                {objBusy === t.key ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Toepassen op werktafel (× {t.aantal})
              </button>
            </div>
          ))}
          {objTypes.length === 0 && <p className="p-6 text-sm text-gray-400">Voeg objecten toe om bouwdeel-types te zien.</p>}
        </div>
      </div>
    </div>
  );
}
