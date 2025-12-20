import { useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function NieuweCalculatie() {
  const router = useRouter()

  const [projectnummer, setProjectnummer] = useState("")
  const [naamOpdrachtgever, setNaamOpdrachtgever] = useState("")
  const [omschrijving, setOmschrijving] = useState("")

  const [adres, setAdres] = useState("")
  const [postcode, setPostcode] = useState("")
  const [plaatsnaam, setPlaatsnaam] = useState("")
  const [land, setLand] = useState("")

  const [bedrijfNaam, setBedrijfNaam] = useState("")
  const [postbus, setPostbus] = useState("")
  const [emailFacturen, setEmailFacturen] = useState("")
  const [telefoonKantoor, setTelefoonKantoor] = useState("")

  const [email, setEmail] = useState("")
  const [telefoon, setTelefoon] = useState("")

  const [naamProjectleider, setNaamProjectleider] = useState("")
  const [telefoonProjectleider, setTelefoonProjectleider] = useState("")

  const [startDatum, setStartDatum] = useState("")
  const [eindDatum, setEindDatum] = useState("")

  const [facturatieGegevens, setFacturatieGegevens] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError(null)

    try {
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
            email,
            telefoon,
            bedrijf_naam: bedrijfNaam,
            postbus,
            email_facturen: emailFacturen,
            telefoon_kantoor: telefoonKantoor,
            naam_projectleider: naamProjectleider,
            telefoon_projectleider: telefoonProjectleider,
            start_datum: startDatum,
            eind_datum: eindDatum,
            facturatie_gegevens: facturatieGegevens
          }
        ])
        .select()
        .single()

      if (error) throw error

      router.push(`/calculaties/${data.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1>Nieuwe Calculatie</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>

        {/* Checkbox bovenin */}
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

          {/* RIJ 1 */}
          <div className="sb-form-col left">
            <div className="sb-form-field">
              <label>Projectnummer ID</label>
              <input value={projectnummer} onChange={(e) => setProjectnummer(e.target.value)} />
            </div>
          </div>
          <div className="sb-form-col right">
            <div className="sb-form-field">
              <label>Bedrijfsnaam</label>
              <input value={bedrijfNaam} onChange={(e) => setBedrijfNaam(e.target.value)} />
            </div>
          </div>

          {/* RIJ 2 */}
          <div className="sb-form-col left">
            <div className="sb-form-field">
              <label>Naam opdrachtgever</label>
              <input value={naamOpdrachtgever} onChange={(e) => setNaamOpdrachtgever(e.target.value)} />
            </div>
          </div>
          <div className="sb-form-col right">
            <div className="sb-form-field">
              <label>Postbus</label>
              <input value={postbus} onChange={(e) => setPostbus(e.target.value)} />
            </div>
          </div>

          {/* RIJ 3 */}
          <div className="sb-form-col left">
            <div className="sb-form-field">
              <label>Omschrijving</label>
              <textarea value={omschrijving} onChange={(e) => setOmschrijving(e.target.value)} />
            </div>
          </div>
          <div className="sb-form-col right">
            <div className="sb-form-field">
              <label>Email facturen</label>
              <input value={emailFacturen} onChange={(e) => setEmailFacturen(e.target.value)} />
            </div>
          </div>

          {/* RIJ 4 */}
          <div className="sb-form-col left">
            <div className="sb-form-field">
              <label>Adres</label>
              <input value={adres} onChange={(e) => setAdres(e.target.value)} />
            </div>
          </div>
          <div className="sb-form-col right">
            <div className="sb-form-field">
              <label>Adres</label>
              <input value={adres} onChange={(e) => setAdres(e.target.value)} />
            </div>
          </div>

          {/* RIJ 5 */}
          <div className="sb-form-col left">
            <div className="sb-form-field">
              <label>Postcode</label>
              <input value={postcode} onChange={(e) => setPostcode(e.target.value)} />
            </div>
          </div>
          <div className="sb-form-col right">
            <div className="sb-form-field">
              <label>Postcode</label>
              <input value={postcode} onChange={(e) => setPostcode(e.target.value)} />
            </div>
          </div>

          {/* RIJ 6 */}
          <div className="sb-form-col left">
            <div className="sb-form-field">
              <label>Plaatsnaam</label>
              <input value={plaatsnaam} onChange={(e) => setPlaatsnaam(e.target.value)} />
            </div>
          </div>
          <div className="sb-form-col right">
            <div className="sb-form-field">
              <label>Plaatsnaam</label>
              <input value={plaatsnaam} onChange={(e) => setPlaatsnaam(e.target.value)} />
            </div>
          </div>

          {/* RIJ 7 */}
          <div className="sb-form-col left">
            <div className="sb-form-field">
              <label>Land</label>
              <input value={land} onChange={(e) => setLand(e.target.value)} />
            </div>
          </div>
          <div className="sb-form-col right">
            <div className="sb-form-field">
              <label>Land</label>
              <input value={land} onChange={(e) => setLand(e.target.value)} />
            </div>
          </div>

          {/* RIJ 8 */}
          <div className="sb-form-col left">
            <div className="sb-form-field">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="sb-form-col right">
            <div className="sb-form-field">
              <label>Telefoon kantoor</label>
              <input value={telefoonKantoor} onChange={(e) => setTelefoonKantoor(e.target.value)} />
            </div>
          </div>

          {/* RIJ 9 */}
          <div className="sb-form-col left">
            <div className="sb-form-field">
              <label>Telefoon</label>
              <input value={telefoon} onChange={(e) => setTelefoon(e.target.value)} />
            </div>
          </div>
          <div className="sb-form-col right">
            <div className="sb-form-field">
              <label>Projectleider</label>
              <input value={naamProjectleider} onChange={(e) => setNaamProjectleider(e.target.value)} />
            </div>
          </div>

          {/* RIJ 10 */}
          <div className="sb-form-col left">
            <div className="sb-form-field">
              <label>Startdatum</label>
              <input type="date" value={startDatum} onChange={(e) => setStartDatum(e.target.value)} />
            </div>
          </div>
          <div className="sb-form-col right">
            <div className="sb-form-field">
              <label>Tel. projectleider</label>
              <input value={telefoonProjectleider} onChange={(e) => setTelefoonProjectleider(e.target.value)} />
            </div>
          </div>

          {/* RIJ 11 */}
          <div className="sb-form-col left">
            <div className="sb-form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "Verwerken..." : "Start calculatie"}
              </button>
            </div>
          </div>
          <div className="sb-form-col right">
            <div className="sb-form-field">
              <label>Einddatum</label>
              <input type="date" value={eindDatum} onChange={(e) => setEindDatum(e.target.value)} />
            </div>
          </div>

        </div>
      </form>
    </>
  )
}
