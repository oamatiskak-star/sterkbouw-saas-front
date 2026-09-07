// components/calculatie/opname/OpnameForm.jsx — gedeeld formulier voor nieuwe en bestaande
// opnames (poort van Opnameformulier.html naar de SterkCalc-dashboard, incl. multi-schets en
// foto's). Twee acties: gewoon opslaan (bv. een NAW-only afspraak vooraf), of — pas als de
// opname compleet is op locatie — "afronden": maakt dan pas de gekoppelde calculatie aan.
import { useMemo, useRef, useState } from 'react';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import SketchBlocks from './SketchBlocks';
import FotoUploads from './FotoUploads';
import MeerwerkBlok, { initieleMeerwerkWaarde } from './MeerwerkBlok';

const TYPE_OPTIES = ['Nieuwbouw', 'Verbouw', 'Aanbouw', 'Onderhoud & Herstel', 'Meerwerk', 'Anders'];

function vandaag() {
  return new Date().toISOString().slice(0, 10);
}

export default function OpnameForm({ initial = null, onSubmit, submitLabel = 'Opslaan', onVoltooien = null }) {
  const [velden, setVelden] = useState(() => ({
    klant_naam: initial?.klant_naam || '',
    adres: initial?.adres || '',
    postcode: initial?.postcode || '',
    plaats: initial?.plaats || '',
    telefoon: initial?.telefoon || '',
    email: initial?.email || '',
    type_aanvraag: initial?.type_aanvraag || TYPE_OPTIES[1],
    datum_opname: initial?.datum_opname || vandaag(),
    opgenomen_door: initial?.opgenomen_door || '',
    omschrijving: initial?.omschrijving || '',
    afmetingen: initial?.afmetingen || '',
    materialen: initial?.materialen || '',
    opmerkingen: initial?.opmerkingen || '',
  }));
  const [meerwerk, setMeerwerk] = useState(() => initieleMeerwerkWaarde(initial));
  const [busy, setBusy] = useState(null); // null | 'opslaan' | 'afronden'
  const [status, setStatus] = useState(null);
  const sketchRef = useRef(null);
  const fotoRef = useRef(null);
  const folderId = useMemo(() => initial?.id || (typeof crypto !== 'undefined' ? crypto.randomUUID() : `${Date.now()}`), [initial?.id]);

  function veld(naam) {
    return {
      value: velden[naam],
      onChange: (e) => setVelden((v) => ({ ...v, [naam]: e.target.value })),
    };
  }

  async function actie(soort) {
    if (!velden.klant_naam.trim()) {
      setStatus({ type: 'error', tekst: 'Vul minimaal de naam van de klant in.' });
      return;
    }
    setBusy(soort);
    setStatus(null);
    try {
      const schetsen = sketchRef.current?.getAllDataUrls() || [];
      const fotos = fotoRef.current?.getFotos() || [];
      const meerwerkVelden = {
        is_meerwerk: meerwerk.actief,
        meerwerk_calculatie_id: meerwerk.actief ? meerwerk.calculatie_id : null,
        meerwerk_reden: meerwerk.actief ? meerwerk.reden : null,
        meerwerk_items: meerwerk.actief ? meerwerk.items : null,
        meerwerk_toelichting: meerwerk.actief ? meerwerk.toelichting : null,
      };
      await onSubmit({ ...velden, schetsen, fotos, ...meerwerkVelden });
      if (soort === 'afronden' && onVoltooien) {
        const resultaat = await onVoltooien({ ...velden, id: initial?.id });
        setStatus({ type: 'ok', tekst: `Opname afgerond — calculatie ${resultaat?.calc_nummer || ''} aangemaakt.` });
      }
    } catch (err) {
      setStatus({ type: 'error', tekst: err?.message || 'Opslaan mislukt.' });
    } finally {
      setBusy(null);
    }
  }

  // [color-scheme:light] + expliciete bg-white/text-gray-900: de site dwingt bij een donker
  // systeemthema global `color-scheme: dark` af (styles/globals.css), waardoor native
  // formuliervelden anders een donkere achtergrond met donkere tekst kregen — onleesbaar.
  const inputCls = 'w-full rounded border-[1.5px] border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 [color-scheme:light] focus:border-sterkcalc-blue focus:outline-none focus:ring-2 focus:ring-sterkcalc-blue/20';
  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-700';

  const sectionTitleCls = 'mb-5 border-b-2 border-[#e8c84b] pb-2 text-xs font-bold uppercase tracking-wide text-gray-900';

  // Bij meerwerk is er al een koppeling aan een bestaande calculatie (meerwerk_calculatie_id) —
  // dan is er geen nieuwe calculatie nodig, dus geen "afronden"-knop.
  const toonAfrondenKnop = !!onVoltooien && !initial?.calculatie_id && !meerwerk.actief;

  return (
    <form onSubmit={(e) => { e.preventDefault(); actie('opslaan'); }} className="space-y-10">
      <div>
        <h2 className={sectionTitleCls}>Klantgegevens</h2>
        <div className="mb-4">
          <label className={labelCls} htmlFor="f-naam">Naam klant</label>
          <input id="f-naam" className={inputCls} placeholder="Voor- en achternaam" required autoComplete="name" {...veld('klant_naam')} />
        </div>
        <div className="mb-4">
          <label className={labelCls} htmlFor="f-adres">Adres</label>
          <input id="f-adres" className={inputCls} placeholder="Straat en huisnummer" autoComplete="street-address" {...veld('adres')} />
        </div>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="f-postcode">Postcode</label>
            <input id="f-postcode" className={inputCls} placeholder="1234 AB" autoCapitalize="characters" {...veld('postcode')} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="f-plaats">Plaats</label>
            <input id="f-plaats" className={inputCls} placeholder="Plaats" autoComplete="address-level2" {...veld('plaats')} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="f-telefoon">Telefoon</label>
            <input id="f-telefoon" type="tel" inputMode="tel" className={inputCls} placeholder="06 12345678" autoComplete="tel" {...veld('telefoon')} />
          </div>
          <div>
            <label className={labelCls} htmlFor="f-email">E-mail</label>
            <input id="f-email" type="email" inputMode="email" className={inputCls} placeholder="klant@voorbeeld.nl" autoComplete="email" autoCapitalize="none" {...veld('email')} />
          </div>
        </div>
      </div>

      <div>
        <h2 className={sectionTitleCls}>Aanvraag</h2>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="f-type">Type aanvraag</label>
            <select id="f-type" className={inputCls} {...veld('type_aanvraag')}>
              {TYPE_OPTIES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="f-datum">Datum opname</label>
            <input id="f-datum" type="date" className={inputCls} {...veld('datum_opname')} />
          </div>
        </div>
        <div className="mb-4">
          <label className={labelCls} htmlFor="f-opnemer">Opgenomen door</label>
          <input id="f-opnemer" className={inputCls} placeholder="Naam van de opnemer" autoComplete="off" {...veld('opgenomen_door')} />
        </div>
        <MeerwerkBlok waarde={meerwerk} onChange={setMeerwerk} />
      </div>

      <div>
        <h2 className={sectionTitleCls}>Omschrijving</h2>
        <div className="mb-4">
          <label className={labelCls} htmlFor="f-omschrijving">Omschrijving werkzaamheden</label>
          <textarea id="f-omschrijving" rows={4} className={inputCls} placeholder="Wat moet er gebeuren?" {...veld('omschrijving')} />
        </div>
        <div className="mb-4">
          <label className={labelCls} htmlFor="f-afmetingen">Afmetingen / oppervlakte</label>
          <input id="f-afmetingen" className={inputCls} placeholder="Bijv. 4 x 3 m (12 m²)" {...veld('afmetingen')} />
        </div>
        <div className="mb-4">
          <label className={labelCls} htmlFor="f-materialen">Materialen / specificaties</label>
          <textarea id="f-materialen" rows={3} className={inputCls} placeholder="Gewenste materialen, afwerking, merken" {...veld('materialen')} />
        </div>
        <div>
          <label className={labelCls} htmlFor="f-opmerkingen">Opmerkingen</label>
          <textarea id="f-opmerkingen" rows={3} className={inputCls} placeholder="Overige opmerkingen" {...veld('opmerkingen')} />
        </div>
      </div>

      <div>
        <h2 className={sectionTitleCls}>Foto's</h2>
        <FotoUploads ref={fotoRef} folderId={folderId} initialFotos={initial?.fotos || []} />
      </div>

      <div>
        <h2 className={sectionTitleCls}>Schets / situatietekening</h2>
        <SketchBlocks ref={sketchRef} initialImages={initial?.schetsen || []} />
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-6">
        <button type="submit" disabled={!!busy} className="inline-flex items-center gap-2 rounded bg-[#e8c84b] px-6 py-3 text-sm font-bold uppercase tracking-wide text-black hover:opacity-90 disabled:opacity-50">
          {busy === 'opslaan' ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {submitLabel}
        </button>
        {toonAfrondenKnop && (
          <button
            type="button"
            disabled={!!busy}
            onClick={() => actie('afronden')}
            className="inline-flex items-center gap-2 rounded border-2 border-black bg-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy === 'afronden' ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Opname afronden → calculatie aanmaken
          </button>
        )}
        {status && <span className={status.type === 'error' ? 'text-sm text-red-600' : 'text-sm text-emerald-700'}>{status.tekst}</span>}
      </div>
    </form>
  );
}
