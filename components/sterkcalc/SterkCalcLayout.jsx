// components/sterkcalc/SterkCalcLayout.jsx
// Eigen SterkCalc Next-Gen shell (donkere sidebar + topbar). Vervangt binnen
// /calculaties de admin-shell. Activatie route-based in pages/_app.js.
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutGrid, PlusCircle, Table2, Boxes, Layers, CalendarDays,
  ShoppingCart, FileText, BarChart3, Settings, HelpCircle, Bell, Plus, LogOut, Calculator,
} from 'lucide-react';

const NAV = [
  { label: 'Overzicht', href: '/calculaties', icon: LayoutGrid, match: (p) => p === '/calculaties' },
  { label: 'Nieuwe calculatie', href: '/calculaties/nieuw', icon: PlusCircle },
  { label: 'Werktafel', href: '/calculaties/werktafel', icon: Table2, match: (p) => p.includes('/werktafel') },
  { label: "Combi's", href: '/calculaties/combis', icon: Boxes, match: (p) => p.includes('/combi') || p.includes('/categorie') || p.includes('/bouwdeel') },
  { label: 'Bouwdelen', href: '/calculaties/bouwdelen', icon: Layers },
  { label: 'Planning', href: '/calculaties/planning', icon: CalendarDays },
  { label: 'Bestellen', href: '/calculaties/bestellen', icon: ShoppingCart },
  { label: 'Offerte', href: '/calculaties/offerte', icon: FileText },
  { label: 'Rapportages', href: '/calculaties/rapportages', icon: BarChart3 },
  { label: 'Instellingen', href: '/calculaties/instellingen', icon: Settings },
];

export default function SterkCalcLayout({ children }) {
  const router = useRouter();
  const path = router.asPath.split('?')[0];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col bg-sterkcalc-navy text-white">
        <Link href="/calculaties" className="flex items-center gap-2.5 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Calculator size={18} className="text-white" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-semibold">SterkCalc</span>
            <span className="block text-[11px] text-white/55">AI Calculatie</span>
          </span>
        </Link>
        <nav className="mt-2 flex-1 space-y-0.5 px-2.5">
          {NAV.map((item) => {
            const active = item.match ? item.match(path) : path.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? 'bg-sterkcalc-blue text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={17} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">OS</span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-xs font-medium">O.S.M. Amatiskak</span>
              <span className="block truncate text-[10px] text-white/50">oamatiskak@gmail.com</span>
            </span>
          </div>
          <Link href="/login" className="mt-3 flex items-center gap-2 text-xs text-white/55 hover:text-white">
            <LogOut size={14} /> Uitloggen
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5">
          <div className="text-sm text-gray-600">
            <span className="text-gray-400">Project:</span>{' '}
            <span className="font-medium text-gray-900">Nieuwbouw woning Deventer</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><HelpCircle size={16} /> Help</button>
            <span className="relative text-gray-500"><Bell size={18} /><span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sterkcalc-warning text-[9px] font-bold text-white">3</span></span>
            <Link href="/calculaties/nieuw" className="flex items-center gap-1.5 rounded-lg bg-sterkcalc-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-sterkcalc-navy2">
              <Plus size={15} /> Nieuwe calculatie
            </Link>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
