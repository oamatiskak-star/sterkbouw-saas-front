// pages/calculaties/nieuw.js — Canonieke entry (recovery P1). Vervangt de legacy executor-wizard
// als primaire ingang. Maakt project + calculatie + eerste werktafelrecord + eerste versie en
// plaatst de gebruiker direct in de werktafel, zodat de volledige keten gevuld wordt.
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Loader2, FolderPlus, ArrowRight, FileText, Wand2, DoorOpen, Layers, Boxes, Table2, FileSignature, CalendarDays, ShoppingCart, BarChart3, LayoutDashboard } from 'lucide-react';
import { maakProjectEnCalculatie } from '@/services/projecten';

const TYPES = ['nieuwbouw', 'renovatie', 'transformatie', 'verduurzaming', 'uitbreiding'];
const KETEN = [
  { i: FolderPlus, l: 'Project' }, { i: FileText, l: 'Documenten' }, { i: Wand2, l: 'AI-analyse' }, { i: DoorOpen, l: 'Ruimtes' },
  { i: Layers, l: 'Bouwdelen' }, { i: Boxes, l: "Combi's" }, { i: Table2, l: 'Werktafel' }, { i: FileSignature, l: 'Offerte' },
  { i: CalendarDays, l: 'Planning' }, { i: ShoppingCart, l: 'Bestellen' }, { i: BarChart3, l: 'Rapportage' }, { i: LayoutDashboard, l: 'Dashboard' },
];

export default function NieuweCalculatie() {
  const router = useRouter();
  const [f, setF] = useState({ projectnaam: '', opdrachtgever: '', plaats: '', projecttype: 'nieuwbouw', oppervlakte: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const start = async () => {
    if (!f.projectnaam.trim()) { setErr('Vul een projectnaam in.'); return; }
    setErr(''); setBusy(true);
    try {
      const id = await maakProjectEnCalculatie(f);
      router.push(`/calculaties/${id}/werktafel`);
    } catch (e) {
      setErr(e.message || String(e));
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><FolderPlus size={20} className="text-sterkcalc-blue" /> Nieuwe calculatie</h1>
      <p className="mt-1 text-sm text-gray-500">Start vanuit het project. Je calculatie doorloopt de volledige keten — je landt direct in de werktafel.</p>

      {/* Canonieke keten */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white p-3">
        <div className="flex min-w-max items-center gap-1">
          {KETEN.map((s, i) => (
            <div key={s.l} className="flex items-center">
              <div className="flex flex-col items-center gap-1 px-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sterkcalc-navy/5 text-sterkcalc-navy"><s.i size={15} /></div>
                <span className="text-[10px] text-gray-500">{s.l}</span>
              </div>
              {i < KETEN.length - 1 && <ArrowRight size={11} className="text-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      {/* Projectformulier */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className="mb-1 block text-xs font-medium text-gray-500">Projectnaam *</span><input autoFocus value={f.projectnaam} onChange={(e) => set('projectnaam', e.target.value)} placeholder="bv. Badkamerrenovatie Jansen" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-gray-500">Opdrachtgever</span><input value={f.opdrachtgever} onChange={(e) => set('opdrachtgever', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-gray-500">Plaats</span><input value={f.plaats} onChange={(e) => set('plaats', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-gray-500">Projecttype</span><select value={f.projecttype} onChange={(e) => set('projecttype', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm capitalize">{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
          <label className="block"><span className="mb-1 block text-xs font-medium text-gray-500">Oppervlakte (m²)</span><input type="number" value={f.oppervlakte} onChange={(e) => set('oppervlakte', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></label>
        </div>
        {err && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        <button onClick={start} disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sterkcalc-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />} Calculatie starten → werktafel
        </button>
        <p className="mt-2 text-xs text-gray-400">Maakt project + calculatie + eerste versie aan en opent de werktafel. Documenten/AI-analyse kun je daarna per calculatie toevoegen.</p>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Documenten uploaden voor AI-calculatie via de oude executor?{' '}
        <Link href="/calculaties/nieuw-legacy" className="text-sterkcalc-blue hover:underline">Oude AI-wizard</Link> (legacy).
      </div>
    </div>
  );
}
