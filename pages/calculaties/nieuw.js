import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

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
  const { isReady, query } = router
  const project_id = isReady && query.project_id ? String(query.project_id) : null

  if (!isReady) return <div>Laden...</div>
  if (!project_id) return <div>Project ontbreekt</div>

  // PROJECT – BESTAAND
  const [naamOpdrachtgever, setNaamOpdrachtgever] = useState("")
  const [omschrijving, setOmschrijving] = useState("")
  const [adres, setAdres] = useState("")
  const [postcode, setPostcode] = useState("")
  const [plaatsnaam, setPlaatsnaam] = useState("")
  const [land, setLand] = useState("Nederland")
  const [telefoon, setTelefoon] = useState("")
  const [projectType, setProjectType] = useState("Nieuwbouw")
  const [opmerking, setOpmerking] = useState("")

  // FACTURATIE – BESTAAND
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

  const [facturatieGegevens, setFacturatieGegevens] = useState(false)
  const [creating, setCreating] = useState(false)

  // UPLOAD – TOEGEVOEGD
  const [files, setFiles] = useState([])

  useEffect(() => {
    if (facturatieGegevens) {
      setAdresFacturatie(adres)
      setPostcodeFacturatie(postcode)
      setPlaatsnaamFacturatie(plaatsnaam)
      setLandFacturatie(land)
    }
  }, [facturatieGegevens, adres, postcode, plaatsnaam, land])

  // UPLOAD FUNCTIE – TOEGEVOEGD
  async function uploadFiles() {
    for (const file of files) {
      const path = `${project_id}/${Date.now()}_${file.name}`

      const { error: uploadError } = await supabase
        .storage
        .from("project_files")
        .upload(path, file)

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { error: dbError } = await supabase
        .from("project_files")
        .insert({
          project_id,
          filename: file.name,
          path
        })

      if (dbError) {
        throw new Error(dbError.message)
      }
    }
  }

  async function handleStartCalculatie() {
    if (creating) return
    setCreating(true)

    try {
      // UPLOAD EERST – TOEGEVOEGD
      if (files.length > 0) {
        await uploadFiles()
      }

      const { data, error } = await supabase
        .from("calculaties")
        .insert({
          project_id,
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
          workflow_status: "initializing"
        })
        .select("id")
        .single()

      if (error) throw error

      await supabase.rpc("start_project_initialisation", {
        p_project_id: project_id
      })

      router.replace(`/calculaties/${data.id}`)
    } catch (e) {
      alert(e.message)
      setCreating(false)
    }
  }

  return (
    <>
      <h1>Nieuwe Calculatie</h1>

      <div style={{ marginBottom: 16, padding: 12, background: "#eef2ff", borderRadius: 6, fontWeight: 600 }}>
        Project ID: {project_id}
      </div>

      {/* UPLOAD VELD – TOEGEVOEGD */}
      <Field label="Bestanden voor analyse en calculatie (PDF, DWG, XLSX)">
        <input
          type="file"
          multiple
          onChange={e => setFiles(Array.from(e.target.files))}
        />
      </Field>

      <label style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="checkbox"
          checked={facturatieGegevens}
          onChange={e => setFacturatieGegevens(e.target.checked)}
        />
        Facturatiegegevens kopiëren van projectadres
      </label>

      <form onSubmit={e => e.preventDefault()}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr", gap: 40 }}>
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
                {creating ? "Bezig..." : "Start calculatie"}
              </button>
            </Field>
          </div>
        </div>
      </form>
    </>
  )
}
