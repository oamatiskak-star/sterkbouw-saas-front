import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function PlanningCapaciteit() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("v_planning_capaciteit")
        .select("*")
        .order("discipline", { ascending: true })

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
                    r.actieve_projecten > 1
                      ? "#ffe6e6"
                      : "transparent"
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
