import { useState, useRef } from "react"
import supabase from "@/lib/supabase"

const styles = {
  wrap: { maxWidth: 1400, margin: "0 auto", padding: 24 },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
    marginBottom: 24
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  cardHover: {
    borderColor: "#2563eb",
    boxShadow: "0 8px 16px rgba(37, 99, 235, 0.1)"
  },
  cardTitle: { 
    fontWeight: 600, 
    marginBottom: 16,
    fontSize: 18,
    color: "#1f2937",
    display: "flex",
    alignItems: "center",
    gap: 10
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    boxSizing: "border-box",
    marginBottom: 16
  },
  textarea: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    minHeight: 120,
    resize: "vertical",
    boxSizing: "border-box",
    marginBottom: 16,
    fontFamily: "monospace"
  },
  button: {
    padding: "12px 24px",
    background: "#2563eb",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 500,
    border: "none",
    borderRadius: 8,
    width: "100%",
    transition: "background 0.3s ease"
  },
  buttonHover: {
    background: "#1d4ed8"
  },
  secondaryButton: {
    padding: "12px 24px",
    background: "#10b981",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 500,
    border: "none",
    borderRadius: 8,
    width: "100%",
    marginTop: 8,
    transition: "background 0.3s ease"
  },
  previewContainer: {
    border: "2px dashed #d1d5db",
    borderRadius: 8,
    padding: 20,
    minHeight: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f9fafb",
    marginTop: 16
  },
  imagePreview: {
    maxWidth: "100%",
    maxHeight: 400,
    borderRadius: 8,
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
  },
  loadingSpinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    width: 40,
    height: 40,
    animation: "spin 1s linear infinite"
  },
  dropdown: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    background: "#fff",
    marginBottom: 16
  },
  icon: {
    fontSize: 20,
    color: "#2563eb"
  }
}

const TEKENING_TYPES = [
  { id: "bestek", naam: "Bestektekening", icon: "📋", beschrijving: "Contractuele tekeningen met alle details en specificaties" },
  { id: "installatie_e", naam: "Elektra Installatie", icon: "⚡", beschrijving: "Elektrische schema's, aansluitingen, verdeelkasten" },
  { id: "installatie_w", naam: "Water Installatie", icon: "💧", beschrijving: "Waterleidingen, afvoeren, sanitaire voorzieningen" },
  { id: "bouw_detail", naam: "Bouwkundig Detail", icon: "🏗️", beschrijving: "Wandopbouw, vloerdetails, dakconstructies" },
  { id: "gevel", naam: "Geveltekening", icon: "🏢", beschrijving: "Voor-, zij-, achtergevels met materialisatie" },
  { id: "plat", naam: "Plattegrond", icon: "📐", beschrijving: "Verdiepingsplattegronden met functie-indeling" }
]

const DETAIL_NIVEAUS = [
  { id: "concept", naam: "Concept", niveau: "Laag", detail: "Basisvormen en indelingen" },
  { id: "voorlopig", naam: "Voorlopig Ontwerp", niveau: "Middel", detail: "Dimensionering en materialen" },
  { id: "definitief", naam: "Definitief Ontwerp", niveau: "Hoog", detail: "Alle technische details en aansluitingen" },
  { id: "uitvoering", naam: "Uitvoeringstekening", niveau: "Maximaal", detail: "Productie- en montagedetails" }
]

