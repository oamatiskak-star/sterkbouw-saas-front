// pages/calculaties/project/[id].js — Project-dashboard (NAW, documenten, calculaties)
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronLeft, Loader2, FileText, FileBox, Table2 } from 'lucide-react';
import { loadProject, loadDocumenten, loadCalculatiesVanProject, projectNaam } from '@/services/projecten';

export default function ProjectDashboard() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState(null);
  const [docs, setDocs] = useState([]);
  const [calcs, setCalcs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const [p, d, c] = await Promise.all([loadProject(id), loadDocumenten(id), loadCalculatiesVanProject(id)]);
        setProject(p); setDocs(d); setCalcs(c);
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="flex items-center gap-2 p-8 text-gray-400"><Loader2 className="animate-spin" size={16} /> Laden…</div>;
  if (!project) return <div className="p-8 text-sm text-gray-400">Project niet gevonden.</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Link href="/calculaties/projecten" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ChevronLeft size={15} /> Projecten</Link>
      <h1 className="text-xl font-semibold text-gray-900">{projectNaam(project)}</h1>
      <p className="text-sm text-gray-500">{[project.straatnaam_en_huisnummer, project.postcode, project.plaats || project.plaatsnaam].filter(Boolean).join(' · ') || '—'}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi l="Opdrachtgever" v={project.naam_opdrachtgever || '—'} />
        <Kpi l="Type" v={project.project_type || '—'} />
        <Kpi l="Status" v={project.status || 'concept'} />
        <Kpi l="Oppervlakte" v={project.oppervlakte_m2 ? `${project.oppervlakte_m2} m²` : '—'} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card titel={`Documenten & tekeningen (${docs.length})`} icon={FileBox}>
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between py-1 text-sm">
              <span className="flex items-center gap-2 truncate text-gray-700"><FileText size={14} className="text-gray-400" />{d.file_name || d.storage_path}</span>
              <span className="text-xs text-gray-400">{d.document_type || '—'}</span>
            </div>
          ))}
          {docs.length === 0 && <p className="py-2 text-sm text-gray-400">Nog geen documenten.</p>}
        </Card>
        <Card titel={`Calculaties (${calcs.length})`} icon={Table2}>
          {calcs.map((c) => (
            <Link key={c.id} href={`/calculaties/${c.id}/werktafel`} className="flex items-center justify-between rounded py-1 text-sm hover:bg-gray-50">
              <span className="truncate text-gray-700">{c.naam || `Calculatie ${String(c.id).slice(0, 8)}`}</span>
              <span className="text-xs text-gray-400">{c.status || 'concept'}</span>
            </Link>
          ))}
          {calcs.length === 0 && <p className="py-2 text-sm text-gray-400">Nog geen calculaties.</p>}
        </Card>
      </div>
    </div>
  );
}
function Kpi({ l, v }) { return <div className="rounded-xl border border-gray-200 bg-white p-3"><div className="text-[11px] uppercase tracking-wide text-gray-400">{l}</div><div className="truncate text-sm font-semibold text-gray-900">{v}</div></div>; }
function Card({ titel, icon: Icon, children }) { return <div className="rounded-xl border border-gray-200 bg-white p-4"><div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900"><Icon size={15} className="text-gray-400" />{titel}</div>{children}</div>; }
