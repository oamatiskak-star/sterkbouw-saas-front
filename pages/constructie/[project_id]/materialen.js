import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import supabase from "@/lib/supabase"

export default function ConstructieMaterialen() {
  const router = useRouter()
  const { project_id } = router.query

  const [materialen, setMaterialen] = useState([])
  const [loading, setLoading] = useState(true)
  const [nieuwMateriaal, setNieuwMateriaal] = useState("")
  const [kosten, setKosten] = useState("")

  const loadedRef = useRef(false)

  useEffect(() => {
    if (!project_id) return
    if (loadedRef.current) return
    loadedRef.current = true

    let cancelled = false

    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("constructie_materialen")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", { ascending: true })

      if (!cancelled) {
        setMaterialen(data || [])
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [project_id])

  async function toevoegen() {
    if (!nieuwMateriaal.trim() || !kosten) return

    await supabase.from("constructie_materialen").insert({
      project_id,
      naam: nieuwMateriaal,
      kosten: Number(kosten),
      status: "open"
    })

    setNieuwMateriaal("")
    setKosten("")
    router.reload()
  }

  if (loading) return null
  if (!project_id) return <p>Project niet gevonden.</p>

  return (
    <div style={{ padding: 16 }}>
      <h1>Materialen – project</h1>

      <section style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Materiaal"
          value={nieuwMateriaal}
          onChange={e => setNieuwMateriaal(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          type="number"
          placeholder="Kosten"
          value={kosten}
          onChange={e => setKosten(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={toevoegen}>Toevoegen</button>
      </section>

      <section>
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
                  <td>€ {Number(m.kosten).toFixed(2)}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
