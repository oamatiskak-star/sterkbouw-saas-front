import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"
import ProjectInitOptionsModal from "../../components/ProjectInitOptionsModal"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const inputStyle = {
  width: "100%",
  height: 44,
  padding: "8px 12px",
  fontSize: 14,
  boxSizing: "border-box",
  borderRadius: 4,
  border: "1px solid #d1d5db"
}

const buttonStyle = {
  ...inputStyle,
  background: "#2563eb",
  color: "#ffffff",
  border: "none",
  fontWeight: 600,
  cursor: "pointer"
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

export default function NieuweCalculatie() {
  const router = useRouter()

  // PROJECT
  const [naamOpdrachtgever, setNaamOpdrachtgever] = useState("")
  const [omschrijving, setOmschrijving] = useState("")
  const [adres, setAdres] = useState("")
  const [postcode, setPostcode] = useState("")
  const [plaatsnaam, setPlaatsnaam] = useState("")
  const [land, setLand] = useState("Nederland")
  const [telefoon, setTelefoon] = useState("")
  const [projectType, setProjectType] = useState("Nieuwbouw")
  const [opmerking, setOpmerking] = useState("")

  // FACTURATIE
  const [bedrijfNaam, setBedrijfNaam] = useState("")
  const [postbus, setPostbus] = useState("")
  const [adresFacturatie, setAdresFacturatie] = useState("")
  const [postcodeFacturatie, setPostcodeFacturatie] = useState("")
  const [plaatsnaamFacturatie, setPlaatsnaamFacturatie] = useState("")
  const [landFacturatie, setLandFacturatie] = useState("Nederland")
  const [emailFacturen, setEmailFacturen] = useState("")
  const [telefoonKantoor, setTelefoonKantoor] = useState("")
  const [naamProjectleider, setNaamProjectleider] = useState("")
  const [telefoonProjectleider, setTelefoonProjectleider] = useState("")

  // FLOW
  const [facturatieGegevens, setFacturatieGegevens] = useState(false)
  const [creating, setCreating] = useState(false)
  const [projectId, setProjectId] = useState(null)
  const [showOptions, setShowOptions] = useState(false)

  useEffect(() => {
    if (facturatieGegevens) {
      setAdresFacturatie(adres)
      setPostcodeFacturatie(postcode)
      setPlaatsnaamFacturatie(plaatsnaam)
      setLandFacturatie(land)
    }
  }, [facturatieGegevens, adres, postcode, plaatsnaam, land])

  // ==========================
  // 1. START CALCULATIE (maakt project id indien nodig)
  // ==========================
  async function handleStartCalculatie() {
    if (creating) return
    if (projectId) {
      setShowOptions(true)
      return
    }

    setCreating(true)

    const { data, error } = await supabase
      .from("projecten")
      .insert({
        naam: omschrijving || naamOpdrachtgever || "Nieuw project",
        adres,
        postcode,
        plaatsnaam,
        land,
        status: "draft"
      })
      .select("id")
      .single()

    if (error) {
      alert(error.message)
      setCreating(false)
      return
    }

    setProjectId(data.id)
    setCreating(false)
    setShowOptions(true)
  }

  // ==========================
  // 2. NA OPT FORM → START FLOW
  // ==========================
  async function handleConfirmOptions({ options, uploaded_files }) {
    if (!projectId) {
      alert("Project ID ontbreekt")
      return
    }

    try {
      const { data: calculatie, error } = await supabase
        .from("calculaties")
        .insert({
          project_id: projectId,

          naam_opdrachtgever: naamOpdrachtgever,
          omschrijving,
          adres,
          postcode,
          plaatsnaam,
          land,
          telefoon,
          project_type: projectType,
          opmerking,

          bedrijf_naam: bedrijfNaam,
          postbus,
          adres_facturatie: adresFacturatie,
          postcode_facturatie: postcodeFacturatie,
          plaatsnaam_facturatie: plaatsnaamFacturatie,
          land_facturatie: landFacturatie,
          email_facturen: emailFacturen,
          telefoon_kantoor: telefoonKantoor,
          naam_projectleider: naamProjectleider,
          telefoon_projectleider: telefoonProjectleider,

          status: "initializing",
          workflow_status: "scan_pending"
        })
        .select("id")
        .single()

      if (error) throw error

      await supabase.rpc("start_project_initialisation", {
        p_project_id: projectId
      })

      router.push(`/calculaties/${calculatie.id}/initialisatie`)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <h1>Nieuwe Calculatie</h1>

      {projectId && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#eef2ff",
            borderRadius: 6,
            fontWeight: 600
          }}
        >
          Project ID aangemaakt: {projectId}
        </div>
      )}

      <label style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="checkbox"
          checked={facturatieGegevens}
          onChange={e => setFacturatieGegevens(e.target.checked)}
        />
        Facturatiegegevens kopiëren van projectadres
      </label>

      <form onSubmit={e => e.preventDefault()}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr", gap: 40, maxWidth: 1800 }}>
          <div>
            <h3>Projectgegevens</h3>

            <Field label="Naam opdrachtgever">
              <input style={inputStyle} value={naamOpdrachtgever} onChange={e => setNaamOpdrachtgever(e.target.value)} />
            </Field>

            <Field label="Omschrijving">
              <input style={inputStyle} value={omschrijving} onChange={e => setOmschrijving(e.target.value)} />
            </Field>

            <Field label="Adres">
              <input style={inputStyle} value={adres} onChange={e => setAdres(e.target.value)} />
            </Field>

            <Field label="Postcode">
              <input style={inputStyle} value={postcode} onChange={e => setPostcode(e.target.value)} />
            </Field>

            <Field label="Plaatsnaam">
              <input style={inputStyle} value={plaatsnaam} onChange={e => setPlaatsnaam(e.target.value)} />
            </Field>

            <Field label="Land">
              <select style={inputStyle} value={land} onChange={e => setLand(e.target.value)}>
                <option>Nederland</option>
                <option>België</option>
                <option>Duitsland</option>
              </select>
            </Field>

            <Field label="Telefoon">
              <input style={inputStyle} value={telefoon} onChange={e => setTelefoon(e.target.value)} />
            </Field>

            <Field label="Projecttype">
              <select style={inputStyle} value={projectType} onChange={e => setProjectType(e.target.value)}>
                <option>Nieuwbouw</option>
                <option>Utiliteitsbouw</option>
                <option>Transformatie</option>
                <option>Renovatie</option>
              </select>
            </Field>

            <Field label="Opmerking">
              <input style={inputStyle} value={opmerking} onChange={e => setOpmerking(e.target.value)} />
            </Field>

            <Field label=" ">
              <button
                type="button"
                style={buttonStyle}
                onClick={handleStartCalculatie}
                disabled={creating}
              >
                Start calculatie
              </button>
            </Field>
          </div>

          <div>
            <h3>Facturatiegegevens</h3>

            <Field label="Bedrijfsnaam">
              <input style={inputStyle} value={bedrijfNaam} onChange={e => setBedrijfNaam(e.target.value)} />
            </Field>

            <Field label="Postbus">
              <input style={inputStyle} value={postbus} onChange={e => setPostbus(e.target.value)} />
            </Field>

            <Field label="Adres">
              <input style={inputStyle} value={adresFacturatie} onChange={e => setAdresFacturatie(e.target.value)} />
            </Field>

            <Field label="Postcode">
              <input style={inputStyle} value={postcodeFacturatie} onChange={e => setPostcodeFacturatie(e.target.value)} />
            </Field>

            <Field label="Plaatsnaam">
              <input style={inputStyle} value={plaatsnaamFacturatie} onChange={e => setPlaatsnaamFacturatie(e.target.value)} />
            </Field>

            <Field label="Land">
              <select style={inputStyle} value={landFacturatie} onChange={e => setLandFacturatie(e.target.value)}>
                <option>Nederland</option>
                <option>België</option>
                <option>Duitsland</option>
              </select>
            </Field>

            <Field label="Email facturen">
              <input style={inputStyle} value={emailFacturen} onChange={e => setEmailFacturen(e.target.value)} />
            </Field>

            <Field label="Telefoon kantoor">
              <input style={inputStyle} value={telefoonKantoor} onChange={e => setTelefoonKantoor(e.target.value)} />
            </Field>

            <Field label="Projectleider">
              <input style={inputStyle} value={naamProjectleider} onChange={e => setNaamProjectleider(e.target.value)} />
            </Field>

            <Field label="Tel. projectleider">
              <input style={inputStyle} value={telefoonProjectleider} onChange={e => setTelefoonProjectleider(e.target.value)} />
            </Field>
          </div>
        </div>
      </form>

      {showOptions && (
        <ProjectInitOptionsModal
          projectId={projectId}
          onConfirm={handleConfirmOptions}
          onCancel={() => setShowOptions(false)}
        />
      )}
    </>
  )
}
