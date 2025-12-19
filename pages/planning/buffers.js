import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function PlanningBuffers() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("v_planning_buffers")
        .select("*")
        .order("project_naam", { ascending: true })

      setRows(data || [])
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return null

  return (
    <>
      <h1>Planning buffers en slack</h1>

      {rows.length === 0 && (
        <p>Geen bufferdata beschikbaar.</p>
      )}

      {rows.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Project</th>
              <th>Fase</th>
              <th>Gepland (dagen)</th>
              <th>Benodigd (dagen)</th>
              <th>Slack (dagen)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr
                key={`${r.project_id}-${r.fase}`}
                style={{
                  backgroundColor:
                    r.slack_dagen < 0
                      ? "#ffe6e6"
                      : r.slack_dagen <= 3
                      ? "#fff3cd"
                      : "transparent"
                }}
              >
                <td>{r.project_naam}</td>
                <td>{r.fase}</td>
                <td>{r.geplande_duur_dagen}</td>
                <td>{r.benodigde_duur_dagen}</td>
                <td>{r.slack_dagen}</td>
                <td>
                  {r.slack_dagen < 0
                    ? "Achterstand"
                    : r.slack_dagen <= 3
                    ? "Krap"
                    : "Ruimte"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
