// components/portaal/OffertePortalToegang.jsx — toegangsschermen van het klantportaal:
//   - OffertePortalVerificatie: klant bevestigt zijn e-mailadres en voert de toegestuurde code in
//     (een doorgestuurde link werkt zo niet voor anderen);
//   - OffertePortalVerlopen: offerte is verlopen, portaal is gesloten.
import { useState } from 'react';
import { Loader2, Lock, Mail, CalendarX } from 'lucide-react';

function Kader({ nummer, children }) {
  return (
    <div className="portaal flex min-h-screen items-center justify-center bg-sterkcalc-navy px-3 py-3 antialiased">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg sm:p-8">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">STRKBOUW{nummer ? ` · Offerte ${nummer}` : ''}</div>
        {children}
      </div>
    </div>
  );
}

export function OffertePortalVerificatie({ token, emailHint, nummer, onGeverifieerd }) {
  const [stap, setStap] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [fout, setFout] = useState('');

  const post = async (body) => {
    const r = await fetch('/api/portaal/verificatie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ token, ...body }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Er ging iets mis');
    return j;
  };

  const vraagCode = async (e) => {
    e?.preventDefault();
    setFout(''); setBusy(true);
    try {
      await post({ stap: 'aanvragen', email });
      setStap('code');
    } catch (err) { setFout(err.message); } finally { setBusy(false); }
  };

  const controleer = async (e) => {
    e?.preventDefault();
    setFout(''); setBusy(true);
    try {
      await post({ stap: 'controleren', code });
      await onGeverifieerd();
    } catch (err) { setFout(err.message); } finally { setBusy(false); }
  };

  return (
    <Kader nummer={nummer}>
      <div className="mt-3 flex items-center gap-2 text-lg font-bold text-gray-900"><Lock size={18} /> Beveiligde offerte</div>
      {stap === 'email' ? (
        <form onSubmit={vraagCode} className="mt-3">
          <p className="text-sm text-gray-600">
            Deze offerte is persoonlijk. Vul het e-mailadres in waarop u de offerte heeft ontvangen{emailHint ? ` (${emailHint})` : ''}. U ontvangt een eenmalige code.
          </p>
          <input
            type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="uw e-mailadres"
            className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-3 text-sm"
          />
          {fout && <p className="mt-2 text-sm text-red-600">{fout}</p>}
          <button type="submit" disabled={busy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sterkcalc-navy px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <><Mail size={16} /> Stuur mij een code</>}
          </button>
        </form>
      ) : (
        <form onSubmit={controleer} className="mt-3">
          <p className="text-sm text-gray-600">
            Als dit het e-mailadres is waarop u de offerte ontving, ontvangt u binnen enkele minuten een 6-cijferige code. Controleer ook uw spammap.
          </p>
          <input
            inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="mt-4 w-full rounded-lg border border-gray-200 px-3 py-3 text-center text-lg font-semibold tracking-widest"
          />
          {fout && <p className="mt-2 text-sm text-red-600">{fout}</p>}
          <button type="submit" disabled={busy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sterkcalc-navy px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : 'Bekijk de offerte'}
          </button>
          <button type="button" onClick={() => { setStap('email'); setCode(''); setFout(''); }} className="mt-3 w-full text-sm text-gray-500 underline">
            Andere code aanvragen
          </button>
        </form>
      )}
    </Kader>
  );
}

export function OffertePortalVerlopen({ geldigTot, nummer, contact }) {
  const datum = geldigTot ? new Date(`${geldigTot}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  return (
    <Kader nummer={nummer}>
      <div className="mt-3 flex items-center gap-2 text-lg font-bold text-gray-900"><CalendarX size={18} /> Offerte verlopen</div>
      <p className="mt-3 text-sm text-gray-600">
        Deze offerte {datum ? `was geldig tot en met ${datum} en ` : ''}is niet meer beschikbaar. Wilt u een actuele offerte ontvangen? Neem dan contact met ons op.
      </p>
      {(contact?.telefoon || contact?.email) && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <div className="font-semibold text-gray-900">{contact?.naam || 'STRKBOUW'}</div>
          {contact?.telefoon && <div>{contact.telefoon}</div>}
          {contact?.email && <div>{contact.email}</div>}
        </div>
      )}
    </Kader>
  );
}
