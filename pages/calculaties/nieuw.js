import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const EXECUTOR_URL =
  "https://sterkbouw-saas-executor-production.up.railway.app"

const styles = {
  wrap: { maxWidth: 640, margin: "0 auto", padding: 24 },
  grid: { display: "grid", gap: 12 },
  label: { fontSize: 13 },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: 14
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 6,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer"
  }
}

export default function NieuweCalculatie() {
  const router = useRouter()
  const [projectId, setProjectId] = useState(null)
  const [uploaded, setUploaded] = useState(false)
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
    project_type: "nieuwbouw",
    opmerking: ""
  })

  function updateField(k, v) {
    setForm(p => ({ ...p, [k]: v }))
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

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length || !projectId) return
    setUploaded(true)
    setError(null)

    const fd = new FormData()
    fd.append("project_id", projectId)
    files.forEach(f => fd.append("files", f))

    try {
      const res = await fetch(`${EXECUTOR_URL}/upload-files`, {
        method: "POST",
        body: fd
      })
      if (!res.ok) setError(await res.text())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    if (!projectId || !uploaded) return
    const t = setInterval(async () => {
      const { data: project } = await supabase
        .from("projects")
        .select("analysis_status")
        .eq("id", projectId)
        .single()
      if (project) setAnalysisStatus(project.analysis_status)

      const { data: calc } = await supabase
        .from("calculaties")
        .select("id, workflow_status")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (calc?.id && calc.workflow_status === "done") {
        clearInterval(t)
        router.push(`/uitslag/${calc.id}`)
      }
    }, 3000)
    return () => clearInterval(t)
  }, [projectId, uploaded])

  return (
    <div style={styles.wrap}>
      <h1>Nieuwe calculatie</h1>

      <div style={styles.grid}>
        {Object.keys(form).map(k => {
          if (k === "project_type") {
            return (
              <div key={k}>
                <label style={styles.label}>Projecttype</label>
                <select
                  value={form.project_type}
                  onChange={e => updateField("project_type", e.target.value)}
                  style={styles.input}
                >
                  <option value="nieuwbouw">Nieuwbouw</option>
                  <option value="transformatie">Transformatie</option>
                </select>
              </div>
            )
          }
          return (
            <div key={k}>
              <label style={styles.label}>{k}</label>
              <input
                value={form[k]}
                onChange={e => updateField(k, e.target.value)}
                style={styles.input}
              />
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        <button style={styles.button} onClick={handleCreateProject} disabled={creating || !!projectId}>
          Project aanmaken
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <input type="file" multiple onChange={handleUpload} disabled={!projectId} style={{ width: "100%" }} />
      </div>

      <div style={{ marginTop: 12, fontSize: 13 }}>
        Status: {!uploaded ? "wachten op upload" : analysisStatus || "analyseren"}
      </div>

      {error && <pre style={{ marginTop: 12, color: "red", fontSize: 12 }}>{error}</pre>}
    </div>
  )
}
