import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function InkoopDashboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("v_inkoop_overzicht")
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
      <h1>Inkoop</h1>

      {rows.length === 0 && (
        <p>Geen inkoopdata beschikbaar.</p>
      )}

      {rows.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Project</th>
              <th>Discipline</th>
              <th>Begroot</th>
              <th>Ingekocht</th>
              <th>Openstaand</th>
              <th>Status</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                style={{
                  backgroundColor:
                    Number(r.openstaand_bedrag) > 0
                      ? "#fff3cd"
                      : "transparent"
                }}
              >
                <td>{r.project_naam}</td>
                <td>{r.discipline}</td>
                <td>€ {Number(r.begroot).toFixed(2)}</td>
                <td>€ {Number(r.ingekocht).toFixed(2)}</td>
                <td>€ {Number(r.openstaand_bedrag).toFixed(2)}</td>
                <td>
                  {Number(r.openstaand_bedrag) > 0
                    ? "Open"
                    : "Afgerond"}
                </td>
                <td>
                  <Link href={`/inkoop/${r.project_id}`}>
                    Bekijk
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
