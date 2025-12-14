import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Calculator() {
  const [project, setProject] = useState(null)
  const [calculations, setCalculations] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: p } = await supabase
      .from("projects")
      .select("*")
      .eq("projectnaam", "Breskens Achterkant")
      .single()

    setProject(p)

    const { data: c } = await supabase
      .from("calculations")
      .select("*")
      .eq("project_id", p.id)
      .order("created_at", { ascending: false })

    setCalculations(c || [])
  }

  async function startCalculation() {
    setLoading(true)

    await supabase.from("tasks").insert({
      type: "run_calculation",
      project_id: project.id
    })

    setLoading(false)
    load()
  }

  return (
    <div>
      <h1>Calculaties – {project?.projectnaam}</h1>

      <button onClick={startCalculation} disabled={loading}>
        Nieuwe calculatie starten
      </button>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Totaal</th>
          </tr>
        </thead>
        <tbody>
          {calculations.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.status}</td>
              <td>{c.totaal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
