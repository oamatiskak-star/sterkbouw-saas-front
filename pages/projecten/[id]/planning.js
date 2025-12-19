import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ProjectPlanning() {
  const router = useRouter()
  const { id } = router.query

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function load() {
      const { data, error } = await supabase
        .from("project_planning_activiteiten")
        .select(`
          id,
          discipline,
          omschrijving,
          duur_dagen,
          start_datum,
          eind_datum,
          is_kritisch
        `)
        .eq("project_id", id)
        .order("start_datum", { ascending: true })

      if (!error) {
        setRows(data || [])
      }

      setLoading(false)
    }

    load()
  }, [id])

  if (loading) return null

  return (
    <>
      <h1>Projectplanning</h1>

      {rows.length === 0 && (
        <p>Geen planning beschikbaar voor dit project.</p>
      )}

      {rows.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Discipline</th>
              <th>Omschrijving</th>
              <th>Duur (dagen)</th>
              <th>Start</th>
              <th>Einde</th>
              <th>Kritisch</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr
                key={r.id}
                style={{
                  backgroundColor: r.is_kritisch ? "#fff3cd" : "transparent"
                }}
              >
                <td>{r.discipline}</td>
                <td>{r.omschrijving}</td>
                <td>{r.duur_dagen}</td>
                <td>{r.start_datum}</td>
                <td>{r.eind_datum}</td>
                <td>{r.is_kritisch ? "Ja" : "Nee"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
