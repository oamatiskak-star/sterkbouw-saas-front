import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"
import ProjectInitOptionsModal from "../../components/ProjectInitOptionsModal"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/* =========================
   HELPER
========================= */
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

/* =========================
   PAGE
========================= */
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

  const [facturatieGegevens, setFacturatieGegevens] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
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

  /* Startknop → opt form */
  const handleStartClick = () => {
    setError(null)
    setShowOptions(true)
  }

  /* Bevestigen opt-form → aanmaken */
  const handleConfirmOptions = async (options) => {
    try {
      if (!naamOpdrachtgever.trim()) {
        setError("Naam opdrachtgever is verplicht")
        return
      }

      const { data, error } = await supabase
        .from("calculaties")
        .insert({
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

      router.push(`/calculaties/${data.id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <h1>Nieuwe Calculatie</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={(e) => e.preventDefault()}>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={facturatieGegevens}
              onChange={(e) => setFacturatieGegevens(e.target.checked)}
            />
            Facturatiegegevens kopiëren van projectadres
          </label>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            maxWidth: 900
          }}
        >

          {/* PROJECT */}
          <div>
            <h3>Projectgegevens</h3>

            <Field label="Naam opdrachtgever">
              <input value={naamOpdrachtgever} onChange={e => setNaamOpdrachtgever(e.target.value)} />
            </Field>

            <Field label="Omschrijving">
              <input value={omschrijving} onChange={e => setOmschrijving(e.target.value)} />
            </Field>

            <Field label="Adres">
              <input value={adres} onChange={e => setAdres(e.target.value)} />
            </Field>

            <Field label="Postcode">
              <input value={postcode} onChange={e => setPostcode(e.target.value)} />
            </Field>

            <Field label="Plaatsnaam">
              <input value={plaatsnaam} onChange={e => setPlaatsnaam(e.target.value)} />
            </Field>

            <Field label="Land">
              <select value={land} onChange={e => setLand(e.target.value)}>
                <option>Nederland</option>
                <option>België</option>
                <option>Duitsland</option>
              </select>
            </Field>

            <Field label="Telefoon">
              <input value={telefoon} onChange={e => setTelefoon(e.target.value)} />
            </Field>

            <Field label="Projecttype">
              <select value={projectType} onChange={e => setProjectType(e.target.value)}>
                <option>Nieuwbouw</option>
                <option>Utiliteitsbouw</option>
                <option>Transformatie</option>
                <option>Renovatie</option>
              </select>
            </Field>

            <Field label="Opmerking">
              <input value={opmerking} onChange={e => setOpmerking(e.target.value)} />
            </Field>
          </div>

          {/* FACTURATIE */}
          <div>
            <h3>Facturatiegegevens</h3>

            <Field label="Bedrijfsnaam">
              <input value={bedrijfNaam} onChange={e => setBedrijfNaam(e.target.value)} />
            </Field>

            <Field label="Postbus">
              <input value={postbus} onChange={e => setPostbus(e.target.value)} />
            </Field>

            <Field label="Adres">
              <input value={adresFacturatie} onChange={e => setAdresFacturatie(e.target.value)} readOnly={facturatieGegevens} />
            </Field>

            <Field label="Postcode">
              <input value={postcodeFacturatie} onChange={e => setPostcodeFacturatie(e.target.value)} readOnly={facturatieGegevens} />
            </Field>

            <Field label="Plaatsnaam">
              <input value={plaatsnaamFacturatie} onChange={e => setPlaatsnaamFacturatie(e.target.value)} readOnly={facturatieGegevens} />
            </Field>

            <Field label="Land">
              <select value={landFacturatie} onChange={e => setLandFacturatie(e.target.value)} disabled={facturatieGegevens}>
                <option>Nederland</option>
                <option>België</option>
                <option>Duitsland</option>
              </select>
            </Field>

            <Field label="Email facturen">
              <input value={emailFacturen} onChange={e => setEmailFacturen(e.target.value)} />
            </Field>

            <Field label="Telefoon kantoor">
              <input value={telefoonKantoor} onChange={e => setTelefoonKantoor(e.target.value)} />
            </Field>

            <Field label="Projectleider">
              <input value={naamProjectleider} onChange={e => setNaamProjectleider(e.target.value)} />
            </Field>

            <Field label="Tel. projectleider">
              <input value={telefoonProjectleider} onChange={e => setTelefoonProjectleider(e.target.value)} />
            </Field>
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <button type="button" onClick={handleStartClick}>
            Start calculatie
          </button>
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
