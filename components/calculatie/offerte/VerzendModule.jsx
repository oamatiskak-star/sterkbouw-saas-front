// components/calculatie/offerte/VerzendModule.jsx — P7.6 offerte-afronding (scherm 14-16).
// E-mail samenstellen (onderwerp/bericht met variabelen + bijlagen) → verzenden via 3 kanalen
// (e-mail / PDF / klantportaal) → status verzonden + audittrail (bevestiging).
import { useMemo, useState } from 'react';
import { Mail, Download, Link2, Send, Check, Loader2, Paperclip } from 'lucide-react';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

const BIJLAGEN = [
  { key: 'offerte', label: 'Offerte (PDF)', default: true },
  { key: 'planning', label: 'Planning', default: true },
  { key: 'meerwerk', label: 'Meerwerk-overzicht', default: false },
  { key: 'techspec', label: 'Technische specificatie', default: false },
];

export default function VerzendModule({ offerte, portalUrl, events = [], totaalIncl, busy, onPdf, onVerzonden }) {
  const klant = offerte?.klant_naam || 'klant';
  const nummer = offerte?.nummer || 'OFF';
  const bedrag = totaalIncl != null ? fmtEUR(totaalIncl) : (offerte?.totaal_incl != null ? fmtEUR(offerte.totaal_incl) : '—');

  const [onderwerp, setOnderwerp] = useState(`Offerte ${nummer}`);
  const [bericht, setBericht] = useState(
    `Beste ${klant},\n\nHierbij ontvangt u onze offerte ${nummer} met een totaalbedrag van ${bedrag} incl. btw.\n\nU kunt de offerte online bekijken en akkoord geven via de meegestuurde link. Heeft u vragen, neem gerust contact op.\n\nMet vriendelijke groet,\nSterk Bouw BV`
  );
  const [bijlagen, setBijlagen] = useState(() => Object.fromEntries(BIJLAGEN.map((b) => [b.key, b.default])));
  const verzonden = ['verzonden', 'bekeken', 'vraag', 'akkoord', 'getekend'].includes(offerte?.status);

  const body = useMemo(() => `${bericht}${portalUrl ? `\n\nOnline bekijken: ${portalUrl}` : ''}`, [bericht, portalUrl]);
  const mailto = offerte?.klant_email
    ? `mailto:${encodeURIComponent(offerte.klant_email)}?subject=${encodeURIComponent(onderwerp)}&body=${encodeURIComponent(body)}`
    : null;

  const kopieer = (txt) => { navigator.clipboard?.writeText(txt); window.alert('Gekopieerd'); };

  return (
    <div className="space-y-4">
      {/* E-mail samenstellen */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><Mail size={15} className="text-sterkcalc-blue" /> E-mail samenstellen</div>
        <label className="block text-[11px] text-gray-500">Aan
          <input readOnly value={offerte?.klant_email || '— vul e-mail opdrachtgever in (tab Cover)'} className="mt-0.5 block w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-600" />
        </label>
        <label className="mt-2 block text-[11px] text-gray-500">Onderwerp
          <input value={onderwerp} onChange={(e) => setOnderwerp(e.target.value)} className="mt-0.5 block w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm" />
        </label>
        <label className="mt-2 block text-[11px] text-gray-500">Bericht
          <textarea value={bericht} onChange={(e) => setBericht(e.target.value)} rows={7} className="mt-0.5 block w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm" />
        </label>
        <div className="mt-2">
          <div className="mb-1 flex items-center gap-1 text-[11px] font-medium text-gray-500"><Paperclip size={12} /> Bijlagen</div>
          <div className="flex flex-wrap gap-3">
            {BIJLAGEN.map((b) => (
              <label key={b.key} className="flex items-center gap-1.5 text-xs text-gray-700">
                <input type="checkbox" checked={!!bijlagen[b.key]} onChange={() => setBijlagen((s) => ({ ...s, [b.key]: !s[b.key] }))} className="h-3.5 w-3.5 accent-sterkcalc-blue" />
                {b.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Verzendkanalen */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kanaal icon={Mail} titel="E-mail" sub={offerte?.klant_email || 'geen adres'} actie={mailto ? <a href={mailto} className="kanaal-btn inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-sterkcalc-blue px-3 py-2 text-xs font-medium text-white hover:opacity-90">Open in e-mail</a> : <span className="text-[11px] text-amber-600">Vul e-mailadres in</span>} />
        <Kanaal icon={Download} titel="PDF" sub="download offerte" actie={<button onClick={onPdf} disabled={busy} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">Download PDF</button>} />
        <Kanaal icon={Link2} titel="Klantportaal" sub={portalUrl ? 'link delen' : 'na verzenden'} actie={portalUrl ? <button onClick={() => kopieer(portalUrl)} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">Kopieer link</button> : <span className="text-[11px] text-gray-400">link verschijnt na verzenden</span>} />
      </div>

      {/* Verzenden / bevestiging */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="text-sm text-gray-600">
          {verzonden
            ? <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700"><Check size={15} /> Offerte verzonden{offerte?.verzonden_at ? ` op ${new Date(offerte.verzonden_at).toLocaleDateString('nl-NL')}` : ''}.</span>
            : 'Markeer als verzonden zodra de offerte de deur uit is — dit maakt de portaal-link aan en legt het vast in de audittrail.'}
        </div>
        <button
          onClick={() => onVerzonden({ kanaal: 'e-mail', onderwerp, bijlagen: Object.keys(bijlagen).filter((k) => bijlagen[k]) })}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-sterkcalc-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {verzonden ? 'Opnieuw vastleggen' : 'Markeer als verzonden'}
        </button>
      </div>

      {/* Audittrail */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Audittrail</div>
        {events.length === 0 ? (
          <p className="text-sm text-gray-400">Nog geen activiteit. Verstuur de offerte en deel de portaal-link.</p>
        ) : (
          <ol className="space-y-1.5">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-sm">
                <span className="font-medium capitalize text-gray-700">{e.type}{e.bericht ? `: ${e.bericht}` : ''}</span>
                <span className="text-xs text-gray-400">{new Date(e.created_at).toLocaleString('nl-NL')}{e.ip ? ` · ${e.ip}` : ''}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function Kanaal({ icon: Icon, titel, sub, actie }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800"><Icon size={14} className="text-gray-400" /> {titel}</div>
      <div className="mb-2 truncate text-[11px] text-gray-400">{sub}</div>
      {actie}
    </div>
  );
}
