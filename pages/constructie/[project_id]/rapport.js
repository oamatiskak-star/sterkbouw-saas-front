import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import supabase from "@/lib/supabase"

export default function ConstructieRapport() {
  const router = useRouter()
  const { project_id } = router.query

  const [berekeningen, setBerekeningen] = useState([])
  const [materialen, setMaterialen] = useState([])
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

      if (!cancelled) {
        setBerekeningen(b || [])
        setMaterialen(m || [])
        setPlanning(p || [])
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
      <h1>Constructie rapport – project</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Berekeningen</h2>

        {berekeningen.length === 0 && (
          <p>Geen berekeningen aanwezig.</p>
        )}

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
                  <td>€ {Number(b.kosten || 0).toFixed(2)}</td>
                  <td>€ {Number(b.arbeid || 0).toFixed(2)}</td>
                  <td>€ {Number(b.totaal || 0).toFixed(2)}</td>
                  <td>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Materialen</h2>

        {materialen.length === 0 && (
          <p>Geen materialen aanwezig.</p>
        )}

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
                  <td>€ {Number(m.kosten || 0).toFixed(2)}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Planning</h2>

        {planning.length === 0 && (
          <p>Geen planning aanwezig.</p>
        )}

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
