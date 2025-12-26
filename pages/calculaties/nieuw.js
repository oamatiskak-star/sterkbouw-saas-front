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
  wrap: { maxWidth: 1200, margin: "0 auto", padding: 24 },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: 24,
    alignItems: "flex-start"
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
  section: {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    marginTop: 16
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

/*
========================================================
COMPONENT
========================================================
*/
export default function NieuweCalculatie() {
  // ===== GUARDS =====
  const createProjectGuardRef = useRef(false)
  const uploadGuardRef = useRef(false)
  const intervalRunningRef = useRef(false)
  const intervalTickGuardRef = useRef(false)

  // ===== STATE =====
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

  // ===== PROJECT FORM =====
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

  // ===== OPSLAGEN (HANDMATIG AANPASBAAR) =====
  const [opslagen, setOpslagen] = useState({
    ak_pct: 0.08,
    abk_pct: 0.04,
    w_pct: 0.06,
    r_pct: 0.05
  })

  // ===== UURLONEN (HANDMATIG AANPASBAAR) =====
  const [uurlonen, setUurlonen] = useState([
    { discipline: "timmerman", uurloon: 52 },
    { discipline: "installateur", uurloon: 60 },
    { discipline: "elektricien", uurloon: 60 },
    { discipline: "stucadoor", uurloon: 48 },
    { discipline: "schilder", uurloon: 45 }
  ])

  /*
  ========================================================
  HELPERS
  ========================================================
  */
  function updateForm(k, v) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function updateOpslag(k, v) {
    setOpslagen(p => ({ ...p, [k]: Number(v) }))
  }

  function updateUurloon(i, v) {
    const copy = [...uurlonen]
    copy[i] = { ...copy[i], uurloon: Number(v) }
    setUurlonen(copy)
  }

  function berekenIndicatie() {
    const gemiddeldUurloon =
      uurlonen.reduce((s, u) => s + u.uurloon, 0) / uurlonen.length

    const arbeid = 100 * gemiddeldUurloon
    const materiaal = 250
    const subtotaal = arbeid + materiaal

    const ak = subtotaal * opslagen.ak_pct
    const abk = subtotaal * opslagen.abk_pct
    const w = subtotaal * opslagen.w_pct
    const r = subtotaal * opslagen.r_pct

    return Math.round(subtotaal + ak + abk + w + r)
  }

  /*
  ========================================================
  OPSLAAN NAAR DATABASE
  ========================================================
  */
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

  /*
  ========================================================
  ACTIES
  ========================================================
  */
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

  /*
  ========================================================
  POLLING (ALLEEN LEZEN)
  ========================================================
  */
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

  /*
  ========================================================
  RENDER
  ========================================================
  */
  return (
    <div style={styles.wrap}>
      <h1>Nieuwe calculatie</h1>

      <div style={styles.layout}>
        <div>
          {/* PROJECT */}
          <div style={styles.section}>
            <h3>Projectgegevens</h3>
            {Object.keys(form).map(k => (
              <div key={k}>
                <label style={styles.label}>{k}</label>
                <input
                  style={styles.input}
                  value={form[k]}
                  onChange={e => updateForm(k, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* OPSLAGEN */}
          <div style={styles.section}>
            <h3>Opslagen</h3>
            {Object.keys(opslagen).map(k => (
              <div key={k}>
                <label style={styles.label}>{k}</label>
                <input
                  type="number"
                  step="0.01"
                  style={styles.input}
                  value={opslagen[k]}
                  onChange={e => updateOpslag(k, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* UURLONEN */}
          <div style={styles.section}>
            <h3>Uurlonen</h3>
            {uurlonen.map((u, i) => (
              <div key={u.discipline}>
                <label style={styles.label}>{u.discipline}</label>
                <input
                  type="number"
                  style={styles.input}
                  value={u.uurloon}
                  onChange={e => updateUurloon(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* ACTIES */}
          <div style={{ marginTop: 16 }}>
            <strong>Indicatie totaal</strong>: € {indicatie}
          </div>

          <div style={{ marginTop: 12 }}>
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
              disabled={!projectId}
              onChange={handleUpload}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            Fase: {processStatus.fase}
          </div>

          {error && (
            <pre style={{ color: "red", marginTop: 12 }}>{error}</pre>
          )}
        </div>

        {/* PREVIEW */}
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
