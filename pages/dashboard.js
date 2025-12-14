import { apiGet } from "../lib/api"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push("/login")
      } else {
        setUser(data.user)
      }
    }
    loadUser()
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
          <KPIGrid />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Panel title="Project voortgang">
              <div className="h-64 bg-gray-200 rounded"></div>
            </Panel>

            <Panel title="Cashflow en calculaties">
              <div className="h-64 bg-gray-200 rounded"></div>
            </Panel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Panel title="Laatste projecten">
              <ul className="space-y-2 text-sm">
                <li>Project Breskens</li>
                <li>Project Hilversum</li>
                <li>Project Apeldoorn</li>
              </ul>
            </Panel>

            <Panel title="Recente uploads">
              <ul className="space-y-2 text-sm">
                <li>STABU_calculatie.xlsx</li>
                <li>BIM_model.ifc</li>
                <li>Contract.pdf</li>
              </ul>
            </Panel>

            <Panel title="Open acties">
              <ul className="space-y-2 text-sm">
                <li>Calculatie afronden</li>
                <li>Risico analyse controleren</li>
                <li>Document uploaden</li>
              </ul>
            </Panel>
          </div>
        </main>
      </div>
    </div>
  )
}

/* =======================
SIDEBAR
======================= */
function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        SterkBouw
      </div>

      <nav className="flex-1 p-4 space-y-1 text-sm">
        <MenuLink label="Dashboard" link="/dashboard" />
        <MenuLink label="Projecten" link="/projecten" />
        <MenuLink label="Calculaties" link="/calculator" />
        <MenuLink label="STABU Calculator" link="/stabu-calculator" />
        <MenuLink label="Fixed Price" link="/fixed-price" />
        <MenuLink label="BIM Architect" link="/bim" />
        <MenuLink label="Constructeurs" link="/constructeurs" />
        <MenuLink label="E en W" link="/ew" />
        <MenuLink label="Risico Analyse" link="/risico" />
        <MenuLink label="Kopersportaal" link="/kopersportaal" />
        <MenuLink label="Documenten" link="/documenten" />
        <MenuLink label="Uploads" link="/uploads" />
        <MenuLink label="Installatie" link="/installatie" />
        <MenuLink label="Team" link="/team" />
        <MenuLink label="Notificaties" link="/notificaties" />
        <MenuLink label="Instellingen" link="/admin" />
      </nav>

      <div className="p-4 border-t border-gray-700 text-sm">
        <MenuLink label="Profiel" link="/profiel" />
        <MenuLink label="Uitloggen" link="/logout" />
      </div>
    </aside>
  )
}

function MenuLink({ label, link }) {
  return (
    <a
      href={link}
      className="block px-3 py-2 rounded hover:bg-gray-800"
    >
      {label}
    </a>
  )
}

/* =======================
TOPBAR
======================= */
function Topbar({ user }) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div className="text-lg font-semibold">
        SterkBouw SaaS Dashboard
      </div>

      <div className="flex items-center space-x-3">
        <ActionButton label="Nieuwe calculatie" />
        <ActionButton label="Upload bestanden" />
        <ActionButton label="Nieuw project" />

        <div className="text-sm text-gray-600">
          {user.email}
        </div>
      </div>
    </header>
  )
}

function ActionButton({ label }) {
  return (
    <button className="px-3 py-2 bg-yellow-400 text-black rounded text-sm font-medium">
      {label}
    </button>
  )
}

/* =======================
KPI BLOK
======================= */
function KPIGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <KPI title="Actieve projecten" value="12" />
      <KPI title="Lopende calculaties" value="8" />
      <KPI title="Totale bouwsom" value="€ 8.450.000" />
      <KPI title="Risicoscore" value="Laag" />
      <KPI title="Verwachte marge" value="18%" />
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

/* =======================
PANEL
======================= */
function Panel({ title, children }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="font-semibold mb-3">{title}</div>
      {children}
    </div>
  )
}
