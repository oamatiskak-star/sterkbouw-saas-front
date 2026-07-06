// pages/calculaties/nieuw.js — P6: Project Intake Center (AI-first).
// Flow: Project → Documenten → AI-analyse → Bouwdelen-voorstel → gevulde Werktafel.
// De werktafel is het RESULTAAT van deze stappen, niet de eerste stap. Werktafel/offerte/
// planning/bestellen/rapportage blijven ongewijzigd (P6-L).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Loader2, FolderPlus, ArrowRight, ArrowLeft, FileText, Wand2, Layers, Table2, CheckCircle2,
  UploadCloud, Trash2, File, Image as ImageIcon, Sparkles, AlertTriangle, DoorOpen, Box, ClipboardList,
} from 'lucide-react';
import { maakProjectEnCalculatie } from '@/services/projecten';
import { PROJECTTYPE_LABELS } from '@/lib/calc/projecttypeTemplates';
import { uploadDocument, loadDossier, deleteDocument, markAnalyseStatus, isAnalyseerbaar, leesbareGrootte, DOC_TYPES, DOC_ACCEPT } from '@/services/documenten';
import DocumentControle from '@/components/calculatie/documenten/DocumentControle';
import { analyseDocument, loadRuimtes, loadObjecten } from '@/services/aiAnalyse';
import { genereerBouwdeelVoorstel, valideerProjecttype, pasVoorstelToe } from '@/services/p6Intake';
import BouwdeelKiezer from '@/components/calculatie/werktafel/BouwdeelKiezer';

const TYPES = Object.keys(PROJECTTYPE_LABELS);
const STAPPEN = [
  { n: 1, l: 'Project', i: FolderPlus },
  { n: 2, l: 'Documenten', i: FileText },
  { n: 3, l: 'AI-analyse', i: Wand2 },
  { n: 4, l: 'Bouwdelen', i: Layers },
  { n: 5, l: 'Werktafel', i: Table2 },
];

