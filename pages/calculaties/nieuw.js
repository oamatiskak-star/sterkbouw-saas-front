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
  wrap: { maxWidth: 1200, margin: "0 auto", padding: 24 },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: 24,
    alignItems: "stretch"
  },
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
  },
  previewWrapper: {
    width: 420,
    height: 595,
    border: "1px solid #d1d5db",
    borderRadius: 6,
    overflow: "hidden",
    background: "#111"
  },
  previewFrame: {
    width: "100%",
    height: "100%",
    border: "none",
    background: "#fff"
  }
}

export default function NieuweCalculatie() {
  const router = useRouter()

  const [projectId, setProjectId] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const [pdfUrl, setPdfUrl] = useState(null)

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

      if (!pdfUrl) {
        const { data: signed } = await supabase.storage
          .from("sterkcalc")
          .createSignedUrl(
            `${projectId}/calculatie_2jours.pdf`,
            3600
          )

        if (signed?.signedUrl) {
          setPdfUrl(signed.signedUrl)
        }
      }
    }, 3000)

    return () => clearInterval(t)
  }, [projectId, uploaded, pdfUrl])

  return (
    <div style={styles.wrap}>
      <h1>Nieuwe calculatie</h1>

      <div style={styles.layout}>
        {/* LINKS */}
        <div>
          <div style={styles.grid}>
            {Object.keys(form).map(k => {
              if (k === "project_type") {
                return (
                  <div key={k}>
                    <label style={styles.label}>Projecttype</label>
                    <select
                      value={form.project_type}
                      onChange={e =>
                        updateField("project_type", e.target.value)
                      }
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
            <button
              style={styles.button}
              onClick={handleCreateProject}
              disabled={creating || !!projectId}
            >
              Project aanmaken
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <input
              type="file"
              multiple
              onChange={handleUpload}
              disabled={!projectId}
              style={{ width: "100%" }}
            />
          </div>

          {pdfUrl && (
            <div style={{ marginTop: 12 }}>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: 12,
                  background: "#2563eb",
                  color: "#fff",
                  borderRadius: 6,
                  textDecoration: "none"
                }}
              >
                Download 2jours calculatie
              </a>
            </div>
          )}

          <div style={{ marginTop: 12, fontSize: 13 }}>
            Status:{" "}
            {!uploaded ? "wachten op upload" : analysisStatus || "analyseren"}
          </div>

          {error && (
            <pre style={{ marginTop: 12, color: "red", fontSize: 12 }}>
              {error}
            </pre>
          )}
        </div>

        {/* RECHTS – VASTE A4 PREVIEW */}
        <div style={styles.previewWrapper}>
          {pdfUrl ? (
            <iframe
              title="2jours preview"
              src={pdfUrl}
              style={styles.previewFrame}
            />
          ) : (
            <div
              style={{
                color: "#9ca3af",
                fontSize: 13,
                padding: 16
              }}
            >
              Nog geen calculatie
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
