import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Planning() {
  const [planning, setPlanning] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("projectnaam", "Breskens Achterkant")
      .single()

    if (!project) return

    const { data } = await supabase
      .from("results")
      .select("*")
      .eq("type", "generate_planning")
      .order("created_at", { ascending: false })
      .limit(1)

    setPlanning(data?.[0]?.data || null)
  }

  async function generatePlanning() {
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("projectnaam", "Breskens Achterkant")
      .single()

    await supabase.from("tasks").insert({
      type: "generate_planning",
      project_id: project.id
    })

    load()
  }

  return (
    <div>
      <h1>Planning</h1>

      <button onClick={generatePlanning}>
        Planning genereren
      </button>

      {planning && (
        <table>
          <thead>
            <tr>
              <th>Fase</th>
              <th>Duur (weken)</th>
            </tr>
          </thead>
          <tbody>
            {planning.fases.map((f, i) => (
              <tr key={i}>
                <td>{f.naam}</td>
                <td>{f.weken}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
