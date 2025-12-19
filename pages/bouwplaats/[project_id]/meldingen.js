import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function BouwplaatsMeldingen() {
  const router = useRouter()
  const { project_id } = router.query

  const [meldingen, setMeldingen] = useState([])
  const [bericht, setBericht] = useState("")
  const [foto, setFoto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project_id) return

    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("bouwplaats_meldingen")
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", { ascending: false })

      setMeldingen(data || [])
      setLoading(false)
    }

    load()
  }, [project_id])

  async function verstuur() {
    if (!bericht.trim()) return

    let fotoPath = null
    if (foto) {
      fotoPath = `${project_id}/${Date.now()}_${foto.name}`
      await supabase.storage.from("meldingen").upload(fotoPath, foto)
    }

    await supabase.from("bouwplaats_meldingen").insert({
      project_id,
      bericht,
      foto: fotoPath,
      status: "open"
    })

    setBericht("")
    setFoto(null)
    router.reload()
  }

  if (loading) return null
  if (!project_id) return <p>Project niet gevonden.</p>

  return (
    <div style={{ padding: 16 }}>
      <h1>Meldingen Bouwplaats</h1>

      <section style={{ marginBottom: 24 }}>
        <textarea
          placeholder="Beschrijving melding"
          value={bericht}
          onChange={e => setBericht(e.target.value)}
          rows={3}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          type="file"
          onChange={e => setFoto(e.target.files[0])}
          style={{ marginBottom: 8 }}
        />
        <button onClick={verstuur}>Verstuur melding</button>
      </section>

      <section>
        {meldingen.length === 0 && <p>Geen meldingen.</p>}

        {meldingen.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {meldingen.map(m => (
              <li
                key={m.id}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8,
                  backgroundColor:
                    m.status === "open" ? "#fff3cd" : "#d4edda"
                }}
              >
                <div>{m.bericht}</div>
                {m.foto && (
                  <div>
                    <a
                      href={supabase
                        .storage
                        .from("meldingen")
                        .getPublicUrl(m.foto).publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Bekijk foto
                    </a>
                  </div>
                )}
                <div>Status: {m.status}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
