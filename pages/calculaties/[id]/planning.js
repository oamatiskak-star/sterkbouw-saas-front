// pages/calculaties/[id]/planning.js — planning uit werktafel-uren (gantt-weekbalken)
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, CalendarDays, Wand2 } from 'lucide-react';
import { loadPlanning, genereerPlanning } from '@/services/calcModules';

export default function Planning() {
  const router = useRouter();
  const { id } = router.query;
  const [taken, setTaken] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!id) return; loadPlanning(id).then(setTaken).finally(() => setLoading(false)); }, [id]);
  const genereer = async () => { setBusy(true); try { setTaken(await genereerPlanning(id)); } catch (e) { window.alert(e.message || e); } finally { setBusy(false); } };
  const maxDag = Math.max(1, ...taken.map((t) => (t.start_dag || 0) + (t.duur_dagen || 0)));
  return (
    <div className="mx-auto max-w-5xl p-6">
      <Link href={`/calculaties/${id}/werktafel`} className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ChevronLeft size={15} /> Werktafel</Link>
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900"><CalendarDays size={20} className="text-sterkcalc-blue" /> Planning</h1>
        <button onClick={genereer} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-sterkcalc-navy2 disabled:opacity-60">{busy ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />} Genereren uit werktafel</button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>
      ) : taken.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">Nog geen planning — genereer uit de werktafel-uren.</p>
      ) : (
        <div className="mt-4 space-y-1.5">
          {taken.map((t) => (
            <div key={t.id || t.naam} className="flex items-center gap-3">
              <div className="w-44 shrink-0 truncate text-sm text-gray-700">{t.naam} <span className="text-xs text-gray-400">({t.uren}u)</span></div>
              <div className="relative h-6 flex-1 rounded bg-gray-100">
                <div className="absolute top-0 h-6 rounded bg-sterkcalc-blue/80" style={{ left: `${(t.start_dag / maxDag) * 100}%`, width: `${(t.duur_dagen / maxDag) * 100}%` }} title={`dag ${t.start_dag}–${t.start_dag + t.duur_dagen}`} />
              </div>
              <div className="w-16 shrink-0 text-right text-xs text-gray-400">{t.duur_dagen} dgn</div>
            </div>
          ))}
          <div className="pt-2 text-xs text-gray-500">Totale doorlooptijd: ~{maxDag} werkdagen.</div>
        </div>
      )}
    </div>
  );
}
