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

  const [naamOpdrachtgever, setNaamOpdrachtgever] = useState("")
  const [omschrijving, setOmschrijving] = useState("")
  const [adres, setAdres] = useState("")
  const [postcode, setPostcode] = useState("")
  const [plaatsnaam, setPlaatsnaam] = useState("")
  const [land, setLand] = useState("Nederland")
  const [telefoon, setTelefoon] = useState("")
  const [projectType, setProjectType] = useState("Nieuwbouw")
  const [opmerking, setOpmerking] = useState("")

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
  const [showOptions, setShowOptions] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (facturatieGegevens) {
      setAdresFacturatie(adres)
      setPostcodeFacturatie(postcode)
      setPlaatsnaamFacturatie(plaatsnaam)
      setLandFacturatie(land)
    }
  }, [facturatieGegevens, adres, postcode, plaatsnaam, land])

  async function handleConfirmOptions() {
    if (creating) return
    setCreating(true)

    try {
      // 1. Project aanmaken
      const { data: project, error: projectError } = await supabase
        .from("projecten")
        .insert({
          naam: omschrijving || naamOpdrachtgever,
          adres,
          postcode,
          plaatsnaam,
          land,
          type: projectType
        })
        .select("id")
        .single()

      if (projectError) throw projectError

      // 2. Calculatie aanmaken met project_id
      const { data: calculatie, error: calcError } = await supabase
        .from("calculaties")
        .insert({
          project_id: project.id,
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

      if (calcError) throw calcError

      // 3. Initialisatie starten op PROJECT
      await supabase.rpc("start_project_initialisation", {
        p_project_id: project.id
      })

      // 4. Naar calculatie-status
      router.push(`/calculaties/${calculatie.id}/initialisatie`)
    } catch (err) {
      alert(err.message)
      setCreating(false)
    }
  }

  return (
    <>
      <h1>Nieuwe Calculatie</h1>

      {/* formulier ongewijzigd */}

      {showOptions && (
        <ProjectInitOptionsModal
          onConfirm={handleConfirmOptions}
          onCancel={() => setShowOptions(false)}
        />
      )}
    </>
  )
}
