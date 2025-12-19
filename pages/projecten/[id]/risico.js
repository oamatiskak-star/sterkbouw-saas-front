import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ProjectRisico() {
  const router = useRouter()
  const { id } = router.query

  const [risico, setRisico] = useState(null)
  const [knelpunten, setKnelpunten] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)

      const { data: r } = await supabase
        .from("v_project_risico")
        .select("*")
        .eq("project_id", id)
        .single()

      const { data: k } = await supabase
        .from("v_project_knelpunten")
        .select("*")
        .eq("project_id", id)

      setRisico(r)
      setKnelpunten(k || [])
      setLoading(false)
    }

    load()
  }, [id])

  if (loading) return null

  return (
    <>
      <h1>Projectrisico</h1>

      {!risico && (
        <p>Geen risicoanalyse beschikbaar voor dit project.</p>
      )}

      {risico && (
        <section style={{ marginBottom: 32 }}>
          <h2>Risicosamenvatting</h2>
          <p>
            Totale risicoscore:{" "}
            <strong>{Number(risico.risico_score || 0).toFixed(2)}</strong>
          </p>
          <p>
            Faalkosteninschatting: €{" "}
            <strong>{Number(risico.faalkosten_inschatting || 0).toFixed(2)}</strong>
          </p>
        </section>
      )}

      <section>
        <h2>Knelpunten</h2>

        {knelpunten.length === 0 && (
          <p>Geen knelpunten gedetecteerd.</p>
        )}

        {knelpunten.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Discipline</th>
                <th>Gelijktijdige activiteiten</th>
              </tr>
            </thead>
            <tbody>
              {knelpunten.map(k => (
                <tr key={k.discipline}>
                  <td>{k.discipline}</td>
                  <td>{k.gelijktijdige_activiteiten}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
