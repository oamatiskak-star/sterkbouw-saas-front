import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import supabase from "@/lib/supabase"

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

  // ===== GUARDS =====
  const createProjectGuard = useRef(false)
  const uploadGuard = useRef(false)
  const statusCheckCount = useRef(0)
  const signedUrlTried = useRef(false)

  const [projectId, setProjectId] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)

  const [processStatus, setProcessStatus] = useState({
    fase: "wachten",
    actie: null
  })
  const [filesStatus, setFilesStatus] = useState([])

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

  const basisCorrecties = {
    nieuwbouw: {
      ak_pct: 0.08,
      abk_pct: 0.04,
      w_pct: 0.06,
      r_pct: 0.05,
      normuren_factor: 1.1,
      materiaal_index: 1.0
    },
    transformatie: {
      ak_pct: 0.08,
      abk_pct: 0.04,
      w_pct: 0.06,
      r_pct: 0.05,
      normuren_factor: 1.0,
      materiaal_index: 1.0
    },
    renovatie: {
      ak_pct: 0.07,
      abk_pct: 0.03,
      w_pct: 0.05,
      r_pct: 0.04,
      normuren_factor: 1.0,
      materiaal_index: 1.0
    },
    verduurzaming: {
      ak_pct: 0.06,
      abk_pct: 0.02,
      w_pct: 0.04,
      r_pct: 0.03,
      normuren_factor: 1.0,
      materiaal_index: 1.0
    }
  }

  const [correcties, setCorrecties] = useState({
    ...basisCorrecties.nieuwbouw
  })

  const [uurlonen, setUurlonen] = useState([
    { discipline: "timmerman", uurloon: 52 },
    { discipline: "installateur", uurloon: 60 },
    { discipline: "elektricien", uurloon: 60 },
    { discipline: "stucadoor", uurloon: 48 },
    { discipline: "schilder", uurloon: 45 }
  ])

  function updateField(k, v) {
    setForm(p => {
      const updated = { ...p, [k]: v }
      if (k === "project_type" && basisCorrecties[v]) {
        setCorrecties({ ...basisCorrecties[v] })
      }
      return updated
    })
  }

  async function handleCreateProject() {
    if (createProjectGuard.current) return
    createProjectGuard.current = true

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
      createProjectGuard.current = false
    }
  }

  async function handleUpload(e) {
    if (uploadGuard.current || !projectId) return
    const files = Array.from(e.target.files)
    if (!files.length) return

    uploadGuard.current = true
    setUploaded(true)

    const fd = new FormData()
    fd.append("project_id", projectId)
    files.forEach(f => fd.append("files", f))

    try {
      const res = await fetch(`${EXECUTOR_URL}/upload-files`, {
        method: "POST",
        body: fd
      })
      if (!res.ok) throw new Error(await res.text())
    } catch (e) {
      setError(e.message)
    } finally {
      uploadGuard.current = false
    }
  }

  useEffect(() => {
    if (!projectId || !uploaded) return
    if (statusCheckCount.current >= 2) return

    async function checkOnce() {
      statusCheckCount.current++

      const { data: project } = await supabase
        .from("projects")
        .select("analysis_status")
        .eq("id", projectId)
        .maybeSingle()

      if (project?.analysis_status) {
        setAnalysisStatus(project.analysis_status)
      }

      if (
        project?.analysis_status === "completed" &&
        !signedUrlTried.current
      ) {
        signedUrlTried.current = true

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

      if (project?.analysis_status !== "completed") {
        setTimeout(checkOnce, 1500)
      }
    }

    checkOnce()
  }, [projectId, uploaded])

  return (
    <div style={styles.wrap}>
      <h1>Nieuwe calculatie</h1>

      <div style={styles.layout}>
        <div>
          <div style={styles.grid}>
            {Object.keys(form).map(k => (
              <div key={k}>
                <label style={styles.label}>{k}</label>
                <input
                  value={form[k]}
                  onChange={e => updateField(k, e.target.value)}
                  style={styles.input}
                />
              </div>
            ))}
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

          {error && (
            <pre style={{ marginTop: 12, color: "red", fontSize: 12 }}>
              {error}
            </pre>
          )}
        </div>

        <div style={styles.previewWrapper}>
          {pdfUrl ? (
            <iframe
              title="2jours preview"
              src={pdfUrl}
              style={styles.previewFrame}
            />
          ) : (
            <div style={{ color: "#9ca3af", fontSize: 13, padding: 16 }}>
              Nog geen calculatie
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
