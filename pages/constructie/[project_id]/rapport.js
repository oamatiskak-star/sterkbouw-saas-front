import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ConstructieRapport() {
  const router = useRouter()
  const { project_id } = router.query

  const [berekeningen, setBerekeningen] = useState([])
  const [materialen, setMaterialen] = useState([])
  const [planning, setPlanning] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project_id) return

    async function load() {
      setLoading(true)

      const { data: b } = await supabase
        .from("constructie_berekeningen")
        .select("*")
        .eq("project_id", project_id)

      const { data: m } = await supabase
        .from("constructie_materialen")
        .select("*")
        .eq("project_id", project_id)

      const { data: p } = await supabase
        .from("constructie_planning")
        .select("*")
        .eq("project_id", project_id)

      setBerekeningen(b || [])
      setMaterialen(m || [])
      setPlanning(p || [])
      setLoading(false)
    }

    load()
  }, [project_id])

  if (loading) return null
  if (!project_id) return <p>Project niet gevonden.</p>

  return (
    <div style={{ padding: 16 }}>
      <h1>Constructie Rapport – Project</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Berekeningen</h2>
        {berekeningen.length === 0 && <p>Geen berekeningen aanwezig.</p>}
        {berekeningen.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Omschrijving</th>
                <th>Kosten</th>
                <th>Arbeid</th>
                <th>Totaal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {berekeningen.map(b => (
                <tr key={b.id}>
                  <td>{b.omschrijving}</td>
                  <td>€ {Number(b.kosten).toFixed(2)}</td>
                  <td>€ {Number(b.arbeid).toFixed(2)}</td>
                  <td>€ {Number(b.totaal).toFixed(2)}</td>
                  <td>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Materialen</h2>
        {materialen.length === 0 && <p>Geen materialen aanwezig.</p>}
        {materialen.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Materiaal</th>
                <th>Kosten</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {materialen.map(m => (
                <tr key={m.id}>
                  <td>{m.naam}</td>
                  <td>€ {Number(m.kosten).toFixed(2)}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Planning</h2>
        {planning.length === 0 && <p>Geen planning aanwezig.</p>}
        {planning.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Fase</th>
                <th>Startdatum</th>
                <th>Einddatum</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {planning.map(p => (
                <tr key={p.id}>
                  <td>{p.fase}</td>
                  <td>{p.start_datum}</td>
                  <td>{p.eind_datum}</td>
                  <td>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
