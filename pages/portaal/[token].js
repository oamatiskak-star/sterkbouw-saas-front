// pages/portaal/[token].js — Premium klantportaal (referentie: schermen 2-6). Publiek,
// token-based, geen login. Alle schrijfmutaties lopen via /api/offerte/portal-actie
// (server-side gevalideerd — RLS op sterkcalc_offertes vereist auth.uid(), dus de anonieme
// klant kan nooit rechtstreeks schrijven; de token is hier de autorisatie).
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader2, MessageSquare, Repeat, PlusCircle, Calendar } from 'lucide-react';
import * as oe from '@/services/offerteExcellence';
import { loadSettings } from '@/services/calcModules';
import { genereerOffertePdf } from '@/lib/offerte/genereerOffertePdf';
import OffertePortalHero from '@/components/portaal/OffertePortalHero';
import OffertePortalIntro from '@/components/portaal/OffertePortalIntro';
import OffertePortalWerkzaamheden from '@/components/portaal/OffertePortalWerkzaamheden';
import OffertePortalPrijsoverzicht from '@/components/portaal/OffertePortalPrijsoverzicht';
import OffertePortalPlanning from '@/components/portaal/OffertePortalPlanning';
import OffertePortalOndertekening from '@/components/portaal/OffertePortalOndertekening';
import OffertePortalBedankt from '@/components/portaal/OffertePortalBedankt';

const DEFAULT_VOORWAARDEN = 'Deze offerte is 30 dagen geldig. Bedragen excl. btw tenzij anders vermeld. Meer- en minderwerk wordt separaat verrekend. Uitvoering conform de actuele calculatie en STABU-systematiek. Termijnen worden gefactureerd bij het bereiken van de betreffende bouwfase.';

async function portalActie(token, payload) {
  const r = await fetch('/api/offerte/portal-actie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...payload }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Actie mislukt');
  return j;
}

