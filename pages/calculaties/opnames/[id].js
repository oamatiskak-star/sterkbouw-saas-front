// pages/calculaties/opnames/[id].js — bestaande opname bekijken en bewerken.
// Lost het "kan niet meer aanpassen"-probleem op: submit-opname kon alleen invoegen,
// hier laden + bewerken we dezelfde rij rechtstreeks via Supabase (RLS-policy toegevoegd).
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronLeft, ClipboardList, Loader2 } from 'lucide-react';
import OpnameForm from '@/components/calculatie/opname/OpnameForm';
import { getOpname, updateOpname, voltooiOpname, STATUS_OPTIES } from '@/services/opnames';

const STATUS_LABEL = { nieuw: 'Nieuw', in_behandeling: 'In behandeling', omgezet_naar_calculatie: 'Omgezet naar calculatie', afgerond: 'Afgerond' };

export default function OpnameBewerken() {
  const router = useRouter();
  const { id } = router.query;
  const [opname, setOpname] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (!id) return;
    getOpname(id)
      .then((o) => {
        if (!o) { setErrorMsg('Opname niet gevonden.'); return; }
        setOpname(o);
      })
      .catch((e) => setErrorMsg(e.message || 'Laden mislukt'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(payload) {
    await updateOpname(id, payload);
    setOpname((o) => ({ ...o, ...payload }));
    setSavedAt(new Date());
  }

  async function handleVoltooien(payload) {
    const resultaat = await voltooiOpname({ ...payload, id });
    setOpname((o) => ({
      ...o,
      calculatie_id: resultaat.calculatie_id,
      calculaties: { ...o?.calculaties, projectnummer: resultaat.calc_nummer },
      status: 'omgezet_naar_calculatie',
    }));
    return resultaat;
  }

  async function handleStatusChange(e) {
    const status = e.target.value;
    setOpname((o) => ({ ...o, status }));
    await updateOpname(id, { status }).catch((err) => setErrorMsg(err.message));
  }

  if (loading) {
    return <div className="mx-auto max-w-3xl p-6"><div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div></div>;
  }
  if (errorMsg && !opname) {
    return <div className="mx-auto max-w-3xl p-6"><p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p></div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Link href="/calculaties/opnames" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ChevronLeft size={15} /> Terug naar opnames
      </Link>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><ClipboardList size={20} className="text-sterkcalc-blue" /> {opname.klant_naam}</h1>
        <select value={opname.status || 'nieuw'} onChange={handleStatusChange} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700">
          {STATUS_OPTIES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>)}
        </select>
      </div>
      <p className="mb-1 text-sm text-gray-500">
        Vastgelegd op {new Date(opname.created_at).toLocaleDateString('nl-NL')}
        {opname.updated_at && opname.updated_at !== opname.created_at ? ` · laatst bewerkt ${new Date(opname.updated_at).toLocaleString('nl-NL')}` : ''}
      </p>
      {opname.is_meerwerk && opname.meerwerk_calculatie_id && (
        <p className="mb-1 text-sm">
          <span className="mr-2 rounded bg-[#fdf6e0] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8a6d1a]">Meerwerk</span>
          <Link href={`/calculaties/${opname.meerwerk_calculatie_id}/werktafel`} className="font-mono text-sterkcalc-blue hover:underline">
            Calculatie {opname.meerwerk_calculatie?.projectnummer || opname.meerwerk_calculatie_id} openen →
          </Link>
        </p>
      )}
      {opname.calculatie_id && (
        <p className="mb-6 text-sm">
          <Link href={`/calculaties/${opname.calculatie_id}/werktafel`} className="font-mono text-sterkcalc-blue hover:underline">
            Calculatie {opname.calculaties?.projectnummer || opname.calculatie_id} openen →
          </Link>
        </p>
      )}
      {!opname.calculatie_id && !opname.meerwerk_calculatie_id && <div className="mb-6" />}
      {savedAt && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Opgeslagen om {savedAt.toLocaleTimeString('nl-NL')}.</p>}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <OpnameForm initial={opname} onSubmit={handleSubmit} onVoltooien={handleVoltooien} submitLabel="Wijzigingen opslaan" />
      </div>
    </div>
  );
}
