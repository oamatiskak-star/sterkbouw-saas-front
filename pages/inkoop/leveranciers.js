import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Leveranciers() {
  const [leveranciers, setLeveranciers] = useState([])
  const [naam, setNaam] = useState("")
  const [discipline, setDiscipline] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data } = await supabase
        .from("leveranciers")
        .select("*")
        .order("naam", { ascending: true })

      setLeveranciers(data || [])
      setLoading(false)
    }

    load()
  }, [])

  async function toevoegen() {
    if (!naam.trim()) return

    await supabase.from("leveranciers").insert({
      naam,
      discipline
    })

    setNaam("")
    setDiscipline("")
    location.reload()
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
