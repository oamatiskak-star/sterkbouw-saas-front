import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function ProjectRisico() {
  const router = useRouter()
  const { id } = router.query

  const [risico, setRisico] = useState(null)
  const [knelpunten, setKnelpunten] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data: r, error: rErr } = await supabase
        .from("v_project_risico")
        .select("*")
        .eq("project_id", id)
        .single()

      const { data: k, error: kErr } = await supabase
        .from("v_project_knelpunten")
        .select("*")
        .eq("project_id", id)

      if (cancelled) return

      if (rErr || kErr) {
        setError((rErr || kErr)?.message || "Laadfout")
        setLoading(false)
        return
      }

      setRisico(r)
      setKnelpunten(k || [])
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
      <h1>Projectrisico</h1>

      {!risico && (
        <p>Geen risicoanalyse beschikbaar voor dit project.</p>
      )}

      {risico && (
        <section style={{ marginBottom: 32 }}>
          <h2>Risicosamenvatting</h2>
          <p>
            Totale risicoscore:
            {" "}
            <strong>{Number(risico.risico_score || 0).toFixed(2)}</strong>
          </p>
          <p>
            Faalkosteninschatting:
            {" "}
            €{" "}
            <strong>
              {Number(risico.faalkosten_inschatting || 0).toFixed(2)}
            </strong>
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
