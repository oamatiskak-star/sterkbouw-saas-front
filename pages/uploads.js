import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Uploads() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setError(null)

    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
      return
    }

    setFiles(data || [])
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const path = `${Date.now()}_${file.name}`

    try {
      const { error: storageError } = await supabase.storage
        .from("project-files")
        .upload(path, file)

      if (storageError) {
        throw new Error("STORAGE_UPLOAD_FAILED: " + storageError.message)
      }

      const { error: dbError } = await supabase
        .from("uploads")
        .insert({
          filename: file.name,
          path
        })

      if (dbError) {
        throw new Error("DB_INSERT_FAILED: " + dbError.message)
      }

      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h1>Uploads</h1>

      <input type="file" onChange={handleUpload} />

      {uploading && <p>Uploaden...</p>}

      {error && (
        <pre style={{ color: "red", marginTop: 12 }}>
          {error}
        </pre>
      )}

      <table>
        <thead>
          <tr>
            <th>Bestand</th>
            <th>Datum</th>
          </tr>
        </thead>
        <tbody>
          {files.map(f => (
            <tr key={f.id}>
              <td>{f.filename}</td>
              <td>{new Date(f.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
