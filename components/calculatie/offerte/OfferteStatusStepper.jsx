// components/calculatie/offerte/OfferteStatusStepper.jsx
// Horizontale statusflow-stepper voor het interne dashboard (referentie: scherm "7. Intern
// dashboard"). Zuiver presentationeel — leidt zijn stappen af uit ECHTE offerte-velden en
// -events, geen visuele dummy-status.
import { Check } from 'lucide-react';

const fmtKort = (d) => (d ? new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' }) : null);

function afgeleideStappen(offerte, events) {
  const optieEvent = (events || []).find((e) => e.type === 'optie_gewijzigd');
  return [
    { key: 'concept', label: 'Concept', datum: offerte?.created_at, bereikt: true },
    { key: 'verzonden', label: 'Verzonden', datum: offerte?.verzonden_at, bereikt: !!offerte?.verzonden_at },
    { key: 'bekeken', label: 'Bekeken', datum: offerte?.bekeken_at, bereikt: !!offerte?.bekeken_at },
    { key: 'opties', label: 'Opties gewijzigd', datum: optieEvent?.created_at, bereikt: !!optieEvent, optioneel: true },
    { key: 'geaccepteerd', label: 'Geaccepteerd', datum: offerte?.getekend_at, bereikt: offerte?.status === 'getekend' },
    { key: 'opdracht', label: 'Opdracht', datum: null, bereikt: !!offerte?.project_id },
  ];
}

export default function OfferteStatusStepper({ offerte, events = [] }) {
  const stappen = afgeleideStappen(offerte, events).filter((s) => !s.optioneel || s.bereikt || true);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between">
        {stappen.map((s, i) => (
          <div key={s.key} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <div className={`h-px flex-1 ${i === 0 ? 'invisible' : s.bereikt ? 'bg-sterkcalc-accent' : 'bg-gray-200'}`} />
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${s.bereikt ? 'bg-sterkcalc-accent text-white' : 'border-2 border-gray-200 bg-white text-gray-300'}`}>
                {s.bereikt ? <Check size={13} /> : i + 1}
              </div>
              <div className={`h-px flex-1 ${i === stappen.length - 1 ? 'invisible' : s.bereikt && stappen[i + 1]?.bereikt ? 'bg-sterkcalc-accent' : 'bg-gray-200'}`} />
            </div>
            <span className={`mt-1.5 text-xs font-medium ${s.bereikt ? 'text-gray-800' : 'text-gray-400'}`}>{s.label}</span>
            <span className="text-[10px] text-gray-400">{fmtKort(s.datum) || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