export default function Klantportaal() {
  const router = useRouter();
  const { token } = router.query;
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null);
  const [tekst, setTekst] = useState('');
  const bekekenGelogd = useRef(false);

  const herlaad = async () => {
    const d = await oe.loadOfferteByToken(token);
    setData(d);
    return d;
  };

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [d] = await Promise.all([herlaad(), loadSettings().then((s) => setSettings(s || {})).catch(() => {})]);
        if (d?.offerte && !bekekenGelogd.current) {
          bekekenGelogd.current = true;
          await portalActie(token, { type: 'bekeken' }).catch(() => {});
          await herlaad();
        }
      } finally { setLoading(false); }
    })();
  }, [token]); // eslint-disable-line

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-sterkcalc-navy text-white"><Loader2 className="animate-spin" size={20} /></div>;
  if (!data?.offerte) return <div className="flex min-h-screen items-center justify-center text-gray-500">Offerte niet gevonden.</div>;

  const { offerte, chapters, rows, totalen } = data;
  const cover = offerte.cover || {};
  const content = offerte.content || {};
  const kpi = oe.berekenKpi(offerte, totalen || {});
  const termijnen = oe.termijnBedragen(offerte.termijnen, kpi.investering);
  const getekend = offerte.status === 'getekend';
  const zekerheden = content.zekerheden?.length ? content.zekerheden : oe.DEFAULT_ZEKERHEDEN;
  const voorwaardenTekst = settings?.bedrijf?.voorwaarden || DEFAULT_VOORWAARDEN;

  const scrollNaarOfferte = () => document.getElementById('werkzaamheden')?.scrollIntoView({ behavior: 'smooth' });

  const toggleOptie = async (index) => {
    if (getekend || busy) return;
    setBusy(true);
    try {
      const r = await portalActie(token, { type: 'optie', index });
      setData((d) => ({ ...d, offerte: { ...d.offerte, opties: r.opties } }));
    } catch (e) { window.alert(e.message || e); } finally { setBusy(false); }
  };

  const ondertekenen = async ({ naam, handtekeningDataUrl, voorwaardenVersie }) => {
    setBusy(true);
    try {
      await portalActie(token, { type: 'onderteken', naam, handtekeningDataUrl, voorwaardenVersie, totaalInclBtw: kpi.investering });
      const vers = await herlaad();

      // Definitieve PDF: client-side gegenereerd (jsPDF vereist een browsercontext), daarna
      // geüpload en de URL server-side vastgelegd (RLS-veilig via dezelfde portal-actie-route).
      try {
        const { blob, naam: bestandsnaam } = await genereerOffertePdf({ ...vers, settings, download: false });
        const pdf_url = await oe.uploadOffertePdfBestand(vers.offerte.id, blob, bestandsnaam);
        await portalActie(token, { type: 'pdf_url', pdf_url });
        await herlaad();
      } catch { /* PDF-generatie mag de ondertekening niet blokkeren; klant is al akkoord */ }
    } catch (e) {
      window.alert('Ondertekenen mislukt: ' + (e.message || e));
    } finally { setBusy(false); }
  };

  const conversie = async (type) => {
    setBusy(true);
    try {
      await oe.logEvent(offerte.id, type, { bericht: tekst || null });
      setTekst(''); setModal(null);
      window.alert('Verzonden. We nemen contact met u op.');
    } catch (e) { window.alert('Mislukt: ' + (e.message || e)); } finally { setBusy(false); }
  };

  if (getekend) return <OffertePortalBedankt cover={cover} content={content} pdfUrl={offerte.pdf_url} />;

  return (
    <div className="min-h-screen bg-white">
      <OffertePortalHero offerte={offerte} cover={cover} content={content} onNaarOfferte={scrollNaarOfferte} />
      <OffertePortalIntro offerte={offerte} content={content} />
      <OffertePortalWerkzaamheden chapters={chapters} rows={rows} kpi={kpi} offerte={offerte} getekend={getekend} onToggleOptie={toggleOptie} />
      <OffertePortalPrijsoverzicht totalen={totalen} kpi={kpi} offerte={offerte} />
      <OffertePortalPlanning planning={offerte.planning} termijnen={termijnen} kpi={kpi} />

      <section className="mx-auto max-w-5xl px-6 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
          <span className="mr-1">Vragen of aanpassingen nodig?</span>
          <ConvBtn icon={MessageSquare} label="Vraag stellen" onClick={() => setModal('vraag')} />
          <ConvBtn icon={Repeat} label="Alternatief" onClick={() => setModal('alternatief')} />
          <ConvBtn icon={PlusCircle} label="Meerwerk" onClick={() => setModal('meerwerk')} />
          <ConvBtn icon={Calendar} label="Afspraak plannen" onClick={() => setModal('afspraak')} />
        </div>
      </section>

      <OffertePortalOndertekening zekerheden={zekerheden} voorwaardenTekst={voorwaardenTekst} busy={busy} onOndertekenen={ondertekenen} />

      <footer className="py-8 text-center text-xs text-gray-400">STRKBOUW · Offerte {offerte.nummer} · versie {offerte.versie || 1}</footer>

      {['vraag', 'alternatief', 'meerwerk', 'afspraak'].includes(modal) && (
        <Modal title={{ vraag: 'Vraag stellen', alternatief: 'Alternatief aanvragen', meerwerk: 'Meerwerk aanvragen', afspraak: 'Afspraak plannen' }[modal]} onClose={() => setModal(null)}>
          <textarea autoFocus value={tekst} onChange={(e) => setTekst(e.target.value)} rows={4} placeholder="Uw bericht…" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 [color-scheme:light]" />
          <button onClick={() => conversie(modal)} disabled={busy} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-sterkcalc-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{busy ? <Loader2 size={15} className="animate-spin" /> : 'Versturen'}</button>
        </Modal>
      )}
    </div>
  );
}

function ConvBtn({ icon: Icon, label, onClick }) {
  return <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"><Icon size={13} /> {label}</button>;
}
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between"><h3 className="text-base font-semibold text-gray-900">{title}</h3><button onClick={onClose} className="bg-white text-gray-400 [color-scheme:light]">✕</button></div>
        {children}
      </div>
    </div>
  );
}
