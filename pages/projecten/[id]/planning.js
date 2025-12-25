import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function ProjectPlanning() {
  const router = useRouter()
  const { id } = router.query

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

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
  }, [id])

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
