// components/portaal/SterkCalcOfferteSecties.jsx — secties voor de zakelijke SterkCalc-calculatieofferte in het
// bestaande klantportaal (/portaal/calculatie/[token]). Zelfde opmaak als de particuliere portaalsecties
// (px-3 py-3 sm:px-8 sm:py-4, kaarten p-4 sm:p-8, items-start, break-words). Alle teksten en bedragen komen uit de
// voorstelversie van de SterkCalc-voorstel-API; hier wordt niets berekend of verzonnen.
import { Check, FileText, Clock, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

const kaart = 'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8';
const sectie = 'mx-auto max-w-5xl px-3 py-3 sm:px-8 sm:py-4';
const eur = (x) => fmtEUR(Number(x));
// Datums (28-09-2026) en artikelnummers niet laten afbreken op mobiel: niet-afbrekend koppelteken, alleen in de weergave.
const nb = (t) => String(t ?? '').replace(/(\d{1,2})-(\d{1,2})-(\d{4})/g, '$1\u2011$2\u2011$3');

export function SterkCalcOpdracht({ inhoud }) {
  const samenvatting = inhoud.presentatie?.samenvatting || [];
  const onderdelen = inhoud.presentatie?.scope_onderdelen || [];
  return (
    <section id="opdracht" className={sectie}>
      <div className={kaart}>
        <h2 className="text-lg font-bold text-gray-900">Uw project en opdracht</h2>
        {samenvatting.length > 0 && (
          <ul className="mt-4 space-y-2">
            {samenvatting.map((s, i) => (
              <li key={i} className="flex items-start gap-2 break-words text-sm text-gray-700"><Check size={15} className="mt-0.5 shrink-0 text-sterkcalc-gold" /> {nb(s)}</li>
            ))}
          </ul>
        )}
        {onderdelen.length > 0 ? (
          <div className="mt-6 space-y-3">
            {onderdelen.map((o, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <h3 className="flex items-start gap-2 text-sm font-semibold text-gray-900">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sterkcalc-gold text-[11px] font-bold text-white">{i + 1}</span>
                  <span className="min-w-0 break-words">{nb(o.titel)}</span>
                </h3>
                <ul className="mt-2 space-y-1.5 pl-7">
                  {o.punten.map((pt, j) => <li key={j} className="list-disc break-words text-sm leading-relaxed text-gray-600">{nb(pt)}</li>)}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <>
            <h3 className="mt-6 text-sm font-semibold text-gray-900">Opdrachtomschrijving</h3>
            <p className="mt-2 break-words text-sm leading-relaxed text-gray-600">{nb(inhoud.scope)}</p>
          </>
        )}
        {onderdelen.length > 0 && (
          <details className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-sterkcalc-navy">Volledige contractuele opdrachtomschrijving</summary>
            <p className="mt-3 break-words text-sm leading-relaxed text-gray-600">{nb(inhoud.scope)}</p>
            {(inhoud.stukken || []).length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {inhoud.stukken.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 break-words text-sm text-gray-600"><FileText size={14} className="mt-0.5 shrink-0 text-gray-400" /> {nb(s)}</li>
                ))}
              </ul>
            )}
          </details>
        )}
        {onderdelen.length === 0 && (inhoud.stukken || []).length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-semibold text-gray-900">Beoordeelde documenten</h3>
            <ul className="mt-2 space-y-1.5">
              {inhoud.stukken.map((s, i) => (
                <li key={i} className="flex items-start gap-2 break-words text-sm text-gray-600"><FileText size={14} className="mt-0.5 shrink-0 text-gray-400" /> {nb(s)}</li>
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

// Twee leveropties, beide selecteerbaar. De keuze bepaalt het getoonde totaal en de actie onderaan:
// - optie van deze voorstelversie → akkoord en betalen (bedrag wordt server-side uit de versie bepaald);
// - spoed zonder bevestigde capaciteit → alleen aanvragen (geen betaling, geen toezegging).
export function SterkCalcLeveropties({ inhoud, keuze, onKies, levering }) {
  const o = inhoud.opties;
  if (!o) return null;
  const Regel = ({ l, w, sterk }) => (
    <div className={`flex items-start justify-between gap-3 ${sterk ? 'border-t border-gray-100 pt-2' : ''}`}>
      <span className={sterk ? 'font-semibold text-gray-900' : 'text-gray-600'}>{l}</span>
      <span className={`whitespace-nowrap tabular-nums ${sterk ? 'text-xl font-bold text-sterkcalc-navy' : 'text-gray-700'}`}>{w}</span>
    </div>
  );
  const Kaart = ({ id, children }) => {
    const aan = keuze === id;
    return (
      <div role="radio" tabIndex={0} aria-checked={aan} onClick={() => onKies(id)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onKies(id); } }}
        className={`w-full cursor-pointer rounded-2xl bg-white p-4 text-left shadow-sm sm:p-8 ${aan ? 'border-2 border-solid border-sterkcalc-gold' : 'border border-solid border-gray-200'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">{children[0]}</div>
          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-solid ${aan ? 'border-sterkcalc-gold' : 'border-gray-300'}`}>
            {aan && <span className="h-2.5 w-2.5 rounded-full bg-sterkcalc-gold" />}
          </span>
        </div>
        {children.slice(1)}
      </div>
    );
  };
  return (
    <section id="prijs" className={sectie}>
      <h2 className="px-1 pb-1 text-lg font-bold text-gray-900">Kies uw oplevering</h2>
      <p className="px-1 pb-3 text-sm text-gray-500">Selecteer een optie; het totaalbedrag en de vervolgstap passen zich aan.</p>
      <div role="radiogroup" className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <Kaart id="regulier">
          <div>
            <span className="inline-block rounded bg-sterkcalc-gold px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">Aanbevolen</span>
            <div className="mt-3 text-base font-bold text-gray-900">Reguliere calculatie</div>
          </div>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-600"><Clock size={14} className="mt-0.5 shrink-0" /> Oplevering binnen vijf werkdagen na vervulling van alle startvoorwaarden</p>
          <div className="mt-4 space-y-1.5 text-sm">
            <Regel l="Prijs excl. btw" w={eur(o.regulier.prijs.excl_btw)} />
            <Regel l={`Btw ${o.regulier.prijs.btw_percentage}%`} w={eur(o.regulier.prijs.btw)} />
            <Regel l="Totaal incl. btw" w={eur(o.regulier.prijs.totaal)} sterk />
          </div>
          <p className="mt-3 break-words text-xs leading-relaxed text-gray-500">Complete calculatie inclusief alle onderdelen zoals beschreven in de overeengekomen scope.</p>
        </Kaart>
        <Kaart id="spoed">
          <div>
            <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-600">{levering === 'spoed' ? 'Capaciteit bevestigd' : 'Na capaciteitsbevestiging'}</span>
            <div className="mt-3 flex items-center gap-1.5 text-base font-bold text-gray-900"><Zap size={15} className="text-sterkcalc-gold" /> Spoedcalculatie</div>
          </div>
          <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-600"><Clock size={14} className="mt-0.5 shrink-0" /> Uiterlijk de volgende werkdag om 17.00 uur, na capaciteitsbevestiging en vervulling van alle startvoorwaarden</p>
          <div className="mt-4 space-y-1.5 text-sm">
            <Regel l="Basisprijs excl. btw" w={eur(o.spoed.basis_excl)} />
            <Regel l="Spoedtoeslag excl. btw" w={eur(o.spoed.toeslag_excl)} />
            <Regel l="Totaal excl. btw" w={eur(o.spoed.prijs.excl_btw)} />
            <Regel l={`Btw ${o.spoed.prijs.btw_percentage}%`} w={eur(o.spoed.prijs.btw)} />
            <Regel l="Totaal incl. btw" w={eur(o.spoed.prijs.totaal)} sterk />
          </div>
          <p className="mt-3 break-words text-xs leading-relaxed text-gray-500">Voor projecten met een korte deadline. Beschikbaar na bevestiging van onze productiecapaciteit.</p>
        </Kaart>
      </div>
    </section>
  );
}

// Samenvatting van de keuze vlak boven de vervolgstap.
export function SterkCalcKeuze({ inhoud, keuze, onVerder, verderTekst }) {
  const o = inhoud.opties?.[keuze];
  if (!o) return null;
  return (
    <section className="mx-auto max-w-5xl px-3 pt-3 sm:px-8">
      <div className="flex items-start justify-between gap-3 rounded-xl border-2 border-solid border-sterkcalc-gold bg-white p-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Uw keuze</div>
          <div className="mt-0.5 text-sm font-bold text-gray-900">{keuze === 'spoed' ? 'Spoedcalculatie' : 'Reguliere calculatie'}</div>
          <div className="mt-0.5 break-words text-xs text-gray-500">{keuze === 'spoed' ? 'Uiterlijk de volgende werkdag om 17.00 uur' : 'Binnen vijf werkdagen'}</div>
        </div>
        <div className="text-right">
          <div className="whitespace-nowrap text-xl font-bold tabular-nums text-sterkcalc-navy">{eur(o.prijs.totaal)}</div>
          <div className="text-xs text-gray-500">incl. btw</div>
        </div>
      </div>
      {onVerder && (
        <button onClick={onVerder} className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-sterkcalc-gold px-4 py-3 text-sm font-semibold text-white hover:bg-sterkcalc-gold2">{verderTekst}</button>
      )}
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

// [veld, label, autocomplete, volle breedte, optioneel]
const VELDEN = [
  ['bedrijfsnaam', 'Bedrijfsnaam', 'organization', true], ['straat_huisnummer', 'Straat en huisnummer', 'street-address', true],
  ['postcode', 'Postcode', 'postal-code', false], ['plaats', 'Plaats', 'address-level2', false],
  ['factuur_email', 'E-mailadres voor de factuur', 'email', true],
  ['kvk', 'KvK-nummer', 'off', false, true], ['tav', 'Ter attentie van', 'name', false, true],
];

function Veld({ k, label, ac, breed, waarden, fouten, onChange }) {
  return (
    <div className={breed ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      <input value={waarden[k] || ''} autoComplete={ac} onChange={(e) => onChange(k, e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 [color-scheme:light]" />
      {fouten?.[k] && <div className="mt-1 text-xs text-red-600">{fouten[k]}</div>}
    </div>
  );
}

export function SterkCalcZekerheden({ items }) {
  return (
    <section className={sectie}>
      <div className={kaart}>
        <h2 className="text-lg font-bold text-gray-900">Zekerheden</h2>
        <ul className="mt-4 space-y-2">
          {items.map((z) => (
            <li key={z} className="flex items-start gap-2 break-words text-sm text-gray-700"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-sterkcalc-gold" /> {z}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SterkCalcFactuurgegevens({ waarden, fouten, onChange }) {
  return (
    <section id="akkoord" className={sectie}>
      <div className={kaart}>
        <h2 className="text-lg font-bold text-gray-900">Factuurgegevens</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {VELDEN.filter(([, , , , optioneel]) => !optioneel).map(([k, label, ac, breed]) => (
            <Veld key={k} k={k} label={label} ac={ac} breed={breed} waarden={waarden} fouten={fouten} onChange={onChange} />
          ))}
        </div>
        <details className="mt-3" open={!!(fouten?.kvk || fouten?.tav)}>
          <summary className="cursor-pointer text-xs font-medium text-gray-500">KvK-nummer of t.a.v. toevoegen (optioneel)</summary>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {VELDEN.filter(([, , , , optioneel]) => optioneel).map(([k, label, ac, breed]) => (
              <Veld key={k} k={k} label={label} ac={ac} breed={breed} waarden={waarden} fouten={fouten} onChange={onChange} />
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
