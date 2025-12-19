import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function RapportageDetail() {
  const router = useRouter()
  const { project_id } = router.query

  const [project, setProject] = useState(null)
  const [calculaties, setCalculaties] = useState([])
  const [inkoop, setInkoop] = useState([])
  const [facturen, setFacturen] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project_id) return

    async function load() {
      setLoading(true)

      const { data: p } = await supabase
        .from("projecten")
        .select("id, naam, status, startdatum, einddatum")
        .eq("id", project_id)
        .single()

      const { data: c } = await supabase
        .from("calculaties")
        .select("id, naam, totaal, workflow_status")
        .eq("project_id", project_id)

      const { data: i } = await supabase
        .from("v_inkoop_overzicht")
        .select("*")
        .eq("project_id", project_id)

      const { data: f } = await supabase
        .from("inkoop_facturen")
        .select("*")
        .eq("project_id", project_id)

      setProject(p)
      setCalculaties(c || [])
      setInkoop(i || [])
      setFacturen(f || [])
      setLoading(false)
    }

    load()
  }, [project_id])

  if (loading) return null
  if (!project) return <p>Project niet gevonden.</p>

  return (
    <div style={{ padding: 16 }}>
      <h1>Financieel rapport – {project.naam}</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Calculaties</h2>
        {calculaties.length === 0 && <p>Geen calculaties aanwezig.</p>}
        {calculaties.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Naam</th>
                <th>Totaal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {calculaties.map(c => (
                <tr key={c.id}>
                  <td>{c.naam}</td>
                  <td>€ {Number(c.totaal).toFixed(2)}</td>
                  <td>{c.workflow_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Inkoop</h2>
        {inkoop.length === 0 && <p>Geen inkoopdata.</p>}
        {inkoop.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Discipline</th>
                <th>Begroot</th>
                <th>Ingekocht</th>
                <th>Openstaand</th>
              </tr>
            </thead>
            <tbody>
              {inkoop.map(i => (
                <tr key={i.id}>
                  <td>{i.discipline}</td>
                  <td>€ {Number(i.begroot).toFixed(2)}</td>
                  <td>€ {Number(i.ingekocht).toFixed(2)}</td>
                  <td>€ {Number(i.openstaand_bedrag).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Facturen</h2>
        {facturen.length === 0 && <p>Geen facturen.</p>}
        {facturen.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Factuur</th>
                <th>Omschrijving</th>
                <th>Bedrag</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {facturen.map(f => (
                <tr key={f.id}>
                  <td>{f.factuurnummer}</td>
                  <td>{f.inkoop_bestellingen?.omschrijving}</td>
                  <td>€ {Number(f.bedrag).toFixed(2)}</td>
                  <td>{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
