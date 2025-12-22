import { useState } from "react"
import { useRouter } from "next/router"

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState([])
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  // Haal project_id uit de query params van de router
  const { project_id } = router.query

  // Zorg ervoor dat project_id is opgehaald
  if (!project_id) {
    setError("Geen project ID gevonden!")
    return
  }

  async function handleUpload() {
    setBusy(true)
    setError(null)

    // Controleer of er bestanden geselecteerd zijn
    if (files.length === 0) {
      setError("Geen bestanden geselecteerd!")
      setBusy(false)
      return
    }

    try {
      // Zorg ervoor dat je een GET-aanroep maakt naar een API die de getekende URL ophaalt
      const response = await fetch(`/api/signed-upload?project_id=${project_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error("Kan signed URL niet ophalen")
      }

      const { signedUrl } = await response.json()

      for (const file of files) {
        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type
          },
          body: file
        })

        if (!uploadRes.ok) {
          throw new Error("Upload naar storage mislukt")
        }
      }

      // Na uploaden, koppelen aan de database via Supabase
      const { data, error } = await supabase
        .from("project_files")
        .insert({
          project_id: project_id,
          file_name: files[0].name, // We nemen de eerste file als voorbeeld
          status: "uploaded",
          created_at: new Date().toISOString()
        })

      if (error) {
        throw new Error("Opslaan bestand in database mislukt")
      }

      // Navigeren naar nieuwe pagina na succesvolle upload
      router.push(`/calculaties/${project_id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h1>Bestanden uploaden</h1>
      <input
        type="file"
        multiple
        onChange={e => setFiles([...e.target.files])}
      />
      {error && <div>{error}</div>}
      <button onClick={handleUpload} disabled={busy}>
        {busy ? "Bezig..." : "Uploaden"}
      </button>
    </div>
  )
}
