// components/layout/sidebar.tsx
import {
  LayoutDashboard,
  Calculator,
  Building,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Users,
  CreditCard,
  BarChart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Calculator, label: "Calculaties", href: "/calculaties" },
  { icon: Building, label: "Projecten", href: "/projecten" },
  { icon: Users, label: "Klanten", href: "/klanten" },
  { icon: FileText, label: "Documenten", href: "/documenten" },
  { icon: BarChart, label: "Rapporten", href: "/rapporten" },
  { icon: CreditCard, label: "Facturatie", href: "/facturatie" },
]

const settingsItems = [
  { icon: Settings, label: "Instellingen", href: "/instellingen" },
  { icon: HelpCircle, label: "Help & Support", href: "/help" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="h-screen w-64 border-r bg-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SterkStack</h1>
            <p className="text-xs text-gray-500">Bouwcalculatie SaaS</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            )
          })}
        </div>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Instellingen
          </h3>
          <div className="space-y-1">
            {settingsItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">John Doe</p>
            <p className="text-sm text-gray-500">Bouwkundig Calculator</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
