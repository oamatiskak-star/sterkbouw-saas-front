import { useState, useEffect, useRef } from "react"
import supabase from "@/lib/supabase"

const styles = {
  wrap: { maxWidth: 1400, margin: "0 auto", padding: 24 },
  grid4: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateRows: "auto auto",
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
    marginBottom: 12,
    fontSize: 16,
    color: "#1f2937"
  },
  fieldGrid: { display: "grid", gap: 12 },
  label: { 
    fontSize: 13, 
    fontWeight: 500,
    color: "#374151"
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: 14,
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: 14,
    minHeight: 60,
    resize: "vertical",
    boxSizing: "border-box"
  },
  button: {
    width: "100%",
    padding: 14,
    borderRadius: 6,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 15,
    cursor: "pointer",
    fontWeight: 500
  },
  secondaryButton: {
    width: "100%",
    padding: 14,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    fontSize: 15,
    cursor: "pointer",
    fontWeight: 500,
    marginTop: 8
  },
  preview: {
    flex: 1,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    overflow: "hidden",
    background: "#000",
    minHeight: 400
  },
  iframe: { 
    width: "100%", 
    height: "100%", 
    border: "none", 
    background: "#fff",
    minHeight: 400
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13
  },
  tableHeader: {
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    padding: "8px 12px",
    textAlign: "left",
    fontWeight: 600
  },
  tableCell: {
    borderBottom: "1px solid #e5e7eb",
    padding: "8px 12px",
    verticalAlign: "top"
  },
  totalRow: {
    background: "#f0f9ff",
    fontWeight: 600
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    margin: "24px 0 12px 0",
    color: "#1f2937",
    paddingBottom: 8,
    borderBottom: "2px solid #e5e7eb"
  },
  analyseResult: {
    padding: 12,
    background: "#f0f9ff",
    borderRadius: 6,
    marginTop: 8,
    fontSize: 13
  },
  fileUpload: {
    padding: 12,
    border: "2px dashed #d1d5db",
    borderRadius: 6,
    background: "#f9fafb",
    textAlign: "center",
    cursor: "pointer",
    marginTop: 8
  }
}

const TEMPLATE_PREVIEW_URL = "/templates/offerte_2jours_template.pdf"

