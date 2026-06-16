// pages/calculaties/[id]/objecten.js — OBJECTGEDREVEN CALCULEREN (Object Engine UI).
// Ruimte → Object → Keuze → (combi → component → STABU) → werktafel. De calculator kiest
// per ruimte standaard objecten en maakt maximaal 3 keuzes per object; de werktafel vult
// automatisch. Geen STABU/combi-zoekactie, geen lege schermen, geen losse regels.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Loader2, Boxes, Plus, Trash2, Table2, Wand2, DoorOpen, Check, AlertTriangle, ArrowRight, Calculator, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import * as ai from '@/services/aiAnalyse';
import { pasRuimtesToe, instructiesVoorRuimte } from '@/services/objectEngine';
import { objectenVoorType, defaultKeuzes, ruimteType, ruimteMaten, RUIMTE_TYPE_LABELS } from '@/lib/calc/objectEngine';
import { fmtNum } from '@/lib/calc/werktafelTotals';
import { getModel } from '@/lib/calc/rekenmodellen';
import { rekenmodellenVoorProjecttype } from '@/lib/calc/projecttypeRekenmodellen';
import { PROJECTTYPE_LABELS } from '@/lib/calc/projecttypeTemplates';
import { cascoModellen } from '@/lib/calc/cascoUitTekening';
import RekenmodelConfigurator from '@/components/calculatie/rekenmodel/RekenmodelConfigurator';

const TYPE_OPTIES = Object.keys(RUIMTE_TYPE_LABELS);

