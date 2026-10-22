// pages/portaal/calculatie/[token].js — zakelijke SterkCalc-calculatieofferte in het bestaande klantportaal.
// Hergebruikt de portaalpresentatie (Hero, Intro, Ondertekening) met de bestaande SterkCalc-voorstel-API als enige
// databron: inhoud, prijs, akkoord en de Mollie-betaling worden daar server-side vastgelegd en gecontroleerd.
// De particuliere offerteflow (/portaal/[token], sterkcalc_offertes) wordt niet gebruikt en niet gewijzigd.
// Na expliciet akkoord volgt de bestaande Mollie-checkout; de opdracht start pas na bevestigde betaling én complete stukken.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Loader2, CheckCircle2, Clock } from 'lucide-react';
import OffertePortalHero from '@/components/portaal/OffertePortalHero';
import OffertePortalIntro from '@/components/portaal/OffertePortalIntro';
import OffertePortalOndertekening from '@/components/portaal/OffertePortalOndertekening';
import {
  SterkCalcOpdracht, SterkCalcOntvangt, SterkCalcLeveropties, SterkCalcKeuze, SterkCalcVoorwaarden, SterkCalcFactuurgegevens,
} from '@/components/portaal/SterkCalcOfferteSecties';
import { akkoordEnBetalen, geldigToken, haalVoorstel, spoedAanvragen } from '@/lib/sterkcalc/voorstelApi';

const WAAROM = ['Ervaring met aanbestedingen en bouwinschrijvingen.', 'Heldere en open begrotingen.',
  'Technische diepgang en constructieve onderbouwing.', 'Snelle en persoonlijke communicatie.'];
// Concrete afspraken (geen herhaling van de commerciële voordelen bovenaan).
const ZEKERHEDEN = ['Transparante begrotingsopbouw per onderdeel', 'Duidelijke afbakening van de opdracht',
  'Vastgelegde levertermijn en startvoorwaarden', 'Beschreven correctieronde en revisievoorwaarden'];
const BEDRIJF = 'SterkCalc · STRKBOUW B.V.';
const STATUS = {
  verlopen: 'Dit voorstel is verlopen. Neem contact met ons op voor een nieuw voorstel.',
  vervangen: 'Er is een nieuwere versie van dit voorstel. Gebruik de link uit de meest recente e-mail.',
  ingetrokken: 'Dit voorstel is ingetrokken.',
  concept: 'Dit voorstel is nog niet verstuurd.',
};
const REDEN = {
  verlopen: STATUS.verlopen, vervangen: STATUS.vervangen, inhoud_gewijzigd: 'Het voorstel is gewijzigd. Laad de pagina opnieuw.',
  andere_versie_geaccepteerd: 'Een andere versie van dit voorstel is al geaccepteerd.', betalen_niet_beschikbaar: 'Betalen is op dit moment niet beschikbaar. Neem contact met ons op.',
  factuurgegevens: 'Controleer de factuurgegevens.', voorwaarden: 'Ga akkoord met de voorwaarden.',
};

function controleer(f) {
  const fout = {};
  if ((f.bedrijfsnaam || '').trim().length < 2) fout.bedrijfsnaam = 'Vul de bedrijfsnaam in';
  if ((f.straat_huisnummer || '').trim().length < 3 || !/[0-9]/.test(f.straat_huisnummer)) fout.straat_huisnummer = 'Vul straat en huisnummer in';
  if (!/^[1-9][0-9]{3}\s?[A-Za-z]{2}$/.test((f.postcode || '').trim())) fout.postcode = 'Vul een Nederlandse postcode in (1234 AB)';
  if ((f.plaats || '').trim().length < 2) fout.plaats = 'Vul de plaats in';
  if (!/^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test((f.factuur_email || '').trim())) fout.factuur_email = 'Vul een geldig e-mailadres in';
  if (f.kvk && !/^[0-9]{8}$/.test(f.kvk.replace(/\s+/g, ''))) fout.kvk = 'Een KvK-nummer heeft 8 cijfers';
  return fout;
}

