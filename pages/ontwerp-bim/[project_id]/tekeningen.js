import { useRouter } from "next/router"
import { useEffect, useState, useRef } from "react"
import supabase from "@/lib/supabase"

export default function TekeningenProject() {
  const router = useRouter()
  const { project_id } = router.query

  const [tekeningen, setTekeningen] = useState([])
  const [bestand, setBestand] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadedRef = useRef(false)

  useEffect(() => {
    if (!project_id) return
    if (loadedRef.current) return
    loadedRef.current = true

    let cancelled = false

    async function load() {
      setLoading(true)

      const { data, error } = await supabase
        .storage
        .from("project_tekeningen")
        .list(project_id, { limit: 100 })

      if (!cancelled) {
        setTekeningen(data || [])
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [project_id])

  async function upload() {
    if (!project_id) return
    if (!bestand) return

    const path = `${project_id}/${Date.now()}_${bestand.name}`

    const { error } = await supabase
      .storage
      .from("project_tekeningen")
      .upload(path, bestand)

    if (!error) {
      setBestand(null)
      router.reload()
    }
  }

  async function download(path) {
    const { data } = await supabase
      .storage
      .from("project_tekeningen")
      .download(path)

    if (!data) return

    const url = window.URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = url
    a.download = path.split("/").pop()
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!project_id) return <p>Project niet gevonden.</p>
  if (loading) return null

  return (
    <div style={{ padding: 16 }}>
      <h1>Tekeningen – Project</h1>

      <section style={{ marginBottom: 24 }}>
        <input
          type="file"
          onChange={e => setBestand(e.target.files[0])}
          style={{ marginBottom: 8 }}
        />
        <button onClick={upload}>Upload tekening</button>
      </section>

      <section>
        {tekeningen.length === 0 && <p>Geen tekeningen aanwezig.</p>}

        {tekeningen.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tekeningen.map(t => (
              <li
                key={t.name}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8
                }}
              >
                <span>{t.name}</span>
                <button
                  style={{ marginLeft: 12 }}
                  onClick={() =>
                    download(`${project_id}/${t.name}`)
                  }
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
