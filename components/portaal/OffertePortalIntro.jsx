// components/portaal/OffertePortalIntro.jsx — referentie scherm "3. Projectomschrijving".
import { Check, Home } from 'lucide-react';

export default function OffertePortalIntro({ offerte, content, bedrijfNaam }) {
  const headline = content.headline || 'Een woning die past bij jullie toekomst.';
  const kernvoordelen = Array.isArray(content.kernvoordelen) && content.kernvoordelen.length ? content.kernvoordelen : [];

  if (!content.intro && !kernvoordelen.length && !content.fotoHoofd) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-14 sm:px-8">
      <div className="flex items-center gap-2 pb-8 text-sm font-semibold text-sterkcalc-navy">
        <Home size={16} /> {bedrijfNaam || 'STRKBOUW'} <span className="ml-auto text-xs font-normal text-gray-400">Offerte {offerte.nummer}</span>
      </div>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">{headline}</h2>
          {content.intro && <p className="mt-4 text-sm leading-relaxed text-gray-600">{content.intro}</p>}
          {kernvoordelen.length > 0 && (
            <ul className="mt-6 space-y-3">
              {kernvoordelen.map((k, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sterkcalc-gold/10 text-sterkcalc-gold"><Check size={13} /></span>
                  {k}
                </li>
              ))}
            </ul>
          )}
        </div>
        {content.fotoHoofd && (
          <div className="relative">
            <img src={content.fotoHoofd} alt="" className="h-72 w-full rounded-2xl object-cover shadow-lg sm:h-96" />
            {content.fotoBestaand && (
              <div className="absolute -bottom-6 -left-4 w-32 rounded-xl border-4 border-white shadow-lg sm:w-40">
                <img src={content.fotoBestaand} alt="Bestaande situatie" className="h-20 w-full rounded-lg object-cover sm:h-24" />
                <span className="mt-1 block text-center text-[10px] text-gray-400">Bestaande situatie</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
