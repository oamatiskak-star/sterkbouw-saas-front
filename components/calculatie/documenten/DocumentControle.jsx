// components/calculatie/documenten/DocumentControle.jsx — P7.8 documentcontrole-paneel.
// Toont welke essentiële tekeningtypes aanwezig/ontbrekend zijn. Signaleert, blokkeert niet.
import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, FileSearch, Loader2 } from 'lucide-react';
import { loadDossier } from '@/services/documenten';
import { controleerDocumenten } from '@/lib/calc/documentControle';

export default function DocumentControle({ calculatieId, docs: docsProp, compact }) {
  const [docs, setDocs] = useState(docsProp || null);

  useEffect(() => {
    if (docsProp) { setDocs(docsProp); return; }
    if (!calculatieId) return;
    loadDossier(calculatieId).then(setDocs).catch(() => setDocs([]));
  }, [calculatieId, docsProp]);

  if (docs === null) return <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-400"><Loader2 size={13} className="animate-spin" /> Documenten controleren…</div>;

  const c = controleerDocumenten(docs);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
        <FileSearch size={15} className="text-sterkcalc-blue" /> Documentcontrole
        {c.compleet ? <span className="ml-1 inline-flex items-center gap-1 text-[11px] font-normal text-emerald-600"><CheckCircle2 size={12} /> compleet</span>
          : <span className="ml-1 text-[11px] font-normal text-amber-600">{c.ontbrekend.length} ontbreekt</span>}
      </div>
      {c.aantalTekeningen === 0 && <p className="mb-2 text-[11px] text-gray-400">Nog geen tekeningen geüpload — AI kan pas controleren als er tekeningen in het dossier zitten.</p>}
      <div className={`grid gap-1.5 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {c.resultaat.map((r) => (
          <div key={r.key} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${r.aanwezig ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            {r.aanwezig ? <CheckCircle2 size={13} className="shrink-0" /> : <AlertTriangle size={13} className="shrink-0" />}
            <span className="min-w-0 flex-1">{r.label}</span>
            {r.bestand && <span className="shrink-0 truncate text-[10px] text-emerald-600/70" title={r.bestand}>{r.bestand}</span>}
          </div>
        ))}
      </div>
      {!c.compleet && c.aantalTekeningen > 0 && <p className="mt-2 text-[11px] text-gray-400">Ontbrekende tekeningen maken de AI-analyse minder compleet — upload ze of ga bewust door.</p>}
    </div>
  );
}
