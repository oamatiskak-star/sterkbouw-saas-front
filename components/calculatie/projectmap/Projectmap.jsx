// components/calculatie/projectmap/Projectmap.jsx — P7.4 project-hub (scherm 1.1).
// Projectinfo + voortgang + dossier-tiles (documenten/analyses/ruimtes/werktafel/offertes) +
// recente activiteit. Eén overzicht; vandaaruit duik je de fasen in.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, FileText, Wand2, Boxes, Table2, FileSignature, FolderKanban, ArrowRight, Clock } from 'lucide-react';
import { loadProjectmap } from '@/services/projectmap';
import { fmtEUR } from '@/lib/calc/werktafelTotals';

const ACT_KLEUR = { project: 'bg-sterkcalc-navy', document: 'bg-sterkcalc-blue', analyse: 'bg-sterkcalc-accent', offerte: 'bg-emerald-500' };

export default function Projectmap({ calculatieId }) {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!calculatieId) return;
    loadProjectmap(calculatieId).then(setD).catch(() => setD(null)).finally(() => setLoading(false));
  }, [calculatieId]);

  if (loading) return <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-6 text-gray-400"><Loader2 className="animate-spin" size={16} /> Projectmap laden…</div>;
  if (!d) return null;

  const p = d.project || {};
  const t = d.tellingen;
  const naam = d.calculatie?.naam || p.projectnaam || 'Project';
  const opdr = p.naam_opdrachtgever || '—';
  const plaats = [p.straatnaam_en_huisnummer, p.plaatsnaam].filter(Boolean).join(', ') || p.plaatsnaam || '—';
  const type = d.calculatie?.project_type || p.project_type || '—';
  const status = d.calculatie?.status || p.status || 'concept';

  const tiles = [
    { label: 'Documenten', n: t.documenten, sub: `${t.documentenGeanalyseerd} geanalyseerd`, icon: FileText, href: `/calculaties/${calculatieId}/ai` },
    { label: 'AI-analyses', n: t.analyses, sub: `${t.ruimtes} ruimtes`, icon: Wand2, href: `/calculaties/${calculatieId}/ai` },
    { label: 'Objecten', n: t.objecten, sub: 'ruimtes & modellen', icon: Boxes, href: `/calculaties/${calculatieId}/objecten` },
    { label: 'Werktafel', n: t.werktafelRegels, sub: 'regels', icon: Table2, href: `/calculaties/${calculatieId}/werktafel` },
    { label: 'Offertes', n: t.offertes, sub: 'uitgebracht', icon: FileSignature, href: `/calculaties/${calculatieId}/offerte` },
  ];

  return (
    <div className="space-y-4">
      {/* Projectheader + voortgang */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FolderKanban size={20} className="text-sterkcalc-blue" />
              <h2 className="text-lg font-semibold text-gray-900">{naam}</h2>
              <span className="rounded-full bg-sterkcalc-navy/10 px-2 py-0.5 text-[11px] font-medium capitalize text-sterkcalc-navy">{type}</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium capitalize text-gray-600">{status}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
              <span><span className="text-gray-400">Opdrachtgever:</span> {opdr}</span>
              <span><span className="text-gray-400">Locatie:</span> {plaats}</span>
              {t.calculaties > 1 && <span><span className="text-gray-400">Calculaties:</span> {t.calculaties}</span>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-gray-400">Voortgang</div>
            <div className="text-2xl font-bold text-sterkcalc-navy">{d.voortgang}%</div>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-sterkcalc-accent transition-all" style={{ width: `${d.voortgang}%` }} />
        </div>
      </div>

      {/* Dossier-tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link key={tile.label} href={tile.href} className="group rounded-xl border border-gray-200 bg-white p-4 hover:border-sterkcalc-blue/40 hover:shadow-sm">
              <div className="flex items-center justify-between">
                <Icon size={16} className="text-gray-400 group-hover:text-sterkcalc-blue" />
                <ArrowRight size={13} className="text-gray-300 group-hover:text-sterkcalc-blue" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{tile.n}</div>
              <div className="text-xs font-medium text-gray-700">{tile.label}</div>
              <div className="text-[11px] text-gray-400">{tile.sub}</div>
            </Link>
          );
        })}
      </div>

      {/* Recente activiteit + offertes */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500"><Clock size={13} /> Recente activiteit</div>
          {d.activiteit.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">Nog geen activiteit.</p>
          ) : (
            <ul className="space-y-1.5">
              {d.activiteit.map((a, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ACT_KLEUR[a.type] || 'bg-gray-300'}`} />
                  <span className="min-w-0 flex-1 truncate">{a.tekst}</span>
                  <span className="shrink-0 text-[11px] text-gray-400">{fmtDatum(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500"><FileSignature size={13} /> Offertes</div>
          {d.offertes.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">Nog geen offerte. <Link href={`/calculaties/${calculatieId}/offerte`} className="font-medium text-sterkcalc-blue hover:underline">Stel samen →</Link></p>
          ) : (
            <ul className="space-y-1.5">
              {d.offertes.map((o) => (
                <li key={o.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{o.nummer || 'Offerte'} <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] capitalize text-gray-600">{o.status}</span></span>
                  <span className="tabular-nums text-gray-500">{o.totaal_incl != null ? fmtEUR(o.totaal_incl) : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function fmtDatum(at) {
  try { return new Date(at).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' }); } catch { return ''; }
}
