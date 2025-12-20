import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"
import ProjectInitOptionsModal from "../../components/ProjectInitOptionsModal"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Volgend projectnummer
async function getNextProjectnummer() {
  const { data } = await supabase
    .from("calculaties")
    .select("projectnummer")
    .order("projectnummer", { ascending: false })
    .limit(1)

  if (!data || data.length === 0) return 1001
  const last = parseInt(data[0].projectnummer, 10)
  return isNaN(last) ? 1001 : last + 1
}

export default function NieuweCalculatie() {
  const router = useRouter()

  // PROJECT (links)
  const [naamOpdrachtgever, setNaamOpdrachtgever] = useState("")
  const [omschrijving, setOmschrijving] = useState("")
  const [adres, setAdres] = useState("")
  const [postcode, setPostcode] = useState("")
  const [plaatsnaam, setPlaatsnaam] = useState("")
  const [land, setLand] = useState("Nederland")
  const [telefoon, setTelefoon] = useState("")
  const [projectType, setProjectType] = useState("Nieuwbouw")
  const [opmerking, setOpmerking] = useState("")

  // FACTURATIE (rechts)
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Kopieer projectadres → facturatieadres
  useEffect(() => {
    if (facturatieGegevens) {
      setAdresFacturatie(adres)
      setPostcodeFacturatie(postcode)
      setPlaatsnaamFacturatie(plaatsnaam)
      setLandFacturatie(land)
    }
  }, [facturatieGegevens, adres, postcode, plaatsnaam, land])

  // Startknop → altijd opt-form
  const handleStartClick = () => {
    setError(null)
    setShowOptions(true)
  }

  // Bevestigen opt-form → calculatie aanmaken
  const handleConfirmOptions = async (options) => {
    setLoading(true)
    setError(null)

    try {
      if (!naamOpdrachtgever.trim()) {
        throw new Error("Naam opdrachtgever is verplicht")
      }

      const projectnummer = await getNextProjectnummer()

      const { data, error } = await supabase
        .from("calculaties")
        .insert({
          projectnummer,

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

          facturatie_gegevens: facturatieGegevens,
          opties: options,

          status: "nieuw",
          workflow_status: "open"
        })
        .select("id")
        .single()

      if (error) throw error

      await fetch("/api/initialize-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: data.id,
          options
        })
      })

      router.push(`/calculaties/${data.id}`)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <>
      <h1>Nieuwe Calculatie</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          <input
            type="checkbox"
            checked={facturatieGegevens}
            onChange={(e) => setFacturatieGegevens(e.target.checked)}
          />
          Facturatiegegevens kopiëren
        </label>

        <div className="sb-form-two-col">
          <div>
            <input placeholder="Naam opdrachtgever" value={naamOpdrachtgever} onChange={e => setNaamOpdrachtgever(e.target.value)} />
            <input placeholder="Omschrijving" value={omschrijving} onChange={e => setOmschrijving(e.target.value)} />
            <input placeholder="Adres" value={adres} onChange={e => setAdres(e.target.value)} />
            <input placeholder="Postcode" value={postcode} onChange={e => setPostcode(e.target.value)} />
            <input placeholder="Plaatsnaam" value={plaatsnaam} onChange={e => setPlaatsnaam(e.target.value)} />
            <input placeholder="Telefoon" value={telefoon} onChange={e => setTelefoon(e.target.value)} />
          </div>

          <div>
            <input placeholder="Bedrijfsnaam" value={bedrijfNaam} onChange={e => setBedrijfNaam(e.target.value)} />
            <input placeholder="Adres facturatie" value={adresFacturatie} onChange={e => setAdresFacturatie(e.target.value)} />
            <input placeholder="Email facturen" value={emailFacturen} onChange={e => setEmailFacturen(e.target.value)} />
            <input placeholder="Projectleider" value={naamProjectleider} onChange={e => setNaamProjectleider(e.target.value)} />
          </div>
        </div>

        <button type="button" onClick={handleStartClick} disabled={loading}>
          Start calculatie
        </button>
      </form>

      {showOptions && (
        <ProjectInitOptionsModal
          onConfirm={handleConfirmOptions}
          onCancel={() => setShowOptions(false)}
        />
      )}
    </>
  )
}
