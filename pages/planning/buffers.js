import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function PlanningBuffers() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("v_planning_buffers")
        .select("*")
        .order("project_naam", { ascending: true })

      if (cancelled) return

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setRows(data || [])
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <div>Loading…</div>

  if (error) {
    return (
      <div style={{ color: "red" }}>
        {error}
      </div>
    )
  }

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
