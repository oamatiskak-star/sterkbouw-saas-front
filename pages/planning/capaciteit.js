import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function PlanningCapaciteit() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("v_planning_capaciteit")
        .select("*")
        .order("discipline", { ascending: true })

      setRows(data || [])
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return null

  return (
    <>
      <h1>Planning capaciteit</h1>

      {rows.length === 0 && (
        <p>Geen capaciteitsdata beschikbaar.</p>
      )}

      {rows.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Discipline</th>
              <th>Actieve projecten</th>
              <th>Totale duur (dagen)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr
                key={r.discipline}
                style={{
                  backgroundColor:
                    r.actieve_projecten > 1 ? "#ffe6e6" : "transparent"
                }}
              >
                <td>{r.discipline}</td>
                <td>{r.actieve_projecten}</td>
                <td>{r.totale_duur_dagen}</td>
                <td>
                  {r.actieve_projecten > 1
                    ? "Overbelasting"
                    : "Normaal"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
