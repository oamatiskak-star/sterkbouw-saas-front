import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ConstructieMaterialen() {
  const router = useRouter()
  const { project_id } = router.query

  const [materialen, setMaterialen] = useState([])
  const [loading, setLoading] = useState(true)
  const [nieuwMateriaal, setNieuwMateriaal] = useState("")
  const [kosten, setKosten] = useState("")

  useEffect(() => {
    if (!project_id) return

    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("constructie_materialen")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", { ascending: true })

      setMaterialen(data || [])
      setLoading(false)
    }

    load()
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
      <h1>Materialen – Project</h1>

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
    </div>
  )
}