export default function ProjectIntake() {
  const router = useRouter();
  const [stap, setStap] = useState(1);
  const [created, setCreated] = useState(null); // { calculatieId, projectId }

  // Stap 1 — project
  const [f, setF] = useState({ projectnaam: '', opdrachtgever: '', plaats: '', projecttype: 'nieuwbouw', werkadres: '', omschrijving: '', referentie: '', startdatum: '', einddatum: '', contactpersoon: '', telefoon: '', email: '' });
  const [meer, setMeer] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const startProject = async () => {
    if (!f.projectnaam.trim()) { setErr('Vul een projectnaam in.'); return; }
    setErr(''); setBusy(true);
    try {
      const res = await maakProjectEnCalculatie(f);
      setCreated(res);
      setStap(2);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><FolderPlus size={20} className="text-sterkcalc-blue" /> Project Intake Center</h1>
        <p className="mt-1 text-sm text-gray-500">AI begrijpt eerst wat er gebouwd moet worden — daarna ondersteunt de calculator bij het begroten.</p>

        <Stepper stap={stap} />

        <div className="mt-5">
          {stap === 1 && <ProjectStap f={f} set={set} meer={meer} setMeer={setMeer} err={err} busy={busy} onStart={startProject} />}
          {stap === 2 && created && <DocumentenStap created={created} onBack={() => setStap(1)} onNext={() => setStap(3)} />}
          {stap === 3 && created && <AnalyseStap created={created} onBack={() => setStap(2)} onNext={() => setStap(4)} />}
          {stap === 4 && created && <BouwdelenStap created={created} projecttype={f.projecttype} onBack={() => setStap(3)} onNext={() => setStap(5)} />}
          {stap === 5 && created && <AfrondenStap created={created} projecttype={f.projecttype} router={router} onBack={() => setStap(4)} />}
        </div>
      </div>
    </div>
  );
}

function Stepper({ stap }) {
  return (
    <div className="mt-4 flex items-center gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-2">
      {STAPPEN.map((s, i) => {
        const actief = s.n === stap;
        const klaar = s.n < stap;
        return (
          <div key={s.n} className="flex min-w-max items-center">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${actief ? 'bg-sterkcalc-navy text-white' : klaar ? 'text-emerald-700' : 'text-gray-400'}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${actief ? 'bg-white/20' : klaar ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                {klaar ? <CheckCircle2 size={14} /> : s.n}
              </span>
              <span className="text-sm font-medium">{s.l}</span>
            </div>
            {i < STAPPEN.length - 1 && <ArrowRight size={14} className="mx-0.5 text-gray-300" />}
          </div>
        );
      })}
    </div>
  );
}

const card = 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm';
const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sterkcalc-blue focus:outline-none focus:ring-1 focus:ring-sterkcalc-blue';
const lbl = 'mb-1 block text-xs font-medium text-gray-500';
const primary = 'inline-flex items-center gap-2 rounded-lg bg-sterkcalc-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60';
const ghost = 'inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50';

// ---------- STAP 1: PROJECT ----------
function ProjectStap({ f, set, meer, setMeer, err, busy, onStart }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className={`${card} lg:col-span-2`}>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900"><FolderPlus size={16} className="text-sterkcalc-blue" /> Projectgegevens</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className={lbl}>Projectnaam *</span><input autoFocus value={f.projectnaam} onChange={(e) => set('projectnaam', e.target.value)} placeholder="bv. Nieuwbouw woning Jansen" className={inp} /></label>
          <label className="block"><span className={lbl}>Opdrachtgever</span><input value={f.opdrachtgever} onChange={(e) => set('opdrachtgever', e.target.value)} className={inp} /></label>
          <label className="block"><span className={lbl}>Plaats</span><input value={f.plaats} onChange={(e) => set('plaats', e.target.value)} className={inp} /></label>
          <label className="block sm:col-span-2"><span className={lbl}>Projecttype *</span><select value={f.projecttype} onChange={(e) => set('projecttype', e.target.value)} className={inp}>{TYPES.map((t) => <option key={t} value={t}>{PROJECTTYPE_LABELS[t] || t}</option>)}</select></label>
        </div>

        <button type="button" onClick={() => setMeer((m) => !m)} className="mt-3 text-xs font-medium text-sterkcalc-blue hover:underline">{meer ? '− Minder velden' : '+ Optionele velden (contact, planning, referentie)'}</button>
        {meer && (
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className={lbl}>Werkadres</span><input value={f.werkadres} onChange={(e) => set('werkadres', e.target.value)} className={inp} /></label>
            <label className="block"><span className={lbl}>Referentie</span><input value={f.referentie} onChange={(e) => set('referentie', e.target.value)} className={inp} /></label>
            <label className="block"><span className={lbl}>Contactpersoon</span><input value={f.contactpersoon} onChange={(e) => set('contactpersoon', e.target.value)} className={inp} /></label>
            <label className="block"><span className={lbl}>Telefoon</span><input value={f.telefoon} onChange={(e) => set('telefoon', e.target.value)} className={inp} /></label>
            <label className="block"><span className={lbl}>E-mail</span><input value={f.email} onChange={(e) => set('email', e.target.value)} className={inp} /></label>
            <label className="block"><span className={lbl}>Startdatum</span><input type="date" value={f.startdatum} onChange={(e) => set('startdatum', e.target.value)} className={inp} /></label>
            <label className="block"><span className={lbl}>Einddatum</span><input type="date" value={f.einddatum} onChange={(e) => set('einddatum', e.target.value)} className={inp} /></label>
            <label className="block sm:col-span-2"><span className={lbl}>Omschrijving</span><textarea value={f.omschrijving} onChange={(e) => set('omschrijving', e.target.value)} rows={2} className={inp} /></label>
          </div>
        )}
        {err && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        <div className="mt-4 flex items-center justify-end">
          <button onClick={onStart} disabled={busy} className={primary}>{busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />} Project starten → documenten</button>
        </div>
      </div>

      <div className={card}>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"><Sparkles size={16} className="text-sterkcalc-accent" /> Zo werkt de intake</h2>
        <ol className="space-y-2 text-xs text-gray-500">
          <li><span className="font-semibold text-gray-700">1. Project</span> — basisgegevens, geen technische cijfers.</li>
          <li><span className="font-semibold text-gray-700">2. Documenten</span> — upload tekeningen, bestek, vergunning, foto&apos;s.</li>
          <li><span className="font-semibold text-gray-700">3. AI-analyse</span> — AI leest de stukken en herkent ruimtes/bouwdelen.</li>
          <li><span className="font-semibold text-gray-700">4. Bouwdelen</span> — AI stelt voor, jij houdt controle.</li>
          <li><span className="font-semibold text-gray-700">5. Werktafel</span> — opent gevuld, klaar om te begroten.</li>
        </ol>
        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-[11px] text-gray-400">Oppervlaktes, hoeveelheden en bouwsom ontstaan verderop in de keten — niet hier.</p>
      </div>
    </div>
  );
}

// ---------- STAP 2: DOCUMENTEN ----------
function DocumentenStap({ created, onBack, onNext }) {
  const fileRef = useRef(null);
  const [cat, setCat] = useState(DOC_TYPES[0]);
  const [docs, setDocs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState('');

  const herlaad = () => loadDossier(created.calculatieId).then(setDocs).catch(() => {});
  useEffect(() => { herlaad(); /* eslint-disable-next-line */ }, []);

  const upload = async (files) => {
    if (!files?.length) return;
    setErr(''); setBusy(true);
    try {
      for (const file of Array.from(files)) {
        await uploadDocument({ projectId: created.projectId, calculatieId: created.calculatieId, file, documentType: cat });
      }
      await herlaad();
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const verwijder = async (doc) => {
    if (!window.confirm(`"${doc.file_name}" verwijderen?`)) return;
    await deleteDocument(doc).catch(() => {});
    herlaad();
  };

  return (
    <div className={card}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900"><FileText size={16} className="text-sterkcalc-blue" /> Documentcenter</h2>
        <label className="flex items-center gap-2 text-xs text-gray-500">Categorie
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1 text-xs">{DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        </label>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition ${drag ? 'border-sterkcalc-accent bg-sterkcalc-accent/5' : 'border-gray-300 hover:border-sterkcalc-blue/50 hover:bg-gray-50'}`}
      >
        <input ref={fileRef} type="file" multiple accept={DOC_ACCEPT} className="hidden" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
        {busy ? <Loader2 size={26} className="animate-spin text-sterkcalc-blue" /> : <UploadCloud size={26} className="text-sterkcalc-blue" />}
        <p className="mt-2 text-sm font-medium text-gray-700">Sleep bestanden hierheen of klik om te kiezen</p>
        <p className="mt-1 text-[11px] text-gray-400">PDF · DWG · DXF · IFC · JPG · PNG · WEBP · DOCX · XLSX — meerdere tegelijk · categorie: <strong>{cat}</strong></p>
      </div>
      {err && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      {/* Dossier */}
      <div className="mt-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500"><ClipboardList size={13} /> Projectdossier ({docs.length})</div>
        {docs.length === 0 ? (
          <p className="rounded-lg bg-gray-50 px-3 py-6 text-center text-sm text-gray-400">Nog geen documenten. Upload tekeningen, bestek of foto&apos;s.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {docs.map((d) => (
              <div key={d.id} className="group flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                <div className="rounded-lg bg-sterkcalc-navy/5 p-2 text-sterkcalc-navy">{(d.mime_type || '').startsWith('image/') ? <ImageIcon size={16} /> : <File size={16} />}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-800">{d.file_name}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-400">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">{d.document_type}</span>
                    <span>{leesbareGrootte(d.file_size)}</span>
                    <StatusBadge status={d.analyse_status} />
                  </div>
                </div>
                <button onClick={() => verwijder(d)} className="text-gray-300 opacity-0 hover:text-red-600 group-hover:opacity-100"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {docs.length > 0 && <div className="mt-4"><DocumentControle docs={docs} /></div>}

      <div className="mt-5 flex items-center justify-between">
        <button onClick={onBack} className={ghost}><ArrowLeft size={16} /> Terug</button>
        <button onClick={onNext} className={primary}>{docs.length ? 'Naar AI-analyse' : 'Overslaan → AI-analyse'} <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    geanalyseerd: ['bg-emerald-50 text-emerald-700', 'Geanalyseerd'],
    fout: ['bg-red-50 text-red-700', 'Fout'],
    niet_geanalyseerd: ['bg-gray-100 text-gray-500', 'Niet geanalyseerd'],
  };
  const [cls, txt] = map[status] || map.niet_geanalyseerd;
  return <span className={`rounded px-1.5 py-0.5 ${cls}`}>{txt}</span>;
}

// ---------- STAP 3: AI-ANALYSE ----------
function AnalyseStap({ created, onBack, onNext }) {
  const [docs, setDocs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [ruimtes, setRuimtes] = useState([]);
  const [objecten, setObjecten] = useState([]);
  const [klaar, setKlaar] = useState(false);
  const [err, setErr] = useState('');

  const herlaad = async () => {
    setDocs(await loadDossier(created.calculatieId).catch(() => []));
    setRuimtes(await loadRuimtes(created.calculatieId).catch(() => []));
    setObjecten(await loadObjecten(created.calculatieId).catch(() => []));
  };
  useEffect(() => { herlaad(); /* eslint-disable-next-line */ }, []);

  const analyseerbaar = docs.filter(isAnalyseerbaar);

  const start = async () => {
    setErr(''); setBusy(true); setKlaar(false);
    try {
      let i = 0;
      for (const d of analyseerbaar) {
        i += 1;
        setProgress(`AI leest ${i}/${analyseerbaar.length}: ${d.file_name}`);
        try {
          await analyseDocument(created.calculatieId, d);
          await markAnalyseStatus(d.id, 'geanalyseerd');
        } catch (e) {
          await markAnalyseStatus(d.id, 'fout');
        }
      }
      await herlaad();
      setKlaar(true);
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false); setProgress('');
    }
  };

  const samenvatting = useMemo(() => {
    const tel = {};
    for (const r of ruimtes) { const k = r.klasse || r.naam || 'Ruimte'; tel[k] = (tel[k] || 0) + 1; }
    for (const o of objecten) { const k = o.klasse || o.naam || 'Object'; tel[k] = (tel[k] || 0) + (Number(o.aantal) || 1); }
    return Object.entries(tel).sort((a, b) => b[1] - a[1]);
  }, [ruimtes, objecten]);

  const objTotaal = objecten.reduce((s, o) => s + (Number(o.aantal) || 1), 0);
  const bouwdeelKlassen = new Set(objecten.map((o) => o.klasse).filter(Boolean)).size;

  return (
    <div className={card}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Wand2 size={16} className="text-sterkcalc-accent" /> AI-analyse</h2>
        <button onClick={start} disabled={busy || analyseerbaar.length === 0} className={primary}>
          {busy ? <><Loader2 size={15} className="animate-spin" /> Analyseren…</> : <><Sparkles size={15} /> Start AI-analyse</>}
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">{analyseerbaar.length} van {docs.length} document(en) zijn leesbaar voor AI (PDF/afbeeldingen). DWG/DXF/IFC eerst naar PDF exporteren.</p>
      {progress && <div className="mt-3 flex items-center gap-2 rounded-lg bg-sterkcalc-navy/5 px-3 py-2 text-xs text-gray-600"><Sparkles size={14} className="text-sterkcalc-accent" /> {progress}</div>}
      {err && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      {/* Tellingen */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Telkaart icon={FileText} label="Documenten" n={docs.length} />
        <Telkaart icon={ImageIcon} label="Leesbaar" n={analyseerbaar.length} />
        <Telkaart icon={DoorOpen} label="Ruimtes" n={ruimtes.length} />
        <Telkaart icon={Layers} label="Bouwdeel-types" n={bouwdeelKlassen} />
        <Telkaart icon={Box} label="Objecten" n={objTotaal} />
      </div>

      {/* Samenvatting (P6-F) */}
      {(klaar || samenvatting.length > 0) && (
        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">AI heeft gevonden</div>
          {samenvatting.length === 0 ? (
            <p className="rounded-lg bg-gray-50 px-3 py-6 text-center text-sm text-gray-400">Nog niets herkend. Start de analyse of upload eerst tekeningen/foto&apos;s.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {samenvatting.map(([k, n]) => (
                <span key={k} className="inline-flex items-center gap-1.5 rounded-lg border border-sterkcalc-navy/15 bg-sterkcalc-navy/[0.04] px-3 py-1.5 text-sm text-sterkcalc-navy">
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sterkcalc-navy px-1 text-[11px] font-semibold text-white">{n}</span> {k}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <button onClick={onBack} className={ghost}><ArrowLeft size={16} /> Terug</button>
        <button onClick={onNext} className={primary}>Naar bouwdelen-voorstel <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

function Telkaart({ icon: Icon, label, n }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-center">
      <Icon size={15} className="mx-auto text-gray-400" />
      <div className="mt-1 text-lg font-semibold text-gray-900">{n}</div>
      <div className="text-[10px] uppercase tracking-wide text-gray-400">{label}</div>
    </div>
  );
}

// ---------- STAP 4: BOUWDELEN-VOORSTEL ----------
function BouwdelenStap({ created, projecttype, onBack, onNext }) {
  const [voorstel, setVoorstel] = useState(null);
  const [kiezer, setKiezer] = useState(false);

  useEffect(() => {
    genereerBouwdeelVoorstel(created.calculatieId, projecttype).then(setVoorstel).catch(() => setVoorstel([]));
  }, [created.calculatieId, projecttype]);

  const toggle = (key) => setVoorstel((v) => v.map((x) => (x.key === key ? { ...x, selected: !x.selected } : x)));
  const verwijder = (key) => setVoorstel((v) => v.filter((x) => x.key !== key));
  const addBouwdeel = (b) => {
    setKiezer(false);
    setVoorstel((v) => {
      if (v.some((x) => x.bouwdeelId === b.id)) return v;
      return [...v, { key: `add-${b.id}`, bouwdeelId: b.id, naam: b.naam, klasse: b.naam, count: 1, bron: 'handmatig', categoryCode: b.category_code, selected: true }];
    });
  };

  const validatie = useMemo(() => (voorstel ? valideerProjecttype(projecttype, voorstel) : []), [voorstel, projecttype]);

  // voorstel meegeven aan stap 5 via sessionStorage (eenvoudig, geen globale store nodig).
  useEffect(() => { if (voorstel) try { sessionStorage.setItem(`p6voorstel-${created.calculatieId}`, JSON.stringify(voorstel)); } catch {} }, [voorstel, created.calculatieId]);

  if (!voorstel) return <div className={`${card} flex items-center gap-2 text-gray-400`}><Loader2 size={16} className="animate-spin" /> Bouwdelen-voorstel opstellen…</div>;

  return (
    <div className={card}>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Layers size={16} className="text-sterkcalc-blue" /> AI-bouwdelen-voorstel</h2>
        <button onClick={() => setKiezer(true)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">+ Bouwdeel toevoegen</button>
      </div>
      <p className="mb-3 text-xs text-gray-500">AI calculeert niet zelf — ze stelt voor. Vink aan wat meegaat naar de werktafel. Jij houdt de controle.</p>

      {/* Projecttype-validatie (P6-H) */}
      {validatie.length > 0 && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800"><AlertTriangle size={13} /> Aandacht — niet gedekt voor {PROJECTTYPE_LABELS[projecttype] || projecttype}:</div>
          <div className="mt-1 flex flex-wrap gap-1.5">{validatie.map((m) => <span key={m.cat} className="rounded border border-amber-200 bg-white px-2 py-0.5 text-[11px] text-amber-700">{m.naam}</span>)}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {voorstel.map((v) => (
          <label key={v.key} className={`group flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${v.selected ? 'border-sterkcalc-blue/40 bg-sterkcalc-blue/[0.04]' : 'border-gray-200'} ${!v.bouwdeelId ? 'opacity-70' : ''}`}>
            <input type="checkbox" checked={v.selected} onChange={() => toggle(v.key)} disabled={!v.bouwdeelId} className="h-4 w-4 accent-sterkcalc-blue" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-800">{v.naam}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                <BronBadge bron={v.bron} />
                {v.count > 1 && <span>× {v.count} herkend</span>}
                {!v.bouwdeelId && <span className="text-amber-600">geen combi-bron — alleen signaal</span>}
              </div>
            </div>
            <button type="button" onClick={(e) => { e.preventDefault(); verwijder(v.key); }} className="text-gray-300 opacity-0 hover:text-red-600 group-hover:opacity-100"><Trash2 size={14} /></button>
          </label>
        ))}
        {voorstel.length === 0 && <p className="rounded-lg bg-gray-50 px-3 py-6 text-center text-sm text-gray-400 sm:col-span-2">Geen voorstel — voeg handmatig bouwdelen toe.</p>}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button onClick={onBack} className={ghost}><ArrowLeft size={16} /> Terug</button>
        <button onClick={onNext} className={primary}>Naar afronden <ArrowRight size={16} /></button>
      </div>

      <BouwdeelKiezer open={kiezer} onClose={() => setKiezer(false)} onPick={addBouwdeel} />
    </div>
  );
}

function BronBadge({ bron }) {
  const map = {
    ai: ['bg-sterkcalc-accent/10 text-sterkcalc-accent', 'AI-vondst'],
    'ai-signaal': ['bg-gray-100 text-gray-500', 'AI-signaal'],
    projecttype: ['bg-sterkcalc-navy/10 text-sterkcalc-navy', 'Projecttype'],
    handmatig: ['bg-emerald-50 text-emerald-700', 'Handmatig'],
  };
  const [cls, txt] = map[bron] || map.handmatig;
  return <span className={`rounded px-1.5 py-0.5 ${cls}`}>{txt}</span>;
}

// ---------- STAP 5: AFRONDEN (gate) ----------
function AfrondenStap({ created, projecttype, router, onBack }) {
  const [docs, setDocs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { loadDossier(created.calculatieId).then(setDocs).catch(() => {}); }, [created.calculatieId]);

  const heeftDocs = docs.length > 0;
  const heeftAnalyse = docs.some((d) => d.analyse_status === 'geanalyseerd');

  const afronden = async () => {
    setErr(''); setBusy(true);
    try {
      let voorstel = [];
      try { voorstel = JSON.parse(sessionStorage.getItem(`p6voorstel-${created.calculatieId}`) || '[]'); } catch {}
      await pasVoorstelToe(created.calculatieId, voorstel);
      router.push(`/calculaties/${created.calculatieId}/werktafel`);
    } catch (e) {
      setErr(e.message || String(e));
      setBusy(false);
    }
  };

  return (
    <div className={card}>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900"><CheckCircle2 size={16} className="text-emerald-600" /> Analyse afronden</h2>

      {/* Calculatie-gate (P6-K) */}
      <div className="space-y-1.5">
        <GateRij ok label="Project aangemaakt" />
        <GateRij ok={heeftDocs} label="Documenten geüpload" />
        <GateRij ok={heeftAnalyse} label="AI-analyse uitgevoerd" />
      </div>

      {(!heeftDocs || !heeftAnalyse) && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>De werktafel wordt nauwkeuriger wanneer documenten eerst zijn geanalyseerd. Je mag doorgaan — de werktafel is al gevuld met het projecttype-template en je gekozen bouwdelen.</span>
        </div>
      )}
      {err && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      <div className="mt-4 rounded-lg bg-gray-50 px-3 py-3 text-xs text-gray-500">
        Bij afronden plaatst SterkCalc het <strong>projecttype-template</strong> + de gekozen <strong>AI-bouwdelen</strong> met voorgestelde combi&apos;s in de werktafel. Je opent dus nooit een lege werktafel.
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button onClick={onBack} className={ghost}><ArrowLeft size={16} /> Terug</button>
        <button onClick={afronden} disabled={busy} className={primary}>{busy ? <><Loader2 size={16} className="animate-spin" /> Werktafel vullen…</> : <><Table2 size={16} /> Werktafel openen</>}</button>
      </div>
    </div>
  );
}

function GateRij({ ok, label }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-amber-500" />}
      <span className={ok ? 'text-gray-700' : 'text-gray-500'}>{label}</span>
    </div>
  );
}
