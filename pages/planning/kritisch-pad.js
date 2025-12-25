import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function KritischPad() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("v_kritisch_pad")
        .select("*")
        .order("project_naam", { ascending: true })
        .order("volgorde", { ascending: true })

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
      <h1>Kritische pad</h1>

      {rows.length === 0 && (
        <p>Geen kritische pad data beschikbaar.</p>
      )}

      {rows.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Project</th>
              <th>Fase</th>
              <th>Start</th>
              <th>Einde</th>
              <th>Duur (dagen)</th>
              <th>Slack</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr
                key={`${r.project_id}-${r.fase}`}
                style={{
                  backgroundColor:
                    r.slack_dagen === 0
                      ? "#ffe6e6"
                      : "transparent"
                }}
              >
                <td>{r.project_naam}</td>
                <td>{r.fase}</td>
                <td>{r.start_datum}</td>
                <td>{r.eind_datum}</td>
                <td>{r.duur_dagen}</td>
                <td>{r.slack_dagen}</td>
                <td>
                  {r.slack_dagen === 0
                    ? "Kritisch"
                    : "Niet kritisch"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
