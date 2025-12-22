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
      // Controleer of er bestanden zijn geselecteerd
      if (files.length === 0) {
        setErr("Geen bestanden geselecteerd.");
        return;
      }

      // Loop door alle geselecteerde bestanden
      for (const file of files) {
        const path = `${project_id}/${Date.now()}_${file.name}`

        // Verkrijg een gesigneerde upload URL voor het bestand
        const r = await fetch("/api/signed-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bucket: "sterkcalc",  // Vervang met je eigen bucket naam als nodig
            path,
            contentType: file.type
          })
        })

        const { signedUrl, token } = await r.json()

        // Upload bestand naar de gesigneerde URL
        await fetch(signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
            "x-upsert": "false"
          },
          body: file
        })

        // Sla bestand op in de Supabase database
        const { error: insertError } = await supabase.from("project_files").insert({
          project_id,
          file_name: file.name,           // Correcte kolomnaam voor bestandnaam
          storage_path: path,             // Correcte kolomnaam voor opslagpad
          status: "uploaded",             // Status wordt "uploaded"
          created_at: new Date().toISOString()  // Voeg de timestamp toe
        })

        if (insertError) {
          throw new Error("Fout bij het opslaan van bestand: " + insertError.message)
        }
      }

      // Voeg een taak toe voor verdere verwerking van de bestanden
      const { error: taskError } = await supabase.from("executor_tasks").insert({
        action: "upload_files",
        project_id,
        status: "open",
        assigned_to: "executor"
      })

      if (taskError) {
        throw new Error("Fout bij het toevoegen van de executor taak: " + taskError.message)
      }

      // Redirect naar de volgende pagina na upload
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
