import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import supabase from "@/lib/supabase"

export default function BouwplaatsPlanning() {
  const router = useRouter()
  const { project_id } = router.query

  const [planning, setPlanning] = useState([])
  const [loading, setLoading] = useState(true)

  const loadedRef = useRef(false)

  useEffect(() => {
    if (!project_id) return
    if (loadedRef.current) return
    loadedRef.current = true

    let cancelled = false

    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("project_planning_activiteiten")
        .select("fase, start_datum, eind_datum, status")
        .eq("project_id", project_id)
        .order("start_datum", { ascending: true })

      if (!cancelled) {
        setPlanning(data || [])
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [project_id])

  if (loading) return null
  if (!project_id) return <p>Project niet gevonden.</p>

  return (
    <div style={{ padding: 16 }}>
      <h1>Planning bouwplaats</h1>

      {planning.length === 0 && (
        <p>Geen planning beschikbaar.</p>
      )}

      {planning.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Fase</th>
              <th>Start</th>
              <th>Einde</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {planning.map((p, i) => (
              <tr key={i}>
                <td>{p.fase}</td>
                <td>{p.start_datum}</td>
                <td>{p.eind_datum}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