export default function ObjectenPagina() {
  const router = useRouter();
  const { id } = router.query;
  const [ruimtes, setRuimtes] = useState([]);
  const [cfg, setCfg] = useState({}); // { [ruimteId]: { type, objecten: { [objKey]: {aan, keuzes} } } }
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [nieuw, setNieuw] = useState({ open: false, type: 'badkamer', naam: '', lengte: 2.5, breedte: 2.2, hoogte: 2.6 });
  const [modelOpen, setModelOpen] = useState(null); // { objectKey, initial?, label? } voor de rekenmodel-configurator
  const [projecttype, setProjecttype] = useState(null);
  const [toonOverig, setToonOverig] = useState(false); // overige (niet-aanbevolen) modellen tonen
  const [casco, setCasco] = useState(null); // casco-hoeveelheden uit de laatste vision-analyse (increment 3)

  const initObjecten = (type) => {
    const o = {};
    for (const def of objectenVoorType(type)) o[def.key] = { aan: true, keuzes: defaultKeuzes(def) };
    return o;
  };
  const initCfg = (rs) => {
    const c = {};
    for (const r of rs) { const type = ruimteType(r.klasse || r.naam); c[r.id] = { type, objecten: initObjecten(type) }; }
    return c;
  };

  useEffect(() => {
    if (!id) return;
    ai.loadRuimtes(id).then((rs) => { setRuimtes(rs); setCfg(initCfg(rs)); }).catch(console.error).finally(() => setLoading(false));
    ai.loadCalculatieMeta(id).then((m) => setProjecttype(m?.project_type || null)).catch(() => {});
    ai.loadLaatsteCasco(id).then(setCasco).catch(() => {});
  }, [id]);

  // Aanbevolen vs. overige rekenmodellen op basis van het projecttype (increment 2).
  const { aanbevolen: aanbevolenModellen, overig: overigeModellen } = useMemo(
    () => rekenmodellenVoorProjecttype(projecttype),
    [projecttype]
  );

  // Casco-rekenmodellen met vooringevulde hoeveelheden uit de tekening (increment 3).
  const cascoItems = useMemo(() => cascoModellen(casco), [casco]);

  const setType = (rid, type) => setCfg((c) => ({ ...c, [rid]: { type, objecten: initObjecten(type) } }));
  const toggleObj = (rid, key) => setCfg((c) => ({ ...c, [rid]: { ...c[rid], objecten: { ...c[rid].objecten, [key]: { ...c[rid].objecten[key], aan: !c[rid].objecten[key].aan } } } }));
  const setKeuze = (rid, objKey, kKey, val) => setCfg((c) => ({ ...c, [rid]: { ...c[rid], objecten: { ...c[rid].objecten, [objKey]: { ...c[rid].objecten[objKey], keuzes: { ...c[rid].objecten[objKey].keuzes, [kKey]: val } } } } }));

  const ruimteConfigs = useMemo(() => ruimtes.map((r) => {
    const rc = cfg[r.id]; if (!rc) return null;
    const keuzes = {}; const actieveKeys = [];
    for (const [k, o] of Object.entries(rc.objecten)) { keuzes[k] = o.keuzes; if (o.aan) actieveKeys.push(k); }
    return { ruimteId: r.id, type: rc.type, ruimte: r, label: r.naam || RUIMTE_TYPE_LABELS[rc.type], keuzes, actieveKeys };
  }).filter(Boolean), [ruimtes, cfg]);

  const totaalCombis = useMemo(() => ruimteConfigs.reduce((s, rc) => s + instructiesVoorRuimte(rc.type, rc.ruimte, rc.keuzes, rc.actieveKeys).length, 0), [ruimteConfigs]);

  const vulWerktafel = async () => {
    setBusy(true); setResult(null);
    try {
      const res = await pasRuimtesToe(id, ruimteConfigs);
      setResult(res);
    } catch (e) {
      window.alert('Mislukt: ' + (e.message || e));
    } finally {
      setBusy(false);
    }
  };

  const voegRuimteToe = async () => {
    const r = await ai.insertRuimte(id, { naam: nieuw.naam || RUIMTE_TYPE_LABELS[nieuw.type], klasse: RUIMTE_TYPE_LABELS[nieuw.type], lengte: Number(nieuw.lengte), breedte: Number(nieuw.breedte), hoogte: Number(nieuw.hoogte) });
    setRuimtes((rs) => [...rs, r]);
    setCfg((c) => ({ ...c, [r.id]: { type: nieuw.type, objecten: initObjecten(nieuw.type) } }));
    setNieuw({ open: false, type: 'badkamer', naam: '', lengte: 2.5, breedte: 2.2, hoogte: 2.6 });
  };

  const verwijderRuimte = async (rid) => {
    if (!window.confirm('Ruimte verwijderen?')) return;
    await ai.deleteRuimte(rid).catch(() => {});
    setRuimtes((rs) => rs.filter((r) => r.id !== rid));
  };

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><Boxes size={20} className="text-sterkcalc-blue" /> Ruimtes &amp; objecten</h1>
          <p className="text-sm text-gray-500">Kies per ruimte de objecten en opties — SterkCalc vult de werktafel met de juiste combi&apos;s, componenten en STABU. Geen zoekwerk.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/calculaties/${id}/ai`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"><Wand2 size={14} /> AI-tekening</Link>
          <Link href={`/calculaties/${id}/werktafel`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"><Table2 size={14} /> Werktafel</Link>
        </div>
      </div>

      {/* Actiebalk */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{ruimtes.length}</span> ruimtes · <span className="font-semibold text-gray-900">{totaalCombis}</span> combi&apos;s klaar voor de werktafel
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setNieuw((n) => ({ ...n, open: !n.open }))} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"><Plus size={14} /> Ruimte toevoegen</button>
          <button onClick={vulWerktafel} disabled={busy || ruimtes.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-sterkcalc-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Vul werktafel
          </button>
        </div>
      </div>

      {nieuw.open && (
        <div className="mt-2 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <label className="text-xs text-gray-500">Type<select value={nieuw.type} onChange={(e) => setNieuw((n) => ({ ...n, type: e.target.value }))} className="mt-1 block rounded-lg border border-gray-300 px-2 py-1.5 text-sm">{TYPE_OPTIES.map((t) => <option key={t} value={t}>{RUIMTE_TYPE_LABELS[t]}</option>)}</select></label>
          <label className="text-xs text-gray-500">Naam<input value={nieuw.naam} onChange={(e) => setNieuw((n) => ({ ...n, naam: e.target.value }))} placeholder={RUIMTE_TYPE_LABELS[nieuw.type]} className="mt-1 block rounded-lg border border-gray-300 px-2 py-1.5 text-sm" /></label>
          <label className="text-xs text-gray-500">L (m)<input type="number" step="0.1" value={nieuw.lengte} onChange={(e) => setNieuw((n) => ({ ...n, lengte: e.target.value }))} className="mt-1 block w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm" /></label>
          <label className="text-xs text-gray-500">B (m)<input type="number" step="0.1" value={nieuw.breedte} onChange={(e) => setNieuw((n) => ({ ...n, breedte: e.target.value }))} className="mt-1 block w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm" /></label>
          <label className="text-xs text-gray-500">H (m)<input type="number" step="0.1" value={nieuw.hoogte} onChange={(e) => setNieuw((n) => ({ ...n, hoogte: e.target.value }))} className="mt-1 block w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm" /></label>
          <button onClick={voegRuimteToe} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-3 py-2 text-sm font-medium text-white hover:opacity-90"><Plus size={14} /> Toevoegen</button>
        </div>
      )}

      {result && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <Check size={16} className="mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">{result.toegevoegd}</span> regels toegevoegd aan de werktafel.
            {result.ontbrekend.length > 0 && <span className="text-amber-700"> {result.ontbrekend.length} combi-code(s) niet gevonden: {result.ontbrekend.join(', ')}.</span>}
            <Link href={`/calculaties/${id}/werktafel`} className="ml-2 inline-flex items-center gap-1 font-semibold text-sterkcalc-navy hover:underline">Naar werktafel <ArrowRight size={13} /></Link>
          </div>
        </div>
      )}

      {/* Casco uit tekening — vooringevulde casco-rekenmodellen (increment 3) */}
      {cascoItems.length > 0 && (
        <div className="mt-5 rounded-xl border border-sterkcalc-accent/30 bg-sterkcalc-accent/[0.04] p-4">
          <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-sterkcalc-navy">
            <Wand2 size={16} className="text-sterkcalc-accent" /> Casco uit tekening
            <span className="text-xs font-normal text-gray-500">— hoeveelheden afgeleid uit de bouwtekening; open het rekenmodel vooringevuld</span>
            {casco?.confidence != null && <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500 ring-1 ring-gray-200">zekerheid {Math.round(casco.confidence)}%</span>}
          </div>
          {casco?.opmerking && <p className="mb-2 text-[11px] text-gray-500">{casco.opmerking}</p>}
          <p className="mb-3 text-[11px] text-amber-700">Controleer de afgeleide hoeveelheden vóór toepassen — pas ze zo nodig aan in het rekenmodel.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cascoItems.map((it) => (
              <button
                key={it.objectKey}
                onClick={() => setModelOpen({ objectKey: it.objectKey, initial: it.initial, label: it.label })}
                className="group flex flex-col gap-1 rounded-lg border border-sterkcalc-accent/30 bg-white px-3 py-2.5 text-left hover:border-sterkcalc-accent/60 hover:bg-sterkcalc-accent/[0.06]"
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{it.label}</span>
                  <Calculator size={15} className="text-sterkcalc-accent/50 group-hover:text-sterkcalc-accent" />
                </span>
                <span className="text-[11px] text-gray-500">
                  {it.hoeveelheden.map((h) => `${h.label}: ${fmtNum(h.waarde)} ${h.eenheid}`).join(' · ')}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-gray-400">Staal/constructie wordt niet automatisch afgeleid (komt van de constructietekening) — voer dat handmatig in via het Staalconstructie-rekenmodel.</p>
        </div>
      )}

      {/* Rekenmodellen (bouwdeel-calculators) — aanbevolen per projecttype (increment 2) */}
      <div className="mt-5">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><Calculator size={16} className="text-sterkcalc-blue" /> Rekenmodellen <span className="text-xs font-normal text-gray-400">— object kiezen, keuzes maken, werktafel vult</span></div>

        {aanbevolenModellen.length > 0 && (
          <>
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-sterkcalc-accent">
              <Sparkles size={13} /> Aanbevolen voor {PROJECTTYPE_LABELS[projecttype] || projecttype}
              <span className="font-normal text-gray-400">— relevant voor dit projecttype</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {aanbevolenModellen.map((m) => <ModelKaart key={m.object} m={m} aanbevolen onClick={() => setModelOpen({ objectKey: m.object })} />)}
            </div>
          </>
        )}

        {overigeModellen.length > 0 && (
          <div className={aanbevolenModellen.length > 0 ? 'mt-3' : ''}>
            {aanbevolenModellen.length > 0 ? (
              <>
                <button onClick={() => setToonOverig((v) => !v)} className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  {toonOverig ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  Overige modellen ({overigeModellen.length})
                </button>
                {toonOverig && (
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {overigeModellen.map((m) => <ModelKaart key={m.object} m={m} onClick={() => setModelOpen({ objectKey: m.object })} />)}
                  </div>
                )}
              </>
            ) : (
              // Geen (geldig) projecttype → toon alles plat, zonder valse aanbeveling.
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {overigeModellen.map((m) => <ModelKaart key={m.object} m={m} onClick={() => setModelOpen({ objectKey: m.object })} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ruimtes */}
      <div className="mt-5 space-y-4">
        {ruimtes.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center">
            <DoorOpen size={28} className="mx-auto text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">Nog geen ruimtes. Upload een tekening via <Link href={`/calculaties/${id}/ai`} className="font-medium text-sterkcalc-blue hover:underline">AI-analyse</Link> of voeg handmatig een ruimte toe.</p>
          </div>
        )}
        {ruimtes.map((r) => {
          const rc = cfg[r.id]; if (!rc) return null;
          const maten = ruimteMaten(r);
          const objDefs = objectenVoorType(rc.type);
          const combiCount = instructiesVoorRuimte(rc.type, r, Object.fromEntries(Object.entries(rc.objecten).map(([k, o]) => [k, o.keuzes])), Object.entries(rc.objecten).filter(([, o]) => o.aan).map(([k]) => k)).length;
          return (
            <div key={r.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/60 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <DoorOpen size={16} className="text-sterkcalc-navy" />
                  <span className="text-sm font-semibold text-gray-900">{r.naam || RUIMTE_TYPE_LABELS[rc.type]}</span>
                  <select value={rc.type} onChange={(e) => setType(r.id, e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1 text-xs">
                    {TYPE_OPTIES.map((t) => <option key={t} value={t}>{RUIMTE_TYPE_LABELS[t]}</option>)}
                  </select>
                  <span className="text-xs text-gray-400">{fmtNum(maten.lengte)}×{fmtNum(maten.breedte)}×{fmtNum(maten.hoogte)} m · vloer {fmtNum(maten.vloer)} m² · wand {fmtNum(maten.wand)} m²</span>
                </div>
                <div className="flex items-center gap-2">
                  {getModel(rc.type) && (
                    <button
                      onClick={() => setModelOpen({ objectKey: rc.type, label: r.naam || RUIMTE_TYPE_LABELS[rc.type], initial: { lengte: maten.lengte, breedte: maten.breedte, hoogte: maten.hoogte } })}
                      className="inline-flex items-center gap-1 rounded-lg bg-sterkcalc-accent/10 px-2.5 py-1 text-xs font-medium text-sterkcalc-accent ring-1 ring-sterkcalc-accent/20 hover:bg-sterkcalc-accent/20"
                      title="Open het diepe rekenmodel met de maatvoering van deze ruimte"
                    >
                      <Calculator size={12} /> Rekenmodel
                    </button>
                  )}
                  <span className="rounded-full bg-sterkcalc-navy px-2 py-0.5 text-xs font-medium text-white">{combiCount} combi&apos;s</span>
                  <button onClick={() => verwijderRuimte(r.id)} className="text-gray-300 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {objDefs.map((def) => {
                  const o = rc.objecten[def.key];
                  return (
                    <div key={def.key} className={`rounded-lg border p-3 ${o.aan ? 'border-sterkcalc-blue/30 bg-sterkcalc-blue/[0.03]' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" checked={o.aan} onChange={() => toggleObj(r.id, def.key)} className="h-4 w-4 accent-sterkcalc-blue" />
                        <span className="text-sm font-semibold text-gray-800">{def.naam}</span>
                      </label>
                      {o.aan && def.keuzes.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {def.keuzes.map((k) => (
                            <label key={k.key} className="block text-[11px] text-gray-500">
                              {k.label}
                              <select value={o.keuzes[k.key]} onChange={(e) => setKeuze(r.id, def.key, k.key, e.target.value)} className="mt-0.5 block w-full rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-800">
                                {k.opties.map((op) => <option key={op.v} value={op.v}>{op.label}</option>)}
                              </select>
                            </label>
                          ))}
                        </div>
                      )}
                      {o.aan && def.keuzes.length === 0 && <p className="mt-1 text-[11px] text-gray-400">Standaard inbegrepen.</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {ruimtes.length > 0 && (
        <div className="mt-5 flex items-center justify-end gap-2">
          <span className="text-xs text-gray-400">STABU zit in de combi-componenten — je hoeft niets te zoeken.</span>
          <button onClick={vulWerktafel} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-sterkcalc-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Vul werktafel ({totaalCombis})
          </button>
        </div>
      )}

      {modelOpen && (
        <RekenmodelConfigurator
          calculatieId={id}
          objectKey={modelOpen.objectKey}
          initialValues={modelOpen.initial}
          label={modelOpen.label}
          onClose={() => setModelOpen(null)}
        />
      )}
    </div>
  );
}

function ModelKaart({ m, aanbevolen, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center justify-between rounded-lg border px-3 py-2.5 text-left ${
        aanbevolen
          ? 'border-sterkcalc-accent/30 bg-sterkcalc-accent/[0.04] hover:border-sterkcalc-accent/60 hover:bg-sterkcalc-accent/[0.08]'
          : 'border-gray-200 bg-white hover:border-sterkcalc-blue/40 hover:bg-sterkcalc-blue/[0.04]'
      }`}
    >
      <span>
        <span className="block text-sm font-medium text-gray-800">{m.label}</span>
        <span className="text-[11px] text-gray-400">{(m.output || []).slice(0, 3).join(' · ')}…</span>
      </span>
      <Calculator size={15} className={aanbevolen ? 'text-sterkcalc-accent/50 group-hover:text-sterkcalc-accent' : 'text-gray-300 group-hover:text-sterkcalc-blue'} />
    </button>
  );
}
