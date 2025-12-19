import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Offertes() {
  const [offertes, setOffertes] = useState([])
  const [leveranciers, setLeveranciers] = useState([])
  const [discipline, setDiscipline] = useState("")
  const [leverancierId, setLeverancierId] = useState("")
  const [bedrag, setBedrag] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data: o } = await supabase
        .from("inkoop_offertes")
        .select(`
          id,
          discipline,
          bedrag,
          status,
          leveranciers ( naam )
        `)
        .order("created_at", { ascending: false })

      const { data: l } = await supabase
        .from("leveranciers")
        .select("id, naam")
        .eq("actief", true)
        .order("naam")

      setOffertes(o || [])
      setLeveranciers(l || [])
      setLoading(false)
    }

    load()
  }, [])

  async function toevoegen() {
    if (!discipline || !leverancierId || !bedrag) return

    await supabase.from("inkoop_offertes").insert({
      discipline,
      leverancier_id: leverancierId,
      bedrag: Number(bedrag),
      status: "aangevraagd"
    })

    setDiscipline("")
    setLeverancierId("")
    setBedrag("")
    location.reload()
  }

  if (loading) return null

  return (
    <>
      <h1>Offertes</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Nieuwe offerte</h2>

        <input
          type="text"
          placeholder="Discipline"
          value={discipline}
          onChange={e => setDiscipline(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <select
          value={leverancierId}
          onChange={e => setLeverancierId(e.target.value)}
          style={{ marginRight: 8 }}
        >
          <option value="">Kies leverancier</option>
          {leveranciers.map(l => (
            <option key={l.id} value={l.id}>
              {l.naam}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Bedrag"
          value={bedrag}
          onChange={e => setBedrag(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <button onClick={toevoegen}>
          Offerte toevoegen
        </button>
      </section>

      <section>
        <h2>Overzicht</h2>

        {offertes.length === 0 && (
          <p>Geen offertes aanwezig.</p>
        )}

        {offertes.length > 0 && (
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>Discipline</th>
                <th>Leverancier</th>
                <th>Bedrag</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {offertes.map(o => (
                <tr key={o.id}>
                  <td>{o.discipline}</td>
                  <td>{o.leveranciers?.naam || "-"}</td>
                  <td>€ {Number(o.bedrag).toFixed(2)}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
