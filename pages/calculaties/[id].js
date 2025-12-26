import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export default function CalculatieDetail() {
  const router = useRouter()
  const { id } = router.query

  const [calculatie, setCalculatie] = useState(null)
  const [regels, setRegels] = useState([])
  const [opslagen, setOpslagen] = useState(null)
  const [workflowLog, setWorkflowLog] = useState([])
  const [loading, setLoading] = useState(true)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  // =========================
  // DATA LADEN VIA BACKEND
  // =========================
  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setUploadError(null)

      try {
        const res = await fetch(`/api/calculaties/${id}`, {
          method: "GET"
        })

        if (!res.ok) {
          const t = await res.text()
          throw new Error(t || `HTTP_${res.status}`)
        }

        const data = await res.json()

        if (cancelled) return

        setCalculatie(data.calculatie || null)
        setRegels(Array.isArray(data.regels) ? data.regels : [])
        setOpslagen(data.opslagen || null)
        setWorkflowLog(Array.isArray(data.workflowLog) ? data.workflowLog : [])
      } catch (e) {
        if (!cancelled) {
          setCalculatie(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  // =========================
  // UPLOAD = ALLEEN TASK
  // =========================
  async function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file || !calculatie) return

    setUploading(true)
    setUploadError(null)

    try {
      const res = await fetch(`/api/executor/upload-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: calculatie.project_id,
          calculatie_id: id,
          filename: file.name,
          mime_type: file.type
        })
      })

      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || `HTTP_${res.status}`)
      }
    } catch (err) {
      setUploadError(err.message || "UPLOAD_TASK_FAILED")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!calculatie) {
    return <div>Calculatie niet gevonden</div>
  }

  return (
    <>
      <h1>{calculatie.naam_opdrachtgever || "Calculatie"}</h1>

      <p>
        Status: <strong>{calculatie.workflow_status}</strong>
      </p>
      <p>Kostprijs: € {Number(calculatie.kostprijs || 0).toFixed(2)}</p>
      <p>Verkoopprijs: € {Number(calculatie.verkoopprijs || 0).toFixed(2)}</p>
      <p>Marge: € {Number(calculatie.marge || 0).toFixed(2)}</p>

      <hr />

      <h3>Bestanden uploaden voor analyse</h3>

      <input
        type="file"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {uploading && <p>Bestand doorgestuurd naar executor...</p>}
      {uploadError && (
        <p style={{ color: "red" }}>{uploadError}</p>
      )}
    </>
  )
}
