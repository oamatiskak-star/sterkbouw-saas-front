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
  const [adres, setAdres] = useState("")
  const [postcode, setPostcode] = useState("")
  const [plaatsnaam, setPlaatsnaam] = useState("")
  const [land, setLand] = useState("")
  const [email, setEmail] = useState("")
  const [telefoon, setTelefoon] = useState("")
  const [facturatieGegevens, setFacturatieGegevens] = useState(false)
  const [bedrijfNaam, setBedrijfNaam] = useState("")
  const [postbus, setPostbus] = useState("")
  const [emailFacturen, setEmailFacturen] = useState("")
  const [telefoonKantoor, setTelefoonKantoor] = useState("")
  const [naamProjectleider, setNaamProjectleider] = useState("")
  const [telefoonProjectleider, setTelefoonProjectleider] = useState("")
  const [omschrijving, setOmschrijving] = useState("")
  const [startDatum, setStartDatum] = useState("")
  const [eindDatum, setEindDatum] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!projectnummer || !naamOpdrachtgever || !adres || !postcode || !email || !bedrijfNaam) {
      setError("Alle velden zijn verplicht!")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Voeg een nieuwe calculatie toe
      const { data, error } = await supabase.from("calculaties").insert([
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
          facturatie_gegevens: facturatieGegevens,
          bedrijf_naam: bedrijfNaam,
          postbus,
          email_facturen: emailFacturen,
          telefoon_kantoor: telefoonKantoor,
          naam_projectleider: naamProjectleider,
          telefoon_projectleider: telefoonProjectleider,
          start_datum: startDatum,
          eind_datum: eindDatum,
        }
      ])

      if (error) throw error

      // Redirect naar de calculatie detailpagina
      router.push(`/calculaties/${data[0].id}`)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Nieuwe Calculatie</h1>
      
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Projectnummer ID</label>
          <input
            type="text"
            value={projectnummer}
            onChange={(e) => setProjectnummer(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Naam opdrachtgever</label>
          <input
            type="text"
            value={naamOpdrachtgever}
            onChange={(e) => setNaamOpdrachtgever(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Omschrijving</label>
          <textarea
            value={omschrijving}
            onChange={(e) => setOmschrijving(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Adres</label>
          <input
            type="text"
            value={adres}
            onChange={(e) => setAdres(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Postcode</label>
          <input
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Plaatsnaam</label>
          <input
            type="text"
            value={plaatsnaam}
            onChange={(e) => setPlaatsnaam(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Land</label>
          <input
            type="text"
            value={land}
            onChange={(e) => setLand(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Telefoonnummer</label>
          <input
            type="text"
            value={telefoon}
            onChange={(e) => setTelefoon(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Facturatiegegevens kopiëren</label>
          <input
            type="checkbox"
            checked={facturatieGegevens}
            onChange={(e) => setFacturatieGegevens(e.target.checked)}
          />
        </div>

        <div>
          <label>Bedrijfsnaam</label>
          <input
            type="text"
            value={bedrijfNaam}
            onChange={(e) => setBedrijfNaam(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Postbus</label>
          <input
            type="text"
            value={postbus}
            onChange={(e) => setPostbus(e.target.value)}
          />
        </div>

        <div>
          <label>Email facturen</label>
          <input
            type="email"
            value={emailFacturen}
            onChange={(e) => setEmailFacturen(e.target.value)}
          />
        </div>

        <div>
          <label>Telefoon kantoor</label>
          <input
            type="text"
            value={telefoonKantoor}
            onChange={(e) => setTelefoonKantoor(e.target.value)}
          />
        </div>

        <div>
          <label>Naam projectleider</label>
          <input
            type="text"
            value={naamProjectleider}
            onChange={(e) => setNaamProjectleider(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Telefoon projectleider</label>
          <input
            type="text"
            value={telefoonProjectleider}
            onChange={(e) => setTelefoonProjectleider(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Startdatum</label>
          <input
            type="date"
            value={startDatum}
            onChange={(e) => setStartDatum(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Einddatum</label>
          <input
            type="date"
            value={eindDatum}
            onChange={(e) => setEindDatum(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Verwerken..." : "Maak nieuwe calculatie"}
        </button>
      </form>
    </div>
  )
}
