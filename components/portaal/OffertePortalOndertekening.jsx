// components/portaal/OffertePortalOndertekening.jsx — referentie scherm "5" (rechterkolom:
// Akkoord) + spec-items 9/10/11/12 (zekerheden, voorwaarden-acceptatie, digitale handtekening,
// acceptatie-CTA). Legt bij akkoord alle auditvelden vast (naam, tijd, ip, offerteversie,
// geselecteerde opties, totaalbedrag, voorwaardenversie) — geen losse client-only state.
import { useState } from 'react';
import { ShieldCheck, ChevronDown, Loader2, PenLine } from 'lucide-react';
import SignaturePad from '@/components/shared/SignaturePad';

export const VOORWAARDEN_VERSIE = '2026.1';

export default function OffertePortalOndertekening({ zekerheden, voorwaardenTekst, busy, onOndertekenen }) {
  const [voorwaardenOpen, setVoorwaardenOpen] = useState(false);
  const [akkoordVoorwaarden, setAkkoordVoorwaarden] = useState(false);
  const [naam, setNaam] = useState('');
  const [handtekening, setHandtekening] = useState(null);
  const [padOpen, setPadOpen] = useState(false);

  const klaar = akkoordVoorwaarden && naam.trim().length > 1 && !!handtekening;

  return (
    <section className="mx-auto max-w-5xl px-6 py-4 sm:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Zekerheden</h2>
          <ul className="mt-4 space-y-2.5">
            {(zekerheden || []).map((z, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700"><ShieldCheck size={15} className="text-sterkcalc-gold" /> {z}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Akkoord</h2>
          <p className="mt-1 text-sm text-gray-500">Tevreden? Onderteken direct digitaal.</p>

          <button onClick={() => setVoorwaardenOpen((v) => !v)} className="mt-4 flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700 [color-scheme:light]">
            Algemene voorwaarden STRKBOUW <ChevronDown size={15} className={`transition-transform ${voorwaardenOpen ? 'rotate-180' : ''}`} />
          </button>
          {voorwaardenOpen && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">{voorwaardenTekst}</div>
          )}
          <label className="mt-3 flex items-start gap-2 text-xs text-gray-600">
            <input type="checkbox" className="mt-0.5 bg-white [color-scheme:light]" checked={akkoordVoorwaarden} onChange={(e) => setAkkoordVoorwaarden(e.target.checked)} />
            Ik heb de algemene voorwaarden gelezen en ga hiermee akkoord.
          </label>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500">Volledige naam</label>
            <input value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="Uw naam" className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 [color-scheme:light]" />
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500">Handtekening</label>
            {handtekening ? (
              <div className="mt-1 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2">
                <img src={handtekening.dataUrl} alt="handtekening" className="h-14 w-32 object-contain" />
                <button onClick={() => setPadOpen(true)} className="bg-white text-xs text-sterkcalc-navy underline [color-scheme:light]">Opnieuw tekenen</button>
              </div>
            ) : (
              <button onClick={() => setPadOpen(true)} className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-3 py-3 text-sm text-gray-500 [color-scheme:light] hover:border-sterkcalc-navy hover:text-sterkcalc-navy">
                <PenLine size={15} /> Zet uw handtekening
              </button>
            )}
          </div>

          <button
            onClick={() => onOndertekenen({ naam: naam.trim(), handtekeningDataUrl: handtekening?.dataUrl, voorwaardenVersie: VOORWAARDEN_VERSIE })}
            disabled={!klaar || busy}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sterkcalc-gold px-4 py-3 text-sm font-semibold text-white hover:bg-sterkcalc-gold2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null} Offerte accepteren en ondertekenen
          </button>
        </div>
      </div>

      {padOpen && (
        <SignaturePad
          onSave={(sig) => { setHandtekening(sig); setPadOpen(false); }}
          onCancel={() => setPadOpen(false)}
        />
      )}
    </section>
  );
}
