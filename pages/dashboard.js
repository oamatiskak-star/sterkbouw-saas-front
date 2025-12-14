import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"
import { apiGet } from "../lib/api"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function DashboardPage() {
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

      const dashboardStats = await apiGet("/api/dashboard")
      setStats(dashboardStats)
    }

    init()
  }, [])

  if (!user) {
    return <div className="p-6">Laden...</div>
  }

  return (
    <div className="dashboard-grid">

      <div className="card">
        <h3>Snelle acties</h3>
        <ul>
          <li><a href="/actie/calculaties:bouw">Start bouwcalculatie</a></li>
          <li><a href="/actie/calculaties:ew">Start E en W calculatie</a></li>
          <li><a href="/actie/architecten:bouwtekening">Genereer bouwtekening</a></li>
          <li><a href="/actie/planning:genereer">Genereer planning</a></li>
          <li><a href="/actie/documenten:upload">Upload bestanden</a></li>
        </ul>
      </div>

      <div className="card">
        <h3>Projectstatus</h3>
        <p>Actieve projecten: {stats ? stats.projecten : "-"}</p>
        <p>Lopende calculaties: {stats ? stats.calculaties : "-"}</p>
      </div>

      <div className="card">
        <h3>Financieel overzicht</h3>
        <p>Totale bouwsom: {stats ? stats.bouwsom : "-"}</p>
        <p>Risicoscore: {stats ? stats.risico : "-"}</p>
      </div>

      <div className="card">
        <h3>Laatst gebruikte acties</h3>
        <ul>
          <li>Bouwcalculatie – afgerond</li>
          <li>BIM model gegenereerd</li>
          <li>Planning gegenereerd</li>
        </ul>
      </div>

      <div className="card">
        <h3>Laatste projecten</h3>
        <ul>
          <li>Project Breskens</li>
          <li>Project Hilversum</li>
          <li>Project Apeldoorn</li>
        </ul>
      </div>

      <div className="card">
        <h3>Documenten & uploads</h3>
        <ul>
          <li>STABU calculatie.xlsx</li>
          <li>BIM model.ifc</li>
          <li>Contract.pdf</li>
        </ul>
      </div>

      <div className="card">
        <h3>Openstaande aandachtspunten</h3>
        <ul>
          <li>Calculatie controleren</li>
          <li>Risicoanalyse afronden</li>
          <li>Document upload ontbreekt</li>
        </ul>
      </div>

    </div>
  )
}
