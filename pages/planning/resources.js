import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function PlanningResources() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("v_planning_resources")
        .select("*")
        .order("team", { ascending: true })

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
