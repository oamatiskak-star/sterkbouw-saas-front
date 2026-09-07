// pages/calculaties/[id]/offerte.js — Offerte Excellence builder (Sprint 6, 2Jours++)
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, FileText, Send, FilePlus2, Download, Plus, Trash2, Copy, Eye, Image as ImageIcon } from 'lucide-react';
import { maakOfferte, loadSettings } from '@/services/calcModules';
import * as oe from '@/services/offerteExcellence';
import { genereerOffertePdf } from '@/lib/offerte/genereerOffertePdf';
import { fmtEUR } from '@/lib/calc/werktafelTotals';
import VerzendModule from '@/components/calculatie/offerte/VerzendModule';

const TABS = ['Cover', 'Ontwerp', 'Projectomschrijving', 'Samenvatting', 'Werkzaamheden', 'Opties', 'Planning', 'Termijnen', 'Versturen'];
const STATUS_LABEL = { concept: 'Concept', verzonden: 'Verzonden', bekeken: 'Bekeken', vraag: 'Vraag gesteld', akkoord: 'Akkoord', getekend: 'Getekend', afgewezen: 'Afgewezen' };

export default function OfferteBuilder() {
  const router = useRouter();
  const { id } = router.query;
  const [ctx, setCtx] = useState(null);
  const [settings, setSettings] = useState({});
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState('Cover');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [melding, setMelding] = useState(null);

  const offerte = ctx?.offerte;

  const herlaad = async () => {
    const c = await oe.loadOfferteContext(id);
    setCtx(c);
    if (c.offerte) setEvents(await oe.loadEvents(c.offerte.id).catch(() => []));
    return c;
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      try { await herlaad(); setSettings((await loadSettings().catch(() => ({}))) || {}); } finally { setLoading(false); }
    })();
  }, [id]);

  useEffect(() => {
    if (!offerte) return;
    const patch = {};
    if (!offerte.termijnen?.length) patch.termijnen = oe.DEFAULT_TERMIJNEN;
    if (!offerte.planning?.length) patch.planning = oe.DEFAULT_PLANNING;
    if (!offerte.content?.zekerheden?.length) patch.content = { ...(offerte.content || {}), zekerheden: oe.DEFAULT_ZEKERHEDEN };
    if (Object.keys(patch).length) oe.saveOfferteVelden(offerte.id, patch).then(herlaad).catch(() => {});
  }, [offerte?.id]); // eslint-disable-line

  const kpi = useMemo(() => (offerte && ctx?.totalen ? oe.berekenKpi(offerte, ctx.totalen) : null), [offerte, ctx]);
  const termijnen = useMemo(() => (offerte ? oe.termijnBedragen(offerte.termijnen, kpi?.investering || 0) : []), [offerte, kpi]);

  const setVeld = async (patch) => {
    setCtx((c) => ({ ...c, offerte: { ...c.offerte, ...patch } }));
    await oe.saveOfferteVelden(offerte.id, patch).catch((e) => window.alert('Opslaan mislukt: ' + e.message));
  };

  const maken = async () => { setBusy(true); try { await maakOfferte(id); await herlaad(); } catch (e) { window.alert(e.message || e); } finally { setBusy(false); } };
  const downloadPdf = async () => { setBusy(true); try { await genereerOffertePdf({ ...ctx, settings }); } catch (e) { window.alert('PDF mislukt: ' + (e.message || e)); } finally { setBusy(false); } };
  const versturen = async () => { setBusy(true); try { await oe.logEvent(offerte.id, 'verzonden'); await oe.saveOfferteVelden(offerte.id, { status: 'verzonden', verzonden_at: new Date().toISOString() }); await herlaad(); } finally { setBusy(false); } };

  // P7.6 — afronding: status verzonden + portaal-token aanmaken + audittrail (kanaal/onderwerp).
  const markeerVerzonden = async ({ kanaal, onderwerp, bijlagen } = {}) => {
    setBusy(true);
    try {
      const patch = { status: 'verzonden', verzonden_at: new Date().toISOString() };
      if (!offerte.portal_token) patch.portal_token = (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tok_${Date.now()}_${Math.round(Math.random() * 1e6)}`);
      await oe.saveOfferteVelden(offerte.id, patch);
      await oe.logEvent(offerte.id, 'verzonden', { bericht: kanaal ? `via ${kanaal}` : null, meta: { onderwerp, bijlagen } });
      await herlaad();
    } finally { setBusy(false); }
  };

  // Echte verzending: premium e-mail via Mailtrap/Resend (server-side, env-gated) + status/token.
  const verstuurMail = async () => {
    setBusy(true);
    try {
      const r = await fetch('/api/offerte/verstuur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerte_id: offerte.id }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Versturen mislukt');
      await herlaad();
      if (j.mailSent) {
        setMelding({ soort: 'succes', tekst: `E-mail verstuurd via ${j.mailProvider}.` });
      } else {
        setMelding({
          soort: 'waarschuwing',
          tekst: `Offerte gemarkeerd als verzonden en portaallink aangemaakt, maar de e-mail is NIET automatisch verstuurd (${j.mailReason === 'no_provider_configured' ? 'geen mail-provider ingesteld — zet MAILTRAP_API_TOKEN of RESEND_API_KEY in Vercel env' : j.mailReason}). Gebruik hieronder "Open in e-mail" om 'm handmatig te sturen.`,
        });
      }
      return j;
    } catch (e) {
      setMelding({ soort: 'fout', tekst: 'Versturen mislukt: ' + (e.message || e) });
    } finally { setBusy(false); }
  };

  const portalUrl = offerte?.portal_token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portaal/${offerte.portal_token}` : '';

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Link href={`/calculaties/${id}/werktafel`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ChevronLeft size={15} /> Werktafel</Link>
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><FileText size={20} className="text-sterkcalc-blue" /> Offerte Excellence</h1>
        {offerte && <span className={`rounded-full px-3 py-1 text-xs font-medium ${offerte.status === 'getekend' ? 'bg-sterkcalc-accent/15 text-sterkcalc-accent' : offerte.status === 'akkoord' ? 'bg-emerald-100 text-emerald-700' : ['verzonden', 'bekeken', 'vraag'].includes(offerte.status) ? 'bg-sterkcalc-blue/15 text-sterkcalc-blue' : 'bg-gray-100 text-gray-500'}`}>{STATUS_LABEL[offerte.status] || offerte.status}</span>}
      </div>

      {melding && (
        <div className={`mt-4 flex items-start justify-between gap-3 rounded-xl border p-3 text-sm ${melding.soort === 'succes' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : melding.soort === 'fout' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
          <span>{melding.tekst}</span>
          <button onClick={() => setMelding(null)} className="shrink-0 bg-transparent text-current opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {!offerte ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-200 p-10 text-center">
          <p className="text-sm text-gray-500">Nog geen offerte voor deze calculatie.</p>
          <button onClick={maken} disabled={busy} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-4 py-2 text-sm font-medium text-white hover:bg-sterkcalc-navy2 disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : <FilePlus2 size={15} />} Offerte aanmaken</button>
        </div>
      ) : (
        <>
          {kpi && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {[['Investering', fmtEUR(kpi.investering)], ['Bouwsom', fmtEUR(kpi.bouwsom)], ['Oppervlakte', kpi.oppervlakte_m2 ? `${kpi.oppervlakte_m2} m²` : '—'], ['Bouwtijd', kpi.bouwtijd_weken ? `${kpi.bouwtijd_weken} wk` : '—'], ['Risico', fmtEUR(kpi.risico)], ['Marge', `${Math.round(kpi.marge_pct)}%`]].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-gray-200 bg-white p-2.5"><div className="text-[10px] uppercase tracking-wide text-gray-400">{l}</div><div className="text-sm font-semibold text-gray-900">{v}</div></div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={downloadPdf} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-4 py-2 text-sm font-medium text-white hover:bg-sterkcalc-navy2 disabled:opacity-60">{busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={15} />} Download PDF</button>
            {offerte.status === 'concept' && <button onClick={versturen} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-accent px-4 py-2 text-sm font-medium text-white"><Send size={15} /> Versturen</button>}
            {portalUrl && <a href={portalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Eye size={15} /> Klantportaal</a>}
            {portalUrl && <button onClick={() => { navigator.clipboard?.writeText(portalUrl); window.alert('Portaal-link gekopieerd'); }} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"><Copy size={14} /> Link</button>}
          </div>

          <div className="mt-5 flex flex-wrap gap-1 border-b border-gray-200">
            {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-sm font-medium ${tab === t ? 'border-b-2 border-sterkcalc-accent text-sterkcalc-navy' : 'text-gray-500 hover:text-gray-800'}`}>{t}</button>)}
          </div>

          <div className="mt-4">
            {tab === 'Cover' && <CoverTab offerte={offerte} setVeld={setVeld} />}
            {tab === 'Ontwerp' && <OntwerpTab offerte={offerte} setVeld={setVeld} />}
            {tab === 'Projectomschrijving' && <ProjectomschrijvingTab offerte={offerte} setVeld={setVeld} />}
            {tab === 'Samenvatting' && <SamenvattingTab kpi={kpi} offerte={offerte} setVeld={setVeld} />}
            {tab === 'Werkzaamheden' && <WerkzaamhedenTab ctx={ctx} kpi={kpi} />}
            {tab === 'Opties' && <OptiesTab offerte={offerte} setVeld={setVeld} />}
            {tab === 'Planning' && <PlanningTab offerte={offerte} setVeld={setVeld} />}
            {tab === 'Termijnen' && <TermijnenTab offerte={offerte} termijnen={termijnen} setVeld={setVeld} />}
            {tab === 'Versturen' && <VerzendModule offerte={offerte} portalUrl={portalUrl} events={events} totaalIncl={ctx?.totalen?.verkoopprijs_incl} busy={busy} onPdf={downloadPdf} onVerzonden={markeerVerzonden} onVerstuurMail={verstuurMail} />}
          </div>
        </>
      )}
    </div>
  );
}

function Card({ children }) { return <div className="rounded-xl border border-gray-200 bg-white p-4">{children}</div>; }
function Veld({ label, children }) { return <label className="block"><span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>{children}</label>; }
const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 [color-scheme:light]';

function CoverTab({ offerte, setVeld }) {
  const cover = offerte.cover || {};
  return (
    <Card>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Veld label="Projectnaam"><input className={inputCls} defaultValue={cover.projectnaam || ''} onBlur={(e) => setVeld({ cover: { ...cover, projectnaam: e.target.value } })} /></Veld>
        <Veld label="Locatie"><input className={inputCls} defaultValue={offerte.locatie || ''} onBlur={(e) => setVeld({ locatie: e.target.value })} /></Veld>
        <Veld label="Opdrachtgever"><input className={inputCls} defaultValue={offerte.klant_naam || ''} onBlur={(e) => setVeld({ klant_naam: e.target.value })} /></Veld>
        <Veld label="E-mail opdrachtgever"><input className={inputCls} defaultValue={offerte.klant_email || ''} onBlur={(e) => setVeld({ klant_email: e.target.value })} /></Veld>
        <Veld label="Versie"><input type="number" min="1" className={inputCls} defaultValue={offerte.versie || 1} onBlur={(e) => setVeld({ versie: Number(e.target.value) || 1 })} /></Veld>
        <Veld label="Projectfoto (URL)"><div className="flex items-center gap-2"><ImageIcon size={16} className="text-gray-400" /><input className={inputCls} placeholder="https://…" defaultValue={cover.projectfoto || ''} onBlur={(e) => setVeld({ cover: { ...cover, projectfoto: e.target.value } })} /></div></Veld>
      </div>
      {cover.projectfoto && <img src={cover.projectfoto} alt="cover" className="mt-3 h-40 w-full rounded-lg object-cover" />}
      <p className="mt-2 text-xs text-gray-400">De cover toont de projectfoto met STRKBOUW-branding (premium uitstraling).</p>
    </Card>
  );
}

function OntwerpTab({ offerte, setVeld }) {
  const cover = offerte.cover || {};
  const items = Array.isArray(cover.ontwerpAfbeeldingen) ? cover.ontwerpAfbeeldingen : [];
  const upd = (next) => setVeld({ cover: { ...cover, ontwerpAfbeeldingen: next } });
  const add = () => upd([...items, { url: '', titel: 'Ontwerpvoorstel', beschrijving: '' }]);
  const patch = (i, p) => upd(items.map((it, j) => (j === i ? { ...it, ...p } : it)));
  const del = (i) => upd(items.filter((_, j) => j !== i));
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">Plattegrondvoorstellen, 3D-visualisaties of andere ontwerpafbeeldingen — worden als volle pagina in de offerte-PDF getoond, na de werkzaamheden. Maakt de offerte een beleving in plaats van alleen een prijsopgave.</span>
        <button onClick={add} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-xs font-medium text-white"><Plus size={13} /> Afbeelding</button>
      </div>
      <div className="space-y-4">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border border-gray-100 p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Veld label="Titel"><input className={inputCls} value={it.titel || ''} onChange={(e) => patch(i, { titel: e.target.value })} /></Veld>
              <Veld label="Afbeelding-URL"><div className="flex items-center gap-2"><ImageIcon size={16} className="text-gray-400" /><input className={inputCls} placeholder="https://…" value={it.url || ''} onChange={(e) => patch(i, { url: e.target.value })} /></div></Veld>
            </div>
            <div className="mt-2"><Veld label="Toelichting (optioneel)"><textarea className={inputCls} rows={2} value={it.beschrijving || ''} onChange={(e) => patch(i, { beschrijving: e.target.value })} /></Veld></div>
            {it.url && <img src={it.url} alt={it.titel || 'ontwerp'} className="mt-2 h-40 w-full rounded-lg border border-gray-100 object-contain bg-gray-50" />}
            <button onClick={() => del(i)} className="mt-2 inline-flex items-center gap-1 bg-white text-xs text-gray-400 [color-scheme:light] hover:text-red-600"><Trash2 size={13} /> Verwijderen</button>
          </div>
        ))}
        {items.length === 0 && <p className="py-6 text-center text-sm text-gray-400">Nog geen ontwerpafbeeldingen. Voorbeeld: plattegrondvoorstel of 3D-visualisatie.</p>}
      </div>
    </Card>
  );
}

function ProjectomschrijvingTab({ offerte, setVeld }) {
  const content = offerte.content || {};
  const setContent = (patch) => setVeld({ content: { ...content, ...patch } });
  const kernvoordelen = content.kernvoordelen?.length ? content.kernvoordelen : oe.DEFAULT_KERNVOORDELEN;
  const zekerheden = content.zekerheden?.length ? content.zekerheden : oe.DEFAULT_ZEKERHEDEN;
  const documenten = Array.isArray(content.documenten) ? content.documenten : [];
  const updList = (key, next) => setContent({ [key]: next });
  const patchListItem = (key, list, i, v) => updList(key, list.map((x, j) => (j === i ? v : x)));
  const addListItem = (key, list) => updList(key, [...list, '']);
  const delListItem = (key, list, i) => updList(key, list.filter((_, j) => j !== i));
  const addDocument = () => updList('documenten', [...documenten, { titel: '', url: '', beschrijving: '' }]);
  const patchDocument = (i, p) => updList('documenten', documenten.map((d, j) => (j === i ? { ...d, ...p } : d)));
  const delDocument = (i) => updList('documenten', documenten.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Veld label="Headline"><input className={inputCls} placeholder="Een woning die past bij jullie toekomst." defaultValue={content.headline || ''} onBlur={(e) => setContent({ headline: e.target.value })} /></Veld>
          <Veld label="Video-URL (optioneel, cover-knop 'Bekijk de video')"><input className={inputCls} placeholder="https://…" defaultValue={content.video || ''} onBlur={(e) => setContent({ video: e.target.value })} /></Veld>
        </div>
        <div className="mt-3"><Veld label="Introductietekst"><textarea className={inputCls} rows={3} placeholder="Jullie wensen hebben we vertaald naar een concreet en haalbaar plan…" defaultValue={content.intro || ''} onBlur={(e) => setContent({ intro: e.target.value })} /></Veld></div>
        <div className="mt-3"><Veld label="Sfeer-quote (cover, onderaan)"><input className={inputCls} placeholder="Een sterk huis begint met goed luisteren." defaultValue={content.quote || ''} onBlur={(e) => setContent({ quote: e.target.value })} /></Veld></div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Veld label="Hoofdfoto projectomschrijving (URL)"><input className={inputCls} placeholder="https://…" defaultValue={content.fotoHoofd || ''} onBlur={(e) => setContent({ fotoHoofd: e.target.value })} /></Veld>
          <Veld label="Foto bestaande situatie (URL, optioneel)"><input className={inputCls} placeholder="https://…" defaultValue={content.fotoBestaand || ''} onBlur={(e) => setContent({ fotoBestaand: e.target.value })} /></Veld>
        </div>
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold text-gray-900">Kernvoordelen</span><button onClick={() => addListItem('kernvoordelen', kernvoordelen)} className="inline-flex items-center gap-1 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-xs font-medium text-white"><Plus size={13} /> Punt</button></div>
        <div className="space-y-2">
          {kernvoordelen.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={inputCls} value={v} onChange={(e) => patchListItem('kernvoordelen', kernvoordelen, i, e.target.value)} />
              <button onClick={() => delListItem('kernvoordelen', kernvoordelen, i)} className="bg-white text-gray-300 [color-scheme:light] hover:text-red-600"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold text-gray-900">Zekerheden (getoond naast de ondertekening)</span><button onClick={() => addListItem('zekerheden', zekerheden)} className="inline-flex items-center gap-1 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-xs font-medium text-white"><Plus size={13} /> Punt</button></div>
        <div className="space-y-2">
          {zekerheden.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={inputCls} value={v} onChange={(e) => patchListItem('zekerheden', zekerheden, i, e.target.value)} />
              <button onClick={() => delListItem('zekerheden', zekerheden, i)} className="bg-white text-gray-300 [color-scheme:light] hover:text-red-600"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Documenten die de klant zelf kan bekijken/downloaden op het portaal — bijv. besteklijst of plattegrondvoorstel.</span>
          <button onClick={addDocument} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-xs font-medium text-white"><Plus size={13} /> Document</button>
        </div>
        <div className="space-y-3">
          {documenten.map((d, i) => (
            <div key={i} className="rounded-lg border border-gray-100 p-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Veld label="Titel"><input className={inputCls} placeholder="Besteklijst WMO" value={d.titel || ''} onChange={(e) => patchDocument(i, { titel: e.target.value })} /></Veld>
                <Veld label="Bestand-URL"><input className={inputCls} placeholder="https://…" value={d.url || ''} onChange={(e) => patchDocument(i, { url: e.target.value })} /></Veld>
              </div>
              <div className="mt-2"><Veld label="Toelichting (optioneel)"><input className={inputCls} value={d.beschrijving || ''} onChange={(e) => patchDocument(i, { beschrijving: e.target.value })} /></Veld></div>
              <button onClick={() => delDocument(i)} className="mt-2 inline-flex items-center gap-1 bg-white text-xs text-gray-400 [color-scheme:light] hover:text-red-600"><Trash2 size={13} /> Verwijderen</button>
            </div>
          ))}
          {documenten.length === 0 && <p className="py-6 text-center text-sm text-gray-400">Nog geen documenten toegevoegd.</p>}
        </div>
      </Card>
    </div>
  );
}

function SamenvattingTab({ kpi, offerte, setVeld }) {
  return (
    <Card>
      <p className="mb-3 text-sm text-gray-500">Managementoverzicht — de klant begrijpt binnen 15 seconden wat wordt aangeboden.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Veld label="Oppervlakte (m²)"><input type="number" className={inputCls} defaultValue={offerte.kpi?.oppervlakte_m2 || ''} onBlur={(e) => setVeld({ kpi: { ...(offerte.kpi || {}), oppervlakte_m2: Number(e.target.value) || null } })} /></Veld>
        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">Bouwtijd ({kpi?.bouwtijd_weken || '—'} wk) volgt uit de Planning-tab. Investering, bouwsom, risico en marge komen automatisch uit de calculatie.</div>
      </div>
    </Card>
  );
}

function WerkzaamhedenTab({ ctx, kpi }) {
  const items = useMemo(() => {
    const perCh = {};
    for (const r of ctx.rows || []) {
      const q = Number(r.hoeveelheid) || 0;
      const comp = r._components?.length ? r._components.reduce((s, c) => s + (Number(c.hoeveelheid) || 0) * ((Number(c.materiaalprijs) || 0) + (Number(c.arbeidsprijs) || 0) + (Number(c.materieelprijs) || 0)), 0) : ((Number(r.materiaalprijs) || 0) + (Number(r.arbeidsprijs) || 0) + (Number(r.materieelprijs) || 0));
      const dk = comp * q;
      const ch = (ctx.chapters || []).find((c) => c.id === r.chapter_id);
      const key = ch?.naam || 'Overig';
      perCh[key] = (perCh[key] || 0) + dk;
    }
    const tot = Object.values(perCh).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(perCh).filter(([, v]) => v > 0).map(([naam, dk]) => ({ naam, bedrag: (dk / tot) * (kpi?.bouwsom || 0) }));
  }, [ctx, kpi]);
  return (
    <Card>
      <table className="w-full text-sm">
        <thead><tr className="text-xs text-gray-400"><th className="py-1 text-left">Hoofdstuk</th><th className="py-1 text-right">Bedrag (excl. btw)</th></tr></thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((h) => <tr key={h.naam}><td className="py-1.5 text-gray-800">{h.naam}</td><td className="py-1.5 text-right tabular-nums text-gray-800">{fmtEUR(h.bedrag)}</td></tr>)}
          {items.length === 0 && <tr><td colSpan={2} className="py-4 text-center text-gray-400">Nog geen werkregels in de werktafel.</td></tr>}
          <tr className="font-semibold"><td className="py-2">Bouwsom excl. btw</td><td className="py-2 text-right tabular-nums">{fmtEUR(kpi?.bouwsom || 0)}</td></tr>
        </tbody>
      </table>
    </Card>
  );
}

function OptiesTab({ offerte, setVeld }) {
  const opties = offerte.opties || [];
  const upd = (next) => setVeld({ opties: next });
  const add = () => upd([...opties, { naam: 'Nieuwe optie', soort: 'meer', bedrag: 0, impact: '', geselecteerd: false }]);
  const patch = (i, p) => upd(opties.map((o, j) => (j === i ? { ...o, ...p } : o)));
  const del = (i) => upd(opties.filter((_, j) => j !== i));
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between"><span className="text-sm text-gray-500">Opties & alternatieven (meer-/minderprijs, selecteerbaar).</span><button onClick={add} className="inline-flex items-center gap-1 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-xs font-medium text-white"><Plus size={13} /> Optie</button></div>
      <div className="space-y-2">
        {opties.map((o, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-lg border border-gray-100 p-2">
            <input className="col-span-4 rounded border border-gray-300 px-2 py-1 text-sm" value={o.naam} onChange={(e) => patch(i, { naam: e.target.value })} />
            <select className="col-span-2 rounded border border-gray-300 px-2 py-1 text-sm" value={o.soort} onChange={(e) => patch(i, { soort: e.target.value })}><option value="meer">Meerprijs</option><option value="min">Minderprijs</option></select>
            <input type="number" className="col-span-2 rounded border border-gray-300 px-2 py-1 text-right text-sm" value={o.bedrag} onChange={(e) => patch(i, { bedrag: Number(e.target.value) || 0 })} />
            <input className="col-span-3 rounded border border-gray-300 px-2 py-1 text-sm" placeholder="impact" value={o.impact || ''} onChange={(e) => patch(i, { impact: e.target.value })} />
            <button onClick={() => del(i)} className="col-span-1 bg-white text-gray-300 [color-scheme:light] hover:text-red-600"><Trash2 size={15} /></button>
          </div>
        ))}
        {opties.length === 0 && <p className="py-4 text-center text-sm text-gray-400">Nog geen opties. Voorbeeld: Badkamer luxe (+€3.500), Aluminium kozijnen (+€4.200).</p>}
      </div>
    </Card>
  );
}

function PlanningTab({ offerte, setVeld }) {
  const planning = offerte.planning?.length ? offerte.planning : oe.DEFAULT_PLANNING;
  const upd = (next) => setVeld({ planning: next });
  const patch = (i, p) => upd(planning.map((f, j) => (j === i ? { ...f, ...p } : f)));
  const add = () => upd([...planning, { fase: 'Nieuwe fase', weken: 1 }]);
  const del = (i) => upd(planning.filter((_, j) => j !== i));
  const maxW = Math.max(...planning.map((f) => Number(f.weken) || 0), 1);
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between"><span className="text-sm text-gray-500">Klantvriendelijke planning per fase.</span><button onClick={add} className="inline-flex items-center gap-1 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-xs font-medium text-white"><Plus size={13} /> Fase</button></div>
      <div className="space-y-2">
        {planning.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className="w-44 rounded border border-gray-300 px-2 py-1 text-sm" value={f.fase} onChange={(e) => patch(i, { fase: e.target.value })} />
            <input type="number" className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm" value={f.weken} onChange={(e) => patch(i, { weken: Number(e.target.value) || 0 })} />
            <span className="text-xs text-gray-400">wk</span>
            <div className="h-3 flex-1 rounded bg-gray-100"><div className="h-3 rounded bg-sterkcalc-accent" style={{ width: `${((Number(f.weken) || 0) / maxW) * 100}%` }} /></div>
            <button onClick={() => del(i)} className="bg-white text-gray-300 [color-scheme:light] hover:text-red-600"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-400">Totale bouwtijd: {planning.reduce((s, f) => s + (Number(f.weken) || 0), 0)} weken.</p>
    </Card>
  );
}

function TermijnenTab({ offerte, termijnen, setVeld }) {
  const lijst = offerte.termijnen?.length ? offerte.termijnen : oe.DEFAULT_TERMIJNEN;
  const upd = (next) => setVeld({ termijnen: next });
  const patch = (i, p) => upd(lijst.map((t, j) => (j === i ? { ...t, ...p } : t)));
  const add = () => upd([...lijst, { label: 'Nieuwe termijn', pct: 0 }]);
  const del = (i) => upd(lijst.filter((_, j) => j !== i));
  const somPct = lijst.reduce((s, t) => s + (Number(t.pct) || 0), 0);
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between"><span className="text-sm text-gray-500">Termijnschema (vrij instelbaar; bedragen automatisch).</span><button onClick={add} className="inline-flex items-center gap-1 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-xs font-medium text-white"><Plus size={13} /> Termijn</button></div>
      <div className="space-y-2">
        {termijnen.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm" value={lijst[i]?.label || ''} onChange={(e) => patch(i, { label: e.target.value })} />
            <input type="number" className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm" value={lijst[i]?.pct || 0} onChange={(e) => patch(i, { pct: Number(e.target.value) || 0 })} />
            <span className="text-xs text-gray-400">%</span>
            <span className="w-28 text-right text-sm tabular-nums text-gray-700">{fmtEUR(t.bedrag)}</span>
            <button onClick={() => del(i)} className="bg-white text-gray-300 [color-scheme:light] hover:text-red-600"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
      <p className={`mt-2 text-xs ${somPct === 100 ? 'text-gray-400' : 'text-amber-600'}`}>Som: {somPct}% {somPct !== 100 && '— let op: hoort 100% te zijn.'}</p>
    </Card>
  );
}

