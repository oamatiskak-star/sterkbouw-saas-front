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
    setBusy(true); setErr(null)

    try {
      for (const f of files) {
        const path = `${project_id}/${Date.now()}_${f.name}`

        const r = await fetch("/api/signed-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bucket: "sterkcalc",
            path,
            contentType: f.type
          })
        })
        const { signedUrl, token } = await r.json()

        await fetch(signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": f.type,
            "x-upsert": "false"
          },
          body: f
        })

        await supabase.from("project_files").insert({
          project_id,
          bucket: "sterkcalc",
          path,
          filename: f.name,
          content_type: f.type
        })
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
      <input type="file" multiple onChange={e => setFiles([...e.target.files])} />
      {err && <p>{err}</p>}
      <button onClick={upload} disabled={busy}>Upload starten</button>
    </>
  )
}
