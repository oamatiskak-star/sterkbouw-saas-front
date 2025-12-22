import { useRouter } from "next/router"
import { useState } from "react"

export default function CalculatieUpload() {
  const router = useRouter()
  const { isReady, query } = router
  const project_id = isReady && query.project_id ? String(query.project_id) : null

  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  if (!isReady) return <div>Laden...</div>
  if (!project_id) return <div>Project ontbreekt</div>

  async function handleUpload() {
    if (files.length === 0) return
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("project_id", project_id)

      for (const file of files) {
        formData.append("files", file)
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt)
      }

      router.back()
    } catch (e) {
      setError(e.message)
      setUploading(false)
    }
  }

  return (
    <>
      <h1>Bestanden uploaden</h1>

      <div style={{ marginBottom: 16, fontWeight: 600 }}>
        Project ID: {project_id}
      </div>

      <input
        type="file"
        multiple
        onChange={e => setFiles(Array.from(e.target.files))}
      />

      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            background: "#16a34a",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {uploading ? "Uploaden..." : "Uploaden en analyseren"}
        </button>
      </div>

      {error && <div style={{ marginTop: 12, color: "red" }}>{error}</div>}
    </>
  )
}
