// pages/calculaties/[id]/offerte.js — offerte-builder + status-workflow
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, FileText, Send, Check, FilePlus2, Download } from 'lucide-react';
import supabase from '@/lib/supabase';
import { calcData, maakOfferte, updateOfferte, loadSettings } from '@/services/calcModules';
import { fmtEUR } from '@/lib/calc/werktafelTotals';
import { genereerOffertePdf } from '@/lib/offerte/genereerOffertePdf';

const MODULES = ['voorblad', 'samenvatting', 'calculatie', 'planning', 'voorwaarden', 'bijlagen'];
const STATUS_LABEL = { concept: 'Concept', verzonden: 'Verzonden', getekend: 'Getekend', afgewezen: 'Afgewezen' };

export default function OffertePagina() {
  const router = useRouter();
  const { id } = router.query;
  const [offerte, setOfferte] = useState(null);
  const [totalen, setTotalen] = useState(null);
  const [calcBundle, setCalcBundle] = useState(null); // { calculatie, chapters, rows }
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const herlaad = async () => {
    const { data } = await supabase.from('sterkcalc_offertes').select('*').eq('calculatie_id', id).order('created_at', { ascending: false }).limit(1);
    setOfferte(data?.[0] || null);
  };
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const d = await calcData(id);
        setTotalen(d.totalen);
        setCalcBundle({ calculatie: d.calculatie, chapters: d.chapters, rows: d.rows });
        setSettings(await loadSettings().catch(() => ({})) || {});
        await herlaad();
      } finally { setLoading(false); }
    })();
  }, [id]);

  const downloadPdf = () => {
    try {
      genereerOffertePdf({ offerte, totalen, calculatie: calcBundle?.calculatie, chapters: calcBundle?.chapters || [], rows: calcBundle?.rows || [], settings });
    } catch (e) { window.alert('PDF maken mislukt: ' + (e.message || e)); }
  };

  const klantOpslaan = async (veld, waarde) => {
    setOfferte((o) => ({ ...o, [veld]: waarde }));
  };
  const klantCommit = async (veld, waarde) => {
    try { await updateOfferte(offerte.id, { [veld]: waarde }); } catch { /* best-effort */ }
  };
  const markeerGetekend = async () => {
    if (!offerte.klant_naam) { window.alert('Vul eerst de naam van de opdrachtgever in voordat je akkoord vastlegt.'); return; }
    await zetStatus('getekend');
  };

  const maken = async () => { setBusy(true); try { setOfferte(await maakOfferte(id)); } catch (e) { window.alert(e.message || e); } finally { setBusy(false); } };
  const zetStatus = async (status) => {
    setBusy(true);
    try {
      const extra = status === 'verzonden' ? { verzonden_at: new Date().toISOString() } : status === 'getekend' ? { getekend_at: new Date().toISOString() } : {};
      await updateOfferte(offerte.id, { status, ...extra });
      await herlaad();
    } finally { setBusy(false); }
  };
  const toggleModule = async (m) => {
    const mods = { ...(offerte.modules || {}), [m]: !offerte.modules?.[m] };
    setOfferte({ ...offerte, modules: mods });
    await updateOfferte(offerte.id, { modules: mods });
  };

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Link href={`/calculaties/${id}/werktafel`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ChevronLeft size={15} /> Werktafel</Link>
      <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><FileText size={20} className="text-sterkcalc-blue" /> Offerte</h1>

      {!offerte ? (
        <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">Nog geen offerte voor deze calculatie.</p>
          <button onClick={maken} disabled={busy} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-4 py-2 text-sm font-medium text-white hover:bg-sterkcalc-navy2 disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : <FilePlus2 size={15} />} Offerte aanmaken</button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div><div className="text-sm font-semibold text-gray-900">{offerte.nummer}</div><div className="text-xs text-gray-400">Status: {STATUS_LABEL[offerte.status] || offerte.status}</div></div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${offerte.status === 'getekend' ? 'bg-sterkcalc-accent/15 text-sterkcalc-accent' : offerte.status === 'verzonden' ? 'bg-sterkcalc-blue/15 text-sterkcalc-blue' : 'bg-gray-100 text-gray-500'}`}>{STATUS_LABEL[offerte.status]}</span>
              </div>
              <div className="mt-3 text-sm font-semibold text-gray-700">Opdrachtgever</div>
              <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input value={offerte.klant_naam || ''} onChange={(e) => klantOpslaan('klant_naam', e.target.value)} onBlur={(e) => klantCommit('klant_naam', e.target.value)} placeholder="Naam opdrachtgever" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
                <input value={offerte.klant_email || ''} onChange={(e) => klantOpslaan('klant_email', e.target.value)} onBlur={(e) => klantCommit('klant_email', e.target.value)} placeholder="E-mailadres" className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" />
              </div>

              <div className="mt-3 text-sm font-semibold text-gray-700">Modules</div>
              <div className="mt-1 grid grid-cols-2 gap-1">
                {MODULES.map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm capitalize text-gray-600"><input type="checkbox" checked={!!offerte.modules?.[m]} onChange={() => toggleModule(m)} />{m}</label>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={downloadPdf} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Download size={15} /> Download PDF</button>
              {offerte.status === 'concept' && <button onClick={() => zetStatus('verzonden')} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-4 py-2 text-sm font-medium text-white hover:bg-sterkcalc-navy2"><Send size={15} /> Offerte versturen</button>}
              {offerte.status === 'verzonden' && <button onClick={markeerGetekend} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-accent px-4 py-2 text-sm font-medium text-white"><Check size={15} /> Akkoord vastleggen</button>}
            </div>
          </div>
          <aside className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Kostensamenvatting</div>
            {totalen && (
              <div className="mt-2 space-y-1 text-sm">
                <Row l="Kostprijs" v={fmtEUR(totalen.kostprijs)} /><Row l="AK" v={fmtEUR(totalen.akBedrag)} /><Row l="ABK" v={fmtEUR(totalen.abkBedrag)} /><Row l="Risico" v={fmtEUR(totalen.risicoBedrag)} /><Row l="Winst" v={fmtEUR(totalen.winstBedrag)} />
                <div className="my-1 border-t border-gray-100" />
                <Row l="Excl. btw" v={fmtEUR(totalen.verkoopprijs_excl)} bold /><Row l="Incl. btw" v={fmtEUR(totalen.verkoopprijs_incl)} bold />
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
function Row({ l, v, bold }) { return <div className="flex justify-between"><span className="text-gray-500">{l}</span><span className={bold ? 'font-semibold text-gray-900' : 'text-gray-800'}>{v}</span></div>; }
