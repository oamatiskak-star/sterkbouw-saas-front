import { useState, useEffect, useRef } from "react"
import supabase from "@/lib/supabase"

const EXECUTOR_URL =
  "https://sterkbouw-saas-executor-production.up.railway.app"

/*
========================================================
STYLES
========================================================
*/
const styles = {
  wrap: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 24
  },

  grid4: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateRows: "420px 420px",
    gap: 24
  },

  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box"
  },

  cardTitle: {
    fontWeight: 600,
    marginBottom: 12
  },

  fieldGrid: {
    display: "grid",
    gap: 12
  },

  label: {
    fontSize: 13
  },

  input: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: 14
  },

  button: {
    width: "100%",
    padding: 14,
    borderRadius: 6,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 15,
    cursor: "pointer"
  },

  preview: {
    flex: 1,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    overflow: "hidden",
    background: "#000"
  },

  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
    background: "#fff"
  }
}

/*
========================================================
COMPONENT
========================================================
*/
export default function NieuweCalculatie() {
  const createProjectGuardRef = useRef(false)
  const uploadGuardRef = useRef(false)
  const intervalRunningRef = useRef(false)
  const intervalTickGuardRef = useRef(false)

  const [projectId, setProjectId] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)

  const [processStatus, setProcessStatus] = useState({
    fase: "Wachten",
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

  const [opslagen, setOpslagen] = useState({
    ak_pct: 0.08,
    abk_pct: 0.04,
    w_pct: 0.06,
    r_pct: 0.05
  })

  const [uurlonen, setUurlonen] = useState([
    { discipline: "timmerman", uurloon: 52 },
    { discipline: "installateur", uurloon: 60 },
    { discipline: "elektricien", uurloon: 60 },
    { discipline: "stucadoor", uurloon: 48 },
    { discipline: "schilder", uurloon: 45 }
  ])

  function updateForm(k, v) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function berekenIndicatie() {
    const avg =
      uurlonen.reduce((s, u) => s + u.uurloon, 0) / uurlonen.length

    const arbeid = 100 * avg
    const materiaal = 250
    const sub = arbeid + materiaal

    return Math.round(
      sub +
        sub * opslagen.ak_pct +
        sub * opslagen.abk_pct +
        sub * opslagen.w_pct +
        sub * opslagen.r_pct
    )
  }

  async function saveOpslagen(pid) {
    await supabase.from("calculatie_correcties").upsert({
      project_id: pid,
      ...opslagen
    })
  }

  async function saveUurlonen(pid) {
    for (const row of uurlonen) {
      await supabase.from("calculatie_uurloon_overrides").upsert({
        project_id: pid,
        discipline: row.discipline,
        uurloon: row.uurloon
      })
    }
  }

  async function handleCreateProject() {
    if (createProjectGuardRef.current) return
    createProjectGuardRef.current = true
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
      await saveOpslagen(data.project_id)
      await saveUurlonen(data.project_id)
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
      createProjectGuardRef.current = false
    }
  }

  async function handleUpload(e) {
    if (!projectId || uploadGuardRef.current) return
    const files = Array.from(e.target.files)
    if (!files.length) return

    uploadGuardRef.current = true
    setUploaded(true)
    setFilesStatus(files.map(f => f.name))

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
      uploadGuardRef.current = false
    }
  }

  useEffect(() => {
    if (!projectId || !uploaded) return
    if (intervalRunningRef.current) return
    intervalRunningRef.current = true

    const interval = setInterval(async () => {
      if (intervalTickGuardRef.current) return
      intervalTickGuardRef.current = true

      try {
        const { data: project } = await supabase
          .from("projects")
          .select("pdf_url")
          .eq("id", projectId)
          .maybeSingle()

        if (project?.pdf_url && !pdfUrl) {
          setPdfUrl(project.pdf_url)
        }

        const { data: task } = await supabase
          .from("executor_tasks")
          .select("action")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (task) {
          let fase = "Wachten"
          if (task.action === "project_scan") fase = "Bestanden scannen"
          if (task.action === "generate_stabu") fase = "STABU samenstellen"
          if (task.action === "start_rekenwolk") fase = "Calculatie uitvoeren"
          setProcessStatus({ fase, actie: task.action })
        }
      } finally {
        intervalTickGuardRef.current = false
      }
    }, 3000)

    return () => {
      clearInterval(interval)
      intervalRunningRef.current = false
    }
  }, [projectId, uploaded, pdfUrl])

  const indicatie = berekenIndicatie()

  return (
    <div style={styles.wrap}>
      <h1>Nieuwe calculatie</h1>

      <div style={styles.grid4}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Opslagen</div>
          <div style={styles.fieldGrid}>
            {Object.keys(opslagen).map(k => (
              <div key={k}>
                <label style={styles.label}>{k}</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  value={opslagen[k]}
                  onChange={e =>
                    setOpslagen(p => ({
                      ...p,
                      [k]: Number(e.target.value)
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Uurlonen</div>
          <div style={styles.fieldGrid}>
            {uurlonen.map((u, i) => (
              <div key={u.discipline}>
                <label style={styles.label}>{u.discipline}</label>
                <input
                  style={styles.input}
                  type="number"
                  value={u.uurloon}
                  onChange={e => {
                    const copy = [...uurlonen]
                    copy[i].uurloon = Number(e.target.value)
                    setUurlonen(copy)
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Project / NAW</div>
          <div style={{ ...styles.fieldGrid, overflowY: "auto" }}>
            <label style={styles.label}>project_type</label>
            <select
              style={styles.input}
              value={form.project_type}
              onChange={e =>
                updateForm("project_type", e.target.value)
              }
            >
              <option value="nieuwbouw">nieuwbouw</option>
              <option value="transformatie">transformatie</option>
              <option value="renovatie">renovatie</option>
              <option value="verduurzaming">verduurzaming</option>
            </select>

            {Object.keys(form)
              .filter(k => k !== "project_type")
              .map(k => (
                <div key={k}>
                  <label style={styles.label}>{k}</label>
                  <input
                    style={styles.input}
                    value={form[k]}
                    onChange={e =>
                      updateForm(k, e.target.value)
                    }
                  />
                </div>
              ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Preview</div>
          <div style={styles.preview}>
            {pdfUrl ? (
              <iframe
                title="preview"
                src={pdfUrl}
                style={styles.iframe}
              />
            ) : (
              <div style={{ color: "#9ca3af", padding: 16 }}>
                Nog geen calculatie
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <strong>Indicatie totaal:</strong> € {indicatie}
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

      <div style={{ marginTop: 12 }}>
        Fase: {processStatus.fase}
      </div>

      {error && (
        <pre style={{ color: "red", marginTop: 12 }}>
          {error}
        </pre>
      )}
    </div>
  )
}
