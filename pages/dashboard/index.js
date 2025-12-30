import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"

export default function DashboardPage() {
  const router = useRouter()
  const [loading] = useState(false)

  const modules = [
    { key: "calculatie", label: "Calculatie & Offertes", desc: "Kostenberekeningen en offertebeheer", path: "/calculatie" },
    { key: "projecten", label: "Projecten", desc: "Projectmanagement en planning", path: "/projecten" },
    { key: "bim", label: "BIM", desc: "3D modellen en tekeningen", path: "/bim" },
    { key: "financien", label: "Financiën", desc: "Budgetten en cashflow", path: "/financien" },
    { key: "bouwplaats", label: "Bouwplaats", desc: "Uitvoering & inspectie", path: "/bouwplaats" },
    { key: "documenten", label: "Documenten", desc: "Bestanden & rapportages", path: "/documenten" },
    { key: "uren", label: "Urenregistratie", desc: "Uren & urenstaten", path: "/uren" },
    { key: "voorraad", label: "Voorraad", desc: "Materialenbeheer", path: "/voorraad" }
  ]

  const quickActions = [
    { label: "Nieuwe calculatie", path: "/calculatie/nieuw" },
    { label: "Nieuw project", path: "/projecten/nieuw" },
    { label: "Financiering", path: "/financien/aanvraag" },
    { label: "Bouwinspectie", path: "/bouwplaats/inspectie" }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-4 font-bold text-lg border-b">Bouw Management</div>
        <nav className="flex flex-col p-2 gap-1">
          {[
            "dashboard","administratie","bim","bouwplaats","calculatie",
            "constructie","documenten","financien","financieringen",
            "inkoop","kopersportaal","mail","planning","projecten",
            "projectportaal","instellingen"
          ].map(route => (
            <Link
              key={route}
              href={`/${route}`}
              className={`px-4 py-2 rounded text-sm ${
                router.pathname.startsWith(`/${route}`)
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {route.charAt(0).toUpperCase() + route.slice(1)}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 space-y-8 overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Overzicht van je bouwprojecten</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push("/calculatie")} className="btn-primary">Calculatie</button>
            <button onClick={() => router.push("/projecten/nieuw")} className="btn-success">Nieuw project</button>
          </div>
        </div>

        {/* KPI’s */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ["Actieve projecten", "12"],
            ["Open calculaties", "8"],
            ["Open issues", "3"],
            ["Cashflow", "€2.8M"]
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">{label}</div>
              <div className="text-xl font-bold">{value}</div>
            </div>
          ))}
        </div>

        {/* Snelle acties */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-4">Snelle acties</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quickActions.map(a => (
              <button
                key={a.path}
                onClick={() => router.push(a.path)}
                className="border rounded p-4 hover:bg-gray-50 text-left"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modules */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-4">Alle modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {modules.map(m => (
              <div
                key={m.key}
                onClick={() => router.push(m.path)}
                className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="font-semibold">{m.label}</div>
                <div className="text-sm text-gray-500">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <style jsx>{`
        .btn-primary {
          background:#2563eb;color:#fff;padding:0.5rem 1rem;border-radius:0.375rem
        }
        .btn-success {
          background:#16a34a;color:#fff;padding:0.5rem 1rem;border-radius:0.375rem
        }
      `}</style>
    </div>
  )
}
