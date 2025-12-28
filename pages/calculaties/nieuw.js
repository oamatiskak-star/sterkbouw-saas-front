import { useState, useEffect, useRef } from "react"
import supabase from "@/lib/supabase"

const styles = {
  wrap: { maxWidth: 1200, margin: "0 auto", padding: 24 },
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
  cardTitle: { fontWeight: 600, marginBottom: 12 },
  fieldGrid: { display: "grid", gap: 12 },
  label: { fontSize: 13 },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: 14
  },
  textarea: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: 14,
    minHeight: 60,
    resize: "vertical"
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
  iframe: { width: "100%", height: "100%", border: "none", background: "#fff" }
}

// PAD NAAR JE PDF TEMPLATE - PAS DIT AAN!
const TEMPLATE_PREVIEW_URL = "/templates/offerte_2jours_template.pdf"

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

  const [form, setForm] = useState({
    // NAW-gegevens volgens PDF-placeholders
    naam_opdrachtgever: "",           // (Naam opdrachtgever)
    t_a_v_naam: "",                   // (t.a.v. naam)
    straatnaam_en_huisnummer: "",     // (straatnaam en huisnummer)
    postcode: "",                     // (postcode)
    plaats: "",                       // (plaats)
    
    // Projectgegevens
    projectnaam: "",                  // (projectnaam) in aanhef
    plaatsnaam: "",                   // (plaatsnaam) in aanhef
    
    // Overige gegevens
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
      setProcessStatus({ fase: "Project aangemaakt", actie: "created" })
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
      createProjectGuardRef.current = false
    }
  }

  async function handleUpload(e) {
    if (!projectId || uploadGuardRef.current) return
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    uploadGuardRef.current = true
    setError(null)

    try {
      const res = await fetch("/api/executor/upload-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          files: files.map(f => ({
            filename: f.name,
            mime_type: f.type
          }))
        })
      })

      if (!res.ok) throw new Error(await res.text())
      setUploaded(true)
      setProcessStatus({ fase: "Bestanden geüpload - verwerking bezig", actie: "upload" })
    } catch (e) {
      setError(e.message)
    } finally {
      uploadGuardRef.current = false
    }
  }

  useEffect(() => {
    if (!projectId || intervalRunningRef.current) return
    intervalRunningRef.current = true

    const interval = setInterval(async () => {
      if (intervalTickGuardRef.current) return
      intervalTickGuardRef.current = true

      try {
        const { data: project } = await supabase
          .from("projects")
          .select("pdf_url, status")
          .eq("id", projectId)
          .maybeSingle()

        if (project?.pdf_url) {
          setPdfUrl(project.pdf_url)
          if (project.status === "voltooid") {
            setProcessStatus({ fase: "Calculatie gereed", actie: "completed" })
            clearInterval(interval)
            intervalRunningRef.current = false
          }
        }
      } finally {
        intervalTickGuardRef.current = false
      }
    }, 3000)

    return () => {
      clearInterval(interval)
      intervalRunningRef.current = false
    }
  }, [projectId])

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
                    const c = [...uurlonen]
                    c[i].uurloon = Number(e.target.value)
                    setUurlonen(c)
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
              onChange={e => updateForm("project_type", e.target.value)}
            >
              <option value="nieuwbouw">nieuwbouw</option>
              <option value="transformatie">transformatie</option>
              <option value="renovatie">renovatie</option>
              <option value="verduurzaming">verduurzaming</option>
            </select>

            {/* NAW-velden volgens PDF-placeholders */}
            <div>
              <label style={styles.label}>naam_opdrachtgever</label>
              <input
                style={styles.input}
                value={form.naam_opdrachtgever}
                onChange={e => updateForm("naam_opdrachtgever", e.target.value)}
                placeholder="(Naam opdrachtgever)"
              />
            </div>
            
            <div>
              <label style={styles.label}>t.a.v. naam</label>
              <input
                style={styles.input}
                value={form.t_a_v_naam}
                onChange={e => updateForm("t_a_v_naam", e.target.value)}
                placeholder="(t.a.v. naam)"
              />
            </div>
            
            <div>
              <label style={styles.label}>straatnaam en huisnummer</label>
              <input
                style={styles.input}
                value={form.straatnaam_en_huisnummer}
                onChange={e => updateForm("straatnaam_en_huisnummer", e.target.value)}
                placeholder="(straatnaam en huisnummer)"
              />
            </div>
            
            <div>
              <label style={styles.label}>postcode</label>
              <input
                style={styles.input}
                value={form.postcode}
                onChange={e => updateForm("postcode", e.target.value)}
                placeholder="(postcode)"
              />
            </div>
            
            <div>
              <label style={styles.label}>plaats</label>
              <input
                style={styles.input}
                value={form.plaats}
                onChange={e => updateForm("plaats", e.target.value)}
                placeholder="(plaats)"
              />
            </div>
            
            <div>
              <label style={styles.label}>projectnaam</label>
              <input
                style={styles.input}
                value={form.projectnaam}
                onChange={e => updateForm("projectnaam", e.target.value)}
                placeholder="(projectnaam)"
              />
            </div>
            
            <div>
              <label style={styles.label}>plaatsnaam (project)</label>
              <input
                style={styles.input}
                value={form.plaatsnaam}
                onChange={e => updateForm("plaatsnaam", e.target.value)}
                placeholder="(plaatsnaam)"
              />
            </div>
            
            {/* Overige velden */}
            <div>
              <label style={styles.label}>land</label>
              <input
                style={styles.input}
                value={form.land}
                onChange={e => updateForm("land", e.target.value)}
              />
            </div>
            
            <div>
              <label style={styles.label}>telefoon</label>
              <input
                style={styles.input}
                value={form.telefoon}
                onChange={e => updateForm("telefoon", e.target.value)}
              />
            </div>
            
            <div>
              <label style={styles.label}>opmerking</label>
              <textarea
                style={styles.textarea}
                value={form.opmerking}
                onChange={e => updateForm("opmerking", e.target.value)}
                rows="3"
              />
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Preview</div>
          <div style={styles.preview}>
            <iframe
              key={pdfUrl ? "generated" : "template"}
              title="preview"
              src={pdfUrl ? `${pdfUrl}?t=${Date.now()}` : TEMPLATE_PREVIEW_URL}
              style={styles.iframe}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <strong>Indicatie totaal:</strong> € {indicatie}
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          style={{
            ...styles.button,
            opacity: (creating || !!projectId) ? 0.6 : 1,
            cursor: (creating || !!projectId) ? "not-allowed" : "pointer"
          }}
          onClick={handleCreateProject}
          disabled={creating || !!projectId}
        >
          {creating ? "Aanmaken..." : "Project aanmaken"}
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <input 
          type="file" 
          multiple 
          onChange={handleUpload} 
          disabled={!projectId}
          style={{ padding: 8 }}
        />
        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
          Upload bestanden voor verwerking
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 8, background: "#f3f4f6", borderRadius: 6 }}>
        <strong>Status:</strong> {processStatus.fase}
        {projectId && !pdfUrl && (
          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
            (Polling voor resultaat...)
          </div>
        )}
      </div>

      {error && (
        <pre style={{ 
          color: "red", 
          marginTop: 12, 
          padding: 12, 
          background: "#fee", 
          borderRadius: 6,
          fontSize: 13,
          overflow: "auto"
        }}>
          {error}
        </pre>
      )}
    </div>
  )
}
