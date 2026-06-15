// components/sterkcalc/FaseStepper.jsx — P7.1: canonieke calculator-ketting als doorlopende
// fase-balk binnen één calculatie. Project → Documenten & AI → Ruimtes & objecten → Werktafel →
// Offerte → Planning → Bestellen. STABU/combi/component zijn engine, geen fase in deze balk.
import Link from 'next/link';
import { FolderKanban, Wand2, Boxes, Table2, FileText, CalendarDays, ShoppingCart, Check } from 'lucide-react';

export const FASES = [
  { key: 'dashboard', label: 'Project', icon: FolderKanban },
  { key: 'ai', label: 'Documenten & AI', icon: Wand2 },
  { key: 'objecten', label: 'Ruimtes & objecten', icon: Boxes },
  { key: 'werktafel', label: 'Werktafel', icon: Table2 },
  { key: 'offerte', label: 'Offerte', icon: FileText },
  { key: 'planning', label: 'Planning', icon: CalendarDays },
  { key: 'bestellen', label: 'Bestellen', icon: ShoppingCart },
];

// Routes die binnen een calculatie als fase gelden (anders geen stepper tonen).
export const FASE_KEYS = FASES.map((f) => f.key);

export default function FaseStepper({ calculatieId, fase }) {
  const huidig = Math.max(0, FASES.findIndex((f) => f.key === fase));
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-200 bg-white px-4 py-2">
      {FASES.map((f, i) => {
        const Icon = f.icon;
        const actief = i === huidig;
        const gedaan = i < huidig;
        return (
          <div key={f.key} className="flex shrink-0 items-center">
            <Link
              href={`/calculaties/${calculatieId}/${f.key}`}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                actief ? 'bg-sterkcalc-navy text-white' : gedaan ? 'text-emerald-700 hover:bg-emerald-50' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${actief ? 'bg-white/20' : gedaan ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                {gedaan ? <Check size={11} /> : i + 1}
              </span>
              <Icon size={13} />
              <span className="whitespace-nowrap">{f.label}</span>
            </Link>
            {i < FASES.length - 1 && <span className="mx-0.5 h-px w-3 bg-gray-200" />}
          </div>
        );
      })}
    </div>
  );
}
