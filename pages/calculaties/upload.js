import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function UploadPagina() {
  const router = useRouter()
  const [projectId, setProjectId] = useState(null)
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  // 🔒 PROJECT ID STABILISEREN
  useEffect(() => {
    if (!router.isReady) return
    if (router.query.project_id) {
      setProjectId(String(router.query.project_id)) // Haal project_id uit de queryparameter
    }
  }, [router.isReady, router.query.project_id])

  if (!router.isReady) return <div>Laden...</div>
  if (!projectId) return <div>Project ontbreekt</div>

  // Functie om bestanden te uploaden naar Supabase storage en invoegen in de database
  async function upload() {
    setBusy(true)
    setErr(null)

    try {
      if (files.length === 0) {
        throw new Error("Geen bestanden geselecteerd")
      }

      // Loop door de geselecteerde bestanden
      for (const file of files) {
        const path = `${projectId}/${Date.now()}_${file.name}` // Bepaal het pad voor de upload

        // Verkrijg een gesigneerde upload URL voor het bestand
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

        // Upload het bestand naar de Supabase storage met de gesigneerde URL
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

        // Voeg het bestand toe aan de database in de project_files tabel
        const { error: insertError } = await supabase
          .from("project_files")
          .insert({
            project_id: projectId,
            file_name: file.name,
            storage_path: path,
            status: "uploaded",
            created_at: new Date().toISOString()
          })

        if (insertError) {
          throw new Error("DB insert mislukt: " + insertError.message)
        }
      }

      // Voeg een taak toe aan de executor om de bestanden te verwerken
      const { error: taskError } = await supabase
        .from("executor_tasks")
        .insert({
          action: "upload_files",
          project_id: projectId,
          status: "open",
          assigned_to: "executor"
        })

      if (taskError) {
        throw new Error("Executor taak mislukt: " + taskError.message)
      }

      // Redirect naar de pagina voor de nieuwe calculatie
      router.push(`/calculaties/nieuw?project_id=${projectId}`)
    } catch (e) {
      setErr(e.message) // Toon eventuele foutmeldingen
    } finally {
      setBusy(false) // Zet de busy-status weer uit
    }
  }

  return (
    <>
      <input
        type="file"
        multiple
        onChange={e => setFiles([...e.target.files])}
      />

      {err && <p>{err}</p>} {/* Toon eventuele foutmeldingen */}

      <button onClick={upload} disabled={busy}>
        Upload starten
      </button>
    </>
  )
}
