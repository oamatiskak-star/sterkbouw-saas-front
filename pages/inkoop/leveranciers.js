import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function Leveranciers() {
  const [leveranciers, setLeveranciers] = useState([])
  const [naam, setNaam] = useState("")
  const [discipline, setDiscipline] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)

      const { data, error } = await supabase
        .from("leveranciers")
        .select("*")
        .order("naam", { ascending: true })

      if (!cancelled) {
        if (error) {
          console.error("LEVERANCIERS_LOAD_FAILED", error)
          setLeveranciers([])
        } else {
          setLeveranciers(data || [])
        }
        setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  async function toevoegen() {
    if (!naam.trim()) return

    const { error } = await supabase
      .from("leveranciers")
      .insert({
        naam: naam.trim(),
        discipline: discipline || null
      })

    if (error) {
      console.error("LEVERANCIER_TOEVOEGEN_FAILED", error)
      return
    }

    // formulier resetten
    setNaam("")
    setDiscipline("")

    // lijst lokaal verversen (geen reload)
    const { data } = await supabase
      .from("leveranciers")
      .select("*")
      .order("naam", { ascending: true })

    setLeveranciers(data || [])
  }

  if (loading) return null

  return (
    <>
      <h1>Leveranciers</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Nieuwe leverancier</h2>

        <input
          type="text"
          placeholder="Naam"
          value={naam}
          onChange={e => setNaam(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <input
          type="text"
          placeholder="Discipline"
          value={discipline}
          onChange={e => setDiscipline(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <button onClick={toevoegen}>
          Toevoegen
        </button>
      </section>

      <section>
        <h2>Overzicht</h2>

        {leveranciers.length === 0 && (
          <p>Geen leveranciers aanwezig.</p>
        )}

        {leveranciers.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Naam</th>
                <th>Discipline</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leveranciers.map(l => (
                <tr key={l.id}>
                  <td>{l.naam}</td>
                  <td>{l.discipline || "-"}</td>
                  <td>{l.actief ? "Actief" : "Inactief"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}

/**
 * ⛔ VERPLICHT
 * Voorkomt static prerendering en React error #130
 */
export async function getServerSideProps() {
  return { props: {} }
}
