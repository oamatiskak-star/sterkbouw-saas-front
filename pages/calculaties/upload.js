import { useRouter } from "next/router"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function UploadPagina() {
  const router = useRouter()
  const { project_id } = router.query

  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  async function upload() {
    setBusy(true)
    setErr(null)

    try {
      if (!project_id) {
        throw new Error("Geen project_id in URL")
      }

      if (files.length === 0) {
        throw new Error("Geen bestanden geselecteerd")
      }

      for (const file of files) {
        const path = `${project_id}/${Date.now()}_${file.name}`

        const r = await fetch("/api/signed-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bucket: "sterkcalc",
            path,
            contentType: file.type
          })
        })

        if (!r.ok) {
          throw new Error("Signed upload URL ophalen mislukt")
        }

        const { signedUrl } = await r.json()

        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
            "x-upsert": "false"
          },
          body: file
        })

        if (!uploadRes.ok) {
          throw new Error("Upload naar storage mislukt")
        }

        const { error: insertError } = await supabase
          .from("project_files")
          .insert({
            project_id,
            file_name: file.name,
            storage_path: path,
            status: "uploaded",
            created_at: new Date().toISOString()
          })

        if (insertError) {
          throw new Error("DB insert mislukt: " + insertError.message)
        }
      }

      const { error: taskError } = await supabase
        .from("executor_tasks")
        .insert({
          action: "upload_files",
          project_id,
          status: "open",
          assigned_to: "executor"
        })

      if (taskError) {
        throw new Error("Executor taak mislukt: " + taskError.message)
      }

      router.push(`/calculaties/nieuw?project_id=${project_id}`)
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <input
        type="file"
        multiple
        onChange={e => setFiles([...e.target.files])}
      />

      {err && <p>{err}</p>}

      <button onClick={upload} disabled={busy}>
        Upload starten
      </button>
    </>
  )
}
