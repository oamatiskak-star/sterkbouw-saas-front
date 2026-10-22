// components/portaal/SterkCalcOfferteSecties.jsx — secties voor de zakelijke SterkCalc-calculatieofferte in het
// bestaande klantportaal (/portaal/calculatie/[token]). Zelfde opmaak als de particuliere portaalsecties
// (px-3 py-3 sm:px-8 sm:py-4, kaarten p-4 sm:p-8, items-start, break-words). Alle teksten en bedragen komen uit de
// voorstelversie van de SterkCalc-voorstel-API; hier wordt niets berekend of verzonnen.
import { Check, FileText, Clock, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

const kaart = 'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8';
const sectie = 'mx-auto max-w-5xl px-3 py-3 sm:px-8 sm:py-4';
const eur = (x) => fmtEUR(Number(x));

export function SterkCalcOpdracht({ inhoud }) {
  const samenvatting = inhoud.presentatie?.samenvatting || [];
  return (
    <section id="opdracht" className={sectie}>
      <div className={kaart}>
        <h2 className="text-lg font-bold text-gray-900">Uw project en opdracht</h2>
        {samenvatting.length > 0 && (
          <ul className="mt-4 space-y-2">
            {samenvatting.map((s, i) => (
              <li key={i} className="flex items-start gap-2 break-words text-sm text-gray-700"><Check size={15} className="mt-0.5 shrink-0 text-sterkcalc-gold" /> {s}</li>
            ))}
          </ul>
        )}
        <h3 className="mt-6 text-sm font-semibold text-gray-900">Opdrachtomschrijving</h3>
        <p className="mt-2 break-words text-sm leading-relaxed text-gray-600">{inhoud.scope}</p>
        {(inhoud.stukken || []).length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-semibold text-gray-900">Beoordeelde documenten</h3>
            <ul className="mt-2 space-y-1.5">
              {inhoud.stukken.map((s, i) => (
                <li key={i} className="flex items-start gap-2 break-words text-sm text-gray-600"><FileText size={14} className="mt-0.5 shrink-0 text-gray-400" /> {s}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

const ONTVANGT = [
  ['Gespecificeerde STABU-georiënteerde begroting', 'Een gestructureerde kostenbegroting met hoeveelheden, arbeid, materiaal, materieel en opslagen.'],
  ['Technische uitwerking', 'Verwerking van de relevante technische omschrijvingen en bouwtekeningen.'],
  ['Constructieve onderdelen', 'Calculatie van de constructieve werkzaamheden op basis van de aangeleverde constructieve gegevens.'],
  ['Globale uitvoeringsplanning', 'Een overzicht van de uitvoeringsfasen en verwachte doorlooptijd.'],
  ['Excel en PDF', 'Een bewerkbaar Excel-calculatiebestand en professioneel PDF-rapport.'],
  ['Onduidelijkheden en aandachtspunten', 'Een overzicht van relevante vragen, ontbrekende informatie en aandachtspunten voor de opdrachtgever of architect.'],
];

export function SterkCalcOntvangt({ inhoud }) {
  return (
    <section className={sectie}>
      <div className={kaart}>
        <h2 className="text-lg font-bold text-gray-900">Wat ontvangt u?</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ONTVANGT.map(([k, t], i) => (
            <div key={k} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="text-xs font-semibold text-sterkcalc-gold">{i + 1}</div>
              <div className="mt-1 break-words text-sm font-semibold text-gray-900">{k}</div>
              <div className="mt-1 break-words text-xs leading-relaxed text-gray-600">{t}</div>
            </div>
          ))}
        </div>
        {(inhoud.inbegrepen || []).length > 0 && (
          <p className="mt-4 break-words text-xs leading-relaxed text-gray-500">Inbegrepen: {inhoud.inbegrepen.join(' · ')}. {inhoud.revisies ? `Revisies: ${inhoud.revisies}.` : ''}</p>
        )}
      </div>
    </section>
  );
}

// Twee leveropties. Betaalbaar is alleen de optie van deze voorstelversie; spoed zonder bevestigde capaciteit
// kan alleen worden aangevraagd (server-side vastgelegd). Voorstel zonder leveropties: één prijsblok.
export function SterkCalcLeveropties({ inhoud, levering, spoedAangevraagd, busy, onSpoed, onNaarAkkoord, kanAkkoord }) {
  const o = inhoud.opties;
  if (!o) return null;
  const Prijs = ({ p, extra }) => (
    <div className="mt-4 space-y-1.5 text-sm">
      {extra}
      <div className="flex justify-between gap-3 text-gray-600"><span>Prijs excl. btw</span><span className="whitespace-nowrap tabular-nums">{eur(p.excl_btw)}</span></div>
      <div className="flex justify-between gap-3 text-gray-600"><span>Btw {p.btw_percentage}%</span><span className="whitespace-nowrap tabular-nums">{eur(p.btw)}</span></div>
      <div className="flex items-start justify-between gap-3 border-t border-gray-100 pt-2"><span className="font-semibold text-gray-900">Totaal incl. btw</span><span className="whitespace-nowrap text-xl font-bold tabular-nums text-sterkcalc-navy">{eur(p.totaal)}</span></div>
    </div>
  );
  const gekozen = (x) => (levering === x ? 'border-2 border-sterkcalc-gold' : 'border border-gray-200');
  return (
    <section id="prijs" className={sectie}>
      <h2 className="px-1 pb-3 text-lg font-bold text-gray-900">Prijs en levertermijn</h2>
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <div className={`rounded-2xl bg-white p-4 shadow-sm sm:p-8 ${gekozen('regulier')}`}>
          <span className="inline-block rounded bg-sterkcalc-gold px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">Aanbevolen</span>
          <h3 className="mt-3 text-base font-bold text-gray-900">Reguliere calculatie</h3>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-600"><Clock size={14} className="mt-0.5 shrink-0" /> Oplevering binnen vijf werkdagen</p>
          <Prijs p={o.regulier.prijs} />
          <p className="mt-3 break-words text-xs leading-relaxed text-gray-500">Complete calculatie inclusief alle onderdelen zoals beschreven in de overeengekomen scope.</p>
          {levering === 'regulier' && kanAkkoord && (
            <button onClick={onNaarAkkoord} className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-sterkcalc-gold px-4 py-3 text-sm font-semibold text-white hover:bg-sterkcalc-gold2">Kies regulier en ga naar akkoord</button>
          )}
          {levering === 'spoed' && <p className="mt-4 text-xs text-gray-500">U koos voor spoed; deze versie vervangt het reguliere voorstel.</p>}
        </div>
        <div className={`rounded-2xl bg-white p-4 shadow-sm sm:p-8 ${gekozen('spoed')}`}>
          <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-600">Na capaciteitsbevestiging</span>
          <h3 className="mt-3 flex items-center gap-1.5 text-base font-bold text-gray-900"><Zap size={15} className="text-sterkcalc-gold" /> Spoedcalculatie</h3>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-600"><Clock size={14} className="mt-0.5 shrink-0" /> Uiterlijk volgende werkdag om 17.00 uur</p>
          <Prijs p={o.spoed.prijs} extra={(
            <>
              <div className="flex justify-between gap-3 text-gray-500"><span>Basisprijs excl. btw</span><span className="whitespace-nowrap tabular-nums">{eur(o.spoed.basis_excl)}</span></div>
              <div className="flex justify-between gap-3 text-gray-500"><span>Spoedtoeslag excl. btw</span><span className="whitespace-nowrap tabular-nums">{eur(o.spoed.toeslag_excl)}</span></div>
            </>
          )} />
          <p className="mt-3 break-words text-xs leading-relaxed text-gray-500">Voor projecten met een korte deadline. Beschikbaar na bevestiging van onze productiecapaciteit.</p>
          {levering === 'spoed' && kanAkkoord && (
            <button onClick={onNaarAkkoord} className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-sterkcalc-gold px-4 py-3 text-sm font-semibold text-white hover:bg-sterkcalc-gold2">Ga naar akkoord</button>
          )}
          {levering === 'regulier' && kanAkkoord && (spoedAangevraagd
            ? <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">Uw spoedaanvraag is ontvangen. Na bevestiging van onze capaciteit ontvangt u per e-mail de betaalmogelijkheid voor spoed. Er is nog niets betaald of geaccepteerd.</p>
            : <button onClick={onSpoed} disabled={busy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 [color-scheme:light] hover:bg-gray-50 disabled:opacity-50">{busy ? <Loader2 size={15} className="animate-spin" /> : null} Spoed aanvragen</button>)}
        </div>
      </div>
    </section>
  );
}

export function SterkCalcVoorwaarden({ inhoud }) {
  const stappen = [
    ['Akkoord en betaling', 'U accepteert het voorstel en betaalt 100% vooraf via Mollie.'],
    ['Bevestiging en start', 'De opdracht wordt vrijgegeven nadat de volledige betaling is bevestigd en alle benodigde documenten compleet zijn.'],
    ['Oplevering', inhoud.oplevering],
  ];
  return (
    <section className={sectie}>
      <div className={kaart}>
        <h2 className="text-lg font-bold text-gray-900">Betaling, start en oplevering</h2>
        <ol className="mt-4 space-y-4">
          {stappen.map(([k, t], i) => (
            <li key={k} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sterkcalc-gold text-xs font-bold text-white">{i + 1}</span>
              <div className="min-w-0"><div className="text-sm font-semibold text-gray-900">{k}</div><div className="mt-0.5 break-words text-sm leading-relaxed text-gray-600">{t}</div></div>
            </li>
          ))}
        </ol>
        <p className="mt-5 break-words text-xs leading-relaxed text-gray-500">{inhoud.start}</p>
        <p className="mt-2 flex items-start gap-1.5 break-words text-xs leading-relaxed text-gray-500"><ShieldCheck size={13} className="mt-0.5 shrink-0" /> {inhoud.voorwaarden}</p>
      </div>
    </section>
  );
}

const VELDEN = [
  ['bedrijfsnaam', 'Bedrijfsnaam', 'organization', true], ['straat_huisnummer', 'Straat en huisnummer', 'street-address', true],
  ['postcode', 'Postcode', 'postal-code', false], ['plaats', 'Plaats', 'address-level2', false],
  ['factuur_email', 'E-mailadres voor de factuur', 'email', false], ['kvk', 'KvK-nummer (optioneel)', 'off', false],
  ['tav', 'Ter attentie van (optioneel)', 'name', true],
];

export function SterkCalcFactuurgegevens({ waarden, fouten, onChange }) {
  return (
    <section id="akkoord" className={sectie}>
      <div className={kaart}>
        <h2 className="text-lg font-bold text-gray-900">Factuurgegevens</h2>
        <p className="mt-1 text-sm text-gray-500">De factuur wordt na de bevestigde betaling op deze gegevens opgesteld. Alleen Nederlandse factuuradressen.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {VELDEN.map(([k, label, ac, breed]) => (
            <div key={k} className={breed ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-500">{label}</label>
              <input value={waarden[k] || ''} autoComplete={ac} onChange={(e) => onChange(k, e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 [color-scheme:light]" />
              {fouten?.[k] && <div className="mt-1 text-xs text-red-600">{fouten[k]}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
