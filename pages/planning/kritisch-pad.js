import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function KritischPad() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("v_kritisch_pad")
        .select("*")
        .order("project_naam", { ascending: true })
        .order("volgorde", { ascending: true })

      setRows(data || [])
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return null

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
