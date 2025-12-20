import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"
import ProjectInitOptionsModal from "../components/ProjectInitOptionsModal"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Haal volgend projectnummer op
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

  /* LINKER KOLOM – PROJECT */
  const [naamOpdrachtgever, setNaamOpdrachtgever] = useState("")
  const [omschrijving, setOmschrijving] = useState("")
  const [adres, setAdres] = useState("")
  const [postcode, setPostcode] = useState("")
  const [plaatsnaam, setPlaatsnaam] = useState("")
  const [land, setLand] = useState("Nederland")
  const [telefoon, setTelefoon] = useState("")
  const [projectType, setProjectType] = useState("Nieuwbouw")
  const [opmerking, setOpmerking] = useState("")

  /* RECHTER KOLOM – FACTURATIE */
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

  /* Kopieer projectadres → facturatieadres */
  useEffect(() => {
    if (facturatieGegevens) {
      setAdresFacturatie(adres)
      setPostcodeFacturatie(postcode)
      setPlaatsnaamFacturatie(plaatsnaam)
      setLandFacturatie(land)
    }
  }, [facturatieGegevens, adres, postcode, plaatsnaam, land])

  /* STARTKNOP */
  const handleStartClick = () => {
    if (!naamOpdrachtgever.trim()) {
      setError("Naam opdrachtgever is verplicht")
      return
    }
    setError(null)
    setShowOptions(true)
  }

  /* BEVESTIG OPT-FORM → PROJECT AANMAKEN + INITIALISEREN */
  const handleConfirmOptions = async (options) => {
    setLoading(true)

    try {
      const projectnummer = await getNextProjectnummer()

      const { data, error } = await supabase
        .from("calculaties")
        .insert([
          {
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
            status: "initializing"
          }
        ])
        .select()
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

      router.push(`/calculaties/${data.id}/initialisatie`)
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

        <div className="sb-form-field full" style={{ marginBottom: 32 }}>
          <label className="sb-checkbox">
            <input
              type="checkbox"
              checked={facturatieGegevens}
              onChange={(e) => setFacturatieGegevens(e.target.checked)}
            />
            Facturatiegegevens kopiëren
          </label>
        </div>

        <div className="sb-form-two-col">

          {/* LINKER KOLOM */}
          <div className="sb-form-col left">
            <div className="sb-form-field">
              <label>Naam opdrachtgever</label>
              <input value={naamOpdrachtgever} onChange={(e) => setNaamOpdrachtgever(e.target.value)} />
            </div>

            <div className="sb-form-field">
              <label>Omschrijving</label>
              <input value={omschrijving} onChange={(e) => setOmschrijving(e.target.value)} />
            </div>

            <div className="sb-form-field">
              <label>Adres</label>
              <input value={adres} onChange={(e) => setAdres(e.target.value)} />
            </div>

            <div className="sb-form-field">
              <label>Postcode</label>
              <input value={postcode} onChange={(e) => setPostcode(e.target.value)} />
            </div>

            <div className="sb-form-field">
              <label>Plaatsnaam</label>
              <input value={plaatsnaam} onChange={(e) => setPlaatsnaam(e.target.value)} />
            </div>

            <div className="sb-form-field">
              <label>Land</label>
              <select value={land} onChange={(e) => setLand(e.target.value)}>
                <option>Nederland</option>
                <option>België</option>
                <option>Duitsland</option>
              </select>
            </div>

            <div className="sb-form-field">
              <label>Telefoon</label>
              <input value={telefoon} onChange={(e) => setTelefoon(e.target.value)} />
            </div>

            <div className="sb-form-field">
              <label>Projecttype</label>
              <select value={projectType} onChange={(e) => setProjectType(e.target.value)}>
                <option>Nieuwbouw</option>
                <option>Utiliteitsbouw</option>
                <option>Transformatie</option>
                <option>Renovatie</option>
              </select>
            </div>

            <div className="sb-form-field">
              <label>Opmerking</label>
              <input value={opmerking} onChange={(e) => setOpmerking(e.target.value)} />
            </div>

            <div className="sb-form-actions">
              <button type="button" onClick={handleStartClick} disabled={loading}>
                {loading ? "Verwerken..." : "Start calculatie"}
              </button>
            </div>
          </div>

          {/* RECHTER KOLOM */}
          <div className="sb-form-col right">
            <div className="sb-form-field">
              <label>Bedrijfsnaam</label>
              <input value={bedrijfNaam} onChange={(e) => setBedrijfNaam(e.target.value)} />
            </div>

            <div className="sb-form-field">
              <label>Postbus</label>
              <input value={postbus} onChange={(e) => setPostbus(e.target.value)} />
            </div>

            <div className="sb-form-field">
              <label>Adres</label>
              <input value={adresFacturatie} onChange={(e) => setAdresFacturatie(e.target.value)} readOnly={facturatieGegevens} />
            </div>

            <div className="sb-form-field">
              <label>Postcode</label>
              <input value={postcodeFacturatie} onChange={(e) => setPostcodeFacturatie(e.target.value)} readOnly={facturatieGegevens} />
            </div>

            <div className="sb-form-field">
              <label>Plaatsnaam</label>
              <input value={plaatsnaamFacturatie} onChange={(e) => setPlaatsnaamFacturatie(e.target.value)} readOnly={facturatieGegevens} />
            </div>

            <div className="sb-form-field">
              <label>Land</label>
              <select value={landFacturatie} onChange={(e) => setLandFacturatie(e.target.value)} disabled={facturatieGegevens}>
                <option>Nederland</option>
                <option>België</option>
                <option>Duitsland</option>
              </select>
            </div>

            <div className="sb-form-field">
              <label>Email facturen</label>
              <input value={emailFacturen} onChange={(e) => setEmailFacturen(e.target.value)} />
            </div>

            <div className="sb-form-field">
              <label>Telefoon kantoor</label>
              <input value={telefoonKantoor} onChange={(e) => setTelefoonKantoor(e.target.value)} />
            </div>

            <div className="sb-form-field">
              <label>Projectleider</label>
              <input value={naamProjectleider} onChange={(e) => setNaamProjectleider(e.target.value)} />
            </div>

            <div className="sb-form-field">
              <label>Tel. projectleider</label>
              <input value={telefoonProjectleider} onChange={(e) => setTelefoonProjectleider(e.target.value)} />
            </div>
          </div>
        </div>
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
