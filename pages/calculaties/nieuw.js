import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function NieuweCalculatie() {
  const router = useRouter()
  const { isReady } = router

  const [projectId, setProjectId] = useState(null)
  const [filesUploaded, setFilesUploaded] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState(null)
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
    project_type: "Nieuwbouw",
    opmerking: ""
  })

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  /* ===============================
     KNOP 2 – PROJECT AANMAKEN
     =============================== */
  async function handleCreateProject() {
    if (creating) return
    setCreating(true)
    setError(null)

    try {
      const EXECUTOR_URL =
  "https://sterkbouw-saas-executor-production.up.railway.app"

const res = await fetch(`${EXECUTOR_URL}/upload-files`, {
  method: "POST",
  body: fd
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

  /* ===============================
     KNOP 3 – PROJECT OPHALEN
     =============================== */
  async function handlePickProject() {
    const id = prompt("Plak project_id")
    if (!id) return
    setProjectId(id)
  }

  /* ===============================
     KNOP 4 – UPLOAD BESTANDEN
     (start automatisch analyse)
     =============================== */
  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length || !projectId) return

    const fd = new FormData()
    fd.append("project_id", projectId)

    files.forEach(file => {
      fd.append("files", file)
    })

    const res = await fetch("/api/executor/upload-file", {
      method: "POST",
      body: fd
    })

    if (!res.ok) {
      setError(await res.text())
      return
    }

    setError(null)
  }

  /* ===============================
     STATUS POLL (alleen lezen)
     =============================== */
  useEffect(() => {
    if (!projectId) return

    const i = setInterval(async () => {
      const { data } = await supabase
        .from("projects")
        .select("files_uploaded, analysis_status")
        .eq("id", projectId)
        .single()

      if (data) {
        setFilesUploaded(!!data.files_uploaded)
        setAnalysisStatus(data.analysis_status)
      }
    }, 3000)

    return () => clearInterval(i)
  }, [projectId])

  /* ===============================
     KNOP 6 – CALCULEREN → PDF
     =============================== */
  async function handleCalculeren() {
    if (analysisStatus !== "completed") return

    const { data, error } = await supabase
      .from("calculaties")
      .insert({
        project_id: projectId,
        workflow_status: "initializing"
      })
      .select("id")
      .single()

    if (!error) {
      router.push(`/uitslag/${data.id}`)
    }
  }

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
        Analyse status: {analysisStatus || "wachten"}
      </div>

      <button
        onClick={handleCalculeren}
        disabled={analysisStatus !== "completed"}
        style={{ background: analysisStatus === "completed" ? "#16a34a" : "#ccc" }}
      >
        Calculeren
      </button>

      {error && <pre>{error}</pre>}
    </div>
  )
}
