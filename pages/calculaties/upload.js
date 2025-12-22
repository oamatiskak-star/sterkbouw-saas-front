import { useRouter } from "next/router"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function UploadPagina() {
  const router = useRouter()
  const { isReady, query } = router
  const project_id = isReady && query.project_id ? String(query.project_id) : null

  const [files, setFiles] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  if (!isReady) return <div>Laden...</div>
  if (!project_id) return <div>Project ontbreekt</div>

  async function startUpload() {
    if (files.length === 0) {
      setError("Geen bestanden geselecteerd")
      return
    }

    setSending(true)
    setError(null)

    try {
      const payloadFiles = files.map(f => ({
        filename: f.name,
        size: f.size,
        type: f.type
      }))

      const { error } = await supabase
        .from("executor_tasks")
        .insert({
          action: "upload_files",
          project_id: project_id,
          payload: {
            project_id: project_id,
            files: payloadFiles
          },
          status: "open",
          assigned_to: "executor"
        })

      if (error) throw error

      router.push(`/calculaties/nieuw?project_id=${project_id}`)
    } catch (e) {
      setError(e.message)
      setSending(false)
    }
  }

  return (
    <>
      <h1>Bestanden uploaden</h1>

      <div style={{ marginBottom: 12 }}>
        Project ID: {project_id}
      </div>

      <input
        type="file"
        multiple
        onChange={e => setFiles(Array.from(e.target.files))}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginTop: 16 }}>
        <button onClick={startUpload} disabled={sending}>
          {sending ? "Versturen..." : "Upload starten"}
        </button>
      </div>
    </>
  )
}
