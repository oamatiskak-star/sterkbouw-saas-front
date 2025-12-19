import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function RevisiesProject() {
  const router = useRouter()
  const { project_id } = router.query

  const [revisies, setRevisies] = useState([])
  const [omschrijving, setOmschrijving] = useState("")
  const [bestand, setBestand] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project_id) return

    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("project_revisies")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", { ascending: false })

      setRevisies(data || [])
      setLoading(false)
    }

    load()
  }, [project_id])

  async function upload() {
    if (!omschrijving.trim()) return

    let filePath = null
    if (bestand) {
      filePath = `${project_id}/${Date.now()}_${bestand.name}`
      await supabase.storage.from("project_revisies").upload(filePath, bestand)
    }

    await supabase.from("project_revisies").insert({
      project_id,
      omschrijving,
      bestand: filePath,
      status: "open"
    })

    setOmschrijving("")
    setBestand(null)
    router.reload()
  }

  async function toggleStatus(r) {
    const nieuweStatus = r.status === "open" ? "afgehandeld" : "open"

    await supabase
      .from("project_revisies")
      .update({ status: nieuweStatus })
      .eq("id", r.id)

    router.reload()
  }

  if (loading) return null
  if (!project_id) return <p>Project niet gevonden.</p>

  return (
    <div style={{ padding: 16 }}>
      <h1>Revisies – Project</h1>

      <section style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Omschrijving"
          value={omschrijving}
          onChange={e => setOmschrijving(e.target.value)}
          style={{ width: "60%", marginRight: 8 }}
        />
        <input
          type="file"
          onChange={e => setBestand(e.target.files[0])}
          style={{ marginRight: 8 }}
        />
        <button onClick={upload}>Toevoegen</button>
      </section>

      <section>
        {revisies.length === 0 && <p>Geen revisies aanwezig.</p>}

        {revisies.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {revisies.map(r => (
              <li
                key={r.id}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  backgroundColor:
                    r.status === "open" ? "#fff3cd" : "#d4edda"
                }}
              >
                <div>{r.omschrijving}</div>
                {r.bestand && (
                  <div>
                    <a
                      href={supabase.storage.from("project_revisies").getPublicUrl(r.bestand).publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Bekijk bestand
                    </a>
                  </div>
                )}
                <div>Status: {r.status}</div>
                <button onClick={() => toggleStatus(r)}>
                  {r.status === "open" ? "Markeer afgehandeld" : "Heropenen"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
