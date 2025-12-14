import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { count: projects } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })

    const { count: calculations } = await supabase
      .from("calculations")
      .select("*", { count: "exact", head: true })

    const { count: tasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })

    setStats({ projects, calculations, tasks })
  }

  return (
    <div className="grid">
      <div className="card">
        <h3>Projecten</h3>
        <p>{stats?.projects ?? "-"}</p>
      </div>

      <div className="card">
        <h3>Calculaties</h3>
        <p>{stats?.calculations ?? "-"}</p>
      </div>

      <div className="card">
        <h3>Open taken</h3>
        <p>{stats?.tasks ?? "-"}</p>
      </div>
    </div>
  )
}
