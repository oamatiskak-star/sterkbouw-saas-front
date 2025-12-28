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
  },
  statusIndicator: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    marginRight: 8
  }
}

// API BASE URL - PAS DIT AAN NAAR JOUW BACKEND SERVICE
const API_BASE = "https://sterkbouw-saas-executor-production.up.railway.app"

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
  // Refs
  const createProjectGuardRef = useRef(false)
  const uploadGuardRef = useRef(false)
  
  // State
  const [projectId, setProjectId] = useState(null)
  const [projectCreated, setProjectCreated] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  
  const [processStatus, setProcessStatus] = useState({
    fase: "Wachten op projectinformatie",
    stap: 1,
    totaleStappen: 4
  })

  const [analyseResultaat, setAnalyseResultaat] = useState(null)

  // Form state
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

  // Calculatie state
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

  // ======================
  // EFFECTS
  // ======================

  // Update posten wanneer oppervlakte verandert (na analyse)
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
      
      // Ga naar stap 3 als analyse klaar is
      setProcessStatus({
        fase: "Analyse voltooid, calculatie kan worden gegenereerd",
        stap: 3,
        totaleStappen: 4
      })
    }
  }, [analyseResultaat])

  // Poll voor PDF resultaat
  useEffect(() => {
    if (!projectId || !generating) return
    
    const interval = setInterval(async () => {
      try {
        const { data: project } = await supabase
          .from("projects")
          .select("pdf_url, status")
          .eq("id", projectId)
          .maybeSingle()

        if (project?.pdf_url) {
          setPdfUrl(project.pdf_url)
          setGenerating(false)
          setProcessStatus({
            fase: "Calculatie gereed!",
            stap: 4,
            totaleStappen: 4
          })
          clearInterval(interval)
        }
      } catch (e) {
        console.error("Poll error:", e)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [projectId, generating])

  // ======================
  // FUNCTIES
  // ======================

  function updateForm(k, v) {
    setForm(p => ({ ...p, [k]: v }))
  }

  function updateNieuwePost(k, v) {
    setNieuwePost(p => ({ ...p, [k]: v }))
  }

  // STAP 1: Project aanmaken (ZONDER calculatie)
  async function handleCreateProject() {
    if (createProjectGuardRef.current) return
    createProjectGuardRef.current = true
    setCreating(true)
    setError(null)

    try {
      // Alleen basis projectinformatie, nog GEEN calculatie
      const projectData = {
        projectInfo: {
          naam_opdrachtgever: form.naam_opdrachtgever,
          t_a_v_naam: form.t_a_v_naam,
          straatnaam_en_huisnummer: form.straatnaam_en_huisnummer,
          postcode: form.postcode,
          plaats: form.plaats,
          projectnaam: form.projectnaam,
          plaatsnaam: form.plaatsnaam,
          telefoon: form.telefoon,
          project_type: form.project_type,
          opmerking: form.opmerking,
          status: 'wacht_op_upload'
        }
        // GEEN posten, GEEN berekeningen hier
      }

      const res = await fetch(`${API_BASE}/api/projecten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData)
      })

      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      
      setProjectId(data.project_id)
      setProjectCreated(true)
      setProcessStatus({
        fase: "Project aangemaakt. Upload nu bestanden voor analyse",
        stap: 2,
        totaleStappen: 4
      })
      
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
      createProjectGuardRef.current = false
    }
  }

  // STAP 2: Upload bestanden voor analyse
  async function handleUpload(e) {
    if (!projectId || uploadGuardRef.current) return
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    uploadGuardRef.current = true
    setUploading(true)
    setError(null)
    setProcessStatus({ fase: "Bestanden uploaden...", stap: 2, totaleStappen: 4 })

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      formData.append('project_id', projectId)

      const res = await fetch(`${API_BASE}/api/executor/upload-task`, {
        method: "POST",
        body: formData
      })

      if (!res.ok) throw new Error(await res.text())
      
      const data = await res.json()
      setUploaded(true)
      
      if (data.analyse_resultaat) {
        setAnalyseResultaat(data.analyse_resultaat)
      } else {
        // Poll voor analyse resultaat
        setTimeout(() => {
          checkAnalyseResultaat()
        }, 3000)
      }
      
    } catch (e) {
      setError(e.message)
      setProcessStatus({ fase: "Upload mislukt", stap: 2, totaleStappen: 4 })
    } finally {
      setUploading(false)
      uploadGuardRef.current = false
    }
  }

  async function checkAnalyseResultaat() {
    try {
      const res = await fetch(`${API_BASE}/api/projecten/${projectId}/analyse`)
      if (res.ok) {
        const data = await res.json()
        if (data.analyse_resultaat) {
          setAnalyseResultaat(data.analyse_resultaat)
        }
      }
    } catch (e) {
      console.error("Check analyse error:", e)
    }
  }

  // STAP 3: Genereren calculatie (NA analyse)
  async function generateCalculatie() {
    if (!projectId || !analyseResultaat) {
      setError("Upload en analyse eerst bestanden")
      return
    }

    setGenerating(true)
    setError(null)
    setProcessStatus({ 
      fase: "Calculatie genereren op basis van analyse...", 
      stap: 3, 
      totaleStappen: 4 
    })

    try {
      // Posten updaten met analyse data
      const bijgewerktePosten = posten.map(post => ({
        ...post,
        aantal: post.eenheid === "m²" ? form.oppervlakte_m2 : post.aantal
      }))

      // Bereken totalen
      const subtotaal = bijgewerktePosten.reduce((totaal, post) => {
        const arbeidskosten = post.arbeidsuren * getGemiddeldUurloon()
        const materiaal = post.materiaal || (post.eenheidsprijs * post.aantal)
        return totaal + arbeidskosten + materiaal
      }, 0)

      const opslagData = berekenOpslagen(subtotaal)
      const totaalData = berekenTotaal(opslagData)

      // Stuur calculatie naar backend
      const calculatieData = {
        projectId: projectId,
        projectInfo: form,
        opslagen: opslagen,
        uurlonen: uurlonen,
        posten: bijgewerktePosten,
        analyse: analyseResultaat,
        berekeningen: {
          subtotaal: subtotaal,
          opslagen: opslagData,
          totaal: totaalData
        }
      }

      const res = await fetch(`${API_BASE}/api/generate-calculatie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calculatieData)
      })

      if (!res.ok) throw new Error(await res.text())
      
      const data = await res.json()
      
      if (data.pdf_url) {
        setPdfUrl(data.pdf_url)
        setProcessStatus({ 
          fase: "Calculatie gegenereerd!", 
          stap: 4, 
          totaleStappen: 4 
        })
      } else {
        // Start polling voor PDF
        setProcessStatus({ 
          fase: "Calculatie wordt gegenereerd...", 
          stap: 3, 
          totaleStappen: 4 
        })
      }
      
    } catch (e) {
      setError(e.message)
      setGenerating(false)
      setProcessStatus({ fase: "Fout bij genereren", stap: 3, totaleStappen: 4 })
    }
  }

  // Hulp functies
  function berekenOpslagen(subtotaal) {
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

  function berekenTotaal(opslagData) {
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

  const opslagData = berekenOpslagen(berekenSubtotaal())
  const totaal = berekenTotaal(opslagData)

  // ======================
  // RENDER
  // ======================

  return (
    <div style={styles.wrap}>
      <h1>Nieuwe calculatie</h1>

      {/* Status indicator */}
      <div style={{ 
        marginBottom: 24, 
        padding: 16, 
        background: "#f9fafb", 
        borderRadius: 8,
        border: "1px solid #e5e7eb"
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          Stap {processStatus.stap} van {processStatus.totaleStappen}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            ...styles.statusIndicator,
            background: processStatus.stap >= 1 ? "#10b981" : "#d1d5db"
          }}></div>
          <span style={{ marginRight: 16 }}>1. Project</span>
          
          <div style={{
            ...styles.statusIndicator,
            background: processStatus.stap >= 2 ? "#10b981" : "#d1d5db"
          }}></div>
          <span style={{ marginRight: 16 }}>2. Upload</span>
          
          <div style={{
            ...styles.statusIndicator,
            background: processStatus.stap >= 3 ? "#10b981" : "#d1d5db"
          }}></div>
          <span style={{ marginRight: 16 }}>3. Analyse</span>
          
          <div style={{
            ...styles.statusIndicator,
            background: processStatus.stap >= 4 ? "#10b981" : "#d1d5db"
          }}></div>
          <span>4. Calculatie</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: "#6b7280" }}>
          {processStatus.fase}
        </div>
      </div>

      <div style={styles.sectionTitle}>Projectinformatie</div>
      
      <div style={styles.grid4}>
        {/* Klantgegevens */}
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
                disabled={projectCreated}
              />
            </div>
            
            <div>
              <label style={styles.label}>t.a.v. naam</label>
              <input
                style={styles.input}
                value={form.t_a_v_naam}
                onChange={e => updateForm("t_a_v_naam", e.target.value)}
                placeholder="(t.a.v. naam)"
                disabled={projectCreated}
              />
            </div>
            
            <div>
              <label style={styles.label}>Adres *</label>
              <input
                style={styles.input}
                value={form.straatnaam_en_huisnummer}
                onChange={e => updateForm("straatnaam_en_huisnummer", e.target.value)}
                placeholder="(straatnaam en huisnummer)"
                required
                disabled={projectCreated}
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
                disabled={projectCreated}
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
                disabled={projectCreated}
              />
            </div>
            
            <div>
              <label style={styles.label}>Telefoon</label>
              <input
                style={styles.input}
                value={form.telefoon}
                onChange={e => updateForm("telefoon", e.target.value)}
                placeholder="Telefoonnummer"
                disabled={projectCreated}
              />
            </div>
          </div>
        </div>

        {/* Projectdetails */}
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
                disabled={projectCreated}
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
                disabled={projectCreated}
              />
            </div>
            
            <div>
              <label style={styles.label}>Projecttype</label>
              <select
                style={styles.input}
                value={form.project_type}
                onChange={e => updateForm("project_type", e.target.value)}
                disabled={projectCreated}
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
                placeholder={analyseResultaat ? "Gedetecteerd" : "Handmatig of via upload"}
                readOnly={!!analyseResultaat}
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
                placeholder={analyseResultaat ? "Gedetecteerd" : "Handmatig of via upload"}
                readOnly={!!analyseResultaat}
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
                disabled={projectCreated}
              />
            </div>
          </div>
        </div>

        {/* Calculatie-instellingen */}
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
                      disabled={generating}
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
                      disabled={generating}
                    />
                    <span style={{ fontSize: 13 }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview en acties */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Preview & Acties</div>
          <div style={styles.preview}>
            <iframe
              key={pdfUrl ? "generated" : "template"}
              title="preview"
              src={pdfUrl ? `${pdfUrl}?t=${Date.now()}` : TEMPLATE_PREVIEW_URL}
              style={styles.iframe}
            />
          </div>
          
          <div style={{ marginTop: 16 }}>
            {/* STAP 1: Project aanmaken */}
            {!projectCreated ? (
              <button
                style={styles.button}
                onClick={handleCreateProject}
                disabled={creating}
              >
                {creating ? "Project aanmaken..." : "1. Project aanmaken"}
              </button>
            ) : (
              <div style={{ 
                padding: 12, 
                background: "#f0f9ff", 
                borderRadius: 6,
                marginBottom: 12
              }}>
                ✅ Project aangemaakt (ID: {projectId?.slice(0, 8)}...)
              </div>
            )}

            {/* STAP 2: Upload (alleen als project aangemaakt) */}
            {projectCreated && !uploaded && (
              <div style={{ marginTop: 12 }}>
                <label style={styles.label}>2. Upload bestanden voor analyse</label>
                <div 
                  style={styles.fileUpload}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  {uploading ? "Uploaden..." : "Klik om CAD/PDF bestanden te uploaden"}
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    Plattegronden, tekeningen, PDF's, CAD bestanden
                  </div>
                </div>
                <input 
                  id="file-upload"
                  type="file" 
                  multiple 
                  onChange={handleUpload} 
                  disabled={uploading}
                  style={{ display: 'none' }}
                  accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.cad"
                />
              </div>
            )}

            {/* STAP 3: Calculatie genereren (alleen na upload/analyse) */}
            {uploaded && analyseResultaat && !pdfUrl && (
              <button
                style={{ ...styles.button, background: "#10b981", marginTop: 12 }}
                onClick={generateCalculatie}
                disabled={generating}
              >
                {generating ? "Calculatie genereren..." : "3. Calculatie genereren"}
              </button>
            )}

            {/* STAP 4: Download (als PDF klaar is) */}
            {pdfUrl && (
              <div style={{ marginTop: 12 }}>
                <a 
                  href={pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    ...styles.button, 
                    background: "#8b5cf6",
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center'
                  }}
                >
                  4. Download calculatie PDF
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posten tabel (alleen tonen als we klaar zijn voor calculatie) */}
      {(projectCreated && uploaded) && (
        <>
          <div style={styles.sectionTitle}>Calculatie posten</div>
          
          <div style={{ ...styles.card, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={styles.cardTitle}>Werkzaamheden</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Totaal {posten.length} posten | Oppervlakte: {form.oppervlakte_m2 || 0} m²
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
                    const postTotaal = berekenPost
