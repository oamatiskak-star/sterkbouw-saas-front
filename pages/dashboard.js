import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"
import { apiGet } from "../lib/api"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push("/login")
        return
      }

      setUser(data.user)

      const dashboardData = await apiGet("/api/dashboard")
      setStats(dashboardData)
    }

    init()
  }, [])

  if (!user) {
    return <div className="p-6">Laden...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar user={user} />

        <main className="p-6 space-y-6">
          <KPIGrid stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Project voortgang" />
            <Panel title="Cashflow en calculaties" />
          </div>
        </main>
      </div>
    </div>
  )
}

/* ========== COMPONENTS ========== */

function KPIGrid({ stats }) {
  if (!stats) return <div>Laden dashboard data...</div>

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <KPI title="Actieve projecten" value={stats.projecten} />
      <KPI title="Lopende calculaties" value={stats.calculaties} />
      <KPI title="Totale bouwsom" value={stats.bouwsom} />
      <KPI title="Risicoscore" value={stats.risico} />
      <KPI title="Verwachte marge" value={stats.marge} />
    </div>
  )
}

function KPI({ title, value }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}

function Panel({ title }) {
  return (
    <div className="bg-white rounded shadow p-4 h-64">
      <div className="font-semibold mb-3">{title}</div>
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white">
      <div className="p-6 font-bold text-xl">SterkBouw</div>
      <nav className="p-4 space-y-2 text-sm">
        <MenuLink label="Dashboard" link="/dashboard" />
        <MenuLink label="Projecten" link="/projecten" />
        <MenuLink label="Calculaties" link="/calculator" />
        <MenuLink label="BIM" link="/bim" />
        <MenuLink label="Risico" link="/risico" />
        <MenuLink label="Team" link="/team" />
      </nav>
    </aside>
  )
}

function MenuLink({ label, link }) {
  return (
    <a href={link} className="block px-3 py-2 rounded hover:bg-gray-800">
      {label}
    </a>
  )
}

function Topbar({ user }) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="font-semibold">Dashboard</div>
      <div className="text-sm">{user.email}</div>
    </header>
  )
}
