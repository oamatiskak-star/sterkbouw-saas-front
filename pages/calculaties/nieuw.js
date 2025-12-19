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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!naam) {
      setError("Naam is verplicht!")
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
          status: "concept"
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

        <button type="submit" disabled={loading}>
          {loading ? "Verwerken..." : "Maak nieuwe calculatie"}
        </button>
      </form>
    </div>
  )
}
