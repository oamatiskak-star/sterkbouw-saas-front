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
    if (!project_id || files.length === 0) return
    setBusy(true)
    setErr(null)

    try {
      for (const file of files) {
        const path = `${project_id}/${Date.now()}_${file.name}`

        const { error: uploadError } = await supabase.storage
          .from("sterkcalc")
          .upload(path, file, {
            contentType: file.type,
            upsert: false
          })

        if (uploadError) throw uploadError

        const { error: dbError } = await supabase
          .from("project_files")
          .insert({
            project_id,
            bucket: "sterkcalc",
            path,
            filename: file.name,
            content_type: file.type
          })

        if (dbError) throw dbError
      }

      await supabase.from("executor_tasks").insert({
        action: "upload_files",
        project_id,
        status: "open",
        assigned_to: "executor"
      })

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
        onChange={e => setFiles(Array.from(e.target.files))}
      />
      {err && <p>{err}</p>}
      <button onClick={upload} disabled={busy}>
        Upload starten
      </button>
    </>
  )
}
