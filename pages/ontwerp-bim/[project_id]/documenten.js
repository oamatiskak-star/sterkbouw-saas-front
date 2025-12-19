import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function OntwerpDocumenten() {
  const router = useRouter()
  const { project_id } = router.query

  const [documenten, setDocumenten] = useState([])
  const [bestand, setBestand] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project_id) return

    async function load() {
      setLoading(true)

      const { data } = await supabase
        .storage
        .from("project_ontwerp_documenten")
        .list(project_id, { limit: 100 })

      setDocumenten(data || [])
      setLoading(false)
    }

    load()
  }, [project_id])

  async function upload() {
    if (!bestand) return

    const path = `${project_id}/${Date.now()}_${bestand.name}`

    await supabase
      .storage
      .from("project_ontwerp_documenten")
      .upload(path, bestand)

    setBestand(null)
    router.reload()
  }

  async function download(path) {
    const { data } = await supabase
      .storage
      .from("project_ontwerp_documenten")
      .download(path)

    const url = window.URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = url
    a.download = path.split("/").pop()
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) return null
  if (!project_id) return <p>Project niet gevonden.</p>

  return (
    <div style={{ padding: 16 }}>
      <h1>Documenten – Ontwerp/BIM Project</h1>

      <section style={{ marginBottom: 24 }}>
        <input
          type="file"
          onChange={e => setBestand(e.target.files[0])}
          style={{ marginBottom: 8 }}
        />
        <button onClick={upload}>Upload document</button>
      </section>

      <section>
        {documenten.length === 0 && <p>Geen documenten aanwezig.</p>}

        {documenten.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {documenten.map(d => (
              <li
                key={d.name}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 8
                }}
              >
                <span>{d.name}</span>
                <button
                  style={{ marginLeft: 12 }}
                  onClick={() => download(`${project_id}/${d.name}`)}
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
