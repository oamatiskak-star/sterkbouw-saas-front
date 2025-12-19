import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ProjectDocumenten() {
  const router = useRouter()
  const { id } = router.query

  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)
      const { data } = await supabase
        .storage
        .from("projecten")
        .list(id, { limit: 100, sortBy: { column: "created_at", order: "desc" } })

      setFiles(data || [])
      setLoading(false)
    }

    load()
  }, [id])

  async function uploadFile(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)

    const filePath = `${id}/${Date.now()}_${file.name}`

    const { error } = await supabase
      .storage
      .from("projecten")
      .upload(filePath, file)

    setUploading(false)

    if (!error) {
      router.reload()
    }
  }

  async function downloadFile(path) {
    const { data } = await supabase
      .storage
      .from("projecten")
      .download(path)

    const url = window.URL.createObjectURL(data)
    const a = document.createElement("a")
    a.href = url
    a.download = path.split("/").pop()
    a.click()
    window.URL.revokeObjectURL(url)
  }

  async function deleteFile(path) {
    if (!confirm("Document verwijderen?")) return

    await supabase
      .storage
      .from("projecten")
      .remove([path])

    router.reload()
  }

  if (loading) return null

  return (
    <>
      <h1>Projectdocumenten</h1>

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
