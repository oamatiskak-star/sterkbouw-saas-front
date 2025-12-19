import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function KoperPlanning() {
  const router = useRouter()
  const { id } = router.query

  const [koper, setKoper] = useState(null)
  const [planning, setPlanning] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)

      const { data: k } = await supabase
        .from("kopers")
        .select("id, naam, project_id, woning")
        .eq("id", id)
        .single()

      if (!k?.project_id) {
        setKoper(k)
        setPlanning([])
        setLoading(false)
        return
      }

      const { data: p } = await supabase
        .from("project_planning_activiteiten")
        .select("fase, start_datum, eind_datum, status")
        .eq("project_id", k.project_id)
        .order("start_datum", { ascending: true })

      setKoper(k)
      setPlanning(p || [])
      setLoading(false)
    }

    load()
  }, [id])

  if (loading) return null
  if (!koper) return <p>Koper niet gevonden.</p>

  return (
    <>
      <h1>Planning – {koper.naam}</h1>

      <section style={{ marginBottom: 24 }}>
        <p>Woning: <strong>{koper.woning}</strong></p>
      </section>

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
    </>
  )
}
