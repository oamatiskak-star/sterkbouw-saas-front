import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const EXECUTOR_URL =
  "https://sterkbouw-saas-executor-production.up.railway.app"

export default function NieuweCalculatie() {
  const router = useRouter()
  const { isReady } = router

  const [projectId, setProjectId] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState(null)
  const [analysisLog, setAnalysisLog] = useState([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    naam: "",
    naam_opdrachtgever: "",
    adres: "",
    postcode: "",
    plaatsnaam: "",
    land: "Nederland",
    telefoon: "",
    project_type: "nieuwbouw", // FIX: altijd lowercase
    opmerking: ""
  })

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleCreateProject() {
    if (creating) return
    setCreating(true)
    setError(null)

    try {
      const res = await fetch("/api/projecten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setProjectId(data.project_id)
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  function handlePickProject() {
    const id = prompt("Plak project_id")
    if (!id) return
    setProjectId(id)
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length || !projectId) return

    setUploaded(true)
    setError(null)

    const fd = new FormData()
    fd.append("project_id", projectId)
    files.forEach(file => fd.append("files", file))

    try {
      const res = await fetch(`${EXECUTOR_URL}/upload-files`, {
        method: "POST",
        body: fd
      })

      if (!res.ok) {
        setError(await res.text())
      }
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    if (!projectId || !uploaded) return

    const interval = setInterval(async () => {
      const { data: project } = await supabase
        .from("projects")
        .select("analysis_status")
        .eq("id", projectId)
        .single()

      if (project) {
        setAnalysisStatus(project.analysis_status)
      }

      const { data: calc } = await supabase
        .from("calculaties")
        .select("id, workflow_status")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      // FIX: alleen redirect als calculatie echt klaar is
      if (calc?.id && calc.workflow_status === "done") {
        clearInterval(interval)
        router.push(`/uitslag/${calc.id}`)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [projectId, uploaded])

  if (!isReady) return null

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Nieuwe calculatie</h1>

      <h3>NAW gegevens</h3>
      {Object.keys(form).map(k => (
        <input
          key={k}
          placeholder={k}
          value={form[k]}
          onChange={e => updateField(k, e.target.value)}
          style={{ display: "block", marginBottom: 8, width: "100%" }}
        />
      ))}

      <hr />

      <button onClick={handleCreateProject} disabled={!!projectId || creating}>
        Project aanmaken
      </button>

      <button onClick={handlePickProject} disabled={!!projectId}>
        Project ophalen
      </button>

      <hr />

      <input
        type="file"
        multiple
        onChange={handleUpload}
        disabled={!projectId}
      />

      <div style={{ marginTop: 16 }}>
        Status:{" "}
        {!uploaded
          ? "wachten op upload"
          : analysisStatus || "analyseren"}
      </div>

      {error && <pre>{error}</pre>}
    </div>
  )
}