export default function SterkCalcPortaal() {
  const router = useRouter();
  const { token, optie, betaald } = router.query;
  const [d, setD] = useState(null);
  const [laden, setLaden] = useState(true);
  const [busy, setBusy] = useState(false);
  const [melding, setMelding] = useState(null);
  const [factuur, setFactuur] = useState({});
  const [fouten, setFouten] = useState({});
  const [keuze, setKeuze] = useState(null);

  const laad = async (metOptie) => {
    const r = await haalVoorstel(String(token), metOptie ? optie : null);
    setD(r);
    if (r?.ok && r.voorinvulling) setFactuur((f) => (Object.keys(f).length ? f : { ...r.voorinvulling }));
    if (r?.ok) setKeuze((k) => k || (optie === 'spoed' || optie === 'regulier' ? optie : (r.levering || 'regulier')));
    return r;
  };

  useEffect(() => {
    if (!router.isReady) return;
    if (!geldigToken(token)) { setD({ ok: false }); setLaden(false); return; }
    (async () => {
      try {
        let r = await laad(true);
        // Terug van Mollie: de server haalt de status bij Mollie op; kort opnieuw proberen zolang de betaling nog loopt.
        for (let i = 0; betaald === '1' && r?.betaling && ['open', 'pending', 'authorized'].includes(r.betaling.status) && i < 5; i++) {
          await new Promise((ok) => setTimeout(ok, 2500));
          r = await laad(false);
        }
      } finally { setLaden(false); }
    })();
  }, [router.isReady, token]); // eslint-disable-line

  if (laden) return <div className="flex min-h-screen items-center justify-center bg-sterkcalc-navy text-white"><Loader2 className="animate-spin" size={20} /></div>;
  if (!d?.ok) {
    return (
      <div className="portaal flex min-h-screen items-center justify-center bg-white px-6 text-center">
        <div className="max-w-md"><h1 className="text-lg font-bold text-gray-900">Offerte niet gevonden</h1>
          <p className="mt-2 text-sm text-gray-600">Deze link is ongeldig of niet meer actief. Gebruik de link uit de meest recente e-mail, of neem contact op via info@strkbouw.nl of 085 200 96 01.</p></div>
      </div>
    );
  }

  const i = d.inhoud;
  const pr = i.presentatie || {};
  const levering = d.levering || null;
  const kanAkkoord = d.status === 'verstuurd';
  const naarAkkoord = () => document.getElementById('akkoord')?.scrollIntoView({ behavior: 'smooth' });
  // De gekozen optie is alleen betaalbaar als het de optie van deze voorstelversie is (bedrag = versie, server-side).
  const betaalbaar = kanAkkoord && (!levering || keuze === levering);
  const spoedAanvraag = kanAkkoord && levering === 'regulier' && keuze === 'spoed';
  const kiesOptie = (k) => { setKeuze(k); setMelding(null); };

  const spoed = async () => {
    setBusy(true);
    try {
      const r = await spoedAanvragen(String(token));
      if (r.ok) await laad(false); else setMelding(REDEN[r.reden] || 'Spoed aanvragen lukt nu niet. Bel of mail ons gerust.');
    } finally { setBusy(false); }
  };

  const akkoord = async ({ naam }) => {
    if (!betaalbaar) return;
    const fout = controleer(factuur);
    setFouten(fout);
    if (Object.keys(fout).length) { setMelding('Controleer de factuurgegevens.'); naarAkkoord(); return; }
    setBusy(true); setMelding(null);
    try {
      const f = { ...factuur, land: 'NL' };
      const r = await akkoordEnBetalen({ token: String(token), inhoudHash: d.inhoud_hash, naam, factuur: f });
      if (r.ok && r.checkout_url) { window.location.href = r.checkout_url; return; }
      if (r.ok && r.betaald) { await laad(false); return; }
      if (r.reden === 'factuurgegevens') setFouten(r.fouten || {});
      setMelding(REDEN[r.reden] || 'Akkoord of betalen is niet gelukt. Probeer het opnieuw of neem contact op.');
    } catch {
      setMelding('Geen verbinding. Uw akkoord is mogelijk niet verwerkt; probeer het opnieuw.');
    } finally { setBusy(false); }
  };

  // Al geaccepteerd, betaling niet afgerond: dezelfde (of na afbreken een nieuwe) Mollie-checkout; het akkoord wordt
  // niet opnieuw vastgelegd (de database geeft 'herhaald' terug).
  const opnieuwBetalen = async () => {
    setBusy(true);
    try {
      const r = await akkoordEnBetalen({ token: String(token), inhoudHash: d.inhoud_hash, naam: 'herhaald', factuur: d.factuurgegevens || {} });
      if (r.ok && r.checkout_url) { window.location.href = r.checkout_url; return; }
      await laad(false);
    } finally { setBusy(false); }
  };

  return (
    <div className="portaal min-h-screen bg-white antialiased">
      <OffertePortalHero offerte={{ nummer: i.referentie, klant_naam: i.klant?.bedrijf, created_at: null }}
        cover={{ projectnaam: pr.project_adres || i.project?.locatie }} content={{ headline: 'Uw calculatievoorstel' }}
        bedrijfNaam={BEDRIJF} onNaarOfferte={() => document.getElementById('opdracht')?.scrollIntoView({ behavior: 'smooth' })} />
      <OffertePortalIntro offerte={{ nummer: i.referentie }} bedrijfNaam={BEDRIJF} content={{
        headline: `Beste ${pr.aanhef_naam || i.klant?.contact || ''},`.replace(' ,', ','),
        intro: `Bedankt voor het toesturen van de ${pr.stukken_omschrijving || 'stukken'} voor het project aan de ${pr.project_adres || i.project?.locatie || ''}. `
          + 'Wij hebben de aangeleverde stukken doorgenomen en een persoonlijk calculatievoorstel voor u opgesteld. Waarom SterkCalc:',
        kernvoordelen: WAAROM,
      }} />

      {d.status === 'geaccepteerd' && <Betaalstatus d={d} busy={busy} onBetaal={opnieuwBetalen} />}
      {!kanAkkoord && d.status !== 'geaccepteerd' && <Melding tekst={STATUS[d.status] || 'Dit voorstel kan niet meer worden geaccepteerd.'} />}

      <SterkCalcOpdracht inhoud={i} />
      <SterkCalcOntvangt inhoud={i} />
      <SterkCalcLeveropties inhoud={i} keuze={keuze} onKies={kiesOptie} levering={levering} />
      <SterkCalcVoorwaarden inhoud={i} />
      {kanAkkoord && <SterkCalcKeuze inhoud={i} keuze={keuze}
        onVerder={betaalbaar ? naarAkkoord : spoedAanvraag ? () => document.getElementById('spoed-aanvraag')?.scrollIntoView({ behavior: 'smooth' }) : null}
        verderTekst={betaalbaar ? 'Naar akkoord en betalen' : 'Naar spoed aanvragen'} />}

      {spoedAanvraag && (
        <section id="spoed-aanvraag" className="mx-auto max-w-5xl px-3 py-3 sm:px-8 sm:py-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-gray-900">Spoed aanvragen</h2>
            {d.spoed_aangevraagd_op ? (
              <p className="mt-2 break-words text-sm leading-relaxed text-gray-600">Uw spoedaanvraag is ontvangen. Na bevestiging van onze capaciteit ontvangt u per e-mail een spoedvoorstel waarmee u direct kunt akkoord geven en betalen. Er is nog niets betaald of geaccepteerd.</p>
            ) : (
              <>
                <p className="mt-2 break-words text-sm leading-relaxed text-gray-600">Spoed is beschikbaar na bevestiging van onze productiecapaciteit. Na uw aanvraag beoordelen wij de capaciteit; bij bevestiging ontvangt u per e-mail een spoedvoorstel. Een aanvraag is geen akkoord en er wordt niets betaald.</p>
                {melding && <p className="mt-3 text-sm text-red-700">{melding}</p>}
                <button onClick={spoed} disabled={busy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sterkcalc-gold px-4 py-3 text-sm font-semibold text-white hover:bg-sterkcalc-gold2 disabled:opacity-50 sm:w-auto">{busy ? <Loader2 size={15} className="animate-spin" /> : null} Spoed aanvragen</button>
              </>
            )}
          </div>
        </section>
      )}
      {kanAkkoord && levering === 'spoed' && keuze === 'regulier' && (
        <Melding tekst="Dit voorstel is opgesteld voor spoed. Liever regulier? Antwoord op de e-mail of bel 085 200 96 01; u ontvangt dan een regulier voorstel." />
      )}

      {betaalbaar && (
        <>
          <SterkCalcFactuurgegevens waarden={factuur} fouten={fouten} onChange={(k, v) => setFactuur((f) => ({ ...f, [k]: v }))} />
          {melding && <Melding tekst={melding} fout />}
          <section className="mx-auto max-w-5xl px-3 pt-3 sm:px-8">
            <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              Na uw akkoord wordt u doorgestuurd naar de beveiligde betaalpagina van Mollie om {fmt(i.prijs?.totaal)} incl. btw ({levering === 'spoed' ? 'spoedcalculatie' : 'reguliere calculatie'}) te betalen.
              De calculatie start pas na bevestigde betaling én complete documenten.
            </p>
          </section>
          <OffertePortalOndertekening zekerheden={ZEKERHEDEN} voorwaardenTekst={`${i.voorwaarden} ${i.start} ${i.oplevering}`} busy={busy} onOndertekenen={akkoord}
            knopTekst={`🔒 Akkoord geven en veilig betalen ${fmt(i.prijs?.totaal)}`} ondertitel="Geef akkoord en betaal direct via de beveiligde betaalpagina van Mollie." toonOntbrekend />
        </>
      )}

      <footer className="px-6 py-8 text-center text-xs text-gray-400">SterkCalc | STRKBOUW B.V. · Annie Westlandstraat 30, 8923 BD Leeuwarden · KvK 42068733 · Voorstel {i.referentie} · versie {d.versie}</footer>
    </div>
  );
}

const fmt = (x) => `€ ${Number(x || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Melding({ tekst, fout }) {
  return (
    <section className="mx-auto max-w-5xl px-3 py-3 sm:px-8">
      <div className={`rounded-xl border p-4 text-sm ${fout ? 'border-red-200 bg-red-50 text-red-700' : 'border-sterkcalc-gold bg-white text-gray-700'}`}>{tekst}</div>
    </section>
  );
}

function Betaalstatus({ d, busy, onBetaal }) {
  const st = d.betaling?.status;
  const betaald = st === 'paid';
  return (
    <section className="mx-auto max-w-5xl px-3 py-3 sm:px-8 sm:py-4">
      <div className="rounded-2xl border-2 border-solid border-sterkcalc-gold bg-white p-4 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          {betaald ? <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={20} /> : <Clock className="mt-0.5 shrink-0 text-sterkcalc-gold" size={20} />}
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-900">{betaald ? 'Betaling bevestigd' : 'Akkoord ontvangen — betaling nog niet afgerond'}</h2>
            <p className="mt-1 break-words text-sm text-gray-600">{betaald
              ? 'Dank u wel. Uw betaling is door ons bij Mollie bevestigd. U ontvangt de factuur (als betaald gemarkeerd) en de opdrachtbevestiging per e-mail. De opleverafspraak gaat in zodra ook alle documenten compleet zijn.'
              : 'Wij hebben nog geen bevestigde betaling ontvangen. Rond de betaling af via de beveiligde betaalpagina van Mollie.'}</p>
            {!betaald && <button onClick={onBetaal} disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sterkcalc-gold px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? <Loader2 size={15} className="animate-spin" /> : null} Betaling afronden</button>}
          </div>
        </div>
      </div>
    </section>
  );
}
