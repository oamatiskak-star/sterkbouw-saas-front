import { useState } from "react"

export default function WorkflowUpload({ workflowKey, projectId, onUploaded }) {
  const [loading, setLoading] = useState(false)

  if (!workflowKey || !projectId) return null

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("workflow_key", workflowKey)
    formData.append("project_id", projectId)

    await fetch("/api/upload", {
      method: "POST",
      body: formData
    })

    setLoading(false)
    if (onUploaded) onUploaded()
  }

  return (
    <label className="btn btn-outline-primary">
      {loading ? "Uploaden…" : "Upload bestand"}
      <input
        type="file"
        hidden
        onChange={handleUpload}
      />
    </label>
  )
}
