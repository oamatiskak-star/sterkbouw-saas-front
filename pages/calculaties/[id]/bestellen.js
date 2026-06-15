// pages/calculaties/[id]/bestellen.js — Sprint 8 Bestellen & Inkoop: dashboard, voorstellen,
// leverkalender, tekorten, leverancierspakketten, export. Afgeleid uit werktafel + planning.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, ShoppingCart, FileDown, Sheet, AlertTriangle, Truck, Check, Plus, Trash2, Building2 } from 'lucide-react';
import * as svc from '@/services/bestellen';
import { leverancierspakketPdf, bestellenCsv } from '@/lib/inkoop/exportBestellen';
import { fmtEUR } from '@/lib/calc/werktafelTotals';
import { verrijkBestelregel } from '@/lib/calc/besteleenheden';

const num = (v) => new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 2 }).format(Number(v) || 0);
const STATUS = { concept: 'Concept', geplaatst: 'Geplaatst', geleverd: 'Geleverd' };

export default function BestellenPagina() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [tonenLev, setTonenLev] = useState(false);

  const herlaad = async () => { const d = await svc.deriveBestellen(id); setData(d); return d; };
  useEffect(() => { if (!id) return; herlaad().catch(console.error).finally(() => setLoading(false)); }, [id]);

  const kalender = useMemo(() => {
    if (!data) return [];
    const items = [];
    for (const v of data.voorstellen) if (v.gewenste_leverdatum) items.push({ datum: v.gewenste_leverdatum, type: 'gewenst', tekst: `${v.leverancier_naam} — gewenste levering`, bedrag: v.totaal });
    for (const b of data.bestellingen) { const d = b.verwacht_at || b.gewenste_leverdatum; if (d) items.push({ datum: d, type: b.status === 'geleverd' ? 'geleverd' : 'verwacht', tekst: `${b.leverancier_naam || 'Bestelling'} — ${STATUS[b.status]}`, bedrag: b.totaal }); }
    return items.sort((a, b) => (a.datum < b.datum ? -1 : 1));
  }, [data]);

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;
  if (!data) return <div className="p-8 text-gray-500">Geen data.</div>;

  const { kpi, voorstellen, bestellingen, leveranciers, calculatie } = data;

  const plaats = async (v) => { setBusy('v' + (v.leverancier?.id || v.leverancier_naam)); try { await svc.plaatsVoorstelAlsConcept(id, v); await herlaad(); } catch (e) { window.alert(e.message || e); } finally { setBusy(''); } };
  const zetStatus = async (b, status) => {
    setBusy(b.id);
    try {
      const patch = { status };
      if (status === 'geplaatst') { patch.besteld_at = new Date().toISOString(); const lev = leveranciers.find((l) => l.id === b.leverancier_id); const dagen = lev?.levertijd_dagen || 7; const d = new Date(); d.setDate(d.getDate() + dagen); patch.verwacht_at = d.toISOString().slice(0, 10); }
      if (status === 'geleverd') patch.geleverd_at = new Date().toISOString();
      await svc.updateBestelling(b.id, patch); await herlaad();
    } finally { setBusy(''); }
  };
  const verwijder = async (b) => { if (!window.confirm('Bestelling verwijderen?')) return; await svc.deleteBestelling(b.id); await herlaad(); };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <Link href={`/calculaties/${id}/planning`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ChevronLeft size={15} /> Planning</Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><ShoppingCart size={20} className="text-sterkcalc-blue" /> Bestellen & Inkoop</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => bestellenCsv({ voorstellen, calculatie })} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"><Sheet size={14} /> Excel</button>
          <button onClick={() => setTonenLev((s) => !s)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"><Building2 size={14} /> Leveranciers</button>
        </div>
      </div>
      <p className="mt-1 text-sm text-gray-500">Automatisch afgeleid uit werktafel + planning — geen dubbele invoer. AI stelt voor; jij plaatst.</p>

      {/* KPI */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[['Inkoop (voorstel)', fmtEUR(kpi.inkoop_voorstel)], ['Besteld', fmtEUR(kpi.besteld_bedrag)], ['Ontvangen', fmtEUR(kpi.ontvangen_bedrag)], ['Openstaand', fmtEUR(kpi.openstaand_bedrag)], ['Leveranciers', kpi.aantal_leveranciers], ['Bestellingen', kpi.aantal_bestellingen], ['Open leveringen', kpi.open_leveringen], ['Vertraagd', kpi.vertraagde_leveringen]].map(([l, v]) => (
          <div key={l} className="rounded-lg border border-gray-200 bg-white p-2.5"><div className="text-[10px] uppercase tracking-wide text-gray-400">{l}</div><div className="text-sm font-semibold text-gray-900">{v}</div></div>
        ))}
      </div>

      {/* Leveranciersbeheer */}
      {tonenLev && <Leveranciersbeheer leveranciers={leveranciers} onChange={herlaad} />}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Bestelvoorstellen (leverancierspakketten) */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Bestelvoorstellen — per leverancier</h2>
            {voorstellen.length === 0 ? <p className="py-4 text-center text-sm text-gray-400">Geen materiaal in de werktafel.</p> : voorstellen.map((v) => (
              <div key={v.leverancier?.id || v.leverancier_naam} className="mb-3 rounded-lg border border-gray-100 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><div className="font-semibold text-gray-900">{v.leverancier_naam}</div><div className="text-xs text-gray-400">{v.regels.length} regels · {v.fases.join(', ')} · gewenst ~{v.gewenste_leverdatum || 'n.t.b.'}</div></div>
                  <div className="flex items-center gap-2"><span className="text-sm font-semibold tabular-nums">{fmtEUR(v.totaal)}</span>
                    <button onClick={() => leverancierspakketPdf({ pakket: v, calculatie })} className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"><FileDown size={13} /></button>
                    <button onClick={() => plaats(v)} disabled={busy.startsWith('v')} className="inline-flex items-center gap-1 rounded-lg bg-sterkcalc-navy px-2.5 py-1 text-xs font-medium text-white hover:bg-sterkcalc-navy2 disabled:opacity-60"><Plus size={12} /> Concept</button>
                  </div>
                </div>
                <div className="mt-2 max-h-32 overflow-auto text-xs text-gray-600">
                  {v.regels.slice(0, 10).map((r, i) => { const rb = verrijkBestelregel(r); return (
                    <div key={i} className="flex justify-between border-b border-gray-50 py-0.5">
                      <span>{r.omschrijving} <span className="text-gray-400">· {r.fase_label}</span></span>
                      <span className="tabular-nums text-right">
                        {num(r.hoeveelheid)} {r.eenheid}
                        {rb.bestel && <span className="ml-1 rounded bg-sterkcalc-blue/10 px-1.5 py-0.5 text-[10px] font-medium text-sterkcalc-blue">→ {rb.bestel.aantal} {rb.bestel.verpakking} ({rb.bestel.inhoud} {rb.bestel.eenheid})</span>}
                      </span>
                    </div>
                  ); })}
                  {v.regels.length > 10 && <div className="pt-1 text-gray-400">+{v.regels.length - 10} meer…</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Bestellingen */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Bestellingen</h2>
            {bestellingen.length === 0 ? <p className="py-3 text-center text-sm text-gray-400">Nog geen bestellingen geplaatst.</p> : (
              <div className="space-y-1.5">
                {bestellingen.map((b) => (
                  <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    <span><span className="font-medium text-gray-800">{b.leverancier_naam}</span> <span className="text-xs text-gray-400">{b.nummer} · {fmtEUR(b.totaal)}{b.verwacht_at ? ` · verwacht ${b.verwacht_at}` : ''}</span></span>
                    <span className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.status === 'geleverd' ? 'bg-sterkcalc-accent/15 text-sterkcalc-accent' : b.status === 'geplaatst' ? 'bg-sterkcalc-blue/15 text-sterkcalc-blue' : 'bg-gray-100 text-gray-500'}`}>{STATUS[b.status]}</span>
                      {b.status === 'concept' && <button onClick={() => zetStatus(b, 'geplaatst')} disabled={busy === b.id} className="rounded bg-sterkcalc-navy px-2 py-1 text-xs text-white">Plaatsen</button>}
                      {b.status === 'geplaatst' && <button onClick={() => zetStatus(b, 'geleverd')} disabled={busy === b.id} className="inline-flex items-center gap-1 rounded bg-sterkcalc-accent px-2 py-1 text-xs text-white"><Check size={12} /> Geleverd</button>}
                      <button onClick={() => verwijder(b)} className="text-gray-300 hover:text-red-600"><Trash2 size={14} /></button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rechts: leverkalender + tekorten */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><Truck size={15} /> Leverkalender</h2>
            {kalender.length === 0 ? <p className="text-sm text-gray-400">Geen leveringen gepland.</p> : (
              <ul className="space-y-1.5 text-sm">
                {kalender.map((k, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5">
                    <span><span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${k.type === 'geleverd' ? 'bg-sterkcalc-accent' : k.type === 'verwacht' ? 'bg-sterkcalc-blue' : 'bg-gray-300'}`} />{k.tekst}</span>
                    <span className="text-xs text-gray-400">{k.datum}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><AlertTriangle size={15} className="text-amber-500" /> Tekorten & signalen</h2>
            {data.tekorten.length === 0 ? <p className="text-sm text-gray-400">Geen tekorten of vertragingen.</p> : (
              <ul className="space-y-1.5 text-sm">
                {data.tekorten.map((t, i) => <li key={i} className={`rounded-lg px-2.5 py-1.5 ${t.niveau === 'vertraging' ? 'bg-red-50 text-red-700' : t.niveau === 'tekort' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-600'}`}>{t.tekst}</li>)}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-gray-400">AI signaleert tekorten/vertragingen en doet bestelvoorstellen — plaatst nooit zelf, kiest geen leverancier, wijzigt geen prijzen.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Leveranciersbeheer({ leveranciers, onChange }) {
  const [rij, setRij] = useState({ naam: '', categorieen: '', levertijd_dagen: 7 });
  const toevoegen = async () => {
    if (!rij.naam.trim()) return;
    await svc.saveLeverancier({ naam: rij.naam.trim(), categorieen: rij.categorieen.split(',').map((s) => s.trim()).filter(Boolean), levertijd_dagen: Number(rij.levertijd_dagen) || 7, actief: true });
    setRij({ naam: '', categorieen: '', levertijd_dagen: 7 }); onChange();
  };
  const verwijder = async (l) => { if (!window.confirm(`${l.naam} verwijderen?`)) return; await svc.deleteLeverancier(l.id); onChange(); };
  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="mb-2 text-sm font-semibold text-gray-900">Leveranciers</h2>
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <input placeholder="Naam" value={rij.naam} onChange={(e) => setRij({ ...rij, naam: e.target.value })} className="rounded border border-gray-300 px-2 py-1 text-sm" />
        <input placeholder="categorieën (bv. 25,26)" value={rij.categorieen} onChange={(e) => setRij({ ...rij, categorieen: e.target.value })} className="rounded border border-gray-300 px-2 py-1 text-sm" />
        <input type="number" placeholder="levertijd" value={rij.levertijd_dagen} onChange={(e) => setRij({ ...rij, levertijd_dagen: e.target.value })} className="w-24 rounded border border-gray-300 px-2 py-1 text-sm" />
        <button onClick={toevoegen} className="inline-flex items-center gap-1 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-xs font-medium text-white"><Plus size={13} /> Toevoegen</button>
      </div>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {leveranciers.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5 text-sm">
            <span>{l.naam} <span className="text-xs text-gray-400">· {(l.categorieen || []).join(',')} · {l.levertijd_dagen}d</span></span>
            <button onClick={() => verwijder(l)} className="text-gray-300 hover:text-red-600"><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
