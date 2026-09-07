// components/portaal/OffertePortalBedankt.jsx — referentie scherm "6. Bedankpagina (na akkoord)".
import { Home, Check, Mail, FileText, CalendarClock } from 'lucide-react';

export default function OffertePortalBedankt({ cover, content, pdfUrl }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-sterkcalc-navy px-6 text-center text-white">
      {cover.projectfoto && <img src={cover.projectfoto} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />}
      <div className="absolute inset-0 bg-gradient-to-b from-sterkcalc-navy/80 via-sterkcalc-navy/90 to-sterkcalc-navy" />

      <div className="relative flex items-center gap-2 py-8 text-sm font-bold tracking-wide"><Home size={18} /> STRKBOUW</div>

      <div className="relative flex flex-1 flex-col items-center justify-center pb-10">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-sterkcalc-navy shadow-xl">
          <Check size={38} strokeWidth={3} />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Bedankt voor jullie vertrouwen!</h1>
        <p className="mt-3 max-w-md text-sm text-white/80">De offerte is succesvol ondertekend. We gaan met veel plezier voor jullie aan de slag.</p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Stap icon={Mail} tekst="Je ontvangt zo een bevestiging per e-mail" />
          <Stap icon={FileText} tekst={pdfUrl ? <>De definitieve PDF staat <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-white underline">klaar</a></> : 'De definitieve PDF staat in jullie mailbox'} />
          <Stap icon={CalendarClock} tekst="We nemen binnenkort contact op voor de planning" />
        </div>
      </div>

      {content.quote && <div className="relative pb-8 text-sm italic text-white/60">&ldquo;{content.quote}&rdquo; — STRKBOUW</div>}
    </div>
  );
}

function Stap({ icon: Icon, tekst }) {
  return (
    <div className="flex flex-col items-center gap-2 text-xs text-white/80 sm:w-40">
      <Icon size={20} />
      <span>{tekst}</span>
    </div>
  );
}
