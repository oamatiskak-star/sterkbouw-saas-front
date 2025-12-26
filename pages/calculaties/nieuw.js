import { useState, useEffect, useRef } from "react"
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
  // ===== GUARDS =====
  const createProjectGuardRef = useRef(false)
  const uploadGuardRef = useRef(false)
  const intervalRunningRef = useRef(false)
  const intervalTickGuardRef = useRef(false)
  const signedUrlGuardRef = useRef(false)

  // ===== STATE =====
  const [projectId, setProjectId] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState(null)
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

  function berekenIndicatie() {
    const gemiddeldUurloon =
      uurlonen.reduce((s, u) => s + u.uurloon, 0) / uurlonen.length

    const basisArbeid =
      100 * gemiddeldUurloon * correcties.normuren_factor

    const basisMateriaal =
      250 * correcties.materiaal_index

    const subtotaal = basisArbeid + basisMateriaal
    const ak = subtotaal * correcties.ak_pct
    const abk = subtotaal * correcties.abk_pct
    const w = subtotaal * correcties.w_pct
    const r = subtotaal * correcties.r_pct

    return subtotaal + ak + abk + w + r
  }

  async function saveCorrecties(pid) {
    if (!pid) return
    await supabase.from("calculatie_correcties").upsert({
      project_id: pid,
      projecttype: form.project_type,
      ...correcties
    })
  }

  async function saveUurlonen(pid) {
    if (!pid) return
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
      await saveCorrecties(data.project_id)
      await saveUurlonen(data.project_id)
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
      createProjectGuardRef.current = false
    }
  }

  async function handleUpload(e) {
    if (uploadGuardRef.current || !projectId) return

    const files = Array.from(e.target.files)
    if (!files.length) return

    uploadGuardRef.current = true
    setUploaded(true)
    setFilesStatus(files.map(f => f.name))
    setError(null)

    const fd = new FormData()
    fd.append("project_id", projectId)
    files.forEach(f => fd.append("files", f))

    try {
      const res = await fetch(`${EXECUTOR_URL}/upload-files`, {
        method: "POST",
        body: fd
      })
      if (!res.ok) throw new Error(await res.text())
    } catch (err) {
      setError(err.message)
    } finally {
      uploadGuardRef.current = false
    }
  }

  // ===== POLLING =====
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
          .select("analysis_status")
          .eq("id", projectId)
          .maybeSingle()

        if (project) setAnalysisStatus(project.analysis_status)

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

        if (!signedUrlGuardRef.current && !pdfUrl) {
          signedUrlGuardRef.current = true

          const pdfPath = `${projectId}/calculatie_2jours.pdf`
          const { data: signed, error } = await supabase.storage
            .from("sterkcalc")
            .createSignedUrl(pdfPath, 3600)

          if (signed?.signedUrl) {
            setPdfUrl(String(signed.signedUrl))
          } else if (error) {
            signedUrlGuardRef.current = false
          }
        }
      } catch (_) {
      } finally {
        intervalTickGuardRef.current = false
      }
    }, 3000)

    return () => {
      clearInterval(interval)
      intervalRunningRef.current = false
    }
  }, [projectId, uploaded, pdfUrl])

  const totaal = berekenIndicatie()

  return (
    <div style={styles.wrap}>
      <h1>Nieuwe calculatie</h1>

      <div style={styles.layout}>
        <div>
          <div style={styles.grid}>
            {Object.keys(form).map(k =>
              k === "project_type" ? (
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
                    <option value="renovatie">Renovatie</option>
                    <option value="verduurzaming">Verduurzaming</option>
                  </select>
                </div>
              ) : (
                <div key={k}>
                  <label style={styles.label}>{k}</label>
                  <input
                    value={form[k]}
                    onChange={e => updateField(k, e.target.value)}
                    style={styles.input}
                  />
                </div>
              )
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <strong>Indicatie totaal</strong>: € {totaal.toFixed(0)}
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

          {filesStatus.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>Geüploade bestanden</strong>
              {filesStatus.map(f => (
                <div key={f}>{f}</div>
              ))}
            </div>
          )}

          {pdfUrl && (
            <div style={{ marginTop: 12 }}>
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                Download 2jours calculatie
              </a>
            </div>
          )}

          {error && (
            <pre style={{ color: "red", marginTop: 12 }}>
              {error}
            </pre>
          )}
        </div>

        <div style={styles.previewWrapper}>
          {pdfUrl ? (
            <iframe
              title="preview"
              src={pdfUrl}
              style={styles.previewFrame}
            />
          ) : (
            <div style={{ color: "#9ca3af", padding: 16 }}>
              Nog geen calculatie
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
