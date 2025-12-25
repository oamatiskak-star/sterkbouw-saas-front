import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function ProjectDocumenten() {
  const router = useRouter()
  const { id } = router.query

  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.storage
        .from("projecten")
        .list(id, {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" }
        })

      if (error) {
        if (!cancelled) {
          setError(error.message)
          setLoading(false)
        }
        return
      }

      if (cancelled) return

      setFiles(data || [])
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [id])

  async function uploadFile(e) {
    const file = e.target.files[0]
    if (!file || !id) return

    setUploading(true)
    setError(null)

    const filePath = `${id}/${Date.now()}_${file.name}`

    const { error } = await supabase.storage
      .from("projecten")
      .upload(filePath, file)

    setUploading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.replace(router.asPath)
  }

  async function downloadFile(path) {
    const { data, error } = await supabase.storage
      .from("projecten")
      .download(path)

    if (error) {
      setError(error.message)
      return
    }

    const url = window.URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = url
    a.download = path.split("/").pop()
    a.click()
    window.URL.revokeObjectURL(url)
  }

  async function deleteFile(path) {
    if (!confirm("Document verwijderen?")) return

    const { error } = await supabase.storage
      .from("projecten")
      .remove([path])

    if (error) {
      setError(error.message)
      return
    }

    router.replace(router.asPath)
  }

  if (loading) return <div>Loading…</div>

  return (
    <>
      <h1>Projectdocumenten</h1>

      {error && (
        <div style={{ color: "red", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <input
          type="file"
          onChange={uploadFile}
          disabled={uploading}
        />
      </div>

      {files.length === 0 && (
        <p>Geen documenten aanwezig.</p>
      )}

      {files.length > 0 && (
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Bestand</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {files.map(f => (
              <tr key={f.name}>
                <td>{f.name}</td>
                <td>
                  <button onClick={() => downloadFile(`${id}/${f.name}`)}>
                    Download
                  </button>

                  <button
                    onClick={() => deleteFile(`${id}/${f.name}`)}
                    style={{ marginLeft: 8 }}
                  >
                    Verwijder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
