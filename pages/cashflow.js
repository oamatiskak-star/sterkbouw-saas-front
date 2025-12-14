import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Cashflow() {
  const [cashflow, setCashflow] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from("results")
      .select("*")
      .eq("type", "generate_cashflow")
      .order("created_at", { ascending: false })
      .limit(1)

    setCashflow(data?.[0]?.data || null)
  }

  async function generateCashflow() {
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("projectnaam", "Breskens Achterkant")
      .single()

    await supabase.from("tasks").insert({
      type: "generate_cashflow",
      project_id: project.id
    })

    load()
  }

  return (
    <div>
      <h1>Cashflow</h1>

      <button onClick={generateCashflow}>
        Cashflow berekenen
      </button>

      {cashflow && (
        <table>
          <thead>
            <tr>
              <th>Fase</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {cashflow.termijnen.map((t, i) => (
              <tr key={i}>
                <td>{t.fase}</td>
                <td>{t.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
