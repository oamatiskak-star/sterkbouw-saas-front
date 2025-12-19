import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function PlanningResources() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("v_planning_resources")
        .select("*")
        .order("team", { ascending: true })

      setRows(data || [])
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return null

  return (
    <>
      <h1>Resources per team</h1>

      {rows.length === 0 && (
        <p>Geen resourceplanning beschikbaar.</p>
      )}

      {rows.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Team</th>
              <th>Project</th>
              <th>Fase</th>
              <th>Benodigde uren</th>
              <th>Beschikbare uren</th>
              <th>Verschil</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor:
                    r.benodigde_uren > r.beschikbare_uren
                      ? "#ffe6e6"
                      : "transparent"
                }}
              >
                <td>{r.team}</td>
                <td>{r.project_naam}</td>
                <td>{r.fase}</td>
                <td>{r.benodigde_uren}</td>
                <td>{r.beschikbare_uren}</td>
                <td>{r.beschikbare_uren - r.benodigde_uren}</td>
                <td>
                  {r.benodigde_uren > r.beschikbare_uren
                    ? "Tekort"
                    : "OK"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
