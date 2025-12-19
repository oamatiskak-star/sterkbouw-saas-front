import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function BouwplaatsPlanning() {
  const router = useRouter()
  const { project_id } = router.query

  const [planning, setPlanning] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project_id) return

    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("project_planning_activiteiten")
        .select("fase, start_datum, eind_datum, status")
        .eq("project_id", project_id)
        .order("start_datum", { ascending: true })

      setPlanning(data || [])
      setLoading(false)
    }

    load()
  }, [project_id])

  if (loading) return null
  if (!project_id) return <p>Project niet gevonden.</p>

  return (
    <div style={{ padding: 16 }}>
      <h1>Planning Bouwplaats</h1>

      {planning.length === 0 && <p>Geen planning beschikbaar.</p>}

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