const INITIELE_POSTEN = [
  {
    id: 1,
    code: "12.10",
    omschrijving: "Sloop en stripwerk",
    eenheid: "m²",
    aantal: 120,
    eenheidsprijs: 45,
    arbeidsuren: 80,
    materiaal: 1200,
    opmerking: "Incl. afvoer puin"
  },
  {
    id: 2,
    code: "21.50",
    omschrijving: "Constructieve aanpassingen",
    eenheid: "m²",
    aantal: 120,
    eenheidsprijs: 85,
    arbeidsuren: 120,
    materiaal: 3500,
    opmerking: "Staalconstructies"
  },
  {
    id: 3,
    code: "23.30",
    omschrijving: "Gevel en isolatie",
    eenheid: "m²",
    aantal: 96,
    eenheidsprijs: 95,
    arbeidsuren: 90,
    materiaal: 4200,
    opmerking: "PIR isolatie + gevelbekleding"
  },
  {
    id: 4,
    code: "41.10",
    omschrijving: "Installaties E en W",
    eenheid: "stuk",
    aantal: 1,
    eenheidsprijs: 8500,
    arbeidsuren: 60,
    materiaal: 5200,
    opmerking: "Elektra en waterleidingen"
  },
  {
    id: 5,
    code: "51.90",
    omschrijving: "Afbouw en herindeling",
    eenheid: "stuk",
    aantal: 1,
    eenheidsprijs: 12500,
    arbeidsuren: 180,
    materiaal: 7800,
    opmerking: "Wanden, plafonds, vloeren"
  }
]

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

  const [analyseResultaat, setAnalyseResultaat] = useState(null)

  const [form, setForm] = useState({
    naam_opdrachtgever: "",
    t_a_v_naam: "",
    straatnaam_en_huisnummer: "",
    postcode: "",
    plaats: "",
    projectnaam: "",
    plaatsnaam: "",
    land: "Nederland",
    telefoon: "",
    project_type: "transformatie",
    opmerking: "",
    oppervlakte_m2: 0,
    bouwjaar: null,
    aantal_kamers: 0
  })

  const [opslagen, setOpslagen] = useState({
    ak_pct: 0.08,
    abk_pct: 0.04,
    w_pct: 0.06,
    r_pct: 0.05,
    btw_pct: 0.21
  })

  const [uurlonen, setUurlonen] = useState([
    { discipline: "timmerman", uurloon: 52 },
    { discipline: "installateur", uurloon: 60 },
    { discipline: "elektricien", uurloon: 60 },
    { discipline: "stucadoor", uurloon: 48 },
    { discipline: "schilder", uurloon: 45 }
  ])

  const [posten, setPosten] = useState(INITIELE_POSTEN)
  const [nieuwePost, setNieuwePost] = useState({
    code: "",
    omschrijving: "",
    eenheid: "m²",
    aantal: 1,
    eenheidsprijs: 0,
    arbeidsuren: 0,
    materiaal: 0,
    opmerking: ""
  })

  // Update posten wanneer oppervlakte verandert
  useEffect(() => {
    if (form.oppervlakte_m2 > 0) {
      const bijgewerktePosten = posten.map(post => {
        if (post.eenheid === "m²") {
          return {
            ...post,
            aantal: form.oppervlakte_m2
          }
        }
        return post
      })
      setPosten(bijgewerktePosten)
    }
  }, [form.oppervlakte_m2])

  // Update form wanneer analyse resultaat binnenkomt
  useEffect(() => {
    if (analyseResultaat) {
      setForm(prev => ({
        ...prev,
        oppervlakte_m2: analyseResultaat.oppervlakte_m2 || prev.oppervlakte_m2,
        bouwjaar: analyseResultaat.bouwjaar || prev.bouwjaar,
        aantal_kamers: analyseResultaat.aantal_kamers || prev.aantal_kamers,
        project_type: analyseResultaat.project_type !== 'onbekend' 
          ? analyseResultaat.project_type 
          : prev.project_type
      }))
    }
  }, [analyseResultaat])

  function updateForm(k, v) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function updateNieuwePost(k, v) {
    setNieuwePost(p => ({ ...p, [k]: v }))
  }

  function voegPostToe() {
    if (!nieuwePost.code || !nieuwePost.omschrijving) {
      alert("Code en omschrijving zijn verplicht")
      return
    }

    const nieuweId = Math.max(...posten.map(p => p.id)) + 1
    setPosten([
      ...posten,
      {
        id: nieuweId,
        code: nieuwePost.code,
        omschrijving: nieuwePost.omschrijving,
        eenheid: nieuwePost.eenheid,
        aantal: Number(nieuwePost.aantal),
        eenheidsprijs: Number(nieuwePost.eenheidsprijs),
        arbeidsuren: Number(nieuwePost.arbeidsuren),
        materiaal: Number(nieuwePost.materiaal),
        opmerking: nieuwePost.opmerking
      }
    ])

    setNieuwePost({
      code: "",
      omschrijving: "",
      eenheid: "m²",
      aantal: 1,
      eenheidsprijs: 0,
      arbeidsuren: 0,
      materiaal: 0,
      opmerking: ""
    })
  }

  function verwijderPost(id) {
    setPosten(posten.filter(p => p.id !== id))
  }

  function berekenPostTotaal(post) {
    const arbeidskosten = post.arbeidsuren * getGemiddeldUurloon()
    const materiaal = post.materiaal || (post.eenheidsprijs * post.aantal)
    return arbeidskosten + materiaal
  }

  function berekenSubtotaal() {
    return posten.reduce((totaal, post) => {
      return totaal + berekenPostTotaal(post)
    }, 0)
  }

  function berekenOpslagen() {
    const subtotaal = berekenSubtotaal()
    const opslagBedragen = {
      ak: subtotaal * opslagen.ak_pct,
      abk: subtotaal * opslagen.abk_pct,
      w: subtotaal * opslagen.w_pct,
      r: subtotaal * opslagen.r_pct
    }
    
    const totaalOpslagen = Object.values(opslagBedragen).reduce((a, b) => a + b, 0)
    
    return {
      bedragen: opslagBedragen,
      totaal: totaalOpslagen,
      subtotaal: subtotaal,
      totaalExclusiefBtw: subtotaal + totaalOpslagen
    }
  }

  function berekenTotaal() {
    const opslagData = berekenOpslagen()
    const btwBedrag = opslagData.totaalExclusiefBtw * opslagen.btw_pct
    return {
      exclusiefBtw: opslagData.totaalExclusiefBtw,
      btwBedrag: btwBedrag,
      inclusiefBtw: opslagData.totaalExclusiefBtw + btwBedrag
    }
  }

  function getGemiddeldUurloon() {
    const total = uurlonen.reduce((som, u) => som + u.uurloon, 0)
    return total / uurlonen.length
  }

  async function handleCreateProject() {
    if (createProjectGuardRef.current) return
    createProjectGuardRef.current = true
    setCreating(true)
    setError(null)

    try {
      const calculatieData = {
        projectInfo: form,
        opslagen: opslagen,
        uurlonen: uurlonen,
        posten: posten,
        berekeningen: {
          subtotaal: berekenSubtotaal(),
          opslagen: berekenOpslagen(),
          totaal: berekenTotaal()
        },
        analyse: analyseResultaat
      }

      const res = await fetch("/api/projecten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calculatieData)
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
    setProcessStatus({ fase: "Bestanden uploaden...", actie: "uploading" })

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      formData.append('project_id', projectId)

      const res = await fetch("/api/executor/upload-task", {
        method: "POST",
        body: formData
      })

      if (!res.ok) throw new Error(await res.text())
      
      const data = await res.json()
      setUploaded(true)
      
      if (data.analyse_resultaat) {
        setAnalyseResultaat(data.analyse_resultaat)
        setProcessStatus({ 
          fase: "Bestanden geüpload en geanalyseerd", 
          actie: "upload_and_analyze" 
        })
      } else {
        setProcessStatus({ 
          fase: "Bestanden geüpload - analyse wordt uitgevoerd", 
          actie: "upload" 
        })
        
        setTimeout(() => {
          checkAnalyseResultaat()
        }, 3000)
      }
    } catch (e) {
      setError(e.message)
      setProcessStatus({ fase: "Upload mislukt", actie: "error" })
    } finally {
      uploadGuardRef.current = false
    }
  }

  async function checkAnalyseResultaat() {
    try {
      const res = await fetch(`/api/projecten/${projectId}/analyse`)
      if (res.ok) {
        const data = await res.json()
        if (data.analyse_resultaat) {
          setAnalyseResultaat(data.analyse_resultaat)
          setProcessStatus({ 
            fase: "Analyse voltooid", 
            actie: "analyze_complete" 
          })
        }
      }
    } catch (e) {
      console.error("Check analyse error:", e)
    }
  }

  async function genereerCalculatie() {
    setProcessStatus({ fase: "Calculatie genereren...", actie: "generating" })
    
    try {
      const calculatieData = {
        projectInfo: { ...form, projectId },
        opslagen: opslagen,
        uurlonen: uurlonen,
        posten: posten,
        berekeningen: {
          subtotaal: berekenSubtotaal(),
          opslagen: berekenOpslagen(),
          totaal: berekenTotaal()
        }
      }

      const res = await fetch("/api/generate-calculatie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calculatieData)
      })

      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      
      if (data.pdf_url) {
        setPdfUrl(data.pdf_url)
        setProcessStatus({ fase: "Calculatie gegenereerd", actie: "generated" })
      }
    } catch (e) {
      setError(e.message)
      setProcessStatus({ fase: "Fout bij genereren", actie: "error" })
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

  const totaal = berekenTotaal()
  const opslagData = berekenOpslagen()

  return (
    <div style={styles.wrap}>
      <h1>Nieuwe calculatie</h1>

      <div style={styles.sectionTitle}>Projectinformatie</div>
      
      <div style={styles.grid4}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Klantgegevens</div>
          <div style={{ ...styles.fieldGrid, overflowY: "auto", maxHeight: 400 }}>
            <div>
              <label style={styles.label}>Naam opdrachtgever *</label>
              <input
                style={styles.input}
                value={form.naam_opdrachtgever}
                onChange={e => updateForm("naam_opdrachtgever", e.target.value)}
                placeholder="(Naam opdrachtgever)"
                required
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
              <label style={styles.label}>straatnaam_en_huisnummer *</label>
              <input
                style={styles.input}
                value={form.straatnaam_en_huisnummer}
                onChange={e => updateForm("straatnaam_en_huisnummer", e.target.value)}
                placeholder="(straatnaam en huisnummer)"
                required
              />
            </div>
            
            <div>
              <label style={styles.label}>Postcode *</label>
              <input
                style={styles.input}
                value={form.postcode}
                onChange={e => updateForm("postcode", e.target.value)}
                placeholder="(postcode)"
                required
              />
            </div>
            
            <div>
              <label style={styles.label}>Plaats *</label>
              <input
                style={styles.input}
                value={form.plaats}
                onChange={e => updateForm("plaats", e.target.value)}
                placeholder="(plaats)"
                required
              />
            </div>
            
            <div>
              <label style={styles.label}>Telefoon</label>
              <input
                style={styles.input}
                value={form.telefoon}
                onChange={e => updateForm("telefoon", e.target.value)}
                placeholder="Telefoonnummer"
              />
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Projectdetails</div>
          <div style={{ ...styles.fieldGrid, overflowY: "auto", maxHeight: 400 }}>
            <div>
              <label style={styles.label}>Projectnaam *</label>
              <input
                style={styles.input}
                value={form.projectnaam}
                onChange={e => updateForm("projectnaam", e.target.value)}
                placeholder="(projectnaam)"
                required
              />
            </div>
            
            <div>
              <label style={styles.label}>Plaatsnaam project *</label>
              <input
                style={styles.input}
                value={form.plaatsnaam}
                onChange={e => updateForm("plaatsnaam", e.target.value)}
                placeholder="(plaatsnaam)"
                required
              />
            </div>
            
            <div>
              <label style={styles.label}>Projecttype</label>
              <select
                style={styles.input}
                value={form.project_type}
                onChange={e => updateForm("project_type", e.target.value)}
              >
                <option value="nieuwbouw">Nieuwbouw</option>
                <option value="transformatie">Transformatie</option>
                <option value="renovatie">Renovatie</option>
                <option value="verduurzaming">Verduurzaming</option>
                <option value="sloop">Sloop</option>
                <option value="onderhoud">Onderhoud</option>
              </select>
            </div>
            
            {analyseResultaat && (
              <div style={styles.analyseResult}>
                <strong>Automatische detectie:</strong>
                <div>Oppervlakte: {analyseResultaat.oppervlakte_m2 || 0} m²</div>
                <div>Bouwjaar: {analyseResultaat.bouwjaar || 'onbekend'}</div>
                <div>Type: {analyseResultaat.project_type || 'onbekend'}</div>
              </div>
            )}
            
            <div>
              <label style={styles.label}>Oppervlakte (m²)</label>
              <input
                style={styles.input}
                type="number"
                value={form.oppervlakte_m2}
                onChange={e => updateForm("oppervlakte_m2", parseInt(e.target.value) || 0)}
                min="1"
                placeholder="Automatisch gedetecteerd of handmatig"
              />
            </div>
            
            <div>
              <label style={styles.label}>Bouwjaar</label>
              <input
                style={styles.input}
                type="number"
                value={form.bouwjaar || ''}
                onChange={e => updateForm("bouwjaar", parseInt(e.target.value) || null)}
                min="1900"
                max="2025"
                placeholder="Automatisch gedetecteerd of handmatig"
              />
            </div>
            
            <div>
              <label style={styles.label}>Opmerkingen</label>
              <textarea
                style={styles.textarea}
                value={form.opmerking}
                onChange={e => updateForm("opmerking", e.target.value)}
                rows="3"
                placeholder="Extra opmerkingen..."
              />
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Calculatie-instellingen</div>
          <div style={styles.fieldGrid}>
            <div>
              <label style={styles.label}>Uurlonen per discipline</label>
              {uurlonen.map((u, i) => (
                <div key={u.discipline} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ minWidth: 100, fontSize: 13 }}>{u.discipline}</span>
                    <input
                      style={{ ...styles.input, width: 100 }}
                      type="number"
                      value={u.uurloon}
                      onChange={e => {
                        const c = [...uurlonen]
                        c[i].uurloon = Number(e.target.value)
                        setUurlonen(c)
                      }}
                    />
                    <span style={{ fontSize: 13 }}>€/uur</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>
                Gemiddeld uurloon: €{getGemiddeldUurloon().toFixed(2)}
              </div>
            </div>
            
            <div style={{ marginTop: 12 }}>
              <label style={styles.label}>Opslagen (%)</label>
              {Object.keys(opslagen).map(k => (
                <div key={k} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ minWidth: 120, fontSize: 13 }}>{k}</span>
                    <input
                      style={{ ...styles.input, width: 100 }}
                      type="number"
                      step="0.01"
                      value={opslagen[k] * 100}
                      onChange={e =>
                        setOpslagen(p => ({
                          ...p,
                          [k]: Number(e.target.value) / 100
                        }))
                      }
                    />
                    <span style={{ fontSize: 13 }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Preview offerte</div>
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

      {/* Calculatie posten sectie */}
      <div style={styles.sectionTitle}>Calculatie posten</div>
      
      <div style={{ ...styles.card, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={styles.cardTitle}>Werkzaamheden</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Totaal {posten.length} posten
          </div>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Code</th>
                <th style={styles.tableHeader}>Omschrijving</th>
                <th style={styles.tableHeader}>Eenheid</th>
                <th style={styles.tableHeader}>Aantal</th>
                <th style={styles.tableHeader}>Arbeid (uren)</th>
                <th style={styles.tableHeader}>Materiaal</th>
                <th style={styles.tableHeader}>Totaal</th>
                <th style={styles.tableHeader}>Acties</th>
              </tr>
            </thead>
            <tbody>
              {posten.map(post => {
                const postTotaal = berekenPostTotaal(post)
                return (
                  <tr key={post.id}>
                    <td style={styles.tableCell}>{post.code}</td>
                    <td style={styles.tableCell}>
                      <div><strong>{post.omschrijving}</strong></div>
                      {post.opmerking && (
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                          {post.opmerking}
                        </div>
                      )}
                    </td>
                    <td style={styles.tableCell}>{post.eenheid}</td>
                    <td style={styles.tableCell}>{post.aantal}</td>
                    <td style={styles.tableCell}>{post.arbeidsuren}</td>
                    <td style={styles.tableCell}>€{post.materiaal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</td>
                    <td style={styles.tableCell}>
                      <strong>€{postTotaal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</strong>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => verwijderPost(post.id)}
                        style={{
                          padding: "4px 8px",
                          fontSize: 12,
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer"
                        }}
                      >
                        Verwijder
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Nieuwe post toevoegen */}
        <div style={{ marginTop: 24, padding: 16, border: "1px dashed #d1d5db", borderRadius: 6 }}>
          <div style={{ ...styles.cardTitle, marginBottom: 16 }}>Nieuwe post toevoegen</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <div>
              <label style={styles.label}>Code *</label>
              <input
                style={styles.input}
                value={nieuwePost.code}
                onChange={e => updateNieuwePost("code", e.target.value)}
                placeholder="Bijv. 12.10"
              />
            </div>
            <div>
              <label style={styles.label}>Omschrijving *</label>
              <input
                style={styles.input}
                value={nieuwePost.omschrijving}
                onChange={e => updateNieuwePost("omschrijving", e.target.value)}
                placeholder="Bijv. Sloopwerkzaamheden"
              />
            </div>
            <div>
              <label style={styles.label}>Eenheid</label>
              <select
                style={styles.input}
                value={nieuwePost.eenheid}
                onChange={e => updateNieuwePost("eenheid", e.target.value)}
              >
                <option value="m²">m²</option>
                <option value="stuk">stuk</option>
                <option value="m">m</option>
                <option value="uur">uur</option>
                <option value="dag">dag</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Aantal</label>
              <input
                style={styles.input}
                type="number"
                value={nieuwePost.aantal}
                onChange={e => updateNieuwePost("aantal", e.target.value)}
                min="1"
              />
            </div>
            <div>
              <label style={styles.label}>Arbeidsuren</label>
              <input
                style={styles.input}
                type="number"
                value={nieuwePost.arbeidsuren}
                onChange={e => updateNieuwePost("arbeidsuren", e.target.value)}
                min="0"
              />
            </div>
            <div>
              <label style={styles.label}>Materiaal (€)</label>
              <input
                style={styles.input}
                type="number"
                value={nieuwePost.materiaal}
                onChange={e => updateNieuwePost("materiaal", e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={styles.label}>Opmerking</label>
              <input
                style={styles.input}
                value={nieuwePost.opmerking}
                onChange={e => updateNieuwePost("opmerking", e.target.value)}
                placeholder="Optionele opmerking"
              />
            </div>
          </div>
          <button
            onClick={voegPostToe}
            style={{
              ...styles.secondaryButton,
              marginTop: 16,
              background: "#10b981",
              color: "white",
              border: "none"
            }}
          >
            + Post toevoegen
          </button>
        </div>
      </div>

      {/* Totale berekening sectie */}
      <div style={styles.sectionTitle}>Totale berekening</div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Kostenoverzicht</div>
          <div style={styles.fieldGrid}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
              <span>Subtotaal posten:</span>
              <span><strong>€{berekenSubtotaal().toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</strong></span>
            </div>
            
            {Object.entries(opslagData.bedragen).map(([key, value]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                <span>{key.toUpperCase()} ({opslagen[`${key}_pct`] * 100}%):</span>
                <span>€{value.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
              <span>Totaal opslagen:</span>
              <span><strong>€{opslagData.totaal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</strong></span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "2px solid #1f2937" }}>
              <span><strong>Totaal exclusief BTW:</strong></span>
              <span><strong>€{opslagData.totaalExclusiefBtw.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</strong></span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
              <span>BTW ({opslagen.btw_pct * 100}%):</span>
              <span>€{totaal.btwBedrag.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", background: "#f0f9ff", borderRadius: 6, padding: 12 }}>
              <span style={{ fontWeight: 600, fontSize: 16 }}>TOTAAL INCLUSIEF BTW:</span>
              <span style={{ fontWeight: 600, fontSize: 18, color: "#1e40af" }}>
                €{totaal.inclusiefBtw.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Projectacties</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              style={styles.button}
              onClick={handleCreateProject}
              disabled={creating || !!projectId}
            >
              {creating ? "Project aanmaken..." : "Project aanmaken"}
            </button>
            
            <button
              style={styles.secondaryButton}
              onClick={genereerCalculatie}
              disabled={!projectId}
            >
              Calculatie genereren
            </button>
            
            <div style={{ marginTop: 8 }}>
              <label style={styles.label}>Bestanden uploaden voor analyse</label>
              <div 
                style={styles.fileUpload}
                onClick={() => document.getElementById('file-upload').click()}
              >
                Klik om CAD/PDF bestanden te uploaden
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  Plattegronden, tekeningen, PDF's, CAD bestanden
                </div>
              </div>
              <input 
                id="file-upload"
                type="file" 
                multiple 
                onChange={handleUpload} 
                disabled={!projectId}
                style={{ display: 'none' }}
                accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.cad"
              />
            </div>
            
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Status:</div>
              <div style={{ 
                padding: 12, 
                background: "#f3f4f6", 
                borderRadius: 6,
                fontSize: 14
              }}>
                {processStatus.fase}
                {projectId && !pdfUrl && processStatus.actie !== "generated" && (
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    Wachten op verwerking...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ 
          color: "#dc2626", 
          marginTop: 12, 
          padding: 16, 
          background: "#fef2f2", 
          borderRadius: 6,
          fontSize: 14,
          border: "1px solid #fecaca"
        }}>
          <strong>Fout:</strong> {error}
        </div>
      )}
    </div>
  )
}
