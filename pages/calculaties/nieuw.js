import { useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function NieuweCalculatie() {
  const router = useRouter()
  const [naam, setNaam] = useState("")
  const [totaal, setTotaal] = useState(0)
  const [omschrijving, setOmschrijving] = useState("")
  const [adres, setAdres] = useState("")
  const [woonplaats, setWoonplaats] = useState("")
  const [postcode, setPostcode] = useState("")
  const [email, setEmail] = useState("")
  const [projectleider, setProjectleider] = useState("")
  const [telefoon, setTelefoon] = useState("")
  const [startDatum, setStartDatum] = useState("")
  const [eindDatum, setEindDatum] = useState("")
  const [status, setStatus] = useState("concept")
  const [facturatiegegevens, setFacturatiegegevens] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!naam || !adres || !woonplaats || !postcode || !email) {
      setError("Alle velden zijn verplicht!")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Voeg een nieuwe calculatie toe
      const { data, error } = await supabase.from("calculaties").insert([
        {
          naam,
          totaal,
          omschrijving,
          adres,
          woonplaats,
          postcode,
          email,
          projectleider,
          telefoon,
          start_datum: startDatum,
          eind_datum: eindDatum,
          status,
          facturatiegegevens,
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
          <label>Naam van de calculatie</label>
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Totaal</label>
          <input
            type="number"
            value={totaal}
            onChange={(e) => setTotaal(e.target.value)}
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
          <label>Woonplaats</label>
          <input
            type="text"
            value={woonplaats}
            onChange={(e) => setWoonplaats(e.target.value)}
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
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Projectleider</label>
          <input
            type="text"
            value={projectleider}
            onChange={(e) => setProjectleider(e.target.value)}
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

        <div>
          <label>Facturatiegegevens</label>
          <textarea
            value={facturatiegegevens}
            onChange={(e) => setFacturatiegegevens(e.target.value)}
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
