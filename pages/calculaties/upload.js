import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function UploadCalculatieBestanden() {
  const router = useRouter()
  const { isReady, query } = router
  const project_id = isReady && query.project_id ? String(query.project_id) : null

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  if (!isReady) return <div>Laden...</div>
  if (!project_id) return <div>Project ontbreekt</div>

  async function startUpload() {
    if (files.length === 0) {
      setError("Geen bestanden geselecteerd")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        project_id,
        files: files.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        }))
      }

      const { error: taskError } = await supabase
        .from("executor_tasks")
        .insert({
          action: "upload_files",
          status: "open",
          payload
        })

      if (taskError) {
        throw taskError
      }

      setSuccess(true)

      setTimeout(() => {
        router.replace(`/calculaties/nieuw?project_id=${project_id}`)
      }, 1200)

    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1>Bestanden uploaden</h1>

      <p>Project ID: {project_id}</p>

      <input
        type="file"
        multiple
        onChange={e => setFiles(Array.from(e.target.files))}
        disabled={loading}
      />

      <div style={{ marginTop: 16 }}>
        <button
          onClick={startUpload}
          disabled={loading}
        >
          {loading ? "Upload gestart..." : "Upload starten"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: 12 }}>
          {error}
        </p>
      )}

      {success && (
        <p style={{ color: "green", marginTop: 12 }}>
          Upload taak aangemaakt. Executor verwerkt dit.
        </p>
      )}
    </>
  )
}