export default function BIMOntwerpPage() {
  const [activeTab, setActiveTab] = useState("bestek")
  const [loading, setLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState(null)
  
  const [tekeningConfig, setTekeningConfig] = useState({
    type: "bestek",
    niveau: "voorlopig",
    schaal: "1:50",
    project_naam: "",
    locatie: "",
    opdrachtgever: "",
    beschrijving: "Genereer een technische tekening volgens NEN normen",
    extra_specificaties: ""
  })

  const fileInputRef = useRef(null)

  function updateConfig(k, v) {
    setTekeningConfig(p => ({ ...p, [k]: v }))
  }

  async function generateTekening() {
    if (!tekeningConfig.project_naam.trim()) {
      setError("Projectnaam is verplicht")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simuleer AI generatie - in productie zou dit een echte AI API aanroepen
      console.log("Generating tekening with config:", tekeningConfig)
      
      // Voor demo: wacht 2 seconden en toon placeholder
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In een echte implementatie:
      // const response = await fetch("/api/ai/generate-drawing", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(tekeningConfig)
      // })
      
      // if (!response.ok) throw new Error("AI generatie mislukt")
      // const data = await response.json()
      
      // Placeholder voor demo
      const demoImages = {
        bestek: "https://via.placeholder.com/800x600/3b82f6/ffffff?text=Bestektekening",
        installatie_e: "https://via.placeholder.com/800x600/10b981/ffffff?text=Elektra+Schema",
        installatie_w: "https://via.placeholder.com/800x600/06b6d4/ffffff?text=Water+Installatie",
        bouw_detail: "https://via.placeholder.com/800x600/f59e0b/ffffff?text=Bouwkundig+Detail",
        gevel: "https://via.placeholder.com/800x600/8b5cf6/ffffff?text=Geveltekening",
        plat: "https://via.placeholder.com/800x600/ef4444/ffffff?text=Plattegrond"
      }
      
      setGeneratedImage({
        url: demoImages[tekeningConfig.type],
        config: { ...tekeningConfig },
        timestamp: new Date().toISOString(),
        download_url: `/${tekeningConfig.type}_tekening_${Date.now()}.png`
      })
      
      // Opslaan in database
      await saveToDatabase()
      
    } catch (err) {
      setError(err.message)
      console.error("Tekening generatie fout:", err)
    } finally {
      setLoading(false)
    }
  }

  async function saveToDatabase() {
    try {
      const { error } = await supabase
        .from("bim_tekeningen")
        .insert([{
          project_naam: tekeningConfig.project_naam,
          tekening_type: tekeningConfig.type,
          detail_niveau: tekeningConfig.niveau,
          schaal: tekeningConfig.schaal,
          beschrijving: tekeningConfig.beschrijving,
          status: "gegenereerd",
          gegenereerd_op: new Date().toISOString()
        }])

      if (error) throw error
      
      console.log("Tekening opgeslagen in database")
    } catch (err) {
      console.error("Database opslag fout:", err)
    }
  }

  async function uploadReferentie() {
    if (!fileInputRef.current.files.length) return
    
    const file = fileInputRef.current.files[0]
    setLoading(true)
    
    try {
      // Upload naar Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `referentie_${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('bim-referenties')
        .upload(fileName, file)
      
      if (error) throw error
      
      // URL voor preview
      const { data: { publicUrl } } = supabase.storage
        .from('bim-referenties')
        .getPublicUrl(fileName)
      
      // Gebruik deze referentie voor AI training
      updateConfig("referentie_image", publicUrl)
      
      alert("Referentie afbeelding geüpload!")
    } catch (err) {
      setError("Upload mislukt: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function downloadTekening() {
    if (!generatedImage) return
    
    try {
      const link = document.createElement('a')
      link.href = generatedImage.url
      link.download = `${tekeningConfig.project_naam}_${tekeningConfig.type}_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      setError("Download mislukt: " + err.message)
    }
  }

  function resetForm() {
    setTekeningConfig({
      type: "bestek",
      niveau: "voorlopig",
      schaal: "1:50",
      project_naam: "",
      locatie: "",
      opdrachtgever: "",
      beschrijving: "Genereer een technische tekening volgens NEN normen",
      extra_specificaties: ""
    })
    setGeneratedImage(null)
    setError(null)
  }

  return (
    <div style={styles.wrap}>
      <h1 style={{ marginBottom: 8 }}>AI Tekening Generator</h1>
      <p style={{ color: "#6b7280", marginBottom: 32 }}>
        Genereer automatisch technische tekeningen met AI voor bouwkundige, installatie- en bestektekeningen
      </p>

      <div style={styles.grid3}>
        {/* Linker kolom - Tekening Types */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>📋</span> Tekening Types
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TEKENING_TYPES.map(type => (
              <div 
                key={type.id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: activeTab === type.id ? "#f0f9ff" : "#f9fafb",
                  border: activeTab === type.id ? "1px solid #2563eb" : "1px solid #e5e7eb",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onClick={() => {
                  setActiveTab(type.id)
                  updateConfig("type", type.id)
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {type.icon} {type.naam}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {type.beschrijving}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Midden kolom - Configuratie */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>⚙️</span> Configuratie
          </div>
          
          <div style={styles.fieldGrid}>
            <div>
              <label style={styles.label}>Projectnaam *</label>
              <input
                style={styles.input}
                value={tekeningConfig.project_naam}
                onChange={e => updateConfig("project_naam", e.target.value)}
                placeholder="Bijv. 'Kantoorpand Rotterdam Zuid'"
              />
            </div>
            
            <div>
              <label style={styles.label}>Locatie</label>
              <input
                style={styles.input}
                value={tekeningConfig.locatie}
                onChange={e => updateConfig("locatie", e.target.value)}
                placeholder="Adres of plaats"
              />
            </div>
            
            <div>
              <label style={styles.label}>Detailniveau</label>
              <select
                style={styles.dropdown}
                value={tekeningConfig.niveau}
                onChange={e => updateConfig("niveau", e.target.value)}
              >
                {DETAIL_NIVEAUS.map(niveau => (
                  <option key={niveau.id} value={niveau.id}>
                    {niveau.naam} ({niveau.niveau}) - {niveau.detail}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={styles.label}>Schaal</label>
              <select
                style={styles.dropdown}
                value={tekeningConfig.schaal}
                onChange={e => updateConfig("schaal", e.target.value)}
              >
                <option value="1:20">1:20 - Zeer gedetailleerd</option>
                <option value="1:50">1:50 - Standaard detail</option>
                <option value="1:100">1:100 - Overzicht</option>
                <option value="1:200">1:200 - Masterplan</option>
              </select>
            </div>
            
            <div>
              <label style={styles.label}>Beschrijving</label>
              <textarea
                style={styles.textarea}
                value={tekeningConfig.beschrijving}
                onChange={e => updateConfig("beschrijving", e.target.value)}
                rows="4"
                placeholder="Beschrijf wat je nodig hebt..."
              />
            </div>
            
            <div>
              <label style={styles.label}>Extra specificaties</label>
              <textarea
                style={styles.textarea}
                value={tekeningConfig.extra_specificaties}
                onChange={e => updateConfig("extra_specificaties", e.target.value)}
                rows="3"
                placeholder="Bijzondere eisen, materialen, normen (NEN, Eurocode)..."
              />
            </div>
          </div>
        </div>

        {/* Rechter kolom - Preview & Acties */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>👁️</span> Preview & Acties
          </div>
          
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <div style={styles.loadingSpinner}></div>
                <p style={{ marginTop: 16, color: "#6b7280" }}>AI is bezig met genereren...</p>
              </div>
            ) : generatedImage ? (
              <div>
                <div style={styles.previewContainer}>
                  <img 
                    src={generatedImage.url} 
                    alt="Gegenereerde tekening"
                    style={styles.imagePreview}
                  />
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                    Type: {tekeningConfig.type} | Niveau: {tekeningConfig.niveau} | Schaal: {tekeningConfig.schaal}
                  </div>
                  <button 
                    style={styles.secondaryButton}
                    onClick={downloadTekening}
                  >
                    📥 Tekening Downloaden
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.previewContainer}>
                <div style={{ textAlign: "center", color: "#6b7280" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
                  <p>Nog geen tekening gegenereerd</p>
                  <p style={{ fontSize: 12 }}>Configureer en klik op 'Genereer Tekening'</p>
                </div>
              </div>
            )}
          </div>
          
          <div style={{ marginTop: 20 }}>
            {/* Referentie upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={styles.label}>Referentie upload (optioneel)</label>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,.pdf,.dwg,.dxf"
                onChange={uploadReferentie}
              />
              <button 
                style={{ 
                  ...styles.button, 
                  background: "#6b7280" 
                }}
                onClick={() => fileInputRef.current.click()}
              >
                📁 Referentie Uploaden
              </button>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                Upload bestaande tekeningen als voorbeeld
              </div>
            </div>
            
            {/* Generate button */}
            <button 
              style={styles.button}
              onClick={generateTekening}
              disabled={loading || !tekeningConfig.project_naam.trim()}
            >
              {loading ? "⏳ Bezig..." : "🚀 Tekening Genereren met AI"}
            </button>
            
            {/* Reset button */}
            <button 
              style={{ 
                ...styles.button, 
                background: "#ef4444",
                marginTop: 8
              }}
              onClick={resetForm}
            >
              🔄 Reset Alles
            </button>
          </div>
        </div>
      </div>

      {/* Onderste sectie - Recent gegenereerd */}
      <div style={{ ...styles.card, marginTop: 24 }}>
        <div style={styles.cardTitle}>
          <span>📚</span> Recent Gegenereerde Tekeningen
        </div>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
          marginTop: 16
        }}>
          {/* Voorbeeld items */}
          {[
            { naam: "Wandopbouw Detail", type: "bouw_detail", datum: "2024-01-15" },
            { naam: "Elektra Schema Keuken", type: "installatie_e", datum: "2024-01-14" },
            { naam: "Badkamer Water", type: "installatie_w", datum: "2024-01-13" },
            { naam: "Gevel Zuidzijde", type: "gevel", datum: "2024-01-12" }
          ].map((item, index) => (
            <div key={index} style={{
              padding: 16,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "#f9fafb"
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.naam}</div>
              <div style={{ fontSize: 12, color: "#6b7280", display: "flex", justifyContent: "space-between" }}>
                <span>Type: {item.type}</span>
                <span>{item.datum}</span>
              </div>
              <button style={{
                padding: "6px 12px",
                fontSize: 12,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                marginTop: 8,
                width: "100%"
              }}>
                Opnieuw Genereren
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ 
          marginTop: 24,
          padding: 16,
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 8,
          color: "#dc2626"
        }}>
          <strong>Fout:</strong> {error}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
