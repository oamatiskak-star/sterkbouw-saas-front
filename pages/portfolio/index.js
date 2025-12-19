import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Portfolio() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("v_portfolio_belasting")
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
      <h1>Portfolio overzicht</h1>

      {rows.length === 0 && (
        <p>Geen gelijktijdige projectbelasting gedetecteerd.</p>
      )}

      {rows.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Discipline</th>
              <th>Actieve projecten</th>
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
