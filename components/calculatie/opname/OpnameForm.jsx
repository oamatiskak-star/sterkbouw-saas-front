// components/calculatie/opname/OpnameForm.jsx — gedeeld formulier voor nieuwe en bestaande
// opnames (poort van Opnameformulier.html naar de SterkCalc-dashboard, incl. multi-schets).
import { useRef, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import SketchBlocks from './SketchBlocks';

const TYPE_OPTIES = ['Nieuwbouw', 'Verbouw', 'Aanbouw', 'Onderhoud & Herstel', 'Meerwerk', 'Anders'];

function vandaag() {
  return new Date().toISOString().slice(0, 10);
}

export default function OpnameForm({ initial = null, onSubmit, submitLabel = 'Opslaan' }) {
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
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const sketchRef = useRef(null);

  function veld(naam) {
    return {
      value: velden[naam],
      onChange: (e) => setVelden((v) => ({ ...v, [naam]: e.target.value })),
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!velden.klant_naam.trim()) {
      setStatus({ type: 'error', tekst: 'Vul minimaal de naam van de klant in.' });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const schetsen = sketchRef.current?.getAllDataUrls() || [];
      await onSubmit({ ...velden, schetsen });
    } catch (err) {
      setStatus({ type: 'error', tekst: err?.message || 'Opslaan mislukt.' });
    } finally {
      setBusy(false);
    }
  }

  const inputCls = 'w-full rounded border-[1.5px] border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-sterkcalc-blue focus:outline-none';
  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset>
        <legend className="mb-5 w-full border-b-2 border-[#e8c84b] pb-2 text-xs font-bold uppercase tracking-wide text-gray-900">Klantgegevens</legend>
        <div className="mb-4">
          <label className={labelCls} htmlFor="f-naam">Naam klant</label>
          <input id="f-naam" className={inputCls} placeholder="Voor- en achternaam" required {...veld('klant_naam')} />
        </div>
        <div className="mb-4">
          <label className={labelCls} htmlFor="f-adres">Adres</label>
          <input id="f-adres" className={inputCls} placeholder="Straat en huisnummer" {...veld('adres')} />
        </div>
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls} htmlFor="f-postcode">Postcode</label>
            <input id="f-postcode" className={inputCls} placeholder="1234 AB" {...veld('postcode')} />
          </div>
          <div className="col-span-2">
            <label className={labelCls} htmlFor="f-plaats">Plaats</label>
            <input id="f-plaats" className={inputCls} placeholder="Plaats" {...veld('plaats')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="f-telefoon">Telefoon</label>
            <input id="f-telefoon" type="tel" className={inputCls} placeholder="06 12345678" {...veld('telefoon')} />
          </div>
          <div>
            <label className={labelCls} htmlFor="f-email">E-mail</label>
            <input id="f-email" type="email" className={inputCls} placeholder="klant@voorbeeld.nl" {...veld('email')} />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-5 w-full border-b-2 border-[#e8c84b] pb-2 text-xs font-bold uppercase tracking-wide text-gray-900">Aanvraag</legend>
        <div className="mb-4 grid grid-cols-2 gap-4">
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
        <div>
          <label className={labelCls} htmlFor="f-opnemer">Opgenomen door</label>
          <input id="f-opnemer" className={inputCls} placeholder="Naam van de opnemer" {...veld('opgenomen_door')} />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-5 w-full border-b-2 border-[#e8c84b] pb-2 text-xs font-bold uppercase tracking-wide text-gray-900">Omschrijving</legend>
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
      </fieldset>

      <fieldset>
        <legend className="mb-5 w-full border-b-2 border-[#e8c84b] pb-2 text-xs font-bold uppercase tracking-wide text-gray-900">Schets / situatietekening</legend>
        <SketchBlocks ref={sketchRef} initialImages={initial?.schetsen || []} />
      </fieldset>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded bg-[#e8c84b] px-6 py-3 text-sm font-bold uppercase tracking-wide text-black disabled:opacity-50">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {submitLabel}
        </button>
        {status && <span className={status.type === 'error' ? 'text-sm text-red-600' : 'text-sm text-emerald-700'}>{status.tekst}</span>}
      </div>
    </form>
  );
}
