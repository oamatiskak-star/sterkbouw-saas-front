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
        <h3>Actieve projecten</h3>
        <p>{stats ? stats.projecten : "-"}</p>
      </div>

      <div className="card">
        <h3>Lopende calculaties</h3>
        <p>{stats ? stats.calculaties : "-"}</p>
      </div>

      <div className="card">
        <h3>Totale bouwsom</h3>
        <p>{stats ? stats.bouwsom : "-"}</p>
      </div>

      <div className="card">
        <h3>Risicoscore</h3>
        <p>{stats ? stats.risico : "-"}</p>
      </div>

      <div className="card">
        <h3>Laatste projecten</h3>
        <ul>
          <li>Breskens</li>
          <li>Hilversum</li>
          <li>Apeldoorn</li>
        </ul>
      </div>

      <div className="card">
        <h3>Recente uploads</h3>
        <ul>
          <li>STABU calculatie.xlsx</li>
          <li>BIM model.ifc</li>
          <li>Contract.pdf</li>
        </ul>
      </div>

      <div className="card">
        <h3>Open acties</h3>
        <ul>
          <li>Calculatie afronden</li>
          <li>Risico analyse check</li>
          <li>Document uploaden</li>
        </ul>
      </div>

    </div>
  )
}
