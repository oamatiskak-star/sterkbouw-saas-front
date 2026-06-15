// pages/portaal/[token].js — Klantportaal (Sprint 6 deel 8/9/10): premium offerte-weergave,
// status, digitale ondertekening (audittrail) en conversie-laag. Publiek (token-based, geen login).
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader2, Check, MessageSquare, Repeat, PlusCircle, Calendar, PenLine, ShieldCheck } from 'lucide-react';
import * as oe from '@/services/offerteExcellence';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

const STATUS_LABEL = { concept: 'Concept', verzonden: 'Verzonden', bekeken: 'Bekeken', vraag: 'Vraag gesteld', akkoord: 'Akkoord', getekend: 'Getekend' };
const STAPPEN = ['verzonden', 'bekeken', 'vraag', 'akkoord', 'getekend'];

export default function Klantportaal() {
  const router = useRouter();
  const { token } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [modal, setModal] = useState(null); // 'teken' | 'vraag' | 'alternatief' | 'meerwerk' | 'afspraak'
  const [tekst, setTekst] = useState('');
  const [naam, setNaam] = useState('');
  const bekekenGelogd = useRef(false);

  const herlaad = async () => { const d = await oe.loadOfferteByToken(token); setData(d); return d; };

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const d = await herlaad();
        if (d?.offerte && !bekekenGelogd.current) {
          bekekenGelogd.current = true;
          const ip = await oe.clientIp();
          await oe.logEvent(d.offerte.id, 'bekeken', { ip }).catch(() => {});
          await herlaad();
        }
      } finally { setLoading(false); }
    })();
  }, [token]); // eslint-disable-line

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400"><Loader2 className="animate-spin" size={18} /></div>;
  if (!data?.offerte) return <div className="flex min-h-screen items-center justify-center text-gray-500">Offerte niet gevonden.</div>;

  const { offerte, calculatie, totalen } = data;
  const cover = offerte.cover || {};
  const kpi = oe.berekenKpi(offerte, totalen || {});
  const termijnen = oe.termijnBedragen(offerte.termijnen, kpi.investering);
  const opties = offerte.opties || [];
  const planning = offerte.planning || [];
  const getekend = offerte.status === 'getekend';

  const toggleOptie = async (i) => {
    if (getekend) return;
    const next = opties.map((o, j) => (j === i ? { ...o, geselecteerd: !o.geselecteerd } : o));
    setData((d) => ({ ...d, offerte: { ...d.offerte, opties: next } }));
    await oe.bewaarOptieKeuze(offerte.id, next).catch(() => {});
  };

  const conversie = async (type) => {
    setBusy(type);
    try {
      const ip = await oe.clientIp();
      await oe.logEvent(offerte.id, type, { bericht: tekst || null, ip });
      setTekst(''); setModal(null);
      await herlaad();
      window.alert('Verzonden. We nemen contact met u op.');
    } catch (e) { window.alert('Mislukt: ' + (e.message || e)); } finally { setBusy(''); }
  };

  const tekenen = async () => {
    if (!naam.trim()) { window.alert('Vul uw naam in.'); return; }
    setBusy('teken');
    try {
      const ip = await oe.clientIp();
      const nu = new Date();
      const meta = { naam: naam.trim(), datum: nu.toLocaleDateString('nl-NL'), tijd: nu.toLocaleTimeString('nl-NL'), ip, audittrail: `Digitaal ondertekend via klantportaal op ${nu.toISOString()} vanaf IP ${ip || 'onbekend'}` };
      await oe.logEvent(offerte.id, 'getekend', { bericht: `Ondertekend door ${naam.trim()}`, ip, meta });
      setModal(null);
      await herlaad();
    } catch (e) { window.alert('Mislukt: ' + (e.message || e)); } finally { setBusy(''); }
  };

  const stapIdx = Math.max(0, STAPPEN.indexOf(offerte.status === 'concept' ? 'verzonden' : offerte.status));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover */}
      <div className="relative h-64 w-full bg-sterkcalc-navy" style={cover.projectfoto ? { backgroundImage: `url(${cover.projectfoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        <div className="absolute inset-0 bg-sterkcalc-navy/70" />
        <div className="relative mx-auto flex h-full max-w-3xl flex-col justify-end p-6 text-white">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">Offerte</div>
          <h1 className="text-2xl font-bold">{cover.projectnaam || calculatie?.naam || 'Bouwproject'}</h1>
          <div className="mt-1 text-sm text-white/80">{offerte.klant_naam || ''}{offerte.locatie ? ` · ${offerte.locatie}` : ''} · {offerte.nummer} (v{offerte.versie || 1})</div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 p-6">
        {/* Statusbalk */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between text-xs">
            {STAPPEN.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${i <= stapIdx ? 'bg-sterkcalc-accent text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
                <span className={`mt-1 ${i <= stapIdx ? 'text-gray-700' : 'text-gray-400'}`}>{STATUS_LABEL[s]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[['Investering', fmtEUR(kpi.investering)], ['Bouwsom', fmtEUR(kpi.bouwsom)], ['Oppervlakte', kpi.oppervlakte_m2 ? `${kpi.oppervlakte_m2} m²` : '—'], ['Bouwtijd', kpi.bouwtijd_weken ? `${kpi.bouwtijd_weken} wk` : '—']].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-gray-200 bg-white p-3"><div className="text-[10px] uppercase tracking-wide text-gray-400">{l}</div><div className="text-base font-semibold text-gray-900">{v}</div></div>
          ))}
        </div>

        {/* Opties */}
        {opties.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Opties & alternatieven</h2>
            <div className="space-y-1.5">
              {opties.map((o, i) => (
                <label key={i} className={`flex cursor-pointer items-center justify-between rounded-lg border p-2.5 text-sm ${o.geselecteerd ? 'border-sterkcalc-accent bg-sterkcalc-accent/5' : 'border-gray-200'}`}>
                  <span className="flex items-center gap-2"><input type="checkbox" checked={!!o.geselecteerd} onChange={() => toggleOptie(i)} disabled={getekend} />{o.naam}{o.impact ? <span className="text-xs text-gray-400">· {o.impact}</span> : null}</span>
                  <span className={`font-medium ${o.soort === 'min' ? 'text-emerald-600' : 'text-gray-800'}`}>{o.soort === 'min' ? '−' : '+'} {fmtEUR(o.bedrag)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Planning */}
        {planning.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Planning</h2>
            {planning.map((f, i) => {
              const maxW = Math.max(...planning.map((x) => Number(x.weken) || 0), 1);
              return (
                <div key={i} className="mb-1.5 flex items-center gap-2 text-sm">
                  <span className="w-32 text-gray-600">{f.fase}</span>
                  <div className="h-3 flex-1 rounded bg-gray-100"><div className="h-3 rounded bg-sterkcalc-navy" style={{ width: `${((Number(f.weken) || 0) / maxW) * 100}%` }} /></div>
                  <span className="w-12 text-right text-xs text-gray-400">{f.weken} wk</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Termijnschema */}
        {termijnen.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Termijnschema</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {termijnen.map((t, i) => <tr key={i}><td className="py-1.5 text-gray-700">{t.label}</td><td className="py-1.5 text-right text-gray-400">{t.pct}%</td><td className="py-1.5 text-right tabular-nums text-gray-800">{fmtEUR(t.bedrag)}</td></tr>)}
                <tr className="font-semibold"><td className="py-2">Totaal incl. btw</td><td /><td className="py-2 text-right tabular-nums">{fmtEUR(kpi.investering)}</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Getekend-bevestiging */}
        {getekend && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <ShieldCheck size={18} /> Deze offerte is digitaal akkoord bevonden en ondertekend{offerte.ondertekening?.naam ? ` door ${offerte.ondertekening.naam}` : ''}. Dank u wel.
          </div>
        )}

        {/* Conversie-laag */}
        {!getekend && (
          <div className="sticky bottom-4 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button onClick={() => setModal('teken')} className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-sterkcalc-accent px-4 py-2.5 text-sm font-semibold text-white sm:col-span-3"><Check size={16} /> Akkoord & digitaal ondertekenen</button>
              <ConvBtn icon={MessageSquare} label="Vraag stellen" onClick={() => setModal('vraag')} />
              <ConvBtn icon={Repeat} label="Alternatief" onClick={() => setModal('alternatief')} />
              <ConvBtn icon={PlusCircle} label="Meerwerk" onClick={() => setModal('meerwerk')} />
              <ConvBtn icon={Calendar} label="Afspraak plannen" onClick={() => setModal('afspraak')} />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'teken' && (
        <Modal title="Digitaal ondertekenen" onClose={() => setModal(null)}>
          <p className="text-sm text-gray-500">Door te ondertekenen gaat u akkoord met deze offerte. Naam, datum, tijdstip en IP-adres worden vastgelegd in de audittrail.</p>
          <input autoFocus value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="Uw volledige naam" className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button onClick={tekenen} disabled={busy === 'teken'} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-sterkcalc-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy === 'teken' ? <Loader2 size={15} className="animate-spin" /> : <PenLine size={15} />} Ondertekenen</button>
        </Modal>
      )}
      {['vraag', 'alternatief', 'meerwerk', 'afspraak'].includes(modal) && (
        <Modal title={{ vraag: 'Vraag stellen', alternatief: 'Alternatief aanvragen', meerwerk: 'Meerwerk aanvragen', afspraak: 'Afspraak plannen' }[modal]} onClose={() => setModal(null)}>
          <textarea autoFocus value={tekst} onChange={(e) => setTekst(e.target.value)} rows={4} placeholder="Uw bericht…" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button onClick={() => conversie(modal)} disabled={busy === modal} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-sterkcalc-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy === modal ? <Loader2 size={15} className="animate-spin" /> : 'Versturen'}</button>
        </Modal>
      )}
    </div>
  );
}

function ConvBtn({ icon: Icon, label, onClick }) {
  return <button onClick={onClick} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"><Icon size={15} /> {label}</button>;
}
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between"><h3 className="text-base font-semibold text-gray-900">{title}</h3><button onClick={onClose} className="text-gray-400">✕</button></div>
        {children}
      </div>
    </div>
  );
}
