// components/portaal/OffertePortalHero.jsx — referentie scherm "2. Openingspagina offerte".
// Full-bleed projectfoto, donkere overlay, STRKBOUW-merk, headline, CTA's, sfeer-quote.
import { Home, PlayCircle, ArrowRight } from 'lucide-react';

export default function OffertePortalHero({ offerte, cover, content, bedrijfNaam, onNaarOfferte }) {
  const naam = bedrijfNaam || 'STRKBOUW';
  const headline = content.headline || cover.projectnaam || 'Bouwen aan jullie volgende hoofdstuk.';
  const sub = [
    cover.projectnaam || null,
    offerte.klant_naam || null,
    offerte.created_at ? new Date(offerte.created_at).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }) : null,
  ].filter(Boolean);

  return (
    <div className="relative flex min-h-[92vh] flex-col justify-between overflow-hidden bg-sterkcalc-navy text-white sm:min-h-screen">
      {cover.projectfoto && (
        <img src={cover.projectfoto} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {/* Uniforme donkere scrim + extra bodemgradient: garandeert leesbaarheid van witte tekst
          ongeacht de helderheid/verdeling van de onderliggende foto (ook lichte/technische beelden). */}
      <div className="absolute inset-0 bg-sterkcalc-navy/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-sterkcalc-navy via-sterkcalc-navy/50 to-transparent" />

      <div className="relative flex items-center justify-between p-6 sm:p-8">
        <div className="flex items-center gap-2 font-bold tracking-wide">
          <Home size={20} />
          <span>{naam}</span>
        </div>
        <div className="text-sm text-white/70">Offerte {offerte.nummer}</div>
      </div>

      <div className="relative mx-auto w-full max-w-3xl px-6 pb-10 sm:px-8">
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl">{headline}</h1>
        {sub.length > 0 && (
          <p className="mt-3 text-sm text-white/80 sm:text-base">{sub.join(' · ')}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={onNaarOfferte} className="inline-flex items-center gap-2 rounded-lg bg-sterkcalc-gold px-5 py-3 text-sm font-semibold text-white hover:bg-sterkcalc-gold2">
            Naar de offerte <ArrowRight size={16} />
          </button>
          {content.video && (
            <a href={content.video} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20">
              <PlayCircle size={16} /> Bekijk de video
            </a>
          )}
        </div>
      </div>

      {content.quote && (
        <div className="relative border-t border-white/10 bg-sterkcalc-navy2/60 px-6 py-4 text-center text-sm italic text-white/80 sm:px-8">
          &ldquo;{content.quote}&rdquo; — {naam}
        </div>
      )}
    </div>
  );
}
