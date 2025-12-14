import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Uploads() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from("uploads")
      .select("*")
      .order("created_at", { ascending: false })

    setFiles(data || [])
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)

    const path = `${Date.now()}_${file.name}`

    await supabase.storage
      .from("project-files")
      .upload(path, file)

    await supabase.from("uploads").insert({
      filename: file.name,
      path
    })

    setUploading(false)
    load()
  }

  return (
    <div>
      <h1>Uploads</h1>

      <input type="file" onChange={handleUpload} />

      {uploading && <p>Uploaden...</p>}

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
